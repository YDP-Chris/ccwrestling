import { COMBAT, DAMAGE, METER, GRAPPLE, COMBO } from '../config/constants.js';

export default class CombatSystem {
  constructor(scene) {
    this.scene = scene;
    this.fighters = [];

    // Combo tracking per fighter
    this.comboState = new Map(); // fighter -> { count, lastHitTime, target }

    // Listen for combat events
    this.scene.events.on('fighter-attack', this.handleAttack, this);
    this.scene.events.on('fighter-table-slam', this.handleTableSlam, this);
    this.scene.events.on('fighter-grapple-initiate', this.handleGrappleInitiate, this);
    this.scene.events.on('fighter-grapple-throw', this.handleGrappleThrow, this);
  }

  getComboState(fighter) {
    if (!this.comboState.has(fighter)) {
      this.comboState.set(fighter, { count: 0, lastHitTime: 0, target: null });
    }
    return this.comboState.get(fighter);
  }

  updateCombo(attacker, target, time) {
    const state = this.getComboState(attacker);
    const timeSinceLastHit = time - state.lastHitTime;

    // Check if combo continues or resets
    if (timeSinceLastHit <= COMBO.WINDOW && state.target === target) {
      state.count++;
    } else {
      state.count = 1; // Start new combo
    }

    state.lastHitTime = time;
    state.target = target;

    return state.count;
  }

  getComboMultiplier(comboCount) {
    if (comboCount <= 1) return 1.0;
    const bonus = (comboCount - 1) * COMBO.MULTIPLIER_PER_HIT;
    return Math.min(1.0 + bonus, COMBO.MAX_MULTIPLIER);
  }

  resetCombo(fighter) {
    const state = this.getComboState(fighter);
    if (state.count > 1) {
      // Emit combo end event
      this.scene.events.emit('combat-combo-end', {
        fighter,
        finalCount: state.count
      });
    }
    state.count = 0;
    state.target = null;
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
    // Safety check - scene may be transitioning
    if (!this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;

    // Find potential targets
    const targets = this.fighters.filter(f => f !== attacker);

    let hitLanded = false;
    for (const target of targets) {
      if (this.checkHit(attacker, target)) {
        this.performAttack(attacker, target);
        hitLanded = true;
        break; // Only hit one target per attack
      }
    }

    // Reset combo on whiff (miss)
    if (!hitLanded) {
      this.resetCombo(attacker);
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
    const currentTime = this.scene.time.now;

    // Update combo state
    const comboCount = this.updateCombo(attacker, target, currentTime);
    const comboMultiplier = this.getComboMultiplier(comboCount);

    // Calculate damage with combo multiplier
    let damage = this.calculateDamage(attacker);

    // Apply attack power modifier
    damage = Math.round(damage * attacker.config.attackPower);

    // Apply combo multiplier
    damage = Math.round(damage * comboMultiplier);

    // Determine if this causes knockdown
    const causesKnockdown = attacker.hasWeapon();
    const isHeavyHit = damage >= 15 || attacker.hasWeapon();

    // HIT FREEZE - pause game briefly for impact feel (longer freeze for combos)
    const freezeDuration = isHeavyHit ? 80 : 30;
    const comboFreezeBonus = Math.min((comboCount - 1) * 10, 40);
    this.hitFreeze(freezeDuration + comboFreezeBonus);

    // Apply damage
    target.takeDamage(damage, attacker);

    // Knockdown if weapon hit OR high combo (5+ hits)
    if ((causesKnockdown || comboCount >= 5) && target.health > 0) {
      target.knockdown();
      // Reset combo after knockdown
      this.resetCombo(attacker);
    }

    // Register hit on weapon (may break it)
    if (attacker.heldWeapon && attacker.heldWeapon.registerHit) {
      const broke = attacker.heldWeapon.registerHit();
      if (broke) {
        // Weapon was destroyed, clear reference
        attacker.heldWeapon = null;
      }
    }

    // Attacker gains meter (bonus for combos)
    const baseMeterGain = attacker.hasWeapon() ? METER.GAIN_WEAPON_HIT : METER.GAIN_HIT_DEALT;
    const comboMeterBonus = (comboCount - 1) * COMBO.METER_BONUS_PER_HIT;
    attacker.addMeter(baseMeterGain + comboMeterBonus);

    // Emit hit event for effects
    this.scene.events.emit('combat-hit', {
      attacker,
      target,
      damage,
      isWeaponHit: attacker.hasWeapon(),
      isHeavyHit,
      position: { x: target.x, y: target.y },
      comboCount,
      comboMultiplier
    });

    // Emit combo event if combo is active
    if (comboCount >= 2) {
      this.scene.events.emit('combat-combo', {
        attacker,
        target,
        comboCount,
        comboMultiplier,
        position: { x: target.x, y: target.y - 60 }
      });
    }
  }

  hitFreeze(duration) {
    // Safety check
    if (!this.scene || !this.scene.physics || !this.scene.time) return;

    // Brief pause to emphasize impact
    this.scene.physics.pause();
    this.scene.time.delayedCall(duration, () => {
      // Safety check - scene may be transitioning when timer fires
      if (!this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;
      if (!this.scene.isPaused && this.scene.physics) {
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
    // Safety check - scene may be transitioning
    if (!this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;

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
    // Safety check - scene may be transitioning
    if (!this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;

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
        // Safety check - scene may be transitioning when timer fires
        if (!this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;
        if (attacker && attacker.clearTint) attacker.clearTint();
        if (target && target.clearTint) target.clearTint();
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
    // Safety check - scene may be transitioning
    if (!this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;

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
    if (this.scene && this.scene.events) {
      this.scene.events.off('fighter-attack', this.handleAttack, this);
      this.scene.events.off('fighter-table-slam', this.handleTableSlam, this);
      this.scene.events.off('fighter-grapple-initiate', this.handleGrappleInitiate, this);
      this.scene.events.off('fighter-grapple-throw', this.handleGrappleThrow, this);
    }
    this.fighters = [];
  }
}
