import Phaser from 'phaser';
import { GAME, COLORS } from '../config/constants.js';
import { CONTROLS } from '../config/controls.js';
import StatsManager from '../systems/StatsManager.js';
import TransitionManager from '../systems/TransitionManager.js';
import CareerManager from '../systems/CareerManager.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.winnerName = data.winner || 'UNKNOWN';
    this.playerWon = data.playerWon || false;
    this.recording = data.recording || null;

    // Game mode data
    this.gameMode = data.mode || 'quick';
    this.playerCharKey = data.player || 'DUMPSTER';
    this.opponentCharKey = data.opponent || 'SCAR';
    this.playerHealth = data.playerHealth || 300;  // For survival mode
    this.arcadeProgress = data.arcadeProgress || 0; // Fights completed in arcade
    this.survivalStreak = data.survivalStreak || 0; // Current survival streak

    // Career mode data
    this.career = data.career || null;
    this.isPPV = data.isPPV || false;
    this.isTitleMatch = data.isTitleMatch || false;

    // Record career result if in career mode
    if (this.gameMode === 'career' && this.career) {
      this.career = CareerManager.recordMatchResult(this.career, this.playerWon);
    }
  }

  create() {
    // Play victory music
    if (this.cache.audio.exists('music-victory')) {
      this.victoryMusic = this.sound.add('music-victory', { loop: true, volume: 0.4 });
      this.victoryMusic.play();
    }

    // Animated background
    this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, COLORS.VOID);

    // Side art panels (decorative)
    const leftArt = this.add.image(40, GAME.HEIGHT / 2, 'cabinet-side-art');
    leftArt.setScale(0.3);
    leftArt.setAlpha(0.2);

    const rightArt = this.add.image(GAME.WIDTH - 40, GAME.HEIGHT / 2, 'cabinet-side-art');
    rightArt.setScale(0.3);
    rightArt.setFlipX(true);
    rightArt.setAlpha(0.2);

    // Banner at top
    const banner = this.add.image(GAME.WIDTH / 2, 15, 'cabinet-banner');
    banner.setScale(0.45);
    banner.setAlpha(0.3);

    // Add some visual flair - animated particles in background
    this.createBackgroundEffects();

    // Result text with animation
    const resultText = this.playerWon ? 'VICTORY!' : 'DEFEAT';
    const resultColor = this.playerWon ? '#00FF00' : '#DC143C';

    const result = this.add.text(GAME.WIDTH / 2, 80, resultText, {
      fontFamily: 'Arial Black',
      fontSize: '64px',
      color: resultColor,
      stroke: '#000000',
      strokeThickness: 6
    });
    result.setOrigin(0.5);
    result.setScale(0);

    // Animate result text in
    this.tweens.add({
      targets: result,
      scale: 1,
      duration: 400,
      ease: 'Back.easeOut'
    });

    // Pulse effect on result
    this.tweens.add({
      targets: result,
      scale: 1.05,
      duration: 500,
      yoyo: true,
      repeat: -1,
      delay: 500
    });

    // Winner name
    const winner = this.add.text(GAME.WIDTH / 2, 145, `${this.winnerName.toUpperCase()} WINS!`, {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#FFFFFF'
    });
    winner.setOrigin(0.5);
    winner.setAlpha(0);
    this.tweens.add({
      targets: winner,
      alpha: 1,
      y: 140,
      duration: 300,
      delay: 300
    });

    // Career mode special info
    if (this.gameMode === 'career') {
      let careerInfo = '';
      if (this.isTitleMatch && this.playerWon) {
        careerInfo = this.career?.isChampion ? '🏆 TITLE DEFENDED!' : '🏆 NEW CHAMPION!';
      } else if (this.isPPV) {
        careerInfo = 'PPV MATCH COMPLETE';
      }

      if (careerInfo) {
        const careerText = this.add.text(GAME.WIDTH / 2, 165, careerInfo, {
          fontFamily: 'Arial Black',
          fontSize: '16px',
          color: '#FFD700'
        });
        careerText.setOrigin(0.5);
        careerText.setAlpha(0);
        this.tweens.add({
          targets: careerText,
          alpha: 1,
          duration: 500,
          delay: 500
        });
      }
    }

    // Survival mode streak display
    if (this.gameMode === 'survival') {
      const streakColor = this.survivalStreak >= 5 ? '#FFD700' :
                         this.survivalStreak >= 3 ? '#FF4500' : '#FFFFFF';

      if (this.playerWon) {
        const streakText = this.add.text(GAME.WIDTH / 2, 165,
          `STREAK: ${this.survivalStreak}`, {
          fontFamily: 'Arial Black',
          fontSize: '20px',
          color: streakColor
        });
        streakText.setOrigin(0.5);
        streakText.setAlpha(0);
        this.tweens.add({
          targets: streakText,
          alpha: 1,
          scale: 1.1,
          duration: 500,
          delay: 500,
          yoyo: true,
          repeat: -1
        });
      } else if (this.survivalStreak > 0) {
        // Show final streak when losing
        const finalText = this.add.text(GAME.WIDTH / 2, 165,
          `FINAL STREAK: ${this.survivalStreak - 1}`, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#888888'
        });
        finalText.setOrigin(0.5);

        // Check and show if new best
        const stats = StatsManager.load();
        if (this.survivalStreak - 1 > (stats.modeStats?.survival?.bestStreak || 0)) {
          const newBestText = this.add.text(GAME.WIDTH / 2, 185,
            'NEW BEST!', {
            fontFamily: 'Arial Black',
            fontSize: '16px',
            color: '#FFD700'
          });
          newBestText.setOrigin(0.5);
        }
      }
    }

    // Show match stats
    this.showMatchStats();

    // Menu options based on game mode
    this.selectedOption = 0;
    this.options = [];
    let yOffset = 220;

    // Mode-specific options
    if (this.gameMode === 'career') {
      // Career mode - continue to career menu
      const continueText = this.add.text(GAME.WIDTH / 2, yOffset, 'CONTINUE CAREER', {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#FFFFFF'
      });
      continueText.setOrigin(0.5);
      this.options.push({ text: continueText, action: 'career-continue' });
      yOffset += 35;
    } else if (this.gameMode === 'arcade' && this.playerWon) {
      const continueText = this.add.text(GAME.WIDTH / 2, yOffset, 'NEXT FIGHT', {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#FFFFFF'
      });
      continueText.setOrigin(0.5);
      this.options.push({ text: continueText, action: 'arcade-next' });
      yOffset += 35;
    } else if (this.gameMode === 'survival' && this.playerWon) {
      const continueText = this.add.text(GAME.WIDTH / 2, yOffset, 'NEXT CHALLENGER', {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#FFFFFF'
      });
      continueText.setOrigin(0.5);
      this.options.push({ text: continueText, action: 'survival-next' });
      yOffset += 35;
    }

    // Rematch option
    const rematchText = this.add.text(GAME.WIDTH / 2, yOffset, 'REMATCH', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#FFFFFF'
    });
    rematchText.setOrigin(0.5);
    this.options.push({ text: rematchText, action: 'rematch' });
    yOffset += 35;

    // Character select (for quick match)
    if (this.gameMode === 'quick') {
      const selectText = this.add.text(GAME.WIDTH / 2, yOffset, 'CHARACTER SELECT', {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#FFFFFF'
      });
      selectText.setOrigin(0.5);
      this.options.push({ text: selectText, action: 'select' });
      yOffset += 35;
    }

    // Add save replay option if we have a recording
    if (this.recording) {
      const saveText = this.add.text(GAME.WIDTH / 2, yOffset, 'SAVE REPLAY', {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#FFFFFF'
      });
      saveText.setOrigin(0.5);
      this.options.push({ text: saveText, action: 'save' });
      yOffset += 35;
    }

    const menuText = this.add.text(GAME.WIDTH / 2, yOffset, 'MAIN MENU', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#FFFFFF'
    });
    menuText.setOrigin(0.5);
    this.options.push({ text: menuText, action: 'menu' });

    // Highlight selected option
    this.updateSelection();

    // Input - use KeyCodes directly for reliability
    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Make options clickable
    this.options.forEach((option, index) => {
      option.text.setInteractive({ useHandCursor: true });
      option.text.on('pointerover', () => {
        this.selectedOption = index;
        this.updateSelection();
      });
      option.text.on('pointerdown', () => {
        this.selectOption();
      });
    });

    // Global keyboard listener for navigation
    this.input.keyboard.on('keydown', (event) => {
      if (this.hasSelected) return;

      // Navigation
      if (event.keyCode === 87 || event.keyCode === 38) { // W or UP
        const prev = this.selectedOption;
        this.selectedOption = Math.max(0, this.selectedOption - 1);
        if (prev !== this.selectedOption) this.updateSelection(true);
      }
      if (event.keyCode === 83 || event.keyCode === 40) { // S or DOWN
        const prev = this.selectedOption;
        this.selectedOption = Math.min(this.options.length - 1, this.selectedOption + 1);
        if (prev !== this.selectedOption) this.updateSelection(true);
      }
      // Selection
      if (event.keyCode === 13 || event.keyCode === 32) { // ENTER or SPACE
        this.selectOption();
      }
    });

    // Focus the game canvas
    this.game.canvas.focus();

    // Prevent input lockout
    this.hasSelected = false;
  }

  selectOption() {
    if (this.hasSelected) return;

    const selected = this.options[this.selectedOption];
    if (!selected) return;

    // Play select sound
    if (this.cache.audio.exists('sfx-menu-select')) {
      this.sound.play('sfx-menu-select', { volume: 0.5 });
    }

    // Stop victory music when leaving
    if (this.victoryMusic && selected.action !== 'save') {
      this.victoryMusic.stop();
    }

    switch (selected.action) {
      case 'career-continue':
        this.hasSelected = true;
        TransitionManager.wipeToScene(this, 'CareerMenuScene', { career: this.career });
        break;

      case 'rematch':
        this.hasSelected = true;
        this.scene.start('FightScene', {
          mode: this.gameMode,
          player: this.playerCharKey,
          opponent: this.opponentCharKey
        });
        break;

      case 'arcade-next':
        this.hasSelected = true;
        // Get next opponent from roster (cycle through)
        const { CHARACTERS } = require('../config/characters.js');
        const charKeys = Object.keys(CHARACTERS);
        const nextIndex = (this.arcadeProgress + 1) % charKeys.length;
        let nextOpponent = charKeys[nextIndex];
        // Skip if same as player
        if (nextOpponent === this.playerCharKey) {
          nextOpponent = charKeys[(nextIndex + 1) % charKeys.length];
        }
        this.scene.start('FightScene', {
          mode: 'arcade',
          player: this.playerCharKey,
          opponent: nextOpponent,
          arcadeProgress: this.arcadeProgress + 1
        });
        break;

      case 'survival-next':
        this.hasSelected = true;
        // Random opponent, carry health and streak over
        const chars = require('../config/characters.js').CHARACTERS;
        const keys = Object.keys(chars).filter(k => k !== this.playerCharKey);
        const randomOpponent = keys[Math.floor(Math.random() * keys.length)];
        this.scene.start('FightScene', {
          mode: 'survival',
          player: this.playerCharKey,
          opponent: randomOpponent,
          carryHealth: this.playerHealth,
          survivalStreak: this.survivalStreak
        });
        break;

      case 'select':
        this.hasSelected = true;
        this.scene.start('CharacterSelectScene', { mode: 'quick' });
        break;

      case 'save':
        this.saveReplay();
        // Don't set hasSelected - allow further actions
        break;

      case 'menu':
        this.hasSelected = true;
        this.scene.start('MenuScene');
        break;
    }
  }

  saveReplay() {
    if (!this.recording) return;

    // Create download
    const json = JSON.stringify(this.recording, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `ccw-replay-${timestamp}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);

    // Visual feedback
    const savedText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 40, `Saved: ${filename}`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#00FF00'
    });
    savedText.setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      savedText.destroy();
    });
  }

  createBackgroundEffects() {
    // Subtle animated lines
    for (let i = 0; i < 5; i++) {
      const line = this.add.rectangle(
        Math.random() * GAME.WIDTH,
        Math.random() * GAME.HEIGHT,
        2,
        GAME.HEIGHT,
        this.playerWon ? 0x00FF00 : 0xFF0000,
        0.1
      );
      line.setDepth(-1);

      this.tweens.add({
        targets: line,
        x: line.x + 100,
        alpha: 0,
        duration: 3000 + Math.random() * 2000,
        repeat: -1,
        yoyo: true
      });
    }
  }

  showMatchStats() {
    const stats = StatsManager.load();

    // Stats container
    const statsY = 175;
    const statsContainer = this.add.container(GAME.WIDTH / 2, statsY);
    statsContainer.setAlpha(0);

    // Win streak
    if (stats.currentWinStreak > 1) {
      const streakText = this.add.text(0, 0, `${stats.currentWinStreak} WIN STREAK!`, {
        fontFamily: 'Arial Black',
        fontSize: '16px',
        color: '#FFD700'
      });
      streakText.setOrigin(0.5);
      statsContainer.add(streakText);
    }

    // Win rate
    const winRate = StatsManager.getWinRate();
    const rateText = this.add.text(0, 20, `Win Rate: ${winRate}%`, {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#888888'
    });
    rateText.setOrigin(0.5);
    statsContainer.add(rateText);

    this.tweens.add({
      targets: statsContainer,
      alpha: 1,
      duration: 300,
      delay: 600
    });
  }

  updateSelection(playSound = false) {
    if (playSound && this.cache.audio.exists('sfx-menu-navigate')) {
      this.sound.play('sfx-menu-navigate', { volume: 0.3 });
    }
    this.options.forEach((option, index) => {
      if (index === this.selectedOption) {
        option.text.setColor('#DC143C');
        option.text.setScale(1.1);
      } else {
        option.text.setColor('#FFFFFF');
        option.text.setScale(1);
      }
    });
  }

  update() {
    if (this.hasSelected) return;

    // Get mobile input
    const mobile = window.mobileInput || { justPressed: () => false };

    // Navigation
    if (Phaser.Input.Keyboard.JustDown(this.upKey) || Phaser.Input.Keyboard.JustDown(this.wKey) ||
        mobile.justPressed('up')) {
      const prev = this.selectedOption;
      this.selectedOption = Math.max(0, this.selectedOption - 1);
      if (prev !== this.selectedOption) this.updateSelection(true);
    }

    if (Phaser.Input.Keyboard.JustDown(this.downKey) || Phaser.Input.Keyboard.JustDown(this.sKey) ||
        mobile.justPressed('down')) {
      const prev = this.selectedOption;
      this.selectedOption = Math.min(this.options.length - 1, this.selectedOption + 1);
      if (prev !== this.selectedOption) this.updateSelection(true);
    }

    // Selection with Enter, Space, or Attack button
    if (Phaser.Input.Keyboard.JustDown(this.enterKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
        mobile.justPressed('attack')) {
      this.selectOption();
    }
  }
}
