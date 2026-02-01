# CCW: Architecture & Code Patterns

## Project Structure

```
ccw-game/
├── index.html              # Entry point
├── vite.config.js          # Build configuration
├── package.json
├── /public
│   └── /assets             # Static assets (copied as-is)
│       ├── /sprites
│       ├── /backgrounds
│       ├── /particles
│       ├── /ui
│       ├── /sfx
│       └── /music
├── /src
│   ├── main.js             # Phaser game config and launch
│   ├── /scenes
│   │   ├── BootScene.js    # Asset loading
│   │   ├── MenuScene.js    # Title screen
│   │   ├── FightScene.js   # Main gameplay
│   │   └── GameOverScene.js# Results screen
│   ├── /entities
│   │   ├── Fighter.js      # Base fighter class
│   │   ├── Dumpster.js     # Dumpster-specific (extends Fighter)
│   │   ├── Scar.js         # Scar-specific (extends Fighter)
│   │   ├── Chair.js        # Steel chair weapon
│   │   └── Table.js        # Breakable/burnable table
│   ├── /systems
│   │   ├── CombatSystem.js # Hit detection, damage calculation
│   │   ├── AIController.js # Enemy AI behavior
│   │   └── EffectsManager.js # Particles, screen shake, sounds
│   ├── /ui
│   │   ├── HealthBar.js    # Health bar component
│   │   ├── ExtremeMeter.js # Extreme meter component
│   │   └── Announcer.js    # Text announcements
│   └── /config
│       ├── constants.js    # Game-wide constants
│       ├── characters.js   # Character stats and animation defs
│       └── controls.js     # Input key mappings
└── /dist                   # Build output (git ignored)
```

---

## Core Patterns

### Scene Lifecycle

Every scene follows this pattern:

```javascript
export default class ExampleScene extends Phaser.Scene {
  constructor() {
    super('ExampleScene'); // Unique scene key
  }

  // Called before create, receives data from previous scene
  init(data) {
    this.playerCharacter = data.playerCharacter || 'dumpster';
  }

  // Load assets (only in BootScene typically)
  preload() {}

  // Setup game objects, called once when scene starts
  create() {}

  // Game loop, called every frame
  update(time, delta) {}
}
```

### Entity Pattern

Entities (fighters, weapons) extend Phaser.GameObjects.Sprite and encapsulate their own logic:

