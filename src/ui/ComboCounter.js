import Phaser from 'phaser';
import { GAME, COLORS } from '../config/constants.js';

/**
 * Tracks and displays hit combos for each fighter
 */
export default class ComboCounter {
  constructor(scene) {
    this.scene = scene;

    // Track combos per fighter
    this.combos = new Map();
    this.comboTimers = new Map();

    // Combo reset time (ms) - if no hit within this time, combo resets
    this.comboTimeout = 1500;

    // Create display containers
    this.playerComboDisplay = this.createComboDisplay(100, 80, false);
    this.enemyComboDisplay = this.createComboDisplay(GAME.WIDTH - 100, 80, true);

    // Listen for hit events
    this.scene.events.on('combat-hit', this.onHit, this);
    this.scene.events.on('combat-grapple-throw', this.onThrow, this);
  }

  createComboDisplay(x, y, flipped) {
    const container = this.scene.add.container(x, y);
    container.setDepth(200);
    container.setAlpha(0);

    // Combo count text
    const countText = this.scene.add.text(0, 0, '0', {
      fontFamily: 'Arial Black',
      fontSize: '48px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 6
    });
    countText.setOrigin(0.5);
    container.add(countText);

    // "HIT" label
    const hitLabel = this.scene.add.text(0, 30, 'HIT COMBO', {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#FF4500'
    });
    hitLabel.setOrigin(0.5);
    container.add(hitLabel);

    return { container, countText, hitLabel };
  }

  onHit(data) {
    // Safety check - scene may be transitioning
    if (!this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;

    const { attacker, target, damage } = data;
    this.incrementCombo(attacker, target);
  }

  onThrow(data) {
    // Safety check - scene may be transitioning
    if (!this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;

    const { attacker, target } = data;
    // Throws count as 2 hits for combo purposes
    this.incrementCombo(attacker, target);
    this.incrementCombo(attacker, target);
  }

  incrementCombo(attacker, target) {
    // Get current combo for attacker
    const currentCombo = (this.combos.get(attacker) || 0) + 1;
    this.combos.set(attacker, currentCombo);

    // Reset opponent's combo
    this.combos.set(target, 0);
    this.hideComboDisplay(target);

    // Clear existing timer
    const existingTimer = this.comboTimers.get(attacker);
    if (existingTimer) {
      existingTimer.destroy();
    }

    // Set new timeout to reset combo
    const timer = this.scene.time.delayedCall(this.comboTimeout, () => {
      // Safety check - scene may be transitioning when timer fires
      if (!this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;
      this.combos.set(attacker, 0);
      this.hideComboDisplay(attacker);
    });
    this.comboTimers.set(attacker, timer);

    // Update display
    this.updateComboDisplay(attacker, currentCombo);

    // Announce big combos
    if (currentCombo === 3) {
      this.announceCombo('COMBO!', COLORS.FIRE_ORANGE);
    } else if (currentCombo === 5) {
      this.announceCombo('BRUTAL COMBO!', COLORS.BLOOD_BRIGHT);
    } else if (currentCombo === 7) {
      this.announceCombo('DEVASTATING!', 0xFF00FF);
    } else if (currentCombo >= 10) {
      this.announceCombo('UNSTOPPABLE!', 0x00FFFF);
    }
  }

  updateComboDisplay(fighter, count) {
    if (count < 2) return; // Only show combos of 2+

    // Safety checks
    if (!this.scene || !this.scene.player) return;
    if (!this.playerComboDisplay || !this.enemyComboDisplay) return;

    // Determine which display to use
    const isPlayer = fighter === this.scene.player;
    const display = isPlayer ? this.playerComboDisplay : this.enemyComboDisplay;

    // Safety check - display may be destroyed
    if (!display.container || !display.countText) return;

    // Update count
    display.countText.setText(count.toString());

    // Color based on combo size
    let color = '#FFFFFF';
    if (count >= 10) color = '#00FFFF';
    else if (count >= 7) color = '#FF00FF';
    else if (count >= 5) color = '#FF0000';
    else if (count >= 3) color = '#FF6600';

    display.countText.setColor(color);

    // Show and animate
    display.container.setAlpha(1);

    // Punch effect
    this.scene.tweens.add({
      targets: display.countText,
      scale: 1.3,
      duration: 80,
      yoyo: true,
      ease: 'Power2'
    });
  }

  hideComboDisplay(fighter) {
    // Safety checks
    if (!this.scene || !this.scene.tweens) return;
    if (!this.playerComboDisplay || !this.enemyComboDisplay) return;

    const isPlayer = fighter === this.scene.player;
    const display = isPlayer ? this.playerComboDisplay : this.enemyComboDisplay;

    // Safety check - container may be destroyed
    if (!display.container) return;

    this.scene.tweens.add({
      targets: display.container,
      alpha: 0,
      duration: 200
    });
  }

  announceCombo(text, color) {
    // Safety check - scene may be transitioning
    if (!this.scene || !this.scene.add || !this.scene.tweens) return;

    const colorHex = typeof color === 'number'
      ? `#${color.toString(16).padStart(6, '0')}`
      : color;

    const announcement = this.scene.add.text(
      GAME.WIDTH / 2,
      GAME.HEIGHT / 2 + 50,
      text,
      {
        fontFamily: 'Arial Black',
        fontSize: '28px',
        color: colorHex,
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    announcement.setOrigin(0.5);
    announcement.setDepth(1000);

    // Animate in and out
    announcement.setScale(0);
    this.scene.tweens.add({
      targets: announcement,
      scale: 1,
      duration: 100,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: announcement,
          alpha: 0,
          y: announcement.y - 30,
          duration: 400,
          delay: 300,
          onComplete: () => announcement.destroy()
        });
      }
    });
  }

  destroy() {
    // Remove event listeners
    if (this.scene && this.scene.events) {
      this.scene.events.off('combat-hit', this.onHit, this);
      this.scene.events.off('combat-grapple-throw', this.onThrow, this);
    }

    // Clear timers
    this.comboTimers.forEach(timer => {
      if (timer && timer.destroy) timer.destroy();
    });
    this.comboTimers.clear();

    // Destroy displays
    if (this.playerComboDisplay && this.playerComboDisplay.container) {
      this.playerComboDisplay.container.destroy();
    }
    if (this.enemyComboDisplay && this.enemyComboDisplay.container) {
      this.enemyComboDisplay.container.destroy();
    }
  }
}
