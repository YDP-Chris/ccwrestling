# Phaser 3 Game Development Skill

## Overview

Phaser 3 is a 2D game framework for making HTML5 games. This skill covers patterns and APIs needed for building CCW: Carnage Championship Wrestling - a 2D beat-em-up deathmatch wrestling game.

## Project Setup

### Vite + Phaser 3 Configuration

```bash
npm create vite@latest ccw-game -- --template vanilla
cd ccw-game
npm install phaser
```

### vite.config.js
```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
});
```

### main.js - Game Configuration
```javascript
import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import FightScene from './scenes/FightScene';
import GameOverScene from './scenes/GameOverScene';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },  // Top-down style, no gravity
      debug: false        // Set true during development
    }
  },
  scene: [BootScene, MenuScene, FightScene, GameOverScene],
  pixelArt: true,         // Crisp pixel scaling
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
```

---

## Scene Patterns

### Boot Scene (Asset Loading)
```javascript
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Show loading progress
    const progressBar = this.add.graphics();
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xff0000, 1);
      progressBar.fillRect(250, 220, 300 * value, 30);
    });

    // Load spritesheets
    this.load.spritesheet('dumpster', 'assets/sprites/dumpster.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    this.load.spritesheet('scar', 'assets/sprites/scar.png', {
      frameWidth: 64,
      frameHeight: 64
    });

    // Load images
    this.load.image('chair', 'assets/sprites/chair.png');
    this.load.image('table', 'assets/sprites/table.png');
    this.load.image('table-broken', 'assets/sprites/table-broken.png');
    this.load.image('arena-bg', 'assets/backgrounds/arena.png');

    // Load particles
    this.load.image('particle-blood', 'assets/particles/blood.png');
    this.load.image('particle-spark', 'assets/particles/spark.png');
    this.load.image('particle-fire', 'assets/particles/fire.png');

    // Load audio
    this.load.audio('hit', 'assets/sfx/hit.wav');
    this.load.audio('chair-hit', 'assets/sfx/chair-hit.wav');
    this.load.audio('crowd', 'assets/sfx/crowd-loop.wav');
  }

  create() {
    this.scene.start('MenuScene');
  }
}
```

### Menu Scene
```javascript
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    // Title
    this.add.text(400, 150, 'CCW', {
      fontSize: '72px',
      fontFamily: 'Impact',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(400, 220, 'CARNAGE CHAMPIONSHIP WRESTLING', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Start prompt
    const startText = this.add.text(400, 350, 'PRESS ENTER TO START', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // Blink effect
    this.tweens.add({
      targets: startText,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Input
    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('FightScene');
    });
  }
}
```

### Fight Scene (Main Gameplay)
```javascript
export default class FightScene extends Phaser.Scene {
  constructor() {
    super('FightScene');
  }

  create() {
    // Background
    this.add.image(400, 225, 'arena-bg');

    // Create fighters
    this.player = this.createFighter(200, 300, 'dumpster', true);
    this.enemy = this.createFighter(600, 300, 'scar', false);

    // Create weapons group
    this.weapons = this.physics.add.group();
    this.spawnChair(400, 350);

    // Create table
    this.table = this.createTable(400, 200);

    // Collisions
    this.physics.add.overlap(this.player, this.weapons, this.handleWeaponPickup, null, this);
    this.physics.add.collider(this.player, this.enemy, this.handleFighterCollision, null, this);

    // Input
    this.setupInput();

    // UI
    this.createUI();

    // Start crowd audio
    this.crowdSound = this.sound.add('crowd', { loop: true, volume: 0.3 });
    this.crowdSound.play();
  }

  update(time, delta) {
    this.handlePlayerMovement();
    this.updateAI();
    this.updateUI();
  }

  // ... additional methods
}
```

---

## Sprite & Animation Patterns

