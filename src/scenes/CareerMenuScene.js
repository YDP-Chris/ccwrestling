import Phaser from 'phaser';
import { GAME, COLORS } from '../config/constants.js';
import { CHARACTERS } from '../config/characters.js';
import CareerManager from '../systems/CareerManager.js';
import TransitionManager from '../systems/TransitionManager.js';

export default class CareerMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CareerMenuScene' });
  }

  init(data) {
    this.career = data.career || CareerManager.load();
    this.selectedOption = 0;
    this.menuOptions = [];
  }

  create() {
    // Background
    this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, 0x0a0a0a);

    // Side art panels (decorative)
    const leftArt = this.add.image(35, GAME.HEIGHT / 2, 'cabinet-side-art');
    leftArt.setScale(0.28);
    leftArt.setAlpha(0.2);

    const rightArt = this.add.image(GAME.WIDTH - 35, GAME.HEIGHT / 2, 'cabinet-side-art');
    rightArt.setScale(0.28);
    rightArt.setFlipX(true);
    rightArt.setAlpha(0.2);

    // Banner decoration
    const banner = this.add.image(GAME.WIDTH / 2, GAME.HEIGHT - 10, 'cabinet-banner');
    banner.setScale(0.5);
    banner.setAlpha(0.25);

    // Check for pending story events
    const pendingEvents = CareerManager.getPendingStoryEvents(this.career);
    if (pendingEvents.length > 0) {
      // Show story event first
      this.showStoryEvent(pendingEvents[0]);
      return;
    }

    // Career header
    this.createHeader();

    // Stats panel
    this.createStatsPanel();

    // Upcoming match panel
    this.createMatchPanel();

    // Menu options
    this.createMenu();

    // Setup input
    this.setupInput();
  }

  createHeader() {
    const chapter = CareerManager.getCurrentChapter(this.career);
    const characterConfig = CHARACTERS[this.career.playerCharacter];

    // Title
    this.add.text(GAME.WIDTH / 2, 25, 'CAREER MODE', {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: '#FF4500'
    }).setOrigin(0.5);

    // Chapter info
    if (chapter) {
      this.add.text(GAME.WIDTH / 2, 50, `Chapter ${this.career.currentChapter + 1}: ${chapter.name}`, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#FFFFFF'
      }).setOrigin(0.5);

      this.add.text(GAME.WIDTH / 2, 68, chapter.description, {
        fontFamily: 'Arial',
        fontSize: '11px',
        color: '#888888'
      }).setOrigin(0.5);
    } else if (this.career.isChampion) {
      this.add.text(GAME.WIDTH / 2, 50, 'CHAMPION', {
        fontFamily: 'Arial Black',
        fontSize: '18px',
        color: '#FFD700'
      }).setOrigin(0.5);

      this.add.text(GAME.WIDTH / 2, 70, `${this.career.titleDefenses} Title Defenses`, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#FFFFFF'
      }).setOrigin(0.5);
    }
  }

  createStatsPanel() {
    const stats = CareerManager.getCareerStats(this.career);
    const panelX = 80;
    const panelY = 110;

    // Panel background
    this.add.rectangle(panelX + 70, panelY + 60, 160, 130, 0x1a1a1a)
      .setStrokeStyle(2, 0x333333);

    this.add.text(panelX + 70, panelY, 'STATS', {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#FF4500'
    }).setOrigin(0.5);

    const statLines = [
      `Record: ${stats.wins}-${stats.losses}`,
      `Win Rate: ${stats.winRate}%`,
      `Reputation: ${stats.reputation}/100`,
      `Progress: ${stats.currentChapter}/${stats.totalChapters}`
    ];

    let y = panelY + 30;
    statLines.forEach(line => {
      this.add.text(panelX + 10, y, line, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#CCCCCC'
      });
      y += 22;
    });

    // Reputation bar
    const repBarY = y + 5;
    this.add.rectangle(panelX + 80, repBarY, 120, 10, 0x333333);
    this.add.rectangle(
      panelX + 20 + (stats.reputation * 1.2) / 2,
      repBarY,
      stats.reputation * 1.2,
      8,
      stats.reputation >= 75 ? 0x00FF00 : stats.reputation >= 50 ? 0xFFFF00 : 0xFF4500
    ).setOrigin(0, 0.5);
  }

  createMatchPanel() {
    const match = this.career.upcomingMatch;
    if (!match) return;

    const panelX = GAME.WIDTH - 250;
    const panelY = 110;

    // Panel background
    const bgColor = match.isPPV ? 0x2a1a1a : 0x1a1a1a;
    this.add.rectangle(panelX + 100, panelY + 60, 200, 130, bgColor)
      .setStrokeStyle(2, match.isPPV ? 0xFF4500 : 0x333333);

    // Header
    const headerText = match.isPPV ? match.ppvName : 'NEXT MATCH';
    this.add.text(panelX + 100, panelY, headerText, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: match.isPPV ? '#FFD700' : '#FFFFFF'
    }).setOrigin(0.5);

    // Match type
    this.add.text(panelX + 100, panelY + 25, match.type.name, {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#FF4500'
    }).setOrigin(0.5);

    // VS display
    const playerChar = CHARACTERS[this.career.playerCharacter];
    const opponentChar = CHARACTERS[match.opponent];

    this.add.text(panelX + 40, panelY + 55, playerChar.name.toUpperCase(), {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#00FF00'
    }).setOrigin(0.5);

    this.add.text(panelX + 100, panelY + 55, 'VS', {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#FF4500'
    }).setOrigin(0.5);

    this.add.text(panelX + 160, panelY + 55, opponentChar.name.toUpperCase(), {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#FF0000'
    }).setOrigin(0.5);

    // Title match indicator
    if (match.isTitleMatch) {
      this.add.text(panelX + 100, panelY + 85, '🏆 TITLE MATCH', {
        fontFamily: 'Arial Black',
        fontSize: '12px',
        color: '#FFD700'
      }).setOrigin(0.5);
    }

    // Main event indicator
    if (match.isMainEvent && !match.isTitleMatch) {
      this.add.text(panelX + 100, panelY + 85, '⭐ MAIN EVENT', {
        fontFamily: 'Arial',
        fontSize: '11px',
        color: '#FFFF00'
      }).setOrigin(0.5);
    }
  }

  createMenu() {
    const menuY = 280;
    this.menuOptions = [];

    const options = [
      { label: 'FIGHT!', action: 'fight' },
      { label: 'VIEW ROSTER', action: 'roster' },
      { label: 'BACK TO MENU', action: 'back' }
    ];

    options.forEach((option, index) => {
      const text = this.add.text(GAME.WIDTH / 2, menuY + index * 35, option.label, {
        fontFamily: 'Arial Black',
        fontSize: '20px',
        color: '#888888'
      });
      text.setOrigin(0.5);
      text.setInteractive({ useHandCursor: true });

      text.on('pointerover', () => {
        this.selectedOption = index;
        this.updateMenuSelection();
      });

      text.on('pointerdown', () => {
        this.selectOption();
      });

      this.menuOptions.push({ text, action: option.action });
    });

    this.updateMenuSelection();
  }

  updateMenuSelection() {
    this.menuOptions.forEach((option, index) => {
      if (index === this.selectedOption) {
        option.text.setColor('#FFFFFF');
        option.text.setScale(1.1);
      } else {
        option.text.setColor('#888888');
        option.text.setScale(1);
      }
    });
  }

  showStoryEvent(event) {
    // Create story overlay
    const overlay = this.add.container(0, 0);
    overlay.setDepth(1000);

    // Background
    const bg = this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, 0x000000, 0.9);
    overlay.add(bg);

    // Event type banner
    let bannerColor = 0xFF4500;
    let bannerText = 'STORY EVENT';

    if (event.type === 'promo') {
      bannerText = event.speaker;
      bannerColor = event.speaker === 'MANAGER' ? 0x00FF00 : 0xFF0000;
    } else if (event.type === 'rivalry_start') {
      bannerText = 'NEW RIVALRY';
      bannerColor = 0xFF0000;
    } else if (event.type === 'betrayal') {
      bannerText = 'BETRAYAL!';
      bannerColor = 0xFF00FF;
    }

    this.add.text(GAME.WIDTH / 2, 100, bannerText, {
      fontFamily: 'Arial Black',
      fontSize: '36px',
      color: `#${bannerColor.toString(16).padStart(6, '0')}`
    }).setOrigin(0.5);

    // Event text
    const eventText = event.text || event.reason || '';
    const textDisplay = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2, `"${eventText}"`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#FFFFFF',
      align: 'center',
      wordWrap: { width: 600 }
    });
    textDisplay.setOrigin(0.5);
    overlay.add(textDisplay);

    // Continue prompt
    const continueText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 50, 'Press ENTER to continue', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#888888'
    });
    continueText.setOrigin(0.5);
    overlay.add(continueText);

    // Blink animation
    this.tweens.add({
      targets: continueText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Wait for input
    this.input.keyboard.once('keydown-ENTER', () => {
      CareerManager.markEventTriggered(this.career, event);
      overlay.destroy();
      this.create(); // Recreate the scene
    });

    this.input.once('pointerdown', () => {
      CareerManager.markEventTriggered(this.career, event);
      overlay.destroy();
      this.create();
    });
  }

  setupInput() {
    this.input.keyboard.on('keydown-UP', () => this.navigate(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.navigate(1));
    this.input.keyboard.on('keydown-W', () => this.navigate(-1));
    this.input.keyboard.on('keydown-S', () => this.navigate(1));
    this.input.keyboard.on('keydown-ENTER', () => this.selectOption());
    this.input.keyboard.on('keydown-SPACE', () => this.selectOption());
    this.input.keyboard.on('keydown-ESC', () => this.goBack());
  }

  navigate(direction) {
    const prev = this.selectedOption;
    this.selectedOption = Phaser.Math.Wrap(
      this.selectedOption + direction,
      0,
      this.menuOptions.length
    );
    if (prev !== this.selectedOption && this.cache.audio.exists('sfx-menu-navigate')) {
      this.sound.play('sfx-menu-navigate', { volume: 0.3 });
    }
    this.updateMenuSelection();
  }

  selectOption() {
    const option = this.menuOptions[this.selectedOption];
    if (!option) return;

    // Play select sound
    if (this.cache.audio.exists('sfx-menu-select')) {
      this.sound.play('sfx-menu-select', { volume: 0.5 });
    }

    switch (option.action) {
      case 'fight':
        this.startMatch();
        break;
      case 'roster':
        this.showRoster();
        break;
      case 'back':
        this.goBack();
        break;
    }
  }

  showRoster() {
    // Create roster overlay
    if (this.rosterOverlay) return;

    this.rosterOverlay = this.add.container(0, 0);
    this.rosterOverlay.setDepth(1000);

    // Background
    const bg = this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, 0x000000, 0.95);
    this.rosterOverlay.add(bg);

    // Title
    const title = this.add.text(GAME.WIDTH / 2, 30, 'ROSTER', {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: '#FF4500'
    }).setOrigin(0.5);
    this.rosterOverlay.add(title);

    // Show all characters
    const charKeys = Object.keys(CHARACTERS);
    const startX = 80;
    const spacing = (GAME.WIDTH - 160) / charKeys.length;

    charKeys.forEach((key, index) => {
      const char = CHARACTERS[key];
      const x = startX + spacing * index + spacing / 2;
      const y = 180;

      // Character sprite
      if (this.textures.exists(`${char.spriteKey}-idle`)) {
        const sprite = this.add.sprite(x, y, `${char.spriteKey}-idle`, 0);
        sprite.setScale(1.5);
        this.rosterOverlay.add(sprite);
      }

      // Name
      const isPlayer = key === this.career.playerCharacter;
      const isRival = key === this.career.currentRival;
      const nameColor = isPlayer ? '#00FF00' : isRival ? '#FF0000' : '#FFFFFF';

      const nameText = this.add.text(x, y + 70, char.name, {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: nameColor
      }).setOrigin(0.5);
      this.rosterOverlay.add(nameText);

      // Role indicator
      if (isPlayer) {
        const youText = this.add.text(x, y + 88, '(YOU)', {
          fontFamily: 'Arial',
          fontSize: '10px',
          color: '#00FF00'
        }).setOrigin(0.5);
        this.rosterOverlay.add(youText);
      } else if (isRival) {
        const rivalText = this.add.text(x, y + 88, 'RIVAL', {
          fontFamily: 'Arial',
          fontSize: '10px',
          color: '#FF0000'
        }).setOrigin(0.5);
        this.rosterOverlay.add(rivalText);
      }
    });

    // Instructions
    const hint = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 40, 'Press ESC or ENTER to close', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#888888'
    }).setOrigin(0.5);
    this.rosterOverlay.add(hint);

    // Close handlers
    const closeRoster = () => {
      if (this.rosterOverlay) {
        this.rosterOverlay.destroy();
        this.rosterOverlay = null;
      }
    };

    this.input.keyboard.once('keydown-ESC', closeRoster);
    this.input.keyboard.once('keydown-ENTER', closeRoster);
    this.input.once('pointerdown', closeRoster);
  }

  startMatch() {
    const match = this.career.upcomingMatch;
    if (!match) return;

    TransitionManager.flashToScene(this, 'FightScene', {
      mode: 'career',
      player: this.career.playerCharacter,
      opponent: match.opponent,
      career: this.career,
      matchType: match.type,
      isPPV: match.isPPV,
      isTitleMatch: match.isTitleMatch
    });
  }

  update() {
    // Mobile input support
    const mobile = window.mobileInput || { justPressed: () => false };

    if (mobile.justPressed('up')) {
      this.navigate(-1);
    }
    if (mobile.justPressed('down')) {
      this.navigate(1);
    }
    if (mobile.justPressed('attack')) {
      this.selectOption();
    }
    if (mobile.justPressed('grapple')) {
      this.goBack();
    }
  }

  goBack() {
    TransitionManager.fadeToScene(this, 'MenuScene');
  }
}
