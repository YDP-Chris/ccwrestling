import Phaser from 'phaser';
import { GAME, COLORS } from '../config/constants.js';
import { CHARACTERS } from '../config/characters.js';

const REPLAYS_STORAGE_KEY = 'ccw-replays';
const MAX_REPLAYS = 10;

export default class ReplayScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ReplayScene' });
  }

  init() {
    this.selectedIndex = 0;
    this.replays = this.loadReplays();
  }

  create() {
    // Background
    this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, 0x0a0a0a);

    // Title
    this.add.text(GAME.WIDTH / 2, 35, 'SAVED REPLAYS', {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Create replay list
    this.createReplayList();

    // Navigation hint
    this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 20, 'UP/DOWN: Select    ENTER: Play    DEL: Delete    ESC: Back', {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: '#555555'
    }).setOrigin(0.5);

    // Setup input
    this.setupInput();
  }

  loadReplays() {
    try {
      const saved = localStorage.getItem(REPLAYS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load replays:', e);
    }
    return [];
  }

  saveReplays(replays) {
    try {
      localStorage.setItem(REPLAYS_STORAGE_KEY, JSON.stringify(replays));
    } catch (e) {
      console.warn('Failed to save replays:', e);
    }
  }

  static saveReplay(replayData) {
    try {
      const saved = localStorage.getItem(REPLAYS_STORAGE_KEY);
      const replays = saved ? JSON.parse(saved) : [];

      // Add new replay at the beginning
      const newReplay = {
        id: Date.now(),
        date: new Date().toISOString(),
        player1: replayData.metadata?.player1 || 'DUMPSTER',
        player2: replayData.metadata?.player2 || 'SCAR',
        winner: replayData.winner || 'Unknown',
        playerWon: replayData.playerWon || false,
        data: replayData
      };

      replays.unshift(newReplay);

      // Keep only last MAX_REPLAYS
      while (replays.length > MAX_REPLAYS) {
        replays.pop();
      }

      localStorage.setItem(REPLAYS_STORAGE_KEY, JSON.stringify(replays));
      return true;
    } catch (e) {
      console.warn('Failed to save replay:', e);
      return false;
    }
  }

  createReplayList() {
    this.replayItems = [];
    const startY = 80;

    if (this.replays.length === 0) {
      // No replays message
      this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2, 'No saved replays yet.\n\nComplete matches to save replays!', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#888888',
        align: 'center'
      }).setOrigin(0.5);
      return;
    }

    // Column headers
    this.add.text(GAME.WIDTH / 2 - 200, startY, 'DATE', {
      fontFamily: 'Arial Black',
      fontSize: '11px',
      color: '#FF4500'
    });
    this.add.text(GAME.WIDTH / 2 - 50, startY, 'MATCHUP', {
      fontFamily: 'Arial Black',
      fontSize: '11px',
      color: '#FF4500'
    }).setOrigin(0.5, 0);
    this.add.text(GAME.WIDTH / 2 + 100, startY, 'RESULT', {
      fontFamily: 'Arial Black',
      fontSize: '11px',
      color: '#FF4500'
    }).setOrigin(0.5, 0);

    // Replay rows
    let y = startY + 25;
    this.replays.forEach((replay, index) => {
      const container = this.add.container(0, y);

      // Selection background
      const bg = this.add.rectangle(GAME.WIDTH / 2, 0, GAME.WIDTH - 100, 30, 0x333333, index === 0 ? 0.5 : 0);
      bg.setStrokeStyle(index === 0 ? 2 : 0, 0xFF4500);
      container.add(bg);

      // Date
      const date = new Date(replay.date);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
      const dateText = this.add.text(GAME.WIDTH / 2 - 200, 0, dateStr, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: index === 0 ? '#FFFFFF' : '#888888'
      }).setOrigin(0, 0.5);
      container.add(dateText);

      // Matchup
      const p1Name = CHARACTERS[replay.player1]?.name || replay.player1;
      const p2Name = CHARACTERS[replay.player2]?.name || replay.player2;
      const matchupText = this.add.text(GAME.WIDTH / 2 - 50, 0, `${p1Name} vs ${p2Name}`, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: index === 0 ? '#FFFFFF' : '#888888'
      }).setOrigin(0.5);
      container.add(matchupText);

      // Result
      const resultText = replay.playerWon ? 'WIN' : 'LOSS';
      const resultColor = replay.playerWon ? '#00FF00' : '#FF4500';
      const result = this.add.text(GAME.WIDTH / 2 + 100, 0, resultText, {
        fontFamily: 'Arial Black',
        fontSize: '12px',
        color: index === 0 ? resultColor : '#555555'
      }).setOrigin(0.5);
      container.add(result);

      this.replayItems.push({ container, bg, dateText, matchupText, result, replay });
      y += 35;
    });

    this.updateSelection();
  }

  updateSelection() {
    if (this.replayItems.length === 0) return;

    this.replayItems.forEach((item, index) => {
      const isSelected = index === this.selectedIndex;

      item.bg.setFillStyle(0x333333, isSelected ? 0.5 : 0);
      item.bg.setStrokeStyle(isSelected ? 2 : 0, 0xFF4500);
      item.dateText.setColor(isSelected ? '#FFFFFF' : '#888888');
      item.matchupText.setColor(isSelected ? '#FFFFFF' : '#888888');

      if (isSelected) {
        const resultColor = item.replay.playerWon ? '#00FF00' : '#FF4500';
        item.result.setColor(resultColor);
      } else {
        item.result.setColor('#555555');
      }
    });
  }

  setupInput() {
    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.deleteKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DELETE);
    this.backspaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  update() {
    if (this.replays.length === 0) {
      // Only handle back
      if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
        this.goBack();
      }
      return;
    }

    const mobile = window.mobileInput || { justPressed: () => false };

    // Navigate up
    if (Phaser.Input.Keyboard.JustDown(this.upKey) ||
        Phaser.Input.Keyboard.JustDown(this.wKey) ||
        mobile.justPressed('up')) {
      this.navigate(-1);
    }

    // Navigate down
    if (Phaser.Input.Keyboard.JustDown(this.downKey) ||
        Phaser.Input.Keyboard.JustDown(this.sKey) ||
        mobile.justPressed('down')) {
      this.navigate(1);
    }

    // Play replay
    if (Phaser.Input.Keyboard.JustDown(this.enterKey) ||
        mobile.justPressed('attack')) {
      this.playReplay();
    }

    // Delete replay
    if (Phaser.Input.Keyboard.JustDown(this.deleteKey) ||
        Phaser.Input.Keyboard.JustDown(this.backspaceKey)) {
      this.deleteReplay();
    }

    // Back
    if (Phaser.Input.Keyboard.JustDown(this.escKey) ||
        mobile.justPressed('grapple')) {
      this.goBack();
    }
  }

  navigate(direction) {
    this.selectedIndex = Phaser.Math.Wrap(
      this.selectedIndex + direction,
      0,
      this.replayItems.length
    );

    if (this.sound.get('sfx-menu-navigate')) {
      this.sound.play('sfx-menu-navigate', { volume: 0.3 });
    }

    this.updateSelection();
  }

  playReplay() {
    const selected = this.replayItems[this.selectedIndex];
    if (!selected) return;

    if (this.sound.get('sfx-menu-select')) {
      this.sound.play('sfx-menu-select', { volume: 0.5 });
    }

    // Start FightScene in replay mode
    this.scene.start('FightScene', {
      mode: 'quick',
      player: selected.replay.player1,
      opponent: selected.replay.player2,
      replayMode: 'play',
      replayData: selected.replay.data
    });
  }

  deleteReplay() {
    if (this.replayItems.length === 0) return;

    const selected = this.replayItems[this.selectedIndex];
    if (!selected) return;

    // Remove from array
    this.replays.splice(this.selectedIndex, 1);
    this.saveReplays(this.replays);

    // Remove from display
    selected.container.destroy();
    this.replayItems.splice(this.selectedIndex, 1);

    // Adjust selection
    if (this.selectedIndex >= this.replayItems.length) {
      this.selectedIndex = Math.max(0, this.replayItems.length - 1);
    }

    // Reposition remaining items
    this.replayItems.forEach((item, index) => {
      item.container.y = 105 + index * 35;
    });

    if (this.sound.get('sfx-menu-navigate')) {
      this.sound.play('sfx-menu-navigate', { volume: 0.4 });
    }

    this.updateSelection();

    // Show empty message if no replays left
    if (this.replayItems.length === 0) {
      this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2, 'No saved replays.', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#888888'
      }).setOrigin(0.5);
    }
  }

  goBack() {
    if (this.sound.get('sfx-menu-select')) {
      this.sound.play('sfx-menu-select', { volume: 0.5 });
    }
    this.scene.start('MenuScene');
  }
}
