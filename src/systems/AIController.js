import Phaser from 'phaser';
import { COMBAT, FIGHTER_STATES, GRAPPLE } from '../config/constants.js';
import { AI_PROFILES } from '../config/characters.js';

const AI_STATES = {
  IDLE: 'idle',
  APPROACH: 'approach',
  ATTACK: 'attack',
  RETREAT: 'retreat',
  SEEK_WEAPON: 'seek_weapon',
  SEEK_TABLE: 'seek_table',
  GRAPPLE: 'grapple'
};

export default class AIController {
  constructor(scene, fighter, target, options = {}) {
    this.scene = scene;
    this.fighter = fighter;
    this.target = target;

    // Load character-specific AI profile
    const characterKey = fighter.config?.spriteKey?.toUpperCase() || 'VIPER';
    const profile = AI_PROFILES[characterKey] || AI_PROFILES.VIPER;

    // AI parameters from profile (options can override)
    this.aggressiveness = options.aggressiveness ?? profile.aggressiveness;
    this.thinkInterval = options.thinkInterval ?? profile.thinkInterval;
    this.attackRange = options.attackRange || 90; // Updated for new ranges
    this.retreatHealthThreshold = options.retreatHealthThreshold ?? profile.retreatHealthThreshold;
    this.personality = profile.personality;

    // State
    this.aiState = AI_STATES.IDLE;
    this.lastThinkTime = 0;
    this.lastAttackTime = 0;
    this.attackCooldown = options.attackCooldown ?? profile.attackCooldown;

    // Decision weights from profile
    this.weights = { ...profile.weights };

    // Grapple tracking
    this.lastGrappleTime = 0;
    this.grappleCooldown = 3000;

    // Combo awareness - track how many times we've been hit recently
    this.recentHitsTaken = 0;
    this.lastHitTime = 0;
    this.hitTrackingWindow = 2000; // 2 seconds

    // Listen for when this fighter gets hit
    this.scene.events.on('fighter-damaged', this.onFighterDamaged, this);
  }

  onFighterDamaged(fighter, damage, attacker) {
    if (fighter === this.fighter) {
      const now = this.scene.time.now;
      // Reset counter if it's been a while
      if (now - this.lastHitTime > this.hitTrackingWindow) {
        this.recentHitsTaken = 0;
      }
      this.recentHitsTaken++;
      this.lastHitTime = now;
    }
  }

  update(time, delta) {
    // Handle grapple state specially - AI needs to execute throw
    if (this.fighter.state === FIGHTER_STATES.GRAPPLING) {
      this.handleGrapplingState(time);
      return;
    }

    // Handle being grappled - try to escape
    if (this.fighter.state === FIGHTER_STATES.GRAPPLED) {
      this.handleGrappledState(time);
      return;
    }

    if (!this.fighter.canAct()) {
      return;
    }

    // Only think at intervals
    if (time - this.lastThinkTime >= this.thinkInterval) {
      this.think();
      this.lastThinkTime = time;
    }

    // Execute current state
    this.executeState(time);
  }

