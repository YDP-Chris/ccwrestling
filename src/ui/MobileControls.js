import Phaser from 'phaser';
import { GAME } from '../config/constants.js';

/**
 * Mobile touch controls overlay
 * - Virtual joystick on left for movement
 * - Action buttons on right for Attack, Grapple, Pickup, Slam
 */
export default class MobileControls {
  constructor(scene) {
    this.scene = scene;
    this.enabled = false;

    // Virtual joystick state
    this.joystick = {
      isDown: false,
      x: 0,
      y: 0,
      angle: 0,
      force: 0
    };

    // Button states
    this.buttons = {
      attack: false,
      grapple: false,
      pickup: false,
      slam: false
    };

    // UI elements
    this.container = null;
    this.joystickBase = null;
    this.joystickThumb = null;
    this.actionButtons = {};

    // Check if we should enable mobile controls
    this.checkMobile();
  }

  checkMobile() {
    // Enable on touch devices or narrow screens
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isNarrowScreen = window.innerWidth <= 900;
    this.enabled = isTouchDevice || isNarrowScreen;
  }

  create() {
    if (!this.enabled) return;

    // Create container for all mobile UI
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(1000);
    this.container.setScrollFactor(0);

    this.createJoystick();
    this.createActionButtons();
  }

  createJoystick() {
    const baseX = 80;
    const baseY = GAME.HEIGHT - 80;
    const baseRadius = 50;
    const thumbRadius = 25;

    // Joystick base (semi-transparent circle)
    this.joystickBase = this.scene.add.circle(baseX, baseY, baseRadius, 0x333333, 0.5);
    this.joystickBase.setStrokeStyle(2, 0x666666, 0.8);
    this.container.add(this.joystickBase);

    // Joystick thumb
    this.joystickThumb = this.scene.add.circle(baseX, baseY, thumbRadius, 0x888888, 0.7);
    this.joystickThumb.setStrokeStyle(2, 0xaaaaaa, 0.9);
    this.container.add(this.joystickThumb);

    // Make base interactive for touch
    this.joystickBase.setInteractive(new Phaser.Geom.Circle(0, 0, baseRadius * 1.5), Phaser.Geom.Circle.Contains);

    // Touch handlers
    this.joystickBase.on('pointerdown', (pointer) => {
      this.joystick.isDown = true;
      this.updateJoystickPosition(pointer);
    });

    this.scene.input.on('pointermove', (pointer) => {
      if (this.joystick.isDown) {
        this.updateJoystickPosition(pointer);
      }
    });

    this.scene.input.on('pointerup', (pointer) => {
      // Check if this was the joystick pointer
      if (this.joystick.isDown && pointer.x < GAME.WIDTH / 2) {
        this.resetJoystick();
      }
    });
  }

  updateJoystickPosition(pointer) {
    const baseX = 80;
    const baseY = GAME.HEIGHT - 80;
    const maxDistance = 40;

    // Calculate distance and angle from center
    const dx = pointer.x - baseX;
    const dy = pointer.y - baseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Clamp to max distance
    const clampedDistance = Math.min(distance, maxDistance);

    // Update thumb position
    const thumbX = baseX + Math.cos(angle) * clampedDistance;
    const thumbY = baseY + Math.sin(angle) * clampedDistance;
    this.joystickThumb.setPosition(thumbX, thumbY);

    // Update joystick state
    this.joystick.x = Math.cos(angle) * (clampedDistance / maxDistance);
    this.joystick.y = Math.sin(angle) * (clampedDistance / maxDistance);
    this.joystick.angle = angle;
    this.joystick.force = clampedDistance / maxDistance;
  }

  resetJoystick() {
    this.joystick.isDown = false;
    this.joystick.x = 0;
    this.joystick.y = 0;
    this.joystick.force = 0;

    // Reset thumb to center
    this.joystickThumb.setPosition(80, GAME.HEIGHT - 80);
  }

  createActionButtons() {
    const buttonConfigs = [
      { key: 'attack', label: 'ATK', x: GAME.WIDTH - 60, y: GAME.HEIGHT - 130, color: 0xcc3333 },
      { key: 'grapple', label: 'GRP', x: GAME.WIDTH - 120, y: GAME.HEIGHT - 80, color: 0x33cc33 },
      { key: 'pickup', label: 'PKP', x: GAME.WIDTH - 60, y: GAME.HEIGHT - 80, color: 0x3333cc },
      { key: 'slam', label: 'SLM', x: GAME.WIDTH - 60, y: GAME.HEIGHT - 30, color: 0xcc9933 }
    ];

    buttonConfigs.forEach(config => {
      this.createButton(config);
    });
  }

  createButton(config) {
    const { key, label, x, y, color } = config;
    const radius = 22;

    // Button background
    const button = this.scene.add.circle(x, y, radius, color, 0.6);
    button.setStrokeStyle(2, 0xffffff, 0.5);
    button.setInteractive(new Phaser.Geom.Circle(0, 0, radius), Phaser.Geom.Circle.Contains);
    this.container.add(button);

    // Button label
    const text = this.scene.add.text(x, y, label, {
      fontFamily: 'Arial',
      fontSize: '10px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    text.setOrigin(0.5);
    this.container.add(text);

    // Touch handlers
    button.on('pointerdown', () => {
      this.buttons[key] = true;
      button.setFillStyle(color, 1);
      button.setScale(0.9);
    });

    button.on('pointerup', () => {
      this.buttons[key] = false;
      button.setFillStyle(color, 0.6);
      button.setScale(1);
    });

    button.on('pointerout', () => {
      this.buttons[key] = false;
      button.setFillStyle(color, 0.6);
      button.setScale(1);
    });

    this.actionButtons[key] = { button, text };
  }

  // Get movement input (-1 to 1 for each axis)
  getMovement() {
    if (!this.enabled || !this.joystick.isDown) {
      return { x: 0, y: 0 };
    }

    // Apply deadzone
    const deadzone = 0.2;
    let x = Math.abs(this.joystick.x) > deadzone ? this.joystick.x : 0;
    let y = Math.abs(this.joystick.y) > deadzone ? this.joystick.y : 0;

    return { x, y };
  }

  // Check if a button is pressed
  isButtonDown(buttonKey) {
    return this.enabled && this.buttons[buttonKey];
  }

  // Check if a button was just pressed (for single-fire actions)
  isButtonJustDown(buttonKey) {
    const isDown = this.buttons[buttonKey];
    if (isDown && !this[`_prev_${buttonKey}`]) {
      this[`_prev_${buttonKey}`] = true;
      return true;
    }
    if (!isDown) {
      this[`_prev_${buttonKey}`] = false;
    }
    return false;
  }

  update() {
    // Any per-frame updates can go here
  }

  destroy() {
    if (this.container) {
      this.container.destroy();
    }
  }
}
