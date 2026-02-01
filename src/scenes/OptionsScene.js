import Phaser from 'phaser';
import { GAME, COLORS } from '../config/constants.js';

// Default settings
const DEFAULT_SETTINGS = {
  matchLength: 'medium',  // short, medium, long
  difficulty: 'normal',   // easy, normal, hard
  musicVolume: 0.4,
  sfxVolume: 0.6
};

export default class OptionsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OptionsScene' });
  }

  init() {
    this.selectedIndex = 0;
    this.menuItems = [];

    // Load settings from localStorage or use defaults
    this.settings = this.loadSettings();
  }

  create() {
    // Background
    this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, 0x0a0a0a);

    // Title
    this.add.text(GAME.WIDTH / 2, 50, 'OPTIONS', {
      fontFamily: 'Arial Black',
      fontSize: '36px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Create menu items
    this.createMenuItems();

    // Controls hint
    this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 30,
      'LEFT/RIGHT to change | UP/DOWN to navigate | ESC to save & exit', {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: '#555555'
    }).setOrigin(0.5);

    // Setup input
    this.setupInput();

    // Update display
    this.updateDisplay();
  }

  createMenuItems() {
    const startY = 130;
    const spacing = 60;

    // Match Length
    this.menuItems.push(this.createOptionRow(
      startY,
      'MATCH LENGTH',
      ['SHORT (1 min)', 'MEDIUM (3 min)', 'LONG (5 min)'],
      ['short', 'medium', 'long'],
      this.settings.matchLength
    ));

    // Difficulty
    this.menuItems.push(this.createOptionRow(
      startY + spacing,
      'AI DIFFICULTY',
      ['EASY', 'NORMAL', 'HARD'],
      ['easy', 'normal', 'hard'],
      this.settings.difficulty
    ));

    // Music Volume
    this.menuItems.push(this.createSliderRow(
      startY + spacing * 2,
      'MUSIC VOLUME',
      this.settings.musicVolume
    ));

    // SFX Volume
    this.menuItems.push(this.createSliderRow(
      startY + spacing * 3,
      'SFX VOLUME',
      this.settings.sfxVolume
    ));

    // Reset to defaults
    this.menuItems.push(this.createButtonRow(
      startY + spacing * 4 + 20,
      'RESET TO DEFAULTS',
      () => this.resetDefaults()
    ));
  }

  createOptionRow(y, label, displayOptions, valueOptions, currentValue) {
    const container = this.add.container(GAME.WIDTH / 2, y);

    // Label
    const labelText = this.add.text(-200, 0, label, {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#888888'
    });
    labelText.setOrigin(0, 0.5);
    container.add(labelText);

    // Left arrow
    const leftArrow = this.add.text(50, 0, '<', {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#FF4500'
    });
    leftArrow.setOrigin(0.5);
    container.add(leftArrow);

    // Value display
    const currentIndex = valueOptions.indexOf(currentValue);
    const valueText = this.add.text(130, 0, displayOptions[currentIndex], {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#FFFFFF'
    });
    valueText.setOrigin(0.5);
    container.add(valueText);

    // Right arrow
    const rightArrow = this.add.text(210, 0, '>', {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#FF4500'
    });
    rightArrow.setOrigin(0.5);
    container.add(rightArrow);

    return {
      type: 'option',
      container,
      labelText,
      valueText,
      leftArrow,
      rightArrow,
      displayOptions,
      valueOptions,
      currentIndex,
      getValue: () => valueOptions[currentIndex],
      setValue: (index) => {
        currentIndex = Phaser.Math.Wrap(index, 0, valueOptions.length);
        valueText.setText(displayOptions[currentIndex]);
        return valueOptions[currentIndex];
      }
    };
  }

  createSliderRow(y, label, currentValue) {
    const container = this.add.container(GAME.WIDTH / 2, y);

    // Label
    const labelText = this.add.text(-200, 0, label, {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#888888'
    });
    labelText.setOrigin(0, 0.5);
    container.add(labelText);

    // Slider background
    const sliderBg = this.add.rectangle(130, 0, 160, 16, 0x333333);
    container.add(sliderBg);

    // Slider fill
    const sliderFill = this.add.rectangle(50, 0, 160 * currentValue, 12, COLORS.FIRE_ORANGE);
    sliderFill.setOrigin(0, 0.5);
    container.add(sliderFill);

    // Slider border
    const sliderBorder = this.add.rectangle(130, 0, 160, 16);
    sliderBorder.setStrokeStyle(2, COLORS.CHROME);
    container.add(sliderBorder);

    // Percentage text
    const percentText = this.add.text(230, 0, `${Math.round(currentValue * 100)}%`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#FFFFFF'
    });
    percentText.setOrigin(0, 0.5);
    container.add(percentText);

    let value = currentValue;

    return {
      type: 'slider',
      container,
      labelText,
      sliderFill,
      percentText,
      getValue: () => value,
      setValue: (newValue) => {
        value = Phaser.Math.Clamp(newValue, 0, 1);
        sliderFill.width = 160 * value;
        percentText.setText(`${Math.round(value * 100)}%`);
        return value;
      },
      adjust: (delta) => {
        value = Phaser.Math.Clamp(value + delta, 0, 1);
        sliderFill.width = 160 * value;
        percentText.setText(`${Math.round(value * 100)}%`);
        return value;
      }
    };
  }

  createButtonRow(y, label, callback) {
    const container = this.add.container(GAME.WIDTH / 2, y);

    // Button background
    const bg = this.add.rectangle(0, 0, 250, 36, 0x333333);
    bg.setStrokeStyle(2, 0x555555);
    container.add(bg);

    // Label
    const labelText = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black',
      fontSize: '16px',
      color: '#888888'
    });
    labelText.setOrigin(0.5);
    container.add(labelText);

    return {
      type: 'button',
      container,
      bg,
      labelText,
      callback
    };
  }

  updateDisplay() {
    this.menuItems.forEach((item, index) => {
      const isSelected = index === this.selectedIndex;

      if (item.labelText) {
        item.labelText.setColor(isSelected ? '#FFFFFF' : '#888888');
      }

      if (item.type === 'button') {
        item.bg.setStrokeStyle(2, isSelected ? COLORS.FIRE_ORANGE : 0x555555);
        item.labelText.setColor(isSelected ? '#FFFFFF' : '#888888');
      }

      // Scale selected item
      this.tweens.add({
        targets: item.container,
        scaleX: isSelected ? 1.05 : 1,
        scaleY: isSelected ? 1.05 : 1,
        duration: 100
      });
    });
  }

  setupInput() {
    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // WASD
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  }

  update() {
    // Navigate
    if (Phaser.Input.Keyboard.JustDown(this.upKey) ||
        Phaser.Input.Keyboard.JustDown(this.wKey)) {
      this.navigate(-1);
    }
    if (Phaser.Input.Keyboard.JustDown(this.downKey) ||
        Phaser.Input.Keyboard.JustDown(this.sKey)) {
      this.navigate(1);
    }

    // Adjust value
    if (Phaser.Input.Keyboard.JustDown(this.leftKey) ||
        Phaser.Input.Keyboard.JustDown(this.aKey)) {
      this.adjustValue(-1);
    }
    if (Phaser.Input.Keyboard.JustDown(this.rightKey) ||
        Phaser.Input.Keyboard.JustDown(this.dKey)) {
      this.adjustValue(1);
    }

    // Confirm (for buttons)
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.confirmSelection();
    }

    // Save and exit
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.saveAndExit();
    }
  }

  navigate(direction) {
    this.selectedIndex = Phaser.Math.Wrap(
      this.selectedIndex + direction,
      0,
      this.menuItems.length
    );
    this.sound.play('sfx-menu-select', { volume: 0.3 });
    this.updateDisplay();
  }

  adjustValue(direction) {
    const item = this.menuItems[this.selectedIndex];

    if (item.type === 'option') {
      item.currentIndex = Phaser.Math.Wrap(
        item.currentIndex + direction,
        0,
        item.valueOptions.length
      );
      item.valueText.setText(item.displayOptions[item.currentIndex]);
      this.sound.play('sfx-menu-select', { volume: 0.3 });
    } else if (item.type === 'slider') {
      item.adjust(direction * 0.1);
      this.sound.play('sfx-menu-select', { volume: 0.2 });

      // Preview volume change
      if (this.selectedIndex === 2) {
        // Music volume
        this.sound.volume = item.getValue();
      }
    }
  }

  confirmSelection() {
    const item = this.menuItems[this.selectedIndex];
    if (item.type === 'button' && item.callback) {
      this.sound.play('sfx-menu-select', { volume: 0.6 });
      item.callback();
    }
  }

  resetDefaults() {
    this.settings = { ...DEFAULT_SETTINGS };

    // Update UI
    this.menuItems[0].currentIndex = 1; // medium
    this.menuItems[0].valueText.setText(this.menuItems[0].displayOptions[1]);

    this.menuItems[1].currentIndex = 1; // normal
    this.menuItems[1].valueText.setText(this.menuItems[1].displayOptions[1]);

    this.menuItems[2].setValue(DEFAULT_SETTINGS.musicVolume);
    this.menuItems[3].setValue(DEFAULT_SETTINGS.sfxVolume);

    this.cameras.main.flash(100, 255, 255, 255);
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('ccw-settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  saveSettings() {
    this.settings = {
      matchLength: this.menuItems[0].valueOptions[this.menuItems[0].currentIndex],
      difficulty: this.menuItems[1].valueOptions[this.menuItems[1].currentIndex],
      musicVolume: this.menuItems[2].getValue(),
      sfxVolume: this.menuItems[3].getValue()
    };

    try {
      localStorage.setItem('ccw-settings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }

  saveAndExit() {
    this.saveSettings();
    this.sound.play('sfx-menu-select', { volume: 0.5 });
    this.scene.start('MenuScene');
  }
}

// Export settings getter for other scenes
export function getSettings() {
  try {
    const saved = localStorage.getItem('ccw-settings');
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load settings:', e);
  }
  return { ...DEFAULT_SETTINGS };
}
