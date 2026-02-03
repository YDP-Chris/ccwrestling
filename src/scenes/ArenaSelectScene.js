import Phaser from 'phaser';
import { GAME, COLORS } from '../config/constants.js';
import TransitionManager from '../systems/TransitionManager.js';

// Arena definitions
const ARENAS = [
  { key: 'arena-warehouse', name: 'WAREHOUSE', desc: 'Industrial battleground' },
  { key: 'arena-basement', name: 'BASEMENT', desc: 'Underground fight club' },
  { key: 'arena-basement2', name: 'BOILER ROOM', desc: 'Dark and dangerous' },
  { key: 'arena-factory', name: 'FACTORY', desc: 'Rusted steel and chaos' },
  { key: 'arena-parking', name: 'PARKING LOT', desc: 'Concrete jungle' },
  { key: 'random', name: 'RANDOM', desc: 'Let fate decide' }
];

export default class ArenaSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ArenaSelectScene' });
  }

  init(data) {
    this.gameMode = data.mode || 'quick';
    this.playerCharKey = data.player;
    this.opponentCharKey = data.opponent;
    this.selectedIndex = 0;

    // Pass through any other data
    this.passData = data;
  }

  create() {
    // Background
    this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, 0x0a0a0a);

    // Title
    this.add.text(GAME.WIDTH / 2, 30, 'SELECT ARENA', {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: '#FF4500'
    }).setOrigin(0.5);

    // Create arena preview and cards
    this.createArenaPreview();
    this.createArenaCards();

    // Controls hint
    this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 25, 'ARROWS to select | ENTER to confirm | ESC to go back', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#555555'
    }).setOrigin(0.5);

    // Setup input
    this.setupInput();

    // Initial selection
    this.updateSelection();
  }

  createArenaPreview() {
    // Preview container (center of screen)
    this.previewContainer = this.add.container(GAME.WIDTH / 2, 160);

    // Preview background (dark border)
    const previewBg = this.add.rectangle(0, 0, 320, 180, 0x1a1a1a);
    previewBg.setStrokeStyle(3, 0xFF4500);
    this.previewContainer.add(previewBg);

    // Arena preview image
    this.previewImage = this.add.image(0, 0, ARENAS[0].key);
    this.previewImage.setDisplaySize(314, 174);
    this.previewContainer.add(this.previewImage);

    // Arena name
    this.arenaNameText = this.add.text(GAME.WIDTH / 2, 270, ARENAS[0].name, {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // Arena description
    this.arenaDescText = this.add.text(GAME.WIDTH / 2, 295, ARENAS[0].desc, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#888888'
    }).setOrigin(0.5);
  }

  createArenaCards() {
    this.arenaCards = [];
    const startX = 60;
    const spacing = (GAME.WIDTH - 120) / ARENAS.length;

    ARENAS.forEach((arena, index) => {
      const x = startX + spacing * index + spacing / 2;
      const y = 370;

      // Card container
      const card = this.add.container(x, y);

      // Card background
      const bg = this.add.rectangle(0, 0, 110, 60, 0x1a1a1a);
      bg.setStrokeStyle(2, 0x333333);
      card.add(bg);

      // Thumbnail or icon
      if (arena.key !== 'random') {
        const thumb = this.add.image(0, -5, arena.key);
        thumb.setDisplaySize(100, 40);
        card.add(thumb);
      } else {
        const randomText = this.add.text(0, -5, '?', {
          fontFamily: 'Arial Black',
          fontSize: '32px',
          color: '#FFD700'
        }).setOrigin(0.5);
        card.add(randomText);
      }

      // Name label
      const label = this.add.text(0, 22, arena.name, {
        fontFamily: 'Arial',
        fontSize: '9px',
        color: '#FFFFFF'
      }).setOrigin(0.5);
      card.add(label);

      // Make interactive
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => {
        this.selectedIndex = index;
        this.updateSelection();
      });
      bg.on('pointerdown', () => {
        this.confirmSelection();
      });

      this.arenaCards.push({ container: card, bg, arena });
    });
  }

  setupInput() {
    this.input.keyboard.on('keydown-LEFT', () => this.navigate(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.navigate(1));
    this.input.keyboard.on('keydown-A', () => this.navigate(-1));
    this.input.keyboard.on('keydown-D', () => this.navigate(1));
    this.input.keyboard.on('keydown-ENTER', () => this.confirmSelection());
    this.input.keyboard.on('keydown-SPACE', () => this.confirmSelection());
    this.input.keyboard.on('keydown-ESC', () => this.goBack());
  }

  navigate(direction) {
    this.selectedIndex = Phaser.Math.Wrap(
      this.selectedIndex + direction,
      0,
      ARENAS.length
    );

    if (this.cache.audio.exists('sfx-menu-navigate')) {
      this.sound.play('sfx-menu-navigate', { volume: 0.3 });
    }

    this.updateSelection();
  }

  updateSelection() {
    const arena = ARENAS[this.selectedIndex];

    // Update preview
    if (arena.key === 'random') {
      // Show random preview cycling
      const randomArena = ARENAS[Math.floor(Math.random() * (ARENAS.length - 1))];
      this.previewImage.setTexture(randomArena.key);
    } else {
      this.previewImage.setTexture(arena.key);
    }

    this.arenaNameText.setText(arena.name);
    this.arenaDescText.setText(arena.desc);

    // Update card highlights
    this.arenaCards.forEach((card, index) => {
      if (index === this.selectedIndex) {
        card.bg.setStrokeStyle(3, 0xFF4500);
        card.container.setScale(1.1);
      } else {
        card.bg.setStrokeStyle(2, 0x333333);
        card.container.setScale(1);
      }
    });
  }

  confirmSelection() {
    if (this.cache.audio.exists('sfx-menu-select')) {
      this.sound.play('sfx-menu-select', { volume: 0.5 });
    }

    const arena = ARENAS[this.selectedIndex];
    let selectedArena = arena.key;

    // Handle random selection
    if (selectedArena === 'random') {
      const randomIndex = Math.floor(Math.random() * (ARENAS.length - 1));
      selectedArena = ARENAS[randomIndex].key;
    }

    // Flash and transition
    this.cameras.main.flash(200, 255, 255, 255);

    this.time.delayedCall(300, () => {
      TransitionManager.flashToScene(this, 'FightScene', {
        ...this.passData,
        mode: this.gameMode,
        player: this.playerCharKey,
        opponent: this.opponentCharKey,
        arena: selectedArena
      });
    });
  }

  goBack() {
    if (this.cache.audio.exists('sfx-menu-select')) {
      this.sound.play('sfx-menu-select', { volume: 0.4 });
    }

    // Go back to character select with same mode
    this.scene.start('CharacterSelectScene', { mode: this.gameMode });
  }

  update() {
    // Mobile input support
    const mobile = window.mobileInput || { justPressed: () => false };

    if (mobile.justPressed('left')) {
      this.navigate(-1);
    }
    if (mobile.justPressed('right')) {
      this.navigate(1);
    }
    if (mobile.justPressed('attack')) {
      this.confirmSelection();
    }
    if (mobile.justPressed('grapple')) {
      this.goBack();
    }
  }
}
