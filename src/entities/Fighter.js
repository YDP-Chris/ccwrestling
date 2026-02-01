import Phaser from 'phaser';
import { FIGHTER_STATES, MOVEMENT, HEALTH, COMBAT, TIMING, METER, DAMAGE, GRAPPLE } from '../config/constants.js';

export default class Fighter extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, characterConfig, isPlayer = false) {
    // Use the idle animation spritesheet as the initial texture
    const textureKey = characterConfig.animations.idle;
    console.log('Fighter: Creating with texture', textureKey);

    // Check if texture exists
    if (!scene.textures.exists(textureKey)) {
      console.error('Fighter: Texture not found:', textureKey);
    }

    super(scene, x, y, textureKey);

    this.scene = scene;
    this.config = characterConfig;
    this.isPlayer = isPlayer;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics setup
    this.body.setCollideWorldBounds(true);
    this.body.setSize(this.config.hitboxWidth, this.config.hitboxHeight);
    this.body.setOffset(this.config.hitboxOffsetX || 0, this.config.hitboxOffsetY || 0);

    // Sprites are 128x128, scale up 2.5x for better presence (320x320)
    this.setScale(2.5);

    // Depth will be updated dynamically based on Y position
    this.setDepth(9999);

    // Stats
    this.health = this.config.health;
    this.maxHealth = this.config.health;
    this.extremeMeter = 0;
    this.speed = this.config.speed;

    // State
    this.state = FIGHTER_STATES.IDLE;
    this.facingRight = isPlayer ? true : false;
    this.heldWeapon = null;

    // Timers
    this.stateTimer = null;
    this.fireTimer = null;
    this.fireTicks = 0;

    // Combat flags
    this.attackHitbox = null;
    this.isInvulnerable = false;

    // Grapple state
    this.grappleTarget = null;
    this.grappledBy = null;
    this.escapeMashCount = 0;
    this.grappleTimer = null;

    // Set initial facing and play idle animation
    this.setFlipX(!this.facingRight);

