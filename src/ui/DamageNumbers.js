import Phaser from 'phaser';
import { COLORS } from '../config/constants.js';

/**
 * Floating damage numbers that appear when fighters take hits
 */
export default class DamageNumbers {
  constructor(scene) {
    this.scene = scene;

    // Listen for damage events
    this.scene.events.on('fighter-damaged', this.showDamage, this);
    this.scene.events.on('combat-grapple-throw', this.showThrowDamage, this);
  }

  showDamage(fighter, damage, attacker) {
    if (!fighter || damage <= 0) return;

    // Determine color based on damage amount
    let color = '#FFFFFF';
    let size = 20;

    if (damage >= 30) {
      color = '#FF0000';  // Red for heavy damage
      size = 32;
    } else if (damage >= 20) {
      color = '#FF6600';  // Orange for strong hits
      size = 28;
    } else if (damage >= 15) {
      color = '#FFFF00';  // Yellow for medium hits
      size = 24;
    }

    this.spawnNumber(fighter.x, fighter.y - 40, damage, color, size);
  }

  showThrowDamage(data) {
    const { target, damage, moveName } = data;
    if (!target) return;

    // Throws get special purple color
    this.spawnNumber(target.x, target.y - 60, damage, '#FF00FF', 36);
  }

  spawnNumber(x, y, damage, color, size) {
    // Add some random horizontal offset for variety
    const offsetX = Phaser.Math.Between(-20, 20);

    const damageText = this.scene.add.text(x + offsetX, y, damage.toString(), {
      fontFamily: 'Arial Black',
      fontSize: `${size}px`,
      color: color,
      stroke: '#000000',
      strokeThickness: 4
    });
    damageText.setOrigin(0.5);
    damageText.setDepth(5000);

    // Float up and fade out
    this.scene.tweens.add({
      targets: damageText,
      y: y - 60,
      alpha: 0,
      scale: 1.3,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        damageText.destroy();
      }
    });

    // Slight bounce effect
    this.scene.tweens.add({
      targets: damageText,
      x: x + offsetX + Phaser.Math.Between(-10, 10),
      duration: 200,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }

  destroy() {
    this.scene.events.off('fighter-damaged', this.showDamage, this);
    this.scene.events.off('combat-grapple-throw', this.showThrowDamage, this);
  }
}
