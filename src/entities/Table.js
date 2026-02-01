import Phaser from 'phaser';
import { TIMING } from '../config/constants.js';

const TABLE_STATES = {
  INTACT: 'intact',
  ON_FIRE: 'on_fire',
  BROKEN: 'broken'
};

export default class Table extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'table');

    this.scene = scene;
    this.state = TABLE_STATES.INTACT;
    this.wasOnFire = false;
    this.fireParticles = null;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Scale to reasonable size
    this.setScale(1.2);

    // Scale to match 2.5x fighter size
    this.setDisplaySize(250, 125);
    this.baseScaleX = this.scaleX;
    this.baseScaleY = this.scaleY;

    // Physics
    this.body.setImmovable(true);
    this.body.setSize(80, 40);

    // Depth based on Y position (same system as fighters)
    this.setDepth(1000 + this.y);
  }

  update(time, delta) {
    // Update depth based on Y position
    this.setDepth(1000 + this.y);

    // Update fire particles if on fire
    if (this.state === TABLE_STATES.ON_FIRE) {
      // Could add fire particle emission here
    }
  }

  ignite() {
    if (this.state !== TABLE_STATES.INTACT) return false;

    this.state = TABLE_STATES.ON_FIRE;
    this.wasOnFire = true;

    // Change texture and maintain size
    this.setTexture('table-fire');
    this.setDisplaySize(250, 125);

    // Add fire glow effect
    this.setTint(0xFF6600);

    // Create fire particles if effects manager exists
    this.scene.events.emit('table-ignited', this);

    // Pulse effect using scale
    const baseX = this.scaleX;
    const baseY = this.scaleY;
    this.scene.tweens.add({
      targets: this,
      scaleX: baseX * 1.05,
      scaleY: baseY * 1.05,
      duration: 200,
      yoyo: true,
      repeat: -1
    });

    return true;
  }

  break() {
    if (this.state === TABLE_STATES.BROKEN) return;

    const wasOnFire = this.state === TABLE_STATES.ON_FIRE;
    this.state = TABLE_STATES.BROKEN;

    // Stop any fire effects
    if (this.scene && this.scene.tweens) {
      this.scene.tweens.killTweensOf(this);
    }

    // Change texture and maintain size
    this.setTexture('table-broken');
    this.setDisplaySize(250, 125);
    this.clearTint();

    // Disable collision
    this.body.enable = false;

    // Emit break event
    this.scene.events.emit('table-broken', this, wasOnFire);

    // Fade out and destroy
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      y: this.y + 10,
      duration: 500,
      onComplete: () => {
        // Leave debris on ground
        this.setAlpha(0.3);
      }
    });
  }

  isIntact() {
    return this.state === TABLE_STATES.INTACT || this.state === TABLE_STATES.ON_FIRE;
  }

  isOnFire() {
    return this.state === TABLE_STATES.ON_FIRE;
  }

  isBroken() {
    return this.state === TABLE_STATES.BROKEN;
  }

  destroy() {
    if (this.scene && this.scene.tweens) {
      this.scene.tweens.killTweensOf(this);
    }
    super.destroy();
  }
}