```javascript
// src/entities/Fighter.js
export default class Fighter extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, config) {
    super(scene, x, y, texture);
    
    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Configure physics body
    this.body.setCollideWorldBounds(true);
    this.body.setSize(config.hitboxWidth, config.hitboxHeight);
    this.body.setOffset(config.hitboxOffsetX, config.hitboxOffsetY);
    
    // Fighter properties
    this.config = config;
    this.health = config.maxHealth || 100;
    this.extremeMeter = 0;
    this.state = 'idle';
    this.facingRight = true;
    this.heldWeapon = null;
    this.isPlayer = false;
    
    // State timers
    this.stateTimer = 0;
    this.invulnerableTimer = 0;
    
    // Create animations for this fighter
    this.createAnimations();
  }
  
  createAnimations() {
    const key = this.texture.key;
    const anims = this.scene.anims;
    
    // Only create if not already exists
    if (!anims.exists(`${key}-idle`)) {
      anims.create({
        key: `${key}-idle`,
        frames: anims.generateFrameNumbers(key, { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1
      });
      // ... other animations
    }
  }
  
  update(time, delta) {
    this.updateState(delta);
    this.updateAnimation();
  }
  
  updateState(delta) {
    // Decrement timers
    if (this.stateTimer > 0) this.stateTimer -= delta;
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= delta;
    
    // State machine
    switch (this.state) {
      case 'hitstun':
        if (this.stateTimer <= 0) this.state = 'idle';
        break;
      case 'down':
        if (this.stateTimer <= 0) {
          if (this.health <= 0) {
            this.state = 'ko';
          } else {
            this.state = 'getup';
            this.stateTimer = 500;
          }
        }
        break;
      case 'getup':
        if (this.stateTimer <= 0) {
          this.state = 'idle';
          this.invulnerableTimer = 300; // Brief invuln after getting up
        }
        break;
    }
  }
  
  updateAnimation() {
    const key = this.texture.key;
    const moving = this.body.velocity.x !== 0 || this.body.velocity.y !== 0;
    
    switch (this.state) {
      case 'idle':
        this.play(moving ? `${key}-walk` : `${key}-idle`, true);
        break;
      case 'attacking':
        // Animation set when attack starts
        break;
      case 'hitstun':
        this.play(`${key}-hit`, true);
        break;
      case 'down':
      case 'ko':
        this.play(`${key}-down`, true);
        break;
      case 'getup':
        this.play(`${key}-getup`, true);
        break;
    }
  }
  
  takeDamage(amount, knockbackAngle, knockbackForce) {
    if (this.invulnerableTimer > 0) return;
    if (this.state === 'ko') return;
    
    this.health = Math.max(0, this.health - amount);
    
    // Knockback
    const vx = Math.cos(knockbackAngle) * knockbackForce;
    const vy = Math.sin(knockbackAngle) * knockbackForce;
    this.body.setVelocity(vx, vy);
    
    // Enter hitstun or down state
    if (this.health <= 0 || amount >= 20) {
      this.state = 'down';
      this.stateTimer = this.health <= 0 ? 999999 : 1500;
    } else {
      this.state = 'hitstun';
      this.stateTimer = 200 + (amount * 10);
    }
    
    // Emit event for effects
    this.scene.events.emit('fighterHit', this, amount);
    
    return this.health <= 0;
  }
  
  canAct() {
    return this.state === 'idle' || this.state === 'walking';
  }
  
  setFacing(right) {
    this.facingRight = right;
    this.setFlipX(!right);
  }
}
```

### Combat System

Centralized combat logic for hit detection and damage:

```javascript
// src/systems/CombatSystem.js
export default class CombatSystem {
  constructor(scene) {
    this.scene = scene;
  }
  
  // Create a temporary hitbox for attacks
  performAttack(attacker, target) {
    if (!attacker.canAct()) return false;
    
    // Determine damage and range based on weapon
    const hasWeapon = attacker.heldWeapon !== null;
    const damage = hasWeapon ? 22 : Phaser.Math.Between(8, 12);
    const range = hasWeapon ? 50 : 40;
    const knockback = hasWeapon ? 200 : 150;
    
    // Calculate hitbox position
    const offsetX = attacker.facingRight ? range : -range;
    const hitboxX = attacker.x + offsetX;
    
    // Set attacker state
    attacker.state = 'attacking';
    attacker.body.setVelocity(0, 0);
    
    const key = attacker.texture.key;
    const animKey = hasWeapon ? `${key}-attack-chair` : `${key}-attack`;
    attacker.play(animKey);
    
    // Check for hit at the right frame (midway through animation)
    this.scene.time.delayedCall(150, () => {
      const dist = Phaser.Math.Distance.Between(hitboxX, attacker.y, target.x, target.y);
      
      if (dist < range + 20) {
        // Hit!
        const angle = Phaser.Math.Angle.Between(attacker.x, attacker.y, target.x, target.y);
        const isKO = target.takeDamage(damage, angle, knockback);
        
        // Build meter
        attacker.extremeMeter = Math.min(100, attacker.extremeMeter + (hasWeapon ? 8 : 5));
        
        // Effects
        this.scene.effects.emitBlood(target.x, target.y);
        this.scene.effects.screenShake(hasWeapon ? 'heavy' : 'light');
        this.scene.effects.playSound(hasWeapon ? 'chair-hit' : 'hit');
        
        if (isKO) {
          this.scene.handleKO(target);
        }
      }
    });
    
    // Reset state when animation completes
    attacker.once('animationcomplete', () => {
      if (attacker.state === 'attacking') {
        attacker.state = 'idle';
      }
    });
    
    return true;
  }
  
  attemptGrab(attacker, target) {
    // For future grapple system
  }
  
  tableSlam(attacker, target, table) {
    // Check if attacker is near table and target
    const distToTable = Phaser.Math.Distance.Between(attacker.x, attacker.y, table.x, table.y);
    const distToTarget = Phaser.Math.Distance.Between(attacker.x, attacker.y, target.x, target.y);
    
    if (distToTable > 60 || distToTarget > 50) return false;
    if (!attacker.canAct() || target.state === 'down' || target.state === 'ko') return false;
    
    // Perform slam
    const damage = table.isOnFire ? 55 : 35;
    const angle = Phaser.Math.Angle.Between(attacker.x, attacker.y, table.x, table.y);
    
    // Move target to table
    target.setPosition(table.x, table.y);
    target.takeDamage(damage, angle, 100);
    
    // Break table
    table.break();
    
    // Effects
    this.scene.effects.screenShake('devastating');
    this.scene.effects.emitDebris(table.x, table.y);
    this.scene.effects.playSound('table-break');
    this.scene.effects.showAnnouncement('TABLE BREAK!', '#ff8800');
    
    // Huge meter gain
    attacker.extremeMeter = Math.min(100, attacker.extremeMeter + 20);
    
    return true;
  }
}
```

