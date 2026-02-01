import Phaser from 'phaser';
import { COLORS, HEALTH } from '../config/constants.js';

export default class HealthBar {
  constructor(scene, x, y, fighter, isFlipped = false) {
    this.scene = scene;
    this.fighter = fighter;
    this.isFlipped = isFlipped;

    this.width = 220;
    this.height = 24;
    this.padding = 3;

    // Create container
    this.container = scene.add.container(x, y);
    this.container.setDepth(100);

    // Outer glow/shadow
    this.glow = scene.add.rectangle(0, 0, this.width + 6, this.height + 6, 0x000000, 0.5);
    this.glow.setOrigin(isFlipped ? 1 : 0, 0.5);
    this.container.add(this.glow);

    // Background with gradient feel
    this.background = scene.add.rectangle(0, 0, this.width, this.height, 0x1a1a1a);
    this.background.setOrigin(isFlipped ? 1 : 0, 0.5);
    this.container.add(this.background);

    // Inner shadow
    this.innerShadow = scene.add.rectangle(
      isFlipped ? -this.padding : this.padding,
      -2,
      this.width - (this.padding * 2),
      4,
      0x000000,
      0.3
    );
    this.innerShadow.setOrigin(isFlipped ? 1 : 0, 0.5);
    this.container.add(this.innerShadow);

    // Health fill
    this.fillWidth = this.width - (this.padding * 2);
    this.fill = scene.add.rectangle(
      isFlipped ? -this.padding : this.padding,
      0,
      this.fillWidth,
      this.height - (this.padding * 2),
      COLORS.GREEN
    );
    this.fill.setOrigin(isFlipped ? 1 : 0, 0.5);
    this.container.add(this.fill);

    // Damage fill (shows briefly when taking damage)
    this.damageFill = scene.add.rectangle(
      isFlipped ? -this.padding : this.padding,
      0,
      this.fillWidth,
      this.height - (this.padding * 2),
      COLORS.RED
    );
    this.damageFill.setOrigin(isFlipped ? 1 : 0, 0.5);
    this.damageFill.setAlpha(0);
    this.container.add(this.damageFill);

    // Highlight bar (top shine)
    this.highlight = scene.add.rectangle(
      isFlipped ? -this.padding : this.padding,
      -(this.height / 2) + 5,
      this.fillWidth,
      3,
      0xffffff,
      0.3
    );
    this.highlight.setOrigin(isFlipped ? 1 : 0, 0.5);
    this.container.add(this.highlight);

    // Border with metallic look
    this.border = scene.add.rectangle(0, 0, this.width, this.height);
    this.border.setOrigin(isFlipped ? 1 : 0, 0.5);
    this.border.setStrokeStyle(3, COLORS.CHROME);
    this.container.add(this.border);

    // Corner accents
    this.addCornerAccents(isFlipped);

    // Listen for damage events
    this.scene.events.on('fighter-damaged', this.onFighterDamaged, this);
  }

  addCornerAccents(isFlipped) {
    const cornerSize = 6;
    const xOffset = isFlipped ? -this.width : 0;

    // Top-left / top-right corner
    const corner1 = this.scene.add.rectangle(
      xOffset + cornerSize/2,
      -this.height/2 + cornerSize/2,
      cornerSize,
      cornerSize,
      COLORS.FIRE_ORANGE
    );
    corner1.setOrigin(0.5);
    this.container.add(corner1);

    // Bottom-left / bottom-right corner
    const corner2 = this.scene.add.rectangle(
      xOffset + cornerSize/2,
      this.height/2 - cornerSize/2,
      cornerSize,
      cornerSize,
      COLORS.FIRE_ORANGE
    );
    corner2.setOrigin(0.5);
    this.container.add(corner2);
  }

  onFighterDamaged(fighter, damage) {
    if (fighter === this.fighter) {
      this.updateHealth(damage);
    }
  }

  update() {
    // Called every frame - can be used for animations
    // Health updates are event-driven via onFighterDamaged
  }

  updateHealth(damage = 0) {
    const healthPercent = this.fighter.health / this.fighter.maxHealth;
    const targetWidth = this.fillWidth * healthPercent;
    const currentWidth = this.fill.width;

    // Color based on health
    let color;
    if (healthPercent > 0.6) {
      color = COLORS.GREEN;
    } else if (healthPercent > 0.3) {
      color = COLORS.YELLOW;
    } else {
      color = COLORS.RED;
    }

    // Show damage trail - red bar that trails behind the health bar
    if (damage > 0 && this.damageFill) {
      this.damageFill.width = currentWidth;
      this.damageFill.setAlpha(0.8);

      // Fade out damage trail slowly
      this.scene.tweens.add({
        targets: this.damageFill,
        width: targetWidth,
        alpha: 0,
        duration: 600,
        delay: 200,
        ease: 'Power2'
      });
    }

    // Animate health change (faster than damage trail)
    this.scene.tweens.add({
      targets: this.fill,
      width: targetWidth,
      duration: 150,
      ease: 'Power2'
    });

    // Update color
    this.fill.setFillStyle(color);

    // Flash effect on damage
    this.scene.tweens.add({
      targets: this.fill,
      alpha: 0.4,
      duration: 50,
      yoyo: true
    });

    // Shake the health bar on big hits
    if (damage >= 15) {
      this.scene.tweens.add({
        targets: this.container,
        x: this.container.x + Phaser.Math.Between(-3, 3),
        duration: 30,
        yoyo: true,
        repeat: 2
      });
    }

    // Pulse border when low health
    if (healthPercent <= 0.3 && !this.lowHealthPulse) {
      this.lowHealthPulse = true;
      this.scene.tweens.add({
        targets: this.border,
        strokeAlpha: 0.5,
        duration: 300,
        yoyo: true,
        repeat: -1
      });
    }
  }

  setPosition(x, y) {
    this.container.setPosition(x, y);
  }

  setVisible(visible) {
    this.container.setVisible(visible);
  }

  destroy() {
    this.scene.events.off('fighter-damaged', this.onFighterDamaged, this);
    if (this.lowHealthPulse) {
      this.scene.tweens.killTweensOf(this.border);
    }
    this.container.destroy();
  }
}
