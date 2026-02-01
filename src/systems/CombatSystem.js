import { COMBAT, DAMAGE, METER, GRAPPLE } from '../config/constants.js';

export default class CombatSystem {
  constructor(scene) {
    this.scene = scene;
    this.fighters = [];

    // Listen for combat events
    this.scene.events.on('fighter-attack', this.handleAttack, this);
    this.scene.events.on('fighter-table-slam', this.handleTableSlam, this);
    this.scene.events.on('fighter-grapple-initiate', this.handleGrappleInitiate, this);
    this.scene.events.on('fighter-grapple-throw', this.handleGrappleThrow, this);
  }

  addFighter(fighter) {
    this.fighters.push(fighter);
  }

  removeFighter(fighter) {
    const index = this.fighters.indexOf(fighter);
    if (index > -1) {
      this.fighters.splice(index, 1);
    }
  }

  handleAttack(attacker) {
    // Find potential targets
    const targets = this.fighters.filter(f => f !== attacker);

    for (const target of targets) {
      if (this.checkHit(attacker, target)) {
        this.performAttack(attacker, target);
        break; // Only hit one target per attack
      }
    }
  }

  checkHit(attacker, target) {
    const range = attacker.getAttackRange();
    const distance = Phaser.Math.Distance.Between(
      attacker.x, attacker.y,
      target.x, target.y
    );

    // Check if in range
    if (distance > range) return false;

    // Check if facing the target
    const targetIsRight = target.x > attacker.x;
    if (attacker.facingRight !== targetIsRight) return false;

    return true;
  }

  performAttack(attacker, target) {
    // Calculate damage
    let damage = this.calculateDamage(attacker);

    // Apply attack power modifier
    damage = Math.round(damage * attacker.config.attackPower);

    // Determine if this causes knockdown
    const causesKnockdown = attacker.hasWeapon();
    const isHeavyHit = damage >= 15 || attacker.hasWeapon();

    // HIT FREEZE - pause game briefly for impact feel
    if (isHeavyHit) {
      this.hitFreeze(80);  // 80ms freeze for heavy hits
    } else {
      this.hitFreeze(30);  // 30ms for light hits
    }

    // Apply damage
    target.takeDamage(damage, attacker);

    // Knockdown if weapon hit
    if (causesKnockdown && target.health > 0) {
      target.knockdown();
    }

    // Register hit on weapon (may break it)
    if (attacker.heldWeapon && attacker.heldWeapon.registerHit) {
      const broke = attacker.heldWeapon.registerHit();
      if (broke) {
        // Weapon was destroyed, clear reference
        attacker.heldWeapon = null;
      }
    }

    // Attacker gains meter
    const meterGain = attacker.hasWeapon() ? METER.GAIN_WEAPON_HIT : METER.GAIN_HIT_DEALT;
    attacker.addMeter(meterGain);

    // Emit hit event for effects
    this.scene.events.emit('combat-hit', {
      attacker,
      target,
      damage,
      isWeaponHit: attacker.hasWeapon(),
      isHeavyHit,
      position: { x: target.x, y: target.y }
    });
  }

  hitFreeze(duration) {
    // Brief pause to emphasize impact
    this.scene.physics.pause();
    this.scene.time.delayedCall(duration, () => {
      if (!this.scene.isPaused) {
        this.scene.physics.resume();
      }
    });
  }

  calculateDamage(attacker) {
    if (attacker.hasWeapon()) {
      return DAMAGE.CHAIR;
    }

    // Random fist damage
    return Phaser.Math.Between(DAMAGE.FIST_MIN, DAMAGE.FIST_MAX);
  }

  handleTableSlam(attacker) {
    // Check for nearby table
    const table = this.findNearbyTable(attacker);
    if (!table) return;

    // Check for nearby target
    const target = this.findNearbyTarget(attacker, COMBAT.TABLE_SLAM_RANGE);
    if (!target) return;

    // Perform table slam
    this.performTableSlam(attacker, target, table);
  }

  findNearbyTable(fighter) {
    if (!this.scene.tables) return null;

    for (const table of this.scene.tables) {
      if (table.isIntact()) {
        const distance = Phaser.Math.Distance.Between(
          fighter.x, fighter.y,
          table.x, table.y
        );
        if (distance <= COMBAT.TABLE_SLAM_RANGE) {
          return table;
        }
      }
    }
    return null;
  }

  findNearbyTarget(attacker, range) {
    const targets = this.fighters.filter(f => f !== attacker && f.canAct());

    for (const target of targets) {
      const distance = Phaser.Math.Distance.Between(
        attacker.x, attacker.y,
        target.x, target.y
      );
      if (distance <= range) {
        return target;
      }
    }
    return null;
  }

