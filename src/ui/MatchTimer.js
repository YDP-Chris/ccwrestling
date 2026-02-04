import Phaser from 'phaser';
import { GAME, COLORS } from '../config/constants.js';

/**
 * Displays match elapsed time and handles time-based match endings
 */
export default class MatchTimer {
  constructor(scene, settings = {}) {
    this.scene = scene;
    this.settings = settings;

    // Match length in seconds based on settings
    const lengths = {
      short: 60,
      medium: 180,
      long: 300
    };
    this.matchLength = lengths[settings.matchLength] || 180;
    this.isTimedMatch = settings.matchLength !== undefined;

    // Timer state
    this.elapsedTime = 0;
    this.isRunning = false;

    // Create display
    this.createDisplay();
  }

  createDisplay() {
    // Timer container at top center
    this.container = this.scene.add.container(GAME.WIDTH / 2, 12);
    this.container.setDepth(100);

    // Background
    const bg = this.scene.add.rectangle(0, 0, 80, 24, 0x000000, 0.6);
    bg.setStrokeStyle(1, 0x333333);
    this.container.add(bg);

    // Time text
    this.timeText = this.scene.add.text(0, 0, '0:00', {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#FFFFFF'
    });
    this.timeText.setOrigin(0.5);
    this.container.add(this.timeText);

    // Warning indicator (hidden initially)
    this.warningGlow = this.scene.add.rectangle(0, 0, 84, 28, COLORS.BLOOD_BRIGHT, 0);
    this.container.add(this.warningGlow);
    this.container.sendToBack(this.warningGlow);
  }

  start() {
    this.isRunning = true;
    this.elapsedTime = 0;
  }

  stop() {
    this.isRunning = false;
  }

  update(time, delta) {
    if (!this.isRunning) return;

    // Update elapsed time
    this.elapsedTime += delta / 1000;

    // Format time display
    const displayTime = this.isTimedMatch
      ? Math.max(0, this.matchLength - this.elapsedTime)
      : this.elapsedTime;

    const minutes = Math.floor(displayTime / 60);
    const seconds = Math.floor(displayTime % 60);
    this.timeText.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);

    // Warning effects for timed matches
    if (this.isTimedMatch) {
      const remaining = this.matchLength - this.elapsedTime;

      if (remaining <= 10 && remaining > 0) {
        // Last 10 seconds - pulse red
        this.timeText.setColor('#FF0000');
        this.warningGlow.setAlpha(0.3 + Math.sin(time / 100) * 0.2);
      } else if (remaining <= 30) {
        // Last 30 seconds - yellow warning
        this.timeText.setColor('#FFFF00');
      }

      // Time's up
      if (remaining <= 0) {
        this.onTimeUp();
      }
    }
  }

  onTimeUp() {
    this.isRunning = false;

    // Safety check
    if (!this.scene || !this.timeText) return;

    this.timeText.setText('TIME!');
    this.timeText.setColor('#FF0000');

    // Emit time up event - FightScene will handle determining winner
    if (this.scene.events) {
      this.scene.events.emit('match-time-up');
    }

    // Flash effect
    if (!this.scene.tweens) return;
    this.scene.tweens.add({
      targets: this.timeText,
      scale: 1.5,
      duration: 200,
      yoyo: true,
      repeat: 2
    });
  }

  getElapsedTime() {
    return this.elapsedTime;
  }

  getFormattedTime() {
    const minutes = Math.floor(this.elapsedTime / 60);
    const seconds = Math.floor(this.elapsedTime % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  destroy() {
    if (this.container) this.container.destroy();
  }
}