  think() {
    const distanceToTarget = this.getDistanceToTarget();
    const healthPercent = this.fighter.health / this.fighter.maxHealth;
    const hasWeapon = this.fighter.hasWeapon();
    const currentTime = this.scene.time.now;

    // Adjust weights based on situation
    let approach = this.weights.approach;
    let attack = this.weights.attack;
    let retreat = this.weights.retreat;
    let seekWeapon = this.weights.seekWeapon;
    let seekTable = this.weights.seekTable;
    let grapple = this.weights.grapple;

    // === COMBO AWARENESS ===
    // If getting combo'd (hit multiple times recently), prioritize escape
    if (this.recentHitsTaken >= 2 && currentTime - this.lastHitTime < 1500) {
      retreat += 0.4;  // Strong retreat urge when being combo'd
      approach -= 0.2;
      attack -= 0.2;
    }

    // === PERSONALITY-BASED ADJUSTMENTS ===
    switch (this.personality) {
      case 'brawler': // Dumpster - seeks weapons, trades hits
        if (!hasWeapon) seekWeapon += 0.2;
        if (hasWeapon) attack += 0.3;
        break;

      case 'hitAndRun': // Scar - strike and retreat
        if (distanceToTarget < this.attackRange) {
          attack += 0.2;
        }
        // After attacking, want to retreat
        if (this.aiState === AI_STATES.ATTACK) {
          retreat += 0.3;
        }
        break;

      case 'rushdown': // Blaze - relentless offense
        approach += 0.2;
        attack += 0.2;
        retreat = Math.max(0, retreat - 0.1);
        break;

      case 'grappler': // Tank - close distance, grab
        if (distanceToTarget > GRAPPLE.INITIATE_RANGE) {
          approach += 0.3;
        }
        grapple += 0.2;
        break;

      case 'adaptive': // Viper - read and respond
        // Match target's behavior somewhat
        const targetHealthPercent = this.target.health / this.target.maxHealth;
        if (targetHealthPercent < 0.3) {
          // Target is hurt - press advantage
          approach += 0.2;
          attack += 0.2;
        } else if (healthPercent < targetHealthPercent) {
          // We're losing - be more careful
          retreat += 0.15;
          seekWeapon += 0.1;
        }
        break;
    }

    // === STANDARD SITUATIONAL ADJUSTMENTS ===
    // More aggressive when healthy
    if (healthPercent > 0.7) {
      approach += 0.2;
      attack += 0.1;
      retreat -= 0.1;
    }

    // More defensive when hurt
    if (healthPercent < this.retreatHealthThreshold) {
      retreat += 0.3;
      approach -= 0.2;
    }

    // Want weapon if don't have one and one is available
    if (!hasWeapon && this.findNearestChair()) {
      seekWeapon += 0.3;
    }

    // Consider table slam if target is near table
    if (this.findNearbyTable() && distanceToTarget < COMBAT.TABLE_SLAM_RANGE) {
      seekTable += 0.4;
    }

    // Grapple considerations
    const canGrapple = !hasWeapon &&
                       distanceToTarget < GRAPPLE.INITIATE_RANGE * 1.5 &&
                       currentTime - this.lastGrappleTime > this.grappleCooldown &&
                       this.target.canAct();

    if (canGrapple) {
      grapple += 0.25;
      if (this.target.health > this.target.maxHealth * 0.7) {
        grapple += 0.1;
      }
    } else {
      grapple = 0;
    }

    // Attack if in range
    if (distanceToTarget < this.attackRange) {
      attack += 0.4;
    } else {
      approach += 0.2;
    }

    // Apply aggressiveness modifier
    approach *= this.aggressiveness;
    attack *= this.aggressiveness;
    grapple *= this.aggressiveness;
    retreat *= (1 - this.aggressiveness);

    // Ensure no negative weights
    approach = Math.max(0, approach);
    attack = Math.max(0, attack);
    retreat = Math.max(0, retreat);
    seekWeapon = Math.max(0, seekWeapon);
    seekTable = Math.max(0, seekTable);
    grapple = Math.max(0, grapple);

    // Normalize weights
    const total = approach + attack + retreat + seekWeapon + seekTable + grapple;
    if (total === 0) {
      this.aiState = AI_STATES.IDLE;
      return;
    }
    approach /= total;
    attack /= total;
    retreat /= total;
    seekWeapon /= total;
    seekTable /= total;
    grapple /= total;

    // Random decision based on weights
    const roll = Math.random();
    let cumulative = 0;

    cumulative += approach;
    if (roll < cumulative) {
      this.aiState = AI_STATES.APPROACH;
      return;
    }

    cumulative += attack;
    if (roll < cumulative) {
      this.aiState = AI_STATES.ATTACK;
      return;
    }

    cumulative += grapple;
    if (roll < cumulative) {
      this.aiState = AI_STATES.GRAPPLE;
      return;
    }

    cumulative += retreat;
    if (roll < cumulative) {
      this.aiState = AI_STATES.RETREAT;
      return;
    }

    cumulative += seekWeapon;
    if (roll < cumulative) {
      this.aiState = AI_STATES.SEEK_WEAPON;
      return;
    }

    this.aiState = AI_STATES.SEEK_TABLE;
  }

  executeState(time) {
    // Always face target
    this.fighter.facingRight = this.target.x > this.fighter.x;
    this.fighter.setFlipX(!this.fighter.facingRight);

    switch (this.aiState) {
      case AI_STATES.APPROACH:
        this.executeApproach();
        break;
      case AI_STATES.ATTACK:
        this.executeAttack(time);
        break;
      case AI_STATES.GRAPPLE:
        this.executeGrapple(time);
        break;
      case AI_STATES.RETREAT:
        this.executeRetreat();
        break;
      case AI_STATES.SEEK_WEAPON:
        this.executeSeekWeapon();
        break;
      case AI_STATES.SEEK_TABLE:
        this.executeSeekTable(time);
        break;
      default:
        this.fighter.body.setVelocity(0, 0);
    }
  }

  executeApproach() {
    const distance = this.getDistanceToTarget();

    if (distance > this.attackRange) {
      // Add some lateral movement based on personality
      let strafeAmount = 0;

      // Hitandrun and adaptive personalities strafe more
      if (this.personality === 'hitAndRun' || this.personality === 'adaptive') {
        // Strafe vertically to avoid walking straight into attacks
        const verticalDiff = this.target.y - this.fighter.y;
        if (Math.abs(verticalDiff) < 30) {
          // If roughly on same plane, move up or down randomly
          strafeAmount = (Math.random() > 0.5 ? 1 : -1) * 0.3;
        }
      }

      // Approach with optional strafing
      this.moveTowardWithStrafe(this.target.x, this.target.y, 0.8, strafeAmount);
    } else {
      this.fighter.body.setVelocity(0, 0);
      this.aiState = AI_STATES.ATTACK;
    }
  }