  performTableSlam(attacker, target, table) {
    // Determine damage based on table state
    const damage = table.isOnFire() ? DAMAGE.FLAMING_TABLE : DAMAGE.TABLE_SLAM;

    // Apply damage
    target.takeDamage(damage, attacker);

    // Apply fire DOT if table was burning
    if (table.isOnFire()) {
      target.applyFireDamage();
    }

    // Always knockdown on table slam
    if (target.health > 0) {
      target.knockdown();
    }

    // Break the table
    table.break();

    // Attacker gains meter
    attacker.addMeter(METER.GAIN_TABLE_BREAK);

    // Emit table slam event for effects
    this.scene.events.emit('combat-table-slam', {
      attacker,
      target,
      table,
      damage,
      wasOnFire: table.wasOnFire
    });
  }

  performFinisher(attacker, target) {
    if (!attacker.useMeter()) return false;

    const damage = DAMAGE.FINISHER;

    target.takeDamage(damage, attacker);

    if (target.health > 0) {
      target.knockdown();
    }

    // Emit finisher event for effects
    this.scene.events.emit('combat-finisher', {
      attacker,
      target,
      damage
    });

    return true;
  }

  handleGrappleInitiate(attacker) {
    console.log('CombatSystem.handleGrappleInitiate called');

    // Check if attacker can grapple
    if (!attacker.canGrapple()) {
      console.log('Grapple failed: attacker cannot grapple, state:', attacker.state, 'hasWeapon:', attacker.hasWeapon());
      return;
    }

    // Find nearby target
    const target = this.findGrappleTarget(attacker);
    if (!target) {
      console.log('Grapple failed: no target in range. Checking distances...');
      // Log distances to all fighters for debugging
      for (const f of this.fighters) {
        if (f !== attacker) {
          const dist = Phaser.Math.Distance.Between(attacker.x, attacker.y, f.x, f.y);
          console.log('  Distance to opponent:', dist, 'Required:', GRAPPLE.INITIATE_RANGE);
        }
      }
      return;
    }

    // Check if target can be grappled (not already in grapple, not down/ko)
    if (target.isInGrapple() || !target.canAct()) {
      console.log('Grapple failed: target cannot be grappled, state:', target.state);
      return;
    }

    console.log('Grapple SUCCESS! Locking fighters...');

    // Lock both fighters into grapple
    const initiated = attacker.initiateGrapple(target);
    if (initiated) {
      target.becomeGrappled(attacker);

      // Calculate target positions for smooth animation
      const midX = (attacker.x + target.x) / 2;
      const offset = 50;  // Distance between grappled fighters
      const targetAttackerX = midX - offset;
      const targetVictimX = midX + offset;

      // Smooth tween fighters together instead of snapping
      this.scene.tweens.add({
        targets: attacker,
        x: targetAttackerX,
        duration: 150,
        ease: 'Power2'
      });

      this.scene.tweens.add({
        targets: target,
        x: targetVictimX,
        duration: 150,
        ease: 'Power2'
      });

      // Face each other
      attacker.facingRight = true;
      attacker.setFlipX(false);
      target.facingRight = false;
      target.setFlipX(true);

      // Flash both fighters to indicate grapple lock
      attacker.setTint(0xffff00);
      target.setTint(0xff6600);
      this.scene.time.delayedCall(100, () => {
        attacker.clearTint();
        target.clearTint();
      });

      // Emit grapple start event for effects
      this.scene.events.emit('combat-grapple-start', {
        attacker,
        target
      });
    }
  }

  findGrappleTarget(attacker) {
    const targets = this.fighters.filter(f => f !== attacker && f.canAct());

    for (const target of targets) {
      const distance = Phaser.Math.Distance.Between(
        attacker.x, attacker.y,
        target.x, target.y
      );
      if (distance <= GRAPPLE.INITIATE_RANGE) {
        return target;
      }
    }
    return null;
  }

  handleGrappleThrow(attacker, target, moveName, damage) {
    // Apply damage to target
    target.receiveThrow(damage, attacker);

    // Emit throw event for effects
    this.scene.events.emit('combat-grapple-throw', {
      attacker,
      target,
      moveName,
      damage,
      position: { x: target.x, y: target.y }
    });
  }

  destroy() {
    this.scene.events.off('fighter-attack', this.handleAttack, this);
    this.scene.events.off('fighter-table-slam', this.handleTableSlam, this);
    this.scene.events.off('fighter-grapple-initiate', this.handleGrappleInitiate, this);
    this.scene.events.off('fighter-grapple-throw', this.handleGrappleThrow, this);
    this.fighters = [];
  }
}