### Effects Manager

Centralized visual and audio effects:

```javascript
// src/systems/EffectsManager.js
export default class EffectsManager {
  constructor(scene) {
    this.scene = scene;
  }
  
  emitBlood(x, y) {
    const particles = this.scene.add.particles(x, y, 'particle-blood', {
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 8
    });
    
    this.scene.time.delayedCall(500, () => particles.destroy());
  }
  
  emitSparks(x, y) {
    const particles = this.scene.add.particles(x, y, 'particle-spark', {
      speed: { min: 100, max: 200 },
      angle: { min: -30, max: 30 },
      scale: { start: 0.8, end: 0 },
      lifespan: 300,
      quantity: 12
    });
    
    this.scene.time.delayedCall(400, () => particles.destroy());
  }
  
  emitDebris(x, y) {
    const particles = this.scene.add.particles(x, y, 'particle-debris', {
      speed: { min: 80, max: 180 },
      angle: { min: -60, max: 60 },
      scale: { start: 1, end: 0.5 },
      lifespan: 800,
      quantity: 8,
      gravityY: 200
    });
    
    this.scene.time.delayedCall(1000, () => particles.destroy());
  }
  
  createFireEmitter(x, y) {
    return this.scene.add.particles(x, y, 'particle-fire', {
      speed: { min: 20, max: 60 },
      angle: { min: -100, max: -80 },
      scale: { start: 1, end: 0 },
      lifespan: 600,
      frequency: 50,
      tint: [0xff4400, 0xff8800, 0xffcc00]
    });
  }
  
  screenShake(intensity = 'light') {
    const settings = {
      light: { duration: 100, intensity: 0.005 },
      heavy: { duration: 200, intensity: 0.01 },
      devastating: { duration: 300, intensity: 0.02 }
    };
    
    const { duration, intensity: power } = settings[intensity] || settings.light;
    this.scene.cameras.main.shake(duration, power);
  }
  
  flashSprite(sprite, color = 0xff0000, duration = 100) {
    sprite.setTint(color);
    this.scene.time.delayedCall(duration, () => sprite.clearTint());
  }
  
  playSound(key, options = {}) {
    const defaults = { volume: 0.5 };
    this.scene.sound.play(key, { ...defaults, ...options });
  }
  
  showAnnouncement(text, color = '#ffffff') {
    const announcement = this.scene.add.text(400, 225, text, {
      fontSize: '48px',
      fontFamily: 'Impact, Arial Black, sans-serif',
      color: color,
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0).setDepth(1000);
    
    this.scene.tweens.add({
      targets: announcement,
      alpha: 1,
      scale: { from: 0.5, to: 1.2 },
      duration: 200,
      yoyo: true,
      hold: 800,
      onComplete: () => announcement.destroy()
    });
  }
}
```

