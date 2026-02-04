import Phaser from 'phaser';

const CHAIR_MAX_HITS = 3;

export default class Chair extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'chair-ground');

    this.scene = scene;
    this.holder = null;
    this.isHeld = false;
    this.hitCount = 0;
    this.isBroken = false;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics
    this.body.setImmovable(true);
    this.body.setSize(32, 32);

    // Scale to match 2.5x fighter size
    this.setDisplaySize(120, 80);

    // Depth based on Y position (same system as fighters)
    this.setDepth(1000 + this.y);
  }

  update() {
    if (this.isHeld && this.holder) {
      // Follow holder with held texture
      const offsetX = this.holder.facingRight ? 40 : -40;
      this.setPosition(this.holder.x + offsetX, this.holder.y - 20);
      this.setFlipX(!this.holder.facingRight);
      // Stay above holder
      this.setDepth(this.holder.depth + 1);
    } else {
      // Ground depth based on Y
      this.setDepth(1000 + this.y);
    }
  }

  setHolder(fighter) {
    this.holder = fighter;
    this.isHeld = true;
    this.setTexture('chair-held');
    this.setDisplaySize(100, 120); // Held chair size (vertical, scaled 2.5x)
    this.body.enable = false;
    this.setDepth(fighter.depth + 1); // Above fighter
  }

  drop(x, y) {
    this.holder = null;
    this.isHeld = false;
    this.setTexture('chair-ground');
    this.setDisplaySize(120, 80); // Ground chair size (flat, scaled 2.5x)
    this.setPosition(x, y);
    this.body.enable = true;
    this.setDepth(1000 + y); // Ground depth based on Y
  }

  canPickup() {
    return !this.isHeld && !this.isBroken;
  }

  /**
   * Called when chair hits something. Returns true if chair broke.
   */
  registerHit() {
    this.hitCount++;

    // Visual feedback - flash
    this.setTint(0xffff00);
    if (this.scene && this.scene.time) {
      this.scene.time.delayedCall(50, () => {
        // Safety check - scene may be transitioning when timer fires
        if (!this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;
        if (this.clearTint) this.clearTint();
      });
    }

    if (this.hitCount >= CHAIR_MAX_HITS) {
      this.break();
      return true;
    }
    return false;
  }

  /**
   * Break the chair with particle effect
   */
  break() {
    if (this.isBroken) return;
    this.isBroken = true;

    // Drop from holder
    if (this.holder) {
      this.holder.heldWeapon = null;
      this.holder = null;
    }

    // Spawn debris particles
    if (this.scene && this.scene.add) {
      const particles = this.scene.add.particles(this.x, this.y, 'chair-ground', {
        speed: { min: 100, max: 200 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.3, end: 0 },
        lifespan: 500,
        gravityY: 300,
        quantity: 6
      });

      // Auto-destroy particles
      if (this.scene.time) {
        this.scene.time.delayedCall(600, () => {
          // Safety check - scene may be transitioning when timer fires
          if (particles && particles.destroy) particles.destroy();
        });
      }
    }

    // Screen shake
    if (this.scene.effectsManager) {
      this.scene.effectsManager.shakeLight();
    }

    // Play break sound
    if (this.scene.sound) {
      this.scene.sound.play('sfx-chair-hit', { volume: 0.8 });
    }

    // Emit event
    if (this.scene.events) {
      this.scene.events.emit('chair-broken', this);
    }

    // Remove from scene
    this.destroy();
  }

  destroy() {
    super.destroy();
  }
}