  executeAttack(time) {
    const distance = this.getDistanceToTarget();

    if (distance > this.attackRange * 1.5) {
      // Too far, go back to approach
      this.aiState = AI_STATES.APPROACH;
      return;
    }

    // Check if target is attacking - be more defensive if so
    const targetIsAttacking = this.target.state === FIGHTER_STATES.ATTACKING;

    // Personality affects attack timing
    let attackChance = this.aggressiveness;

    if (targetIsAttacking) {
      // Most personalities back off when target is attacking
      if (this.personality !== 'rushdown') {
        attackChance *= 0.3; // Much less likely to trade hits
        // Consider backing off
        if (Math.random() < 0.4) {
          this.aiState = AI_STATES.RETREAT;
          return;
        }
      }
    }

    // Hit-and-run personality: attack then immediately plan retreat
    if (this.personality === 'hitAndRun' && time - this.lastAttackTime < 500) {
      this.aiState = AI_STATES.RETREAT;
      return;
    }

    // Stop moving to attack (or slight drift based on personality)
    if (this.personality === 'rushdown') {
      // Rushdown keeps slight pressure
      this.moveToward(this.target.x, this.target.y, 0.2);
    } else {
      this.fighter.body.setVelocity(0, 0);
    }

    // Attack if cooldown is done
    if (time - this.lastAttackTime >= this.attackCooldown) {
      if (Math.random() < attackChance) {
        this.fighter.attack();
        this.lastAttackTime = time;
      }
    }
  }

  executeGrapple(time) {
    const distance = this.getDistanceToTarget();

    // If too far, approach first
    if (distance > GRAPPLE.INITIATE_RANGE) {
      this.moveToward(this.target.x, this.target.y, 0.9);
      return;
    }

    // Stop and attempt grapple
    this.fighter.body.setVelocity(0, 0);

    // Try to initiate grapple
    if (this.fighter.canGrapple() && this.target.canAct()) {
      this.scene.events.emit('fighter-grapple-initiate', this.fighter);
      this.lastGrappleTime = time;
      this.aiState = AI_STATES.APPROACH; // Will be overridden if grapple succeeds
    } else {
      // Can't grapple, fall back to approach
      this.aiState = AI_STATES.APPROACH;
    }
  }

  handleGrapplingState(time) {
    // AI has grabbed target, decide when to throw
    // Wait a short random time then execute throw
    if (!this.grappleThrowQueued) {
      this.grappleThrowQueued = true;
      const throwDelay = Phaser.Math.Between(300, 800);
      this.scene.time.delayedCall(throwDelay, () => {
        if (this.fighter.state === FIGHTER_STATES.GRAPPLING) {
          this.fighter.executeGrappleMove();
        }
        this.grappleThrowQueued = false;
      });
    }
  }

  handleGrappledState(time) {
    // AI is being grappled, mash to escape
    // Simulate button mashing at random intervals
    if (!this.lastEscapeAttempt) {
      this.lastEscapeAttempt = time;
    }

    const mashInterval = Phaser.Math.Between(100, 300);
    if (time - this.lastEscapeAttempt >= mashInterval) {
      this.fighter.tryEscape();
      this.lastEscapeAttempt = time;
    }
  }

  executeRetreat() {
    // Move away from target with smart strafing
    const angle = Phaser.Math.Angle.Between(
      this.target.x, this.target.y,
      this.fighter.x, this.fighter.y
    );

    // Check arena bounds and adjust retreat angle
    let retreatAngle = angle;
    const margin = 80;
    const arenaLeft = margin;
    const arenaRight = 800 - margin;
    const arenaTop = 150 + margin;
    const arenaBottom = 400 - margin;

    // If near edge, angle retreat away from wall
    if (this.fighter.x < arenaLeft) {
      retreatAngle = Phaser.Math.Angle.RotateToAngle(retreatAngle, 0, 0.5);
    } else if (this.fighter.x > arenaRight) {
      retreatAngle = Phaser.Math.Angle.RotateToAngle(retreatAngle, Math.PI, 0.5);
    }
    if (this.fighter.y < arenaTop) {
      retreatAngle = Phaser.Math.Angle.RotateToAngle(retreatAngle, Math.PI / 2, 0.5);
    } else if (this.fighter.y > arenaBottom) {
      retreatAngle = Phaser.Math.Angle.RotateToAngle(retreatAngle, -Math.PI / 2, 0.5);
    }

    // Add some random strafe to retreat to be unpredictable
    const strafeOffset = (Math.random() - 0.5) * 0.4;
    retreatAngle += strafeOffset;

    const speed = this.fighter.speed * 0.7;
    this.fighter.body.setVelocity(
      Math.cos(retreatAngle) * speed,
      Math.sin(retreatAngle) * speed
    );

    // Reset recent hits when successfully retreating
    if (this.recentHitsTaken > 0) {
      this.recentHitsTaken = Math.max(0, this.recentHitsTaken - 1);
    }
  }

