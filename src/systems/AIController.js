import Phaser from 'phaser';
import { COMBAT, FIGHTER_STATES, GRAPPLE } from '../config/constants.js';

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

    // AI parameters
    this.aggressiveness = options.aggressiveness || 0.6;
    this.thinkInterval = options.thinkInterval || 500;
    this.attackRange = options.attackRange || 55;
    this.retreatHealthThreshold = options.retreatHealthThreshold || 0.3;

    // State
    this.aiState = AI_STATES.IDLE;
    this.lastThinkTime = 0;
    this.lastAttackTime = 0;
    this.attackCooldown = options.attackCooldown || 1000;  // Use option or default

    // Decision weights
    this.weights = {
      approach: 0.35,
      attack: 0.25,
      retreat: 0.15,
      seekWeapon: 0.1,
      seekTable: 0.05,
      grapple: 0.1
    };

    // Grapple tracking
    this.lastGrappleTime = 0;
    this.grappleCooldown = 3000; // Don't spam grapples
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
      // Boost grapple weight when close and unarmed
      grapple += 0.25;
      // Extra boost if target is healthy (grapples are good openers)
      if (this.target.health > this.target.maxHealth * 0.7) {
        grapple += 0.1;
      }
    } else {
      grapple = 0; // Can't grapple, remove from consideration
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

    // Normalize weights
    const total = approach + attack + retreat + seekWeapon + seekTable + grapple;
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
      this.moveToward(this.target.x, this.target.y, 0.8);
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

    // Stop moving to attack
    this.fighter.body.setVelocity(0, 0);

    // Attack if cooldown is done
    if (time - this.lastAttackTime >= this.attackCooldown) {
      // Random chance to actually attack based on aggressiveness
      if (Math.random() < this.aggressiveness) {
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
    // Move away from target
    const angle = Phaser.Math.Angle.Between(
      this.target.x, this.target.y,
      this.fighter.x, this.fighter.y
    );

    this.fighter.body.setVelocity(
      Math.cos(angle) * this.fighter.speed * 0.6,
      Math.sin(angle) * this.fighter.speed * 0.6
    );
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
    // Cleanup if needed
  }
}
