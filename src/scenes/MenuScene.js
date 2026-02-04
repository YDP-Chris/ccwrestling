import Phaser from 'phaser';
import { GAME, COLORS } from '../config/constants.js';
import TransitionManager from '../systems/TransitionManager.js';
import CareerManager from '../systems/CareerManager.js';

// Game modes
const MODES = {
  CAREER: { id: 'career', label: 'CAREER', desc: 'Rise from rookie to champion with storylines' },
  QUICK_MATCH: { id: 'quick', label: 'QUICK MATCH', desc: 'Jump right into the action' },
  BEST_OF_3: { id: 'bestof3', label: 'BEST OF 3', desc: 'First to 2 round wins takes the match' },
  FIRST_BLOOD: { id: 'firstblood', label: 'FIRST BLOOD', desc: 'First hit wins - lightning fast rounds' },
  IRON_MAN: { id: 'ironman', label: 'IRON MAN', desc: 'Most KOs in 3 minutes wins' },
  ARCADE: { id: 'arcade', label: 'ARCADE', desc: 'Fight through the roster' },
  SURVIVAL: { id: 'survival', label: 'SURVIVAL', desc: 'Endless fights, health carries over' },
  TOURNAMENT: { id: 'tournament', label: 'TOURNAMENT', desc: 'Compete in bracket tournaments' },
  PRACTICE: { id: 'practice', label: 'PRACTICE', desc: 'Train your moves, AI won\'t attack' },
  STATS: { id: 'stats', label: 'STATS', desc: 'View your career statistics' },
  REPLAYS: { id: 'replays', label: 'REPLAYS', desc: 'Watch saved match replays' },
  OPTIONS: { id: 'options', label: 'OPTIONS', desc: 'Settings and controls' }
};

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  init() {
    this.hasStarted = false;
    this.selectedRow = 0;
    this.selectedCol = 0;
    this.menuItems = []; // 2D array: [col][row]
  }

  create() {
    // Background
    this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, 0x0a0a0a);

    // Dark red vignette
    const vignette = this.add.graphics();
    vignette.fillStyle(0x1a0000, 0.3);
    vignette.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

    // Side art panels (decorative)
    const leftArt = this.add.image(50, GAME.HEIGHT / 2, 'cabinet-side-art');
    leftArt.setScale(0.35);
    leftArt.setAlpha(0.25);

    const rightArt = this.add.image(GAME.WIDTH - 50, GAME.HEIGHT / 2, 'cabinet-side-art');
    rightArt.setScale(0.35);
    rightArt.setFlipX(true);
    rightArt.setAlpha(0.25);

    // Banner at bottom
    const banner = this.add.image(GAME.WIDTH / 2, GAME.HEIGHT - 15, 'cabinet-banner');
    banner.setScale(0.55);
    banner.setAlpha(0.4);

    // Logo - smaller for menu
    const logo = this.add.image(GAME.WIDTH / 2, 70, 'logo');
    logo.setScale(0.35);

    // Tagline
    const tagline = this.add.text(GAME.WIDTH / 2, 125, 'CHAIRS. TABLES. FIRE. NO MERCY.', {
      fontFamily: 'Arial Black',
      fontSize: '11px',
      color: '#FF4500',
      fontStyle: 'italic'
    });
    tagline.setOrigin(0.5);

    this.tweens.add({
      targets: tagline,
      alpha: 0.6,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // Create menu items
    this.createMenuItems();

    // Controls hint at bottom
    const controls = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 20,
      'ARROWS/WASD to navigate | ENTER to select', {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: '#444444'
    });
    controls.setOrigin(0.5);

    // Version
    const version = this.add.text(GAME.WIDTH - 8, GAME.HEIGHT - 8, 'v1.0', {
      fontFamily: 'Arial',
      fontSize: '9px',
      color: '#333333'
    });
    version.setOrigin(1, 1);

    // Menu music should already be playing from TitleScene
    // Get reference to it for fade out on selection
    this.menuMusic = this.sound.get('music-menu');
    if (!this.menuMusic?.isPlaying) {
      this.menuMusic = this.sound.add('music-menu', { loop: true, volume: 0.4 });
      this.menuMusic.play();
    }

    // Input setup
    this.setupInput();

    // Focus canvas
    this.game.canvas.focus();
  }

  createMenuItems() {
    const modes = Object.values(MODES);
    const startY = 160;
    const spacing = 42;
    const leftColX = GAME.WIDTH * 0.28;  // ~224
    const rightColX = GAME.WIDTH * 0.72; // ~576

    // Split into two columns
    const itemsPerCol = Math.ceil(modes.length / 2);
    this.menuItems = [[], []]; // [left column, right column]

    modes.forEach((mode, index) => {
      const col = index < itemsPerCol ? 0 : 1;
      const row = index < itemsPerCol ? index : index - itemsPerCol;
      const x = col === 0 ? leftColX : rightColX;
      const y = startY + (row * spacing);

      // Menu item container
      const container = this.add.container(x, y);

      // Background bar (hidden until selected)
      const bg = this.add.rectangle(0, 0, 200, 34, COLORS.BLOOD_BRIGHT, 0);
      bg.setStrokeStyle(2, COLORS.BLOOD_BRIGHT, 0);
      container.add(bg);

      // Label
      const label = this.add.text(0, 0, mode.label, {
        fontFamily: 'Arial Black',
        fontSize: '16px',
        color: '#888888'
      });
      label.setOrigin(0.5);
      container.add(label);

      this.menuItems[col].push({
        mode,
        container,
        bg,
        label,
        col,
        row
      });
    });

    // Description text at bottom center (shared for selected item)
    this.descText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 55, '', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#AAAAAA'
    });
    this.descText.setOrigin(0.5);

    // Initial selection
    this.updateSelection();
  }

  updateSelection() {
    const selectedItem = this.menuItems[this.selectedCol][this.selectedRow];

    // Update all items
    for (let col = 0; col < this.menuItems.length; col++) {
      for (let row = 0; row < this.menuItems[col].length; row++) {
        const item = this.menuItems[col][row];
        const isSelected = col === this.selectedCol && row === this.selectedRow;

        // Animate selection
        this.tweens.add({
          targets: item.label,
          scaleX: isSelected ? 1.1 : 1,
          scaleY: isSelected ? 1.1 : 1,
          duration: 100
        });

        // Color and style
        item.label.setColor(isSelected ? '#FFFFFF' : '#888888');
        item.bg.setFillStyle(COLORS.BLOOD_BRIGHT, isSelected ? 0.3 : 0);
        item.bg.setStrokeStyle(2, COLORS.BLOOD_BRIGHT, isSelected ? 1 : 0);
      }
    }

    // Update description text
    if (selectedItem) {
      this.descText.setText(selectedItem.mode.desc);
    }
  }

  setupInput() {
    // Arrow keys
    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // WASD
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  }

  update() {
    if (this.hasStarted) return;

    // Get mobile input
    const mobile = window.mobileInput || { justPressed: () => false };

    // Navigate up
    if (Phaser.Input.Keyboard.JustDown(this.upKey) ||
        Phaser.Input.Keyboard.JustDown(this.wKey) ||
        mobile.justPressed('up')) {
      this.navigateVertical(-1);
    }

    // Navigate down
    if (Phaser.Input.Keyboard.JustDown(this.downKey) ||
        Phaser.Input.Keyboard.JustDown(this.sKey) ||
        mobile.justPressed('down')) {
      this.navigateVertical(1);
    }

    // Navigate left
    if (Phaser.Input.Keyboard.JustDown(this.leftKey) ||
        Phaser.Input.Keyboard.JustDown(this.aKey) ||
        mobile.justPressed('left')) {
      this.navigateHorizontal(-1);
    }

    // Navigate right
    if (Phaser.Input.Keyboard.JustDown(this.rightKey) ||
        Phaser.Input.Keyboard.JustDown(this.dKey) ||
        mobile.justPressed('right')) {
      this.navigateHorizontal(1);
    }

    // Select (attack button acts as confirm on menus)
    if (Phaser.Input.Keyboard.JustDown(this.enterKey) ||
        Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
        mobile.justPressed('attack')) {
      this.selectMode();
    }
  }

  navigateVertical(direction) {
    const colLength = this.menuItems[this.selectedCol].length;
    this.selectedRow = Phaser.Math.Wrap(
      this.selectedRow + direction,
      0,
      colLength
    );

    // Play navigate sound
    this.sound.play('sfx-menu-navigate', { volume: 0.3 });

    this.updateSelection();
  }

  navigateHorizontal(direction) {
    // Switch columns
    const newCol = Phaser.Math.Wrap(this.selectedCol + direction, 0, 2);

    // Clamp row to new column's length
    const newColLength = this.menuItems[newCol].length;
    this.selectedRow = Math.min(this.selectedRow, newColLength - 1);
    this.selectedCol = newCol;

    // Play navigate sound
    this.sound.play('sfx-menu-navigate', { volume: 0.3 });

    this.updateSelection();
  }

  selectMode() {
    this.hasStarted = true;
    const selectedMode = this.menuItems[this.selectedCol][this.selectedRow].mode;

    // Play select sound
    this.sound.play('sfx-menu-select', { volume: 0.6 });

    // Flash effect
    this.cameras.main.flash(200, 255, 255, 255);

    // Fade out music
    if (this.menuMusic) {
      this.tweens.add({
        targets: this.menuMusic,
        volume: 0,
        duration: 500,
        onComplete: () => this.menuMusic.stop()
      });
    }

    // Handle mode selection with transition
    this.time.delayedCall(200, () => {
      switch (selectedMode.id) {
        case 'career':
          this.startCareer();
          break;
        case 'quick':
        case 'bestof3':
        case 'firstblood':
        case 'ironman':
        case 'arcade':
        case 'survival':
        case 'practice':
          TransitionManager.wipeToScene(this, 'CharacterSelectScene', { mode: selectedMode.id });
          break;
        case 'tournament':
          TransitionManager.wipeToScene(this, 'TournamentScene');
          break;
        case 'stats':
          TransitionManager.fadeToScene(this, 'StatsScene');
          break;
        case 'replays':
          TransitionManager.fadeToScene(this, 'ReplayScene');
          break;
        case 'options':
          TransitionManager.fadeToScene(this, 'OptionsScene');
          break;
      }
    });
  }

  startCareer() {
    // Check for existing career
    const existingCareer = CareerManager.load();

    if (existingCareer) {
      // Continue existing career
      TransitionManager.wipeToScene(this, 'CareerMenuScene', { career: existingCareer });
    } else {
      // Start new career - go to character select
      TransitionManager.wipeToScene(this, 'CharacterSelectScene', { mode: 'career' });
    }
  }
}