### AI Controller

Simple but effective enemy AI:

```javascript
// src/systems/AIController.js
export default class AIController {
  constructor(scene, fighter, target) {
    this.scene = scene;
    this.fighter = fighter;
    this.target = target;
    
    this.actionCooldown = 0;
    this.thinkInterval = 500; // ms between decisions
    this.aggressiveness = 0.6; // 0-1, higher = more aggressive
  }
  
  update(delta) {
    if (!this.fighter.canAct()) {
      this.fighter.body.setVelocity(0, 0);
      return;
    }
    
    this.actionCooldown -= delta;
    if (this.actionCooldown > 0) return;
    
    this.actionCooldown = this.thinkInterval;
    this.think();
  }
  
  think() {
    const dist = Phaser.Math.Distance.Between(
      this.fighter.x, this.fighter.y,
      this.target.x, this.target.y
    );
    
    // Face target
    this.fighter.setFacing(this.target.x > this.fighter.x);
    
    // Decision tree
    if (this.target.state === 'down' || this.target.state === 'ko') {
      // Target is down, approach for follow-up or celebrate
      this.approach(100);
      return;
    }
    
    // Check for nearby weapons
    const nearbyChair = this.findNearbyWeapon();
    if (nearbyChair && !this.fighter.heldWeapon && dist > 100) {
      this.moveToward(nearbyChair.x, nearbyChair.y, 160);
      if (Phaser.Math.Distance.Between(this.fighter.x, this.fighter.y, nearbyChair.x, nearbyChair.y) < 40) {
        this.scene.combat.pickupWeapon(this.fighter, nearbyChair);
      }
      return;
    }
    
    // Combat behavior
    if (dist < 60) {
      // In attack range
      if (Math.random() < this.aggressiveness) {
        this.scene.combat.performAttack(this.fighter, this.target);
      } else {
        // Sometimes back off
        this.retreat(80);
      }
    } else if (dist < 200) {
      // Approach
      this.approach(dist - 50);
    } else {
      // Far away, run in
      this.approach(dist);
    }
  }
  
  approach(distance) {
    this.moveToward(this.target.x, this.target.y, 140);
  }
  
  retreat(distance) {
    const angle = Phaser.Math.Angle.Between(this.target.x, this.target.y, this.fighter.x, this.fighter.y);
    const targetX = this.fighter.x + Math.cos(angle) * distance;
    const targetY = this.fighter.y + Math.sin(angle) * distance;
    this.moveToward(targetX, targetY, 120);
  }
  
  moveToward(x, y, speed) {
    const angle = Phaser.Math.Angle.Between(this.fighter.x, this.fighter.y, x, y);
    this.fighter.body.setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );
  }
  
  findNearbyWeapon() {
    const weapons = this.scene.weapons.getChildren();
    let closest = null;
    let closestDist = 200;
    
    for (const weapon of weapons) {
      if (!weapon.isHeld) {
        const dist = Phaser.Math.Distance.Between(this.fighter.x, this.fighter.y, weapon.x, weapon.y);
        if (dist < closestDist) {
          closest = weapon;
          closestDist = dist;
        }
      }
    }
    
    return closest;
  }
}
```

### Configuration Files

Constants and configuration in dedicated files:

```javascript
// src/config/constants.js
export const GAME = {
  WIDTH: 800,
  HEIGHT: 450,
  GRAVITY: 0, // Top-down, no gravity
  DEBUG: false
};

export const DAMAGE = {
  FIST_MIN: 8,
  FIST_MAX: 12,
  CHAIR: 22,
  TABLE: 35,
  FLAMING_TABLE: 55,
  FIRE_DOT: 3,
  FINISHER: 45
};

export const COMBAT = {
  ATTACK_RANGE: 40,
  CHAIR_RANGE: 50,
  PICKUP_RANGE: 40,
  TABLE_SLAM_RANGE: 60,
  KNOCKBACK_LIGHT: 150,
  KNOCKBACK_HEAVY: 200,
  HITSTUN_BASE: 200,
  KNOCKDOWN_DURATION: 1500
};

export const METER = {
  GAIN_HIT: 5,
  GAIN_WEAPON_HIT: 8,
  GAIN_TAKE_DAMAGE: 3,
  GAIN_TABLE_BREAK: 20,
  MAX: 100
};

export const MOVEMENT = {
  PLAYER_SPEED: 160,
  AI_SPEED: 140
};
```