### Creating Animated Sprites
```javascript
createFighter(x, y, spriteKey, isPlayer) {
  const fighter = this.physics.add.sprite(x, y, spriteKey);
  
  // Physics body
  fighter.setCollideWorldBounds(true);
  fighter.body.setSize(40, 56);  // Hitbox size
  fighter.body.setOffset(12, 8); // Hitbox offset from sprite
  
  // Custom properties
  fighter.isPlayer = isPlayer;
  fighter.health = 100;
  fighter.extremeMeter = 0;
  fighter.heldWeapon = null;
  fighter.isAttacking = false;
  fighter.facingRight = isPlayer ? true : false;
  
  // Flip based on direction
  fighter.setFlipX(!fighter.facingRight);
  
  return fighter;
}

// Define animations (call once in create or BootScene)
createAnimations() {
  // Idle animation
  this.anims.create({
    key: 'dumpster-idle',
    frames: this.anims.generateFrameNumbers('dumpster', { start: 0, end: 3 }),
    frameRate: 8,
    repeat: -1
  });

  // Walk animation
  this.anims.create({
    key: 'dumpster-walk',
    frames: this.anims.generateFrameNumbers('dumpster', { start: 4, end: 9 }),
    frameRate: 10,
    repeat: -1
  });

  // Attack animation (no repeat)
  this.anims.create({
    key: 'dumpster-attack',
    frames: this.anims.generateFrameNumbers('dumpster', { start: 10, end: 14 }),
    frameRate: 15,
    repeat: 0
  });

  // Hit/stagger animation
  this.anims.create({
    key: 'dumpster-hit',
    frames: this.anims.generateFrameNumbers('dumpster', { start: 15, end: 17 }),
    frameRate: 10,
    repeat: 0
  });

  // Down/KO animation
  this.anims.create({
    key: 'dumpster-down',
    frames: this.anims.generateFrameNumbers('dumpster', { start: 18, end: 19 }),
    frameRate: 6,
    repeat: 0
  });
}

// Playing animations
playAnimation(fighter, animKey) {
  const prefix = fighter.texture.key;  // 'dumpster' or 'scar'
  fighter.anims.play(`${prefix}-${animKey}`, true);
}
```

---

## Input Handling

### Keyboard Setup
```javascript
setupInput() {
  // Movement keys (both WASD and Arrows)
  this.keys = {
    left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    
    // Also support arrow keys
    arrowLeft: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
    arrowRight: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    arrowUp: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
    arrowDown: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
    
    // Action keys
    attack: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
    pickup: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
    slam: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
    lightFire: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
    
    // Alt action keys
    attackAlt: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
    pickupAlt: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
    slamAlt: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C),
    
    // System
    pause: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
  };
}

handlePlayerMovement() {
  const speed = 160;
  let vx = 0;
  let vy = 0;

  // Don't move while attacking
  if (this.player.isAttacking) {
    this.player.body.setVelocity(0, 0);
    return;
  }

  // Horizontal
  if (this.keys.left.isDown || this.keys.arrowLeft.isDown) {
    vx = -speed;
    this.player.facingRight = false;
    this.player.setFlipX(true);
  } else if (this.keys.right.isDown || this.keys.arrowRight.isDown) {
    vx = speed;
    this.player.facingRight = true;
    this.player.setFlipX(false);
  }

  // Vertical
  if (this.keys.up.isDown || this.keys.arrowUp.isDown) {
    vy = -speed;
  } else if (this.keys.down.isDown || this.keys.arrowDown.isDown) {
    vy = speed;
  }

  this.player.body.setVelocity(vx, vy);

  // Animation
  if (vx !== 0 || vy !== 0) {
    this.playAnimation(this.player, 'walk');
  } else {
    this.playAnimation(this.player, 'idle');
  }
}

// Action key handling (use JustDown for single press)
handleActions() {
  if (Phaser.Input.Keyboard.JustDown(this.keys.attack) || 
      Phaser.Input.Keyboard.JustDown(this.keys.attackAlt)) {
    this.performAttack(this.player);
  }

  if (Phaser.Input.Keyboard.JustDown(this.keys.pickup) || 
      Phaser.Input.Keyboard.JustDown(this.keys.pickupAlt)) {
    this.attemptPickup(this.player);
  }

  if (Phaser.Input.Keyboard.JustDown(this.keys.slam) || 
      Phaser.Input.Keyboard.JustDown(this.keys.slamAlt)) {
    this.attemptTableSlam(this.player, this.enemy);
  }

  if (Phaser.Input.Keyboard.JustDown(this.keys.lightFire)) {
    this.attemptLightFire(this.player);
  }
}
```

---

## Physics & Collision

### Arcade Physics Setup
```javascript
// In config - no gravity for top-down beat-em-up
physics: {
  default: 'arcade',
  arcade: {
    gravity: { y: 0 },
    debug: false
  }
}

// Collision groups
this.physics.add.overlap(
  this.player,
  this.weapons,
  this.handleWeaponPickup,
  null,  // No process callback
  this   // Context
);

this.physics.add.collider(
  this.player,
  this.enemy,
  this.handleFighterCollision,
  this.shouldCollide,  // Process callback - return false to ignore
  this
);
```

### Knockback Effect
```javascript
applyKnockback(target, source, force = 200) {
  const angle = Phaser.Math.Angle.Between(source.x, source.y, target.x, target.y);
  const vx = Math.cos(angle) * force;
  const vy = Math.sin(angle) * force;
  
  target.body.setVelocity(vx, vy);
  
  // Decay knockback
  this.time.delayedCall(200, () => {
    if (target.active) {
      target.body.setVelocity(0, 0);
    }
  });
}
```

