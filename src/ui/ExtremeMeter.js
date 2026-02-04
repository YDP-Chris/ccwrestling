import Phaser from 'phaser';
import { COLORS, METER, GAME } from '../config/constants.js';

export default class ExtremeMeter {
  constructor(scene, fighter) {
    this.scene = scene;
    this.fighter = fighter;

    this.width = 300;
    this.height = 20;
    this.padding = 2;

    // Position at bottom center
    const x = GAME.WIDTH / 2;
    const y = GAME.HEIGHT - 30;

    // Create container
    this.container = scene.add.container(x, y);
    this.container.setDepth(80);

    // Label
    this.label = scene.add.text(0, -20, 'EXTREME', {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#FF4500'
    });
    this.label.setOrigin(0.5);
    this.container.add(this.label);

    // Background
    this.background = scene.add.rectangle(0, 0, this.width, this.height, 0x333333);
    this.container.add(this.background);

    // Fill
    this.fillWidth = this.width - (this.padding * 2);
    this.fill = scene.add.rectangle(
      -this.fillWidth / 2,
      0,
      0,
      this.height - (this.padding * 2),
      COLORS.FIRE_ORANGE
    );
    this.fill.setOrigin(0, 0.5);
    this.container.add(this.fill);

    // Border
    this.border = scene.add.rectangle(0, 0, this.width, this.height);
    this.border.setStrokeStyle(2, COLORS.FIRE_AMBER);
    this.container.add(this.border);

    // Ready indicator (hidden by default)
    this.readyText = scene.add.text(0, 0, 'READY!', {
      fontFamily: 'Arial Black',
      fontSize: '12px',
      color: '#FFFFFF'
    });
    this.readyText.setOrigin(0.5);
    this.readyText.setVisible(false);
    this.container.add(this.readyText);

    // Glow effect (hidden by default)
    this.glow = scene.add.rectangle(0, 0, this.width + 10, this.height + 10);
    this.glow.setStrokeStyle(3, COLORS.FIRE_AMBER);
    this.glow.setAlpha(0);
    this.container.add(this.glow);
    this.container.sendToBack(this.glow);

    // Is full flag
    this.isFull = false;

    // Listen for meter changes
    this.scene.events.on('fighter-meter-change', this.onMeterChange, this);

    // Initial update
    this.updateMeter();
  }

  onMeterChange(fighter) {
    // Safety check - scene may be transitioning
    if (!this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;
    if (fighter === this.fighter) {
      this.updateMeter();
    }
  }

  update() {
    // Called every frame - meter updates are event-driven
  }

  updateMeter() {
    // Safety checks
    if (!this.scene || !this.scene.tweens) return;
    if (!this.fighter || !this.fill) return;

    const meterPercent = this.fighter.extremeMeter / METER.MAX;
    const targetWidth = this.fillWidth * meterPercent;

    // Animate fill change
    this.scene.tweens.add({
      targets: this.fill,
      width: targetWidth,
      duration: 150,
      ease: 'Power2'
    });

    // Check if full
    const wasFull = this.isFull;
    this.isFull = meterPercent >= 1;

    if (this.isFull && !wasFull) {
      this.onMeterFull();
    } else if (!this.isFull && wasFull) {
      this.onMeterUsed();
    }

    // Color gradient based on fill
    let color;
    if (meterPercent < 0.33) {
      color = COLORS.FIRE_ORANGE;
    } else if (meterPercent < 0.66) {
      color = COLORS.FIRE_AMBER;
    } else if (meterPercent < 1) {
      color = 0xFFDD00; // Bright yellow
    } else {
      color = 0xFFFFFF; // White when full
    }
    this.fill.setFillStyle(color);
  }

  onMeterFull() {
    // Safety check
    if (!this.scene || !this.scene.tweens) return;
    if (!this.readyText) return;

    // Show ready text
    this.readyText.setVisible(true);

    // Pulse animation on ready text
    this.scene.tweens.add({
      targets: this.readyText,
      scale: 1.2,
      duration: 300,
      yoyo: true,
      repeat: -1
    });

    // Glow effect
    this.scene.tweens.add({
      targets: this.glow,
      alpha: 0.8,
      duration: 300,
      yoyo: true,
      repeat: -1
    });

    // Border pulse
    this.scene.tweens.add({
      targets: this.border,
      strokeAlpha: 0.5,
      duration: 200,
      yoyo: true,
      repeat: -1
    });

    // Flash the label
    this.scene.tweens.add({
      targets: this.label,
      scale: 1.1,
      duration: 200,
      yoyo: true,
      repeat: -1
    });
  }

  onMeterUsed() {
    // Safety check
    if (!this.scene || !this.scene.tweens) return;

    // Stop all animations
    this.scene.tweens.killTweensOf(this.readyText);
    this.scene.tweens.killTweensOf(this.glow);
    this.scene.tweens.killTweensOf(this.border);
    this.scene.tweens.killTweensOf(this.label);

    // Reset visuals
    this.readyText.setVisible(false);
    this.readyText.setScale(1);
    this.glow.setAlpha(0);
    this.border.strokeAlpha = 1;
    this.label.setScale(1);
  }

  setVisible(visible) {
    this.container.setVisible(visible);
  }

  destroy() {
    if (this.scene && this.scene.events) {
      this.scene.events.off('fighter-meter-change', this.onMeterChange, this);
    }
    if (this.scene && this.scene.tweens) {
      if (this.readyText) this.scene.tweens.killTweensOf(this.readyText);
      if (this.glow) this.scene.tweens.killTweensOf(this.glow);
      if (this.border) this.scene.tweens.killTweensOf(this.border);
      if (this.label) this.scene.tweens.killTweensOf(this.label);
    }
    if (this.container) this.container.destroy();
  }
}