```javascript
// src/config/characters.js
export const CHARACTERS = {
  dumpster: {
    name: 'The Dumpster',
    maxHealth: 100,
    speed: 140, // Slower
    power: 1.1, // 10% more damage
    hitboxWidth: 40,
    hitboxHeight: 56,
    hitboxOffsetX: 12,
    hitboxOffsetY: 8,
    animations: {
      idle: { start: 0, end: 3, frameRate: 8 },
      walk: { start: 4, end: 9, frameRate: 10 },
      attack: { start: 10, end: 14, frameRate: 15 },
      attackChair: { start: 15, end: 19, frameRate: 12 },
      hit: { start: 20, end: 22, frameRate: 10 },
      down: { start: 23, end: 24, frameRate: 6 },
      getup: { start: 25, end: 27, frameRate: 8 },
      victory: { start: 28, end: 31, frameRate: 6 }
    }
  },
  scar: {
    name: 'Scar',
    maxHealth: 100,
    speed: 170, // Faster
    power: 1.0, // Normal damage
    hitboxWidth: 36,
    hitboxHeight: 54,
    hitboxOffsetX: 14,
    hitboxOffsetY: 10,
    animations: {
      // Same structure, different frame numbers
    }
  }
};
```

```javascript
// src/config/controls.js
export const CONTROLS = {
  player1: {
    left: 'A',
    right: 'D',
    up: 'W',
    down: 'S',
    attack: 'J',
    pickup: 'K',
    slam: 'L',
    fire: 'F'
  },
  player2: {
    left: 'LEFT',
    right: 'RIGHT',
    up: 'UP',
    down: 'DOWN',
    attack: 'NUMPAD_1',
    pickup: 'NUMPAD_2',
    slam: 'NUMPAD_3',
    fire: 'NUMPAD_0'
  },
  system: {
    pause: 'ESC',
    start: 'ENTER'
  }
};
```

---

## Development Workflow

### Running Locally
```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

### Building for Production
```bash
npm run build
# Output in /dist
```

### Deploying to Vercel
```bash
npm run build
vercel deploy --prod
```

Or connect GitHub repo to Vercel for automatic deploys.

---

## Coding Standards

### Naming Conventions
- **Files**: PascalCase for classes (`Fighter.js`), camelCase for utilities (`constants.js`)
- **Classes**: PascalCase (`CombatSystem`)
- **Functions/methods**: camelCase (`performAttack`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_HEALTH`)
- **Scene keys**: PascalCase strings (`'FightScene'`)
- **Animation keys**: kebab-case prefixed with character (`'dumpster-idle'`)

### Code Organization
- Keep scenes thin — delegate to systems and entities
- Entities manage their own state and animations
- Systems handle cross-entity logic (combat, effects)
- Config files for all tunable values

### Comments
- JSDoc for public methods
- Inline comments for non-obvious logic
- TODO comments for known improvements

---

## Testing Checklist

### Before Each Commit
- [ ] Game loads without console errors
- [ ] Both characters can move and attack
- [ ] Chair can be picked up and used
- [ ] Table can be lit and broken
- [ ] Health bars update correctly
- [ ] KO triggers win condition
- [ ] Menu and restart work

### Performance Checks
- [ ] Stable 60 FPS during combat
- [ ] No memory leaks (particles cleaned up)
- [ ] No audio overlap issues
- [ ] Works in Chrome, Firefox, Safari