### Hit Detection (Attack Hitbox)
```javascript
performAttack(fighter) {
  if (fighter.isAttacking) return;
  
  fighter.isAttacking = true;
  this.playAnimation(fighter, 'attack');
  
  // Create temporary hitbox in front of fighter
  const hitboxX = fighter.x + (fighter.facingRight ? 40 : -40);
  const hitbox = this.add.rectangle(hitboxX, fighter.y, 50, 40);
  this.physics.add.existing(hitbox);
  
  // Check for hits
  const target = fighter.isPlayer ? this.enemy : this.player;
  
  if (this.physics.overlap(hitbox, target)) {
    this.applyDamage(target, fighter, fighter.heldWeapon ? 22 : 10);
  }
  
  // Remove hitbox
  hitbox.destroy();
  
  // Reset attack state when animation completes
  fighter.once('animationcomplete', () => {
    fighter.isAttacking = false;
  });
}
```

---

## Visual Effects

### Camera Shake
```javascript
// Light hit
this.cameras.main.shake(100, 0.005);

// Heavy hit (chair)
this.cameras.main.shake(200, 0.01);

// Devastating (table break)
this.cameras.main.shake(300, 0.02);
```

### Particle Effects (Phaser 3.60+)
```javascript
// Blood splatter
emitBlood(x, y) {
  const particles = this.add.particles(x, y, 'particle-blood', {
    speed: { min: 50, max: 150 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    lifespan: 400,
    quantity: 8,
    tint: 0xff0000
  });
  
  // Auto-destroy emitter
  this.time.delayedCall(500, () => particles.destroy());
}

// Sparks (chair hit)
emitSparks(x, y) {
  const particles = this.add.particles(x, y, 'particle-spark', {
    speed: { min: 100, max: 200 },
    angle: { min: -30, max: 30 },
    scale: { start: 0.8, end: 0 },
    lifespan: 300,
    quantity: 12,
    tint: 0xffff00
  });
  
  this.time.delayedCall(400, () => particles.destroy());
}

// Fire (continuous)
createFireEmitter(x, y) {
  return this.add.particles(x, y, 'particle-fire', {
    speed: { min: 20, max: 60 },
    angle: { min: -100, max: -80 },  // Upward
    scale: { start: 1, end: 0 },
    lifespan: 600,
    frequency: 50,
    tint: [0xff4400, 0xff8800, 0xffcc00]
  });
}
```

### Flash/Tint on Hit
```javascript
flashOnHit(sprite) {
  sprite.setTint(0xff0000);
  this.time.delayedCall(100, () => {
    sprite.clearTint();
  });
}
```

### Tweens for Juice
```javascript
// Scale pop on hit
hitPop(sprite) {
  this.tweens.add({
    targets: sprite,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 50,
    yoyo: true
  });
}

// Health bar drain
animateHealthBar(bar, newWidth) {
  this.tweens.add({
    targets: bar,
    width: newWidth,
    duration: 200,
    ease: 'Power2'
  });
}
```

---

## UI Elements

### Health Bars
```javascript
createUI() {
  // Player health bar background
  this.add.rectangle(120, 30, 204, 24, 0x333333).setOrigin(0, 0.5);
  
  // Player health bar fill
  this.playerHealthBar = this.add.rectangle(122, 30, 200, 20, 0x00ff00).setOrigin(0, 0.5);
  
  // Player name
  this.add.text(120, 10, 'THE DUMPSTER', {
    fontSize: '14px',
    color: '#ffffff'
  });
  
  // Enemy health bar (right side)
  this.add.rectangle(680, 30, 204, 24, 0x333333).setOrigin(1, 0.5);
  this.enemyHealthBar = this.add.rectangle(678, 30, 200, 20, 0xff0000).setOrigin(1, 0.5);
  
  this.add.text(680, 10, 'SCAR', {
    fontSize: '14px',
    color: '#ffffff'
  }).setOrigin(1, 0);
  
  // Extreme meter
  this.add.rectangle(400, 420, 304, 20, 0x333333).setOrigin(0.5);
  this.extremeMeterBar = this.add.rectangle(251, 420, 0, 16, 0xffff00).setOrigin(0, 0.5);
  
  this.add.text(400, 435, 'EXTREME', {
    fontSize: '12px',
    color: '#ffff00'
  }).setOrigin(0.5);
}

updateUI() {
  // Update health bar widths
  const playerHealthPct = this.player.health / 100;
  const enemyHealthPct = this.enemy.health / 100;
  
  this.playerHealthBar.width = 200 * playerHealthPct;
  this.enemyHealthBar.width = 200 * enemyHealthPct;
  
  // Color shift when low
  if (playerHealthPct < 0.3) {
    this.playerHealthBar.setFillStyle(0xff0000);
  } else if (playerHealthPct < 0.6) {
    this.playerHealthBar.setFillStyle(0xffff00);
  }
  
  // Extreme meter
  this.extremeMeterBar.width = 300 * (this.player.extremeMeter / 100);
}
```

