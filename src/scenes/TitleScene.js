import Phaser from 'phaser';
import { GAME, COLORS } from '../config/constants.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    // Dark background
    this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, 0x0a0a0a);

    // Subtle red vignette
    const vignette = this.add.graphics();
    vignette.fillStyle(0x1a0000, 0.4);
    vignette.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

    // Banner at bottom (behind wrestlers)
    const banner = this.add.image(GAME.WIDTH / 2, GAME.HEIGHT - 25, 'cabinet-banner');
    banner.setScale(0.55);
    banner.setAlpha(0.4);

    // === ANIMATED WRESTLERS ===
    this.createWrestlers();

    // === LOGO (foreground) ===
    const logo = this.add.image(GAME.WIDTH / 2, GAME.HEIGHT / 2 - 30, 'logo');
    logo.setScale(0.7);
    logo.setAlpha(0);
    logo.setDepth(100);

    // Fade in logo
    this.tweens.add({
      targets: logo,
      alpha: 1,
      scale: 0.75,
      duration: 1000,
      ease: 'Power2'
    });

    // Breathing pulse on logo
    this.tweens.add({
      targets: logo,
      scale: 0.8,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      delay: 1000,
      ease: 'Sine.easeInOut'
    });

    // Subtle glow effect on logo
    logo.preFX?.addGlow(0xff4500, 0, 0, false, 0.1, 16);

    // "Press Enter to Start" text
    const startText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 70, 'PRESS ENTER TO START', {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    });
    startText.setOrigin(0.5);
    startText.setAlpha(0);
    startText.setDepth(100);

    // Fade in start text after logo
    this.tweens.add({
      targets: startText,
      alpha: 1,
      duration: 500,
      delay: 800
    });

    // Blink the start text
    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      delay: 1500
    });

    // Version in corner
    this.add.text(GAME.WIDTH - 10, GAME.HEIGHT - 10, 'v1.0', {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: '#333333'
    }).setOrigin(1, 1).setDepth(100);

    // Play menu music
    if (!this.sound.get('music-menu')?.isPlaying) {
      this.menuMusic = this.sound.add('music-menu', { loop: true, volume: 0.4 });
      this.menuMusic.play();
    }

    // Input to proceed
    this.input.keyboard.once('keydown-ENTER', () => this.startGame());
    this.input.keyboard.once('keydown-SPACE', () => this.startGame());
    this.input.once('pointerdown', () => this.startGame());

    // Focus canvas
    this.game.canvas.focus();
  }

  createWrestlers() {
    // Left wrestler (Dumpster)
    this.leftWrestler = this.add.sprite(180, GAME.HEIGHT / 2 + 40, 'dumpster-idle');
    this.leftWrestler.setScale(2);
    this.leftWrestler.setAlpha(0.6);
    this.leftWrestler.setTint(0xff6644);
    this.leftWrestler.play('dumpster-idle');
    this.leftWrestler.setDepth(10);

    // Right wrestler (Scar) - flipped to face left
    this.rightWrestler = this.add.sprite(GAME.WIDTH - 180, GAME.HEIGHT / 2 + 40, 'scar-idle');
    this.rightWrestler.setScale(2);
    this.rightWrestler.setFlipX(true);
    this.rightWrestler.setAlpha(0.6);
    this.rightWrestler.setTint(0x6688ff);
    this.rightWrestler.play('scar-idle');
    this.rightWrestler.setDepth(10);

    // Subtle bobbing animation for wrestlers
    this.tweens.add({
      targets: this.leftWrestler,
      y: this.leftWrestler.y - 5,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.tweens.add({
      targets: this.rightWrestler,
      y: this.rightWrestler.y - 5,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 600
    });

    // Schedule fight animations
    this.time.addEvent({
      delay: 2500,
      callback: () => this.doFightAnimation(),
      loop: true
    });
  }

  doFightAnimation() {
    // Randomly pick who attacks
    const leftAttacks = Math.random() > 0.5;
    const attacker = leftAttacks ? this.leftWrestler : this.rightWrestler;
    const defender = leftAttacks ? this.rightWrestler : this.leftWrestler;
    const attackerName = leftAttacks ? 'dumpster' : 'scar';
    const defenderName = leftAttacks ? 'scar' : 'dumpster';

    // Move attacker forward
    const moveDir = leftAttacks ? 40 : -40;

    this.tweens.add({
      targets: attacker,
      x: attacker.x + moveDir,
      duration: 150,
      yoyo: true,
      onStart: () => {
        attacker.play(`${attackerName}-punch`);
        attacker.setAlpha(0.8);
      },
      onYoyo: () => {
        // Defender reacts
        defender.play(`${defenderName}-hit`);
        this.cameras.main.shake(100, 0.005);

        // Small impact flash
        const flash = this.add.circle(
          (attacker.x + defender.x) / 2,
          GAME.HEIGHT / 2 + 20,
          30,
          0xffffff,
          0.6
        );
        flash.setDepth(15);
        this.tweens.add({
          targets: flash,
          alpha: 0,
          scale: 2,
          duration: 200,
          onComplete: () => flash.destroy()
        });
      },
      onComplete: () => {
        attacker.play(`${attackerName}-idle`);
        attacker.setAlpha(0.6);
        this.time.delayedCall(300, () => {
          defender.play(`${defenderName}-idle`);
        });
      }
    });
  }

  startGame() {
    // Flash and go to menu
    this.cameras.main.flash(200, 255, 255, 255);
    this.sound.play('sfx-menu-select', { volume: 0.5 });

    this.time.delayedCall(200, () => {
      this.scene.start('MenuScene');
    });
  }
}