    // Check if animation exists before playing
    if (scene.anims.exists(this.config.animations.idle)) {
      this.play(this.config.animations.idle);
    } else {
      console.error('Fighter: Animation not found:', this.config.animations.idle);
    }
  }

  update(cursors, attackKey, pickupKey, tableSlamKey, lightFireKey, grappleKey) {
    // DEBUG: Set extremely high depth to ensure fighters are visible
    this.setDepth(9999);

    // Update animation based on state
    this.updateAnimation();

    // Handle escape mashing if grappled
    if (this.state === FIGHTER_STATES.GRAPPLED && attackKey && Phaser.Input.Keyboard.JustDown(attackKey)) {
      this.tryEscape();
      return;
    }

    // Handle throw selection if grappling
    if (this.state === FIGHTER_STATES.GRAPPLING && attackKey && Phaser.Input.Keyboard.JustDown(attackKey)) {
      this.executeGrappleMove();
      return;
    }

    if (!this.canAct()) {
      return;
    }

    this.handleMovement(cursors);
    this.handleActions(attackKey, pickupKey, tableSlamKey, lightFireKey, grappleKey);
  }

  updateAnimation() {
    const anims = this.config.animations;

    switch (this.state) {
      case FIGHTER_STATES.IDLE:
        if (this.anims.currentAnim?.key !== anims.idle) {
          this.play(anims.idle, true);
        }
        break;
      case FIGHTER_STATES.WALKING:
        if (this.anims.currentAnim?.key !== anims.walk) {
          this.play(anims.walk, true);
        }
        break;
      case FIGHTER_STATES.HITSTUN:
        if (this.anims.currentAnim?.key !== anims.hit) {
          this.play(anims.hit, true);
        }
        break;
      case FIGHTER_STATES.DOWN:
      case FIGHTER_STATES.KO:
        if (this.anims.currentAnim?.key !== anims.down) {
          this.play(anims.down, true);
        }
        break;
      case FIGHTER_STATES.GETUP:
        if (this.anims.currentAnim?.key !== anims.getup) {
          this.play(anims.getup, true);
        }
        break;
      case FIGHTER_STATES.GRAPPLING:
        // Use grapple animation or fallback to punch
        const grappleAnim = anims.grapple || anims.punch;
        if (this.anims.currentAnim?.key !== grappleAnim) {
          this.play(grappleAnim, true);
        }
        break;
      case FIGHTER_STATES.GRAPPLED:
        // Use grappled animation or fallback to hit
        const grappledAnim = anims.grappled || anims.hit;
        if (this.anims.currentAnim?.key !== grappledAnim) {
          this.play(grappledAnim, true);
        }
        break;
      case FIGHTER_STATES.THROWING:
        // Throw animation is set in executeGrappleMove() based on move type
        // Don't override it here
        break;
      // ATTACKING is handled in the attack() method
    }
  }

  handleMovement(cursors) {
    if (!this.canAct()) {
      this.body.setVelocity(0, 0);
      return;
    }

    let velocityX = 0;
    let velocityY = 0;

    if (cursors.left.isDown) {
      velocityX = -this.speed;
      this.facingRight = false;
    } else if (cursors.right.isDown) {
      velocityX = this.speed;
      this.facingRight = true;
    }

    if (cursors.up.isDown) {
      velocityY = -this.speed;
    } else if (cursors.down.isDown) {
      velocityY = this.speed;
    }

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }

    this.body.setVelocity(velocityX, velocityY);
    this.setFlipX(!this.facingRight);

    // Update state
    if (velocityX !== 0 || velocityY !== 0) {
      this.state = FIGHTER_STATES.WALKING;
    } else {
      this.state = FIGHTER_STATES.IDLE;
    }
  }

  handleActions(attackKey, pickupKey, tableSlamKey, lightFireKey, grappleKey) {
    if (attackKey && Phaser.Input.Keyboard.JustDown(attackKey)) {
      this.attack();
    }

    if (pickupKey && Phaser.Input.Keyboard.JustDown(pickupKey)) {
      this.tryPickup();
    }

    if (tableSlamKey && Phaser.Input.Keyboard.JustDown(tableSlamKey)) {
      this.tryTableSlam();
    }

    if (lightFireKey && Phaser.Input.Keyboard.JustDown(lightFireKey)) {
      this.tryLightFire();
    }

    if (grappleKey && Phaser.Input.Keyboard.JustDown(grappleKey)) {
      this.tryGrapple();
    }
  }

  attack() {
    if (!this.canAct()) return;

    this.state = FIGHTER_STATES.ATTACKING;
    this.body.setVelocity(0, 0);

    // Play appropriate attack animation
    const attackAnim = this.heldWeapon ? this.config.animations.chair : this.config.animations.punch;
    this.play(attackAnim, true);

    // Visual feedback - aggressive lunge forward
    const lungeDistance = this.heldWeapon ? 30 : 20;  // Bigger lunge with weapon
    const lungeX = this.facingRight ? lungeDistance : -lungeDistance;

    // Squash and stretch for impact feel
    this.scene.tweens.add({
      targets: this,
      scaleX: 2.7,  // Stretch horizontally on attack
      scaleY: 2.3,  // Squash vertically
      duration: 40,
      yoyo: true,
      onComplete: () => {
        this.setScale(2.5);  // Reset to default
      }
    });

    // Forward lunge
    this.scene.tweens.add({
      targets: this,
      x: this.x + lungeX,
      duration: 60,
      ease: 'Power2',
      yoyo: true
    });

    // Emit attack event for combat system
    this.emitEvent('fighter-attack', this);

    // Return to idle when animation completes
    this.once('animationcomplete', () => {
      if (this.state === FIGHTER_STATES.ATTACKING) {
        this.state = FIGHTER_STATES.IDLE;
      }
    });

    // Fallback timer in case animation doesn't complete
    this.stateTimer = this.scene.time.delayedCall(COMBAT.ATTACK_DURATION + 100, () => {
      if (this.state === FIGHTER_STATES.ATTACKING) {
        this.state = FIGHTER_STATES.IDLE;
      }
    });
  }

  // Safe event emit helper
  emitEvent(eventName, ...args) {
    if (this.scene && this.scene.events) {
      this.scene.events.emit(eventName, ...args);
    }
  }

  tryPickup() {
    this.emitEvent('fighter-pickup', this);
  }

  tryTableSlam() {
    this.emitEvent('fighter-table-slam', this);
  }

  tryLightFire() {
    this.emitEvent('fighter-light-fire', this);
  }

  tryGrapple() {
    console.log('Fighter.tryGrapple() called, canGrapple:', this.canGrapple());
    this.emitEvent('fighter-grapple-initiate', this);
  }

  canGrapple() {
    return this.canAct() && !this.heldWeapon;
  }

  initiateGrapple(target) {
    if (!this.canGrapple()) return false;

    this.state = FIGHTER_STATES.GRAPPLING;
    this.grappleTarget = target;
    this.body.setVelocity(0, 0);

    // Gain meter for initiating
    this.addMeter(GRAPPLE.METER.INITIATE);

    // Auto-throw timer if player doesn't press attack
    this.grappleTimer = this.scene.time.delayedCall(GRAPPLE.ESCAPE_WINDOW, () => {
      if (this.state === FIGHTER_STATES.GRAPPLING && this.grappleTarget) {
        this.executeGrappleMove();
      }
    });

    return true;
  }

  becomeGrappled(attacker) {
    this.state = FIGHTER_STATES.GRAPPLED;
    this.grappledBy = attacker;
    this.escapeMashCount = 0;
    if (this.body) {
      this.body.setVelocity(0, 0);
    }

    // Drop weapon when grappled
    this.dropWeapon();
  }

  tryEscape() {
    if (this.state !== FIGHTER_STATES.GRAPPLED) return;

    this.escapeMashCount++;

    // Visual feedback for mashing - shake and color based on progress
    const progress = this.escapeMashCount / GRAPPLE.ESCAPE_THRESHOLD;
    const shakeAmount = 3 + (progress * 5);

    // Shake the fighter sprite
    this.scene.tweens.add({
      targets: this,
      x: this.x + Phaser.Math.Between(-shakeAmount, shakeAmount),
      duration: 30,
      yoyo: true
    });

    // Color transitions from red to yellow to white as escape nears
    let tintColor;
    if (progress < 0.4) {
      tintColor = 0xff4444;  // Red - struggling
    } else if (progress < 0.8) {
      tintColor = 0xffaa00;  // Orange - getting close
    } else {
      tintColor = 0xffff00;  // Yellow - almost free
    }

    this.setTint(tintColor);
    if (this.scene && this.scene.time) {
      this.scene.time.delayedCall(80, () => {
        this.clearTint();
      });
    }

    // Show escape progress text
    this.showEscapeProgress(this.escapeMashCount, GRAPPLE.ESCAPE_THRESHOLD);

    if (this.escapeMashCount >= GRAPPLE.ESCAPE_THRESHOLD) {
      this.escapeGrapple();
    }
  }

  showEscapeProgress(current, max) {
    // Remove existing progress text
    if (this.escapeProgressText) {
      this.escapeProgressText.destroy();
    }

    // Show mash count above head
    const remaining = max - current;
    if (remaining > 0) {
      this.escapeProgressText = this.scene.add.text(
        this.x,
        this.y - 80,
        `${remaining}`,
        {
          fontFamily: 'Arial Black',
          fontSize: '24px',
          color: '#FFFF00',
          stroke: '#000000',
          strokeThickness: 4
        }
      );
      this.escapeProgressText.setOrigin(0.5);
      this.escapeProgressText.setDepth(10000);

      // Animate and fade
      this.scene.tweens.add({
        targets: this.escapeProgressText,
        y: this.y - 100,
        alpha: 0,
        scale: 1.5,
        duration: 400,
        onComplete: () => {
          if (this.escapeProgressText) {
            this.escapeProgressText.destroy();
            this.escapeProgressText = null;
          }
        }
      });
    }
  }

  escapeGrapple() {
    const attacker = this.grappledBy;

    // Reset grappled state
    this.state = FIGHTER_STATES.IDLE;
    this.grappledBy = null;
    this.escapeMashCount = 0;

    // Gain meter for escaping
    this.addMeter(GRAPPLE.METER.ESCAPE);

    // Push away from attacker
    if (attacker) {
      const pushDir = this.x > attacker.x ? 1 : -1;
      this.body.setVelocityX(COMBAT.KNOCKBACK_FORCE * pushDir);

      // Reset attacker state
      if (attacker.grappleTimer) {
        attacker.grappleTimer.destroy();
        attacker.grappleTimer = null;
      }
      attacker.state = FIGHTER_STATES.IDLE;
      attacker.grappleTarget = null;
    }

    // Emit escape event
    this.emitEvent('fighter-grapple-escape', this, attacker);
  }

  executeGrappleMove() {
    if (this.state !== FIGHTER_STATES.GRAPPLING || !this.grappleTarget) return;

    // Clear auto-throw timer
    if (this.grappleTimer) {
      this.grappleTimer.destroy();
      this.grappleTimer = null;
    }

    // Select random throw move
    const moves = ['THROW', 'BODY_SLAM', 'SUPLEX', 'DDT'];
    const selectedMove = Phaser.Utils.Array.GetRandom(moves);
    const damage = GRAPPLE.DAMAGE[selectedMove];

    // Enter throwing state
    this.state = FIGHTER_STATES.THROWING;

    // Play the appropriate throw animation
    const throwAnim = this.getThrowAnimation(selectedMove);
    this.play(throwAnim, true);

    // Animate the victim being thrown with arc motion
    const target = this.grappleTarget;
    const throwDirection = this.facingRight ? 1 : -1;
    const throwDistance = 120 + Math.random() * 40;  // Variable distance
    const throwHeight = 60 + Math.random() * 30;

    // Arc trajectory for victim
    this.scene.tweens.add({
      targets: target,
      x: target.x + (throwDistance * throwDirection),
      duration: 400,
      ease: 'Power1'
    });

    // Up then down motion
    this.scene.tweens.add({
      targets: target,
      y: target.y - throwHeight,
      duration: 200,
      ease: 'Quad.easeOut',
      yoyo: true
    });

    // Spin the victim
    this.scene.tweens.add({
      targets: target,
      angle: throwDirection * 360,
      duration: 400,
      onComplete: () => {
        target.angle = 0;  // Reset rotation
      }
    });

    // Emit throw event for combat system to handle
    this.emitEvent('fighter-grapple-throw', this, this.grappleTarget, selectedMove, damage);

    // Return to idle after throw animation
    this.scene.time.delayedCall(GRAPPLE.LOCK_DURATION + 200, () => {
      this.completeThrow();
    });
  }

  getThrowAnimation(moveName) {
    const anims = this.config.animations;
    switch (moveName) {
      case 'SUPLEX':
        return anims.throwSuplex || anims.throw;
      case 'DDT':
        return anims.throwDdt || anims.throw;
      case 'BODY_SLAM':
        return anims.throwBodyslam || anims.throw;
      default:
        return anims.throw;
    }
  }

  completeThrow() {
    // Gain meter for successful throw
    this.addMeter(GRAPPLE.METER.THROW);

    // Reset state
    this.state = FIGHTER_STATES.IDLE;
    this.grappleTarget = null;
  }

  receiveThrow(damage, attacker) {
    // Reset grappled state
    this.grappledBy = null;
    this.escapeMashCount = 0;

    // Gain meter for being thrown
    this.addMeter(GRAPPLE.METER.THROWN);

    // Take damage (this will handle knockdown since throws always knockdown)
    this.takeDamage(damage, attacker);

    // Force knockdown if still standing
    if (this.health > 0 && this.state !== FIGHTER_STATES.DOWN && this.state !== FIGHTER_STATES.KO) {
      this.knockdown();
    }
  }

  takeDamage(amount, attacker) {
    if (this.isInvulnerable || this.state === FIGHTER_STATES.KO) return;

    // Apply defense modifier and attack power
    let finalDamage = amount;
    if (attacker && attacker.config) {
      finalDamage = Math.round(amount * attacker.config.attackPower);
    }
    finalDamage = Math.round(finalDamage / this.config.defense);

    this.health = Math.max(0, this.health - finalDamage);

    // Gain meter from taking damage
    this.addMeter(METER.GAIN_HIT_TAKEN);

    // Flash red
    this.setTint(0xff0000);
    if (this.scene && this.scene.time) {
      this.scene.time.delayedCall(100, () => {
        this.clearTint();
      });
    } else {
      // Fallback if scene.time not available
      setTimeout(() => this.clearTint(), 100);
    }

    // Emit damage event
    this.emitEvent('fighter-damaged', this, finalDamage, attacker);

    // Check for KO
    if (this.health <= 0) {
      this.ko();
      return;
    }

    // Heavy hits cause knockdown
    if (finalDamage >= 20) {
      this.knockdown();
    } else {
      this.enterHitstun(finalDamage, attacker);
    }
  }

  enterHitstun(damage, attacker) {
    this.state = FIGHTER_STATES.HITSTUN;
    this.body.setVelocity(0, 0);

    // Cancel any existing timer
    if (this.stateTimer) {
      this.stateTimer.destroy();
    }

    // Knockback with more force for heavy hits
    const knockbackMultiplier = damage >= 15 ? 1.5 : 1;
    if (attacker) {
      const knockbackDir = this.x > attacker.x ? 1 : -1;
      this.body.setVelocityX(COMBAT.KNOCKBACK_FORCE * knockbackDir * knockbackMultiplier);
    }

    // Recoil animation - squash on impact
    this.scene.tweens.add({
      targets: this,
      scaleX: 2.2,  // Squash horizontally
      scaleY: 2.8,  // Stretch vertically
      duration: 50,
      yoyo: true,
      onComplete: () => {
        this.setScale(2.5);
      }
    });

    // Shake fighter sprite for impact
    const shakeIntensity = damage >= 15 ? 8 : 4;
    this.scene.tweens.add({
      targets: this,
      x: this.x + Phaser.Math.Between(-shakeIntensity, shakeIntensity),
      y: this.y + Phaser.Math.Between(-shakeIntensity/2, shakeIntensity/2),
      duration: 30,
      yoyo: true,
      repeat: 2
    });

    // Hitstun duration scales with damage
    const hitstunDuration = COMBAT.HITSTUN_BASE + (damage * COMBAT.HITSTUN_PER_DAMAGE);

    this.stateTimer = this.scene.time.delayedCall(hitstunDuration, () => {
      if (this.state === FIGHTER_STATES.HITSTUN) {
        this.state = FIGHTER_STATES.IDLE;
        this.body.setVelocity(0, 0);
      }
    });
  }

  knockdown() {
    if (this.state === FIGHTER_STATES.KO) return;

    this.state = FIGHTER_STATES.DOWN;
    this.body.setVelocity(0, 0);

    // Drop weapon
    this.dropWeapon();

    // Play down animation
    this.play(this.config.animations.down, true);

    if (this.stateTimer) {
      this.stateTimer.destroy();
    }

    this.stateTimer = this.scene.time.delayedCall(TIMING.DOWN_DURATION, () => {
      if (this.health > 0) {
        this.getUp();
      }
    });
  }

  getUp() {
    if (this.state === FIGHTER_STATES.KO) return;

    this.state = FIGHTER_STATES.GETUP;
    this.isInvulnerable = true;

    // Play getup animation
    this.play(this.config.animations.getup, true);

    this.scene.time.delayedCall(TIMING.GETUP_DURATION, () => {
      this.state = FIGHTER_STATES.IDLE;
      this.isInvulnerable = false;
    });
  }

  ko() {
    this.state = FIGHTER_STATES.KO;
    this.body.setVelocity(0, 0);
    this.dropWeapon();

    // Play down animation
    this.play(this.config.animations.down, true);

    // Flash effect
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 200,
      yoyo: true,
      repeat: -1
    });

    // Emit KO event
    this.emitEvent('fighter-ko', this);
  }

  victory() {
    this.state = 'victory';
    this.body.setVelocity(0, 0);
    this.play(this.config.animations.victory, true);
  }

  canAct() {
    return this.state === FIGHTER_STATES.IDLE || this.state === FIGHTER_STATES.WALKING;
  }

  isInGrapple() {
    return this.state === FIGHTER_STATES.GRAPPLING ||
           this.state === FIGHTER_STATES.GRAPPLED ||
           this.state === FIGHTER_STATES.THROWING;
  }

  isAttacking() {
    return this.state === FIGHTER_STATES.ATTACKING;
  }

  pickupWeapon(weapon) {
    this.heldWeapon = weapon;
    weapon.setHolder(this);
    this.emitEvent('fighter-weapon-pickup', this, weapon);
  }

  dropWeapon() {
    if (this.heldWeapon) {
      this.heldWeapon.drop(this.x, this.y);
      this.heldWeapon = null;
    }
  }

  hasWeapon() {
    return this.heldWeapon !== null;
  }

  addMeter(amount) {
    this.extremeMeter = Math.min(METER.MAX, this.extremeMeter + amount);
    if (this.scene && this.scene.events) {
      this.scene.events.emit('fighter-meter-change', this);
    }
  }

  useMeter() {
    if (this.extremeMeter >= METER.MAX) {
      this.extremeMeter = 0;
      if (this.scene && this.scene.events) {
        this.scene.events.emit('fighter-meter-change', this);
      }
      return true;
    }
    return false;
  }

  applyFireDamage() {
    if (this.fireTicks > 0) return; // Already burning

    this.fireTicks = DAMAGE.FIRE_TICKS || 6;
    this.fireTimer = this.scene.time.addEvent({
      delay: TIMING.FIRE_TICK_INTERVAL,
      callback: () => {
        if (this.fireTicks > 0 && this.state !== FIGHTER_STATES.KO) {
          this.takeDamage(DAMAGE.FIRE_DOT || 3, null);
          this.fireTicks--;

          // Fire particle effect
          this.emitEvent('fighter-burning', this);

          if (this.fireTicks <= 0) {
            this.fireTimer.destroy();
          }
        }
      },
      repeat: this.fireTicks - 1
    });
  }

  getAttackRange() {
    return this.heldWeapon ? COMBAT.CHAIR_RANGE : COMBAT.FIST_RANGE;
  }

  getAttackDamage() {
    if (this.heldWeapon) {
      return DAMAGE.CHAIR;
    }
    // Random fist damage
    return Phaser.Math.Between(DAMAGE.FIST_MIN, DAMAGE.FIST_MAX);
  }

  destroy() {
    if (this.stateTimer) {
      this.stateTimer.destroy();
    }
    if (this.fireTimer) {
      this.fireTimer.destroy();
    }
    if (this.grappleTimer) {
      this.grappleTimer.destroy();
    }
    if (this.escapeProgressText) {
      this.escapeProgressText.destroy();
    }
    super.destroy();
  }
}