### Text Announcements
```javascript
showAnnouncement(text, color = '#ffffff') {
  const announcement = this.add.text(400, 225, text, {
    fontSize: '48px',
    fontFamily: 'Impact',
    color: color,
    stroke: '#000000',
    strokeThickness: 6
  }).setOrigin(0.5).setAlpha(0);
  
  this.tweens.add({
    targets: announcement,
    alpha: 1,
    scale: 1.2,
    duration: 200,
    yoyo: true,
    hold: 800,
    onComplete: () => announcement.destroy()
  });
}

// Usage
this.showAnnouncement('K.O.!', '#ff0000');
this.showAnnouncement('TABLE BREAK!', '#ff8800');
```

---

## Audio

### Sound Effects
```javascript
// Play sound
this.sound.play('hit', { volume: 0.5 });

// Play with pitch variation
this.sound.play('hit', { 
  volume: 0.5,
  rate: Phaser.Math.FloatBetween(0.9, 1.1)
});

// Looping background
this.crowdSound = this.sound.add('crowd', { loop: true, volume: 0.3 });
this.crowdSound.play();

// Stop sound
this.crowdSound.stop();
```

---

## Scene Transitions

```javascript
// Simple transition
this.scene.start('GameOverScene', { winner: 'player', health: this.player.health });

// With fade
this.cameras.main.fadeOut(500, 0, 0, 0);
this.cameras.main.once('camerafadeoutcomplete', () => {
  this.scene.start('GameOverScene', { winner: 'player' });
});

// Receiving data in next scene
create(data) {
  const winner = data.winner || 'player';
  this.add.text(400, 200, winner === 'player' ? 'YOU WIN!' : 'YOU LOSE', {
    fontSize: '48px',
    color: winner === 'player' ? '#00ff00' : '#ff0000'
  }).setOrigin(0.5);
}
```

---

## Game State Management

### Simple State Machine for Fighters
```javascript
const STATES = {
  IDLE: 'idle',
  WALKING: 'walking',
  ATTACKING: 'attacking',
  HIT_STUN: 'hit_stun',
  DOWN: 'down',
  GETTING_UP: 'getting_up'
};

// On fighter object
fighter.state = STATES.IDLE;
fighter.stateTimer = 0;

// In update
updateFighterState(fighter, delta) {
  fighter.stateTimer -= delta;
  
  switch (fighter.state) {
    case STATES.HIT_STUN:
      if (fighter.stateTimer <= 0) {
        fighter.state = STATES.IDLE;
      }
      break;
    case STATES.DOWN:
      if (fighter.stateTimer <= 0) {
        if (fighter.health <= 0) {
          // Stay down - KO
        } else {
          fighter.state = STATES.GETTING_UP;
          fighter.stateTimer = 500;
          this.playAnimation(fighter, 'getup');
        }
      }
      break;
    // ... other states
  }
}

// When taking damage
enterHitStun(fighter, duration = 300) {
  fighter.state = STATES.HIT_STUN;
  fighter.stateTimer = duration;
  fighter.body.setVelocity(0, 0);
  this.playAnimation(fighter, 'hit');
}
```

---

## Useful Utilities

### Distance Check
```javascript
const dist = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
if (dist < 50) {
  // In range
}
```

### Random in Range
```javascript
const damage = Phaser.Math.Between(8, 12);
const randomX = Phaser.Math.FloatBetween(100, 700);
```

### Timer Events
```javascript
// One-shot delay
this.time.delayedCall(1000, () => {
  console.log('1 second later');
});

// Repeating timer
this.fireTimer = this.time.addEvent({
  delay: 500,
  callback: () => this.applyFireDamage(fighter),
  loop: true
});

// Stop timer
this.fireTimer.remove();
```

### Pausing
```javascript
// Pause physics and animations
this.physics.pause();

// Resume
this.physics.resume();

// Pause specific scene
this.scene.pause('FightScene');
this.scene.resume('FightScene');
```

---

## Common Gotchas

1. **Sprite origin**: Default is center (0.5, 0.5). Use `setOrigin(0, 0)` for top-left.

2. **Physics body vs sprite size**: Physics body is separate. Use `body.setSize()` and `body.setOffset()`.

3. **Animation keys must be unique**: Prefix with sprite name like `dumpster-idle`, `scar-idle`.

4. **JustDown vs isDown**: Use `JustDown` for actions (attack), `isDown` for held inputs (movement).

5. **Destroy vs setActive(false)**: Use object pooling with `setActive(false)` for frequently created/destroyed objects.

6. **Scene data passing**: Pass data as second arg to `scene.start()`, receive in `create(data)`.

7. **Sound not playing**: User must interact with page first. Handle in menu scene.

8. **Particles in 3.60+**: API changed. Use `this.add.particles(x, y, texture, config)`.