  executeSeekWeapon() {
    const chair = this.findNearestChair();

    if (!chair) {
      this.aiState = AI_STATES.APPROACH;
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      this.fighter.x, this.fighter.y,
      chair.x, chair.y
    );

    if (distance <= COMBAT.PICKUP_RANGE) {
      // Try to pick up
      this.scene.events.emit('fighter-pickup', this.fighter);
      this.aiState = AI_STATES.APPROACH;
    } else {
      this.moveToward(chair.x, chair.y, 0.9);
    }
  }

  executeSeekTable(time) {
    const table = this.findNearbyTable();
    const distanceToTarget = this.getDistanceToTarget();

    if (!table) {
      this.aiState = AI_STATES.APPROACH;
      return;
    }

    // Check if both near table for slam
    const fighterToTable = Phaser.Math.Distance.Between(
      this.fighter.x, this.fighter.y,
      table.x, table.y
    );

    const targetToTable = Phaser.Math.Distance.Between(
      this.target.x, this.target.y,
      table.x, table.y
    );

    if (fighterToTable <= COMBAT.TABLE_SLAM_RANGE &&
        targetToTable <= COMBAT.TABLE_SLAM_RANGE &&
        distanceToTarget <= COMBAT.TABLE_SLAM_RANGE) {
      // Try table slam
      this.scene.events.emit('fighter-table-slam', this.fighter);
      this.aiState = AI_STATES.APPROACH;
    } else if (fighterToTable > COMBAT.TABLE_SLAM_RANGE) {
      // Move to table
      this.moveToward(table.x, table.y, 0.7);
    } else {
      // At table, wait for target or switch states
      this.fighter.body.setVelocity(0, 0);
      if (Math.random() < 0.1) {
        this.aiState = AI_STATES.APPROACH;
      }
    }
  }

  moveToward(x, y, speedMultiplier = 1) {
    const angle = Phaser.Math.Angle.Between(
      this.fighter.x, this.fighter.y,
      x, y
    );

    this.fighter.body.setVelocity(
      Math.cos(angle) * this.fighter.speed * speedMultiplier,
      Math.sin(angle) * this.fighter.speed * speedMultiplier
    );
  }

  moveTowardWithStrafe(x, y, speedMultiplier = 1, strafeAmount = 0) {
    const angle = Phaser.Math.Angle.Between(
      this.fighter.x, this.fighter.y,
      x, y
    );

    // Add perpendicular strafe component
    const strafeAngle = angle + Math.PI / 2;

    const vx = Math.cos(angle) * this.fighter.speed * speedMultiplier +
               Math.cos(strafeAngle) * this.fighter.speed * strafeAmount;
    const vy = Math.sin(angle) * this.fighter.speed * speedMultiplier +
               Math.sin(strafeAngle) * this.fighter.speed * strafeAmount;

    this.fighter.body.setVelocity(vx, vy);
  }

  getDistanceToTarget() {
    return Phaser.Math.Distance.Between(
      this.fighter.x, this.fighter.y,
      this.target.x, this.target.y
    );
  }

  findNearestChair() {
    if (!this.scene.chairs) return null;

    let nearest = null;
    let nearestDist = Infinity;

    for (const chair of this.scene.chairs) {
      if (!chair.canPickup()) continue;

      const dist = Phaser.Math.Distance.Between(
        this.fighter.x, this.fighter.y,
        chair.x, chair.y
      );

      if (dist < nearestDist) {
        nearest = chair;
        nearestDist = dist;
      }
    }

    return nearest;
  }

  findNearbyTable() {
    if (!this.scene.tables) return null;

    for (const table of this.scene.tables) {
      if (!table.isIntact()) continue;

      const dist = Phaser.Math.Distance.Between(
        this.fighter.x, this.fighter.y,
        table.x, table.y
      );

      if (dist < 150) {
        return table;
      }
    }

    return null;
  }

  setAggressiveness(value) {
    this.aggressiveness = Math.max(0, Math.min(1, value));
  }

  destroy() {
    // Remove event listener
    this.scene.events.off('fighter-damaged', this.onFighterDamaged, this);
  }
}
