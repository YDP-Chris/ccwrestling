import Phaser from 'phaser';
import { GAME, COLORS } from '../config/constants.js';
import TransitionManager from '../systems/TransitionManager.js';
import CareerManager from '../systems/CareerManager.js';

// Game modes
const MODES = {
  CAREER: { id: 'career', label: 'CAREER', desc: 'Rise from rookie to champion with storylines' },
  QUICK_MATCH: { id: 'quick', label: 'QUICK MATCH', desc: 'Jump right into the action' },
  ARCADE: { id: 'arcade', label: 'ARCADE', desc: 'Fight through the roster' },
  SURVIVAL: { id: 'survival', label: 'SURVIVAL', desc: 'Endless fights, health carries over' },
  PRACTICE: { id: 'practice', label: 'PRACTICE', desc: 'Train your moves, AI won\'t attack' },
  OPTIONS: { id: 'options', label: 'OPTIONS', desc: 'Settings and controls' }
};

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  init() {
    this.hasStarted = false;
    this.selectedIndex = 0;
    this.menuItems = [];
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
      'ARROWS/WASD to select | ENTER to confirm', {
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
    const startY = 155;
    const spacing = 38;

    modes.forEach((mode, index) => {
      const y = startY + (index * spacing);

      // Menu item container
      const container = this.add.container(GAME.WIDTH / 2, y);

      // Background bar (hidden until selected)
      const bg = this.add.rectangle(0, 0, 240, 32, COLORS.BLOOD_BRIGHT, 0);
      bg.setStrokeStyle(2, COLORS.BLOOD_BRIGHT, 0);
      container.add(bg);

      // Label
      const label = this.add.text(0, -2, mode.label, {
        fontFamily: 'Arial Black',
        fontSize: '18px',
        color: '#888888'
      });
      label.setOrigin(0.5);
      container.add(label);

      // Description (shown when selected)
      const desc = this.add.text(0, 14, mode.desc, {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: '#666666'
      });
      desc.setOrigin(0.5);
      desc.setAlpha(0);
      container.add(desc);

      this.menuItems.push({
        mode,
        container,
        bg,
        label,
        desc
      });
    });

    // Initial selection
    this.updateSelection();
  }

  updateSelection() {
    this.menuItems.forEach((item, index) => {
      const isSelected = index === this.selectedIndex;

      // Animate selection
      this.tweens.add({
        targets: item.label,
        scaleX: isSelected ? 1.08 : 1,
        scaleY: isSelected ? 1.08 : 1,
        duration: 100
      });

      // Color and style
      item.label.setColor(isSelected ? '#FFFFFF' : '#888888');
      item.bg.setFillStyle(COLORS.BLOOD_BRIGHT, isSelected ? 0.3 : 0);
      item.bg.setStrokeStyle(2, COLORS.BLOOD_BRIGHT, isSelected ? 1 : 0);

      // Show/hide description
      this.tweens.add({
        targets: item.desc,
        alpha: isSelected ? 1 : 0,
        duration: 150
      });
    });
  }

  setupInput() {
    // Arrow keys
    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // WASD
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  }

  update() {
    if (this.hasStarted) return;

    // Get mobile input
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

    // Select (attack button acts as confirm on menus)
    if (Phaser.Input.Keyboard.JustDown(this.enterKey) ||
        Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
        mobile.justPressed('attack')) {
      this.selectMode();
    }
  }

  navigate(direction) {
    this.selectedIndex = Phaser.Math.Wrap(
      this.selectedIndex + direction,
      0,
      this.menuItems.length
    );

    // Play navigate sound
    this.sound.play('sfx-menu-select', { volume: 0.3 });

    this.updateSelection();
  }

  selectMode() {
    this.hasStarted = true;
    const selectedMode = this.menuItems[this.selectedIndex].mode;

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
        case 'arcade':
        case 'survival':
        case 'practice':
          TransitionManager.wipeToScene(this, 'CharacterSelectScene', { mode: selectedMode.id });
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
