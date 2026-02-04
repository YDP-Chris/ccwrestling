import Phaser from 'phaser';
import { GAME, COLORS } from '../config/constants.js';
import { CHARACTERS } from '../config/characters.js';
import StatsManager from '../systems/StatsManager.js';

// Achievement definitions for display
const ACHIEVEMENTS = {
  first_win: { name: 'First Blood', desc: 'Win your first match', icon: '🥇' },
  ten_wins: { name: 'Rising Star', desc: 'Win 10 matches', icon: '⭐' },
  fifty_wins: { name: 'Veteran', desc: 'Win 50 matches', icon: '🏆' },
  five_streak: { name: 'On Fire', desc: 'Win 5 matches in a row', icon: '🔥' },
  ten_streak: { name: 'Unstoppable', desc: 'Win 10 matches in a row', icon: '💪' },
  ten_kos: { name: 'Knockout Artist', desc: 'Get 10 KOs', icon: '👊' },
  try_all: { name: 'Roster Explorer', desc: 'Play with all characters', icon: '🎭' }
};

export default class StatsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StatsScene' });
  }

  init() {
    this.tabIndex = 0;
    this.tabs = ['OVERALL', 'CHARACTERS', 'MODES', 'ACHIEVEMENTS'];
  }

  create() {
    // Load stats
    this.stats = StatsManager.load();

    // Background
    this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, 0x0a0a0a);

    // Title
    this.add.text(GAME.WIDTH / 2, 35, 'STATISTICS', {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Tab headers
    const tabY = 70;
    this.tabTexts = this.tabs.map((tab, i) => {
      const x = GAME.WIDTH / 2 + (i - 1.5) * 100;
      const tabText = this.add.text(x, tabY, tab, {
        fontFamily: 'Arial Black',
        fontSize: '12px',
        color: i === 0 ? '#FF4500' : '#666666'
      });
      tabText.setOrigin(0.5);
      return tabText;
    });

    // Tab underline
    this.tabUnderline = this.add.rectangle(GAME.WIDTH / 2 - 150, tabY + 12, 80, 3, 0xFF4500);

    // Content containers
    this.tabContents = [];
    this.createOverallTab();
    this.createCharactersTab();
    this.createModesTab();
    this.createAchievementsTab();

    // Show first tab
    this.showTab(0);

    // Navigation hint
    this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 20, 'LEFT/RIGHT: Switch Tab    ESC: Back to Menu', {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: '#555555'
    }).setOrigin(0.5);

    // Setup input
    this.setupInput();
  }

  createOverallTab() {
    const container = this.add.container(0, 0);
    const startY = 100;
    const stats = this.stats;

    // Stats grid
    const leftX = GAME.WIDTH / 2 - 120;
    const rightX = GAME.WIDTH / 2 + 120;

    const statRows = [
      { label: 'Total Matches', value: stats.totalMatches },
      { label: 'Wins', value: stats.totalWins },
      { label: 'Losses', value: stats.totalLosses },
      { label: 'Win Rate', value: `${StatsManager.getWinRate()}%` },
      { label: 'Total KOs', value: stats.totalKOs },
      { label: 'Current Streak', value: stats.currentWinStreak },
      { label: 'Best Streak', value: stats.longestWinStreak },
      { label: 'Damage Dealt', value: stats.totalDamageDealt.toLocaleString() },
      { label: 'Damage Taken', value: stats.totalDamageTaken.toLocaleString() }
    ];

    let y = startY;
    statRows.forEach((row, i) => {
      const x = i < 5 ? leftX : rightX;
      const yOffset = i < 5 ? i * 28 : (i - 5) * 28;

      const labelText = this.add.text(x - 60, startY + yOffset, row.label, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#888888'
      });
      labelText.setOrigin(0, 0.5);
      container.add(labelText);

      const valueText = this.add.text(x + 80, startY + yOffset, String(row.value), {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: '#FFFFFF'
      });
      valueText.setOrigin(1, 0.5);
      container.add(valueText);
    });

    // Favorite character
    if (stats.favoriteCharacter) {
      const charConfig = CHARACTERS[stats.favoriteCharacter];
      const charName = charConfig ? charConfig.name : stats.favoriteCharacter;

      this.add.text(GAME.WIDTH / 2, startY + 160, 'FAVORITE FIGHTER', {
        fontFamily: 'Arial Black',
        fontSize: '12px',
        color: '#FF4500'
      }).setOrigin(0.5);
      container.add(this.add.text(GAME.WIDTH / 2, startY + 180, charName, {
        fontFamily: 'Arial Black',
        fontSize: '18px',
        color: '#FFD700'
      }).setOrigin(0.5));
    }

    // Last played
    if (stats.lastPlayed) {
      const lastDate = new Date(stats.lastPlayed);
      const dateStr = lastDate.toLocaleDateString();
      container.add(this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 60, `Last played: ${dateStr}`, {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: '#555555'
      }).setOrigin(0.5));
    }

    this.tabContents.push(container);
  }

  createCharactersTab() {
    const container = this.add.container(0, 0);
    container.setVisible(false);
    const startY = 100;
    const stats = this.stats;

    // Character stats header
    container.add(this.add.text(GAME.WIDTH / 2 - 180, startY - 15, 'CHARACTER', {
      fontFamily: 'Arial Black',
      fontSize: '11px',
      color: '#FF4500'
    }));
    container.add(this.add.text(GAME.WIDTH / 2 - 40, startY - 15, 'MATCHES', {
      fontFamily: 'Arial Black',
      fontSize: '11px',
      color: '#FF4500'
    }).setOrigin(0.5));
    container.add(this.add.text(GAME.WIDTH / 2 + 40, startY - 15, 'WINS', {
      fontFamily: 'Arial Black',
      fontSize: '11px',
      color: '#FF4500'
    }).setOrigin(0.5));
    container.add(this.add.text(GAME.WIDTH / 2 + 100, startY - 15, 'WIN %', {
      fontFamily: 'Arial Black',
      fontSize: '11px',
      color: '#FF4500'
    }).setOrigin(0.5));
    container.add(this.add.text(GAME.WIDTH / 2 + 160, startY - 15, 'KOs', {
      fontFamily: 'Arial Black',
      fontSize: '11px',
      color: '#FF4500'
    }).setOrigin(0.5));

    // Character rows
    let y = startY + 10;
    Object.entries(CHARACTERS).forEach(([key, config]) => {
      const charStats = stats.characterStats[key] || { matches: 0, wins: 0, losses: 0, kos: 0 };
      const winRate = charStats.matches > 0 ? Math.round((charStats.wins / charStats.matches) * 100) : 0;

      container.add(this.add.text(GAME.WIDTH / 2 - 180, y, config.name, {
        fontFamily: 'Arial',
        fontSize: '13px',
        color: charStats.matches > 0 ? '#FFFFFF' : '#555555'
      }));

      container.add(this.add.text(GAME.WIDTH / 2 - 40, y, String(charStats.matches), {
        fontFamily: 'Arial',
        fontSize: '13px',
        color: '#CCCCCC'
      }).setOrigin(0.5, 0));

      container.add(this.add.text(GAME.WIDTH / 2 + 40, y, String(charStats.wins), {
        fontFamily: 'Arial',
        fontSize: '13px',
        color: '#00FF00'
      }).setOrigin(0.5, 0));

      container.add(this.add.text(GAME.WIDTH / 2 + 100, y, `${winRate}%`, {
        fontFamily: 'Arial',
        fontSize: '13px',
        color: winRate >= 50 ? '#00FF00' : '#FF4500'
      }).setOrigin(0.5, 0));

      container.add(this.add.text(GAME.WIDTH / 2 + 160, y, String(charStats.kos), {
        fontFamily: 'Arial',
        fontSize: '13px',
        color: '#FFD700'
      }).setOrigin(0.5, 0));

      y += 25;
    });

    this.tabContents.push(container);
  }

  createModesTab() {
    const container = this.add.container(0, 0);
    container.setVisible(false);
    const startY = 110;
    const stats = this.stats;

    const modes = [
      { key: 'quick', name: 'Quick Match' },
      { key: 'arcade', name: 'Arcade' },
      { key: 'survival', name: 'Survival' },
      { key: 'practice', name: 'Practice' }
    ];

    let y = startY;
    modes.forEach(mode => {
      const modeStats = stats.modeStats[mode.key] || {};

      // Mode name
      container.add(this.add.text(GAME.WIDTH / 2 - 150, y, mode.name, {
        fontFamily: 'Arial Black',
        fontSize: '16px',
        color: '#FFFFFF'
      }));

      // Wins/Losses
      if (mode.key !== 'practice') {
        const wins = modeStats.wins || 0;
        const losses = modeStats.losses || 0;
        container.add(this.add.text(GAME.WIDTH / 2 + 50, y, `W: ${wins}  L: ${losses}`, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#CCCCCC'
        }));

        // Mode-specific stats
        if (mode.key === 'arcade' && modeStats.bestProgress) {
          container.add(this.add.text(GAME.WIDTH / 2 + 50, y + 18, `Best Progress: ${modeStats.bestProgress} fights`, {
            fontFamily: 'Arial',
            fontSize: '11px',
            color: '#888888'
          }));
        }

        if (mode.key === 'survival' && modeStats.bestStreak) {
          container.add(this.add.text(GAME.WIDTH / 2 + 50, y + 18, `Best Streak: ${modeStats.bestStreak}`, {
            fontFamily: 'Arial',
            fontSize: '11px',
            color: '#FFD700'
          }));
        }
      } else {
        const sessions = modeStats.sessions || 0;
        container.add(this.add.text(GAME.WIDTH / 2 + 50, y, `Sessions: ${sessions}`, {
          fontFamily: 'Arial',
          fontSize: '14px',
          color: '#CCCCCC'
        }));
      }

      y += 55;
    });

    this.tabContents.push(container);
  }

  createAchievementsTab() {
    const container = this.add.container(0, 0);
    container.setVisible(false);
    const startY = 100;
    const stats = this.stats;
    const unlocked = stats.achievements || [];

    let y = startY;
    const colWidth = 250;

    Object.entries(ACHIEVEMENTS).forEach(([id, ach], i) => {
      const isUnlocked = unlocked.includes(id);
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = GAME.WIDTH / 2 + (col - 0.5) * colWidth;

      // Background
      const bg = this.add.rectangle(x, startY + row * 50, 220, 40, isUnlocked ? 0x1a3300 : 0x1a1a1a, 0.8);
      bg.setStrokeStyle(1, isUnlocked ? 0x00FF00 : 0x333333);
      container.add(bg);

      // Icon
      container.add(this.add.text(x - 95, startY + row * 50, isUnlocked ? ach.icon : '🔒', {
        fontFamily: 'Arial',
        fontSize: '18px'
      }).setOrigin(0, 0.5));

      // Name
      container.add(this.add.text(x - 70, startY + row * 50 - 8, ach.name, {
        fontFamily: 'Arial Black',
        fontSize: '12px',
        color: isUnlocked ? '#00FF00' : '#555555'
      }).setOrigin(0, 0.5));

      // Description
      container.add(this.add.text(x - 70, startY + row * 50 + 8, ach.desc, {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: isUnlocked ? '#AAFFAA' : '#444444'
      }).setOrigin(0, 0.5));
    });

    // Progress summary
    const totalAch = Object.keys(ACHIEVEMENTS).length;
    const unlockedCount = unlocked.length;
    container.add(this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 70, `${unlockedCount} / ${totalAch} Achievements Unlocked`, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: unlockedCount === totalAch ? '#FFD700' : '#888888'
    }).setOrigin(0.5));

    this.tabContents.push(container);
  }

  showTab(index) {
    this.tabIndex = index;

    // Update tab visuals
    this.tabTexts.forEach((text, i) => {
      text.setColor(i === index ? '#FF4500' : '#666666');
    });

    // Move underline
    const targetX = GAME.WIDTH / 2 + (index - 1.5) * 100;
    this.tweens.add({
      targets: this.tabUnderline,
      x: targetX,
      duration: 150,
      ease: 'Power2'
    });

    // Show/hide content
    this.tabContents.forEach((content, i) => {
      content.setVisible(i === index);
    });
  }

  setupInput() {
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  update() {
    const mobile = window.mobileInput || { justPressed: () => false };

    // Tab navigation
    if (Phaser.Input.Keyboard.JustDown(this.leftKey) ||
        Phaser.Input.Keyboard.JustDown(this.aKey) ||
        mobile.justPressed('left')) {
      const newIndex = Phaser.Math.Wrap(this.tabIndex - 1, 0, this.tabs.length);
      if (this.sound.get('sfx-menu-navigate')) {
        this.sound.play('sfx-menu-navigate', { volume: 0.3 });
      }
      this.showTab(newIndex);
    }

    if (Phaser.Input.Keyboard.JustDown(this.rightKey) ||
        Phaser.Input.Keyboard.JustDown(this.dKey) ||
        mobile.justPressed('right')) {
      const newIndex = Phaser.Math.Wrap(this.tabIndex + 1, 0, this.tabs.length);
      if (this.sound.get('sfx-menu-navigate')) {
        this.sound.play('sfx-menu-navigate', { volume: 0.3 });
      }
      this.showTab(newIndex);
    }

    // Back to menu
    if (Phaser.Input.Keyboard.JustDown(this.escKey) ||
        mobile.justPressed('grapple')) {
      if (this.sound.get('sfx-menu-select')) {
        this.sound.play('sfx-menu-select', { volume: 0.5 });
      }
      this.scene.start('MenuScene');
    }
  }
}
