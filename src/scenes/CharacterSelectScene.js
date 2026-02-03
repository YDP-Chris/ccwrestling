import Phaser from 'phaser';
import { GAME, COLORS } from '../config/constants.js';
import { CHARACTERS } from '../config/characters.js';
import TransitionManager from '../systems/TransitionManager.js';
import CareerManager from '../systems/CareerManager.js';

export default class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  init(data) {
    this.gameMode = data.mode || 'quick';
    this.phase = 'player'; // 'player' or 'opponent'
    this.selectedPlayerIndex = 0;
    this.selectedOpponentIndex = 1;
    this.characterKeys = Object.keys(CHARACTERS);
    this.characterCards = [];
  }

  create() {
    // Background
    this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, 0x0a0a0a);

    // Side art panels (decorative)
    const leftArt = this.add.image(35, GAME.HEIGHT / 2, 'cabinet-side-art');
    leftArt.setScale(0.3);
    leftArt.setAlpha(0.2);

    const rightArt = this.add.image(GAME.WIDTH - 35, GAME.HEIGHT / 2, 'cabinet-side-art');
    rightArt.setScale(0.3);
    rightArt.setFlipX(true);
    rightArt.setAlpha(0.2);

    // Banner at top
    const banner = this.add.image(GAME.WIDTH / 2, 8, 'cabinet-banner');
    banner.setScale(0.5);
    banner.setAlpha(0.3);
    banner.setOrigin(0.5, 0);

    // Title
    const titleStr = this.gameMode === 'career'
      ? 'SELECT YOUR WRESTLER'
      : 'CHOOSE YOUR FIGHTER';
    this.titleText = this.add.text(GAME.WIDTH / 2, 30, titleStr, {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.titleText.setOrigin(0.5);

    // Mode indicator
    const modeLabels = {
      quick: 'QUICK MATCH',
      arcade: 'ARCADE MODE',
      survival: 'SURVIVAL MODE',
      practice: 'PRACTICE MODE'
    };
    this.add.text(GAME.WIDTH / 2, 60, modeLabels[this.gameMode], {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#FF4500'
    }).setOrigin(0.5);

    // Create character cards
    this.createCharacterCards();

    // VS text (hidden until opponent selection)
    this.vsText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2, 'VS', {
      fontFamily: 'Arial Black',
      fontSize: '48px',
      color: '#FF4500',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.vsText.setOrigin(0.5);
    this.vsText.setAlpha(0);

    // Selected fighter display areas
    this.createSelectionDisplays();

    // Controls hint
    const hintText = this.gameMode === 'career'
      ? 'ARROWS to select | ENTER to start career | ESC to go back'
      : 'ARROWS to select | ENTER to confirm | ESC to go back';
    this.controlsHint = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 25, hintText, {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#555555'
    });
    this.controlsHint.setOrigin(0.5);

    // Random button hint
    this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 45,
      'Press R for Random', {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: '#666666'
    }).setOrigin(0.5);

    // Setup input
    this.setupInput();

    // Initial update
    this.updateSelection();
  }

  createCharacterCards() {
    const cardWidth = 140;
    const cardHeight = 180;
    const startX = GAME.WIDTH / 2 - ((this.characterKeys.length - 1) * (cardWidth + 20)) / 2;
    const cardY = GAME.HEIGHT / 2 - 20;

    this.characterKeys.forEach((key, index) => {
      const char = CHARACTERS[key];
      const x = startX + index * (cardWidth + 20);

      const container = this.add.container(x, cardY);

      // Card background - just the stroke outline, no fill covering the sprite
      const cardBg = this.add.rectangle(0, 0, cardWidth, cardHeight);
      cardBg.setStrokeStyle(3, 0x333333);
      cardBg.setFillStyle(0x1a1a1a, 1);
      container.add(cardBg);

      // Character portrait (use idle sprite)
      const portrait = this.add.sprite(0, -20, char.animations.idle);
      portrait.setScale(1.5);
      container.add(portrait);

      // Name
      const name = this.add.text(0, 55, char.name, {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: '#FFFFFF'
      });
      name.setOrigin(0.5);
      container.add(name);

      // Stats bars
      const statsY = 75;
      this.createStatBar(container, -50, statsY, 'ATK', char.attackPower, 0xff4444);
      this.createStatBar(container, -50, statsY + 14, 'DEF', char.defense, 0x44ff44);
      this.createStatBar(container, -50, statsY + 28, 'SPD', char.speed / 350, 0x4444ff);

      // Selection indicators
      const playerIndicator = this.add.text(-cardWidth/2 + 10, -cardHeight/2 + 10, 'P1', {
        fontFamily: 'Arial Black',
        fontSize: '16px',
        color: '#00FF00'
      });
      playerIndicator.setAlpha(0);
      container.add(playerIndicator);

      const opponentIndicator = this.add.text(cardWidth/2 - 10, -cardHeight/2 + 10, 'CPU', {
        fontFamily: 'Arial Black',
        fontSize: '16px',
        color: '#FF0000'
      });
      opponentIndicator.setOrigin(1, 0);
      opponentIndicator.setAlpha(0);
      container.add(opponentIndicator);

      // Ensure portrait is on top of background
      container.sendToBack(cardBg);

      this.characterCards.push({
        key,
        char,
        container,
        cardBg,
        portrait,
        name,
        playerIndicator,
        opponentIndicator
      });
    });
  }

  createStatBar(container, x, y, label, value, color) {
    // Label
    const labelText = this.add.text(x, y, label, {
      fontFamily: 'Arial',
      fontSize: '9px',
      color: '#888888'
    });
    container.add(labelText);

    // Bar background
    const barBg = this.add.rectangle(x + 30, y + 4, 60, 6, 0x333333);
    barBg.setOrigin(0, 0.5);
    container.add(barBg);

    // Bar fill (value is 0-1.5 range typically)
    const normalizedValue = Math.min(value, 1.5) / 1.5;
    const barFill = this.add.rectangle(x + 30, y + 4, 60 * normalizedValue, 6, color);
    barFill.setOrigin(0, 0.5);
    container.add(barFill);
  }

  createSelectionDisplays() {
    // Selection displays removed - the cards themselves show P1/CPU indicators
    // which is cleaner and doesn't overlap with the card layout
    this.playerDisplay = null;
    this.opponentDisplay = null;
  }

  updateSelection() {
    const currentIndex = this.phase === 'player'
      ? this.selectedPlayerIndex
      : this.selectedOpponentIndex;

    this.characterCards.forEach((card, index) => {
      const isCurrentSelection = index === currentIndex;
      const isPlayerSelected = index === this.selectedPlayerIndex && this.phase === 'opponent';

      // Update card appearance
      if (isCurrentSelection) {
        card.cardBg.setStrokeStyle(3, this.phase === 'player' ? 0x00FF00 : 0xFF0000);
        this.tweens.add({
          targets: card.container,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 100
        });
      } else if (isPlayerSelected) {
        card.cardBg.setStrokeStyle(3, 0x00FF00);
        card.container.setScale(1);
      } else {
        card.cardBg.setStrokeStyle(3, 0x333333);
        card.container.setScale(1);
      }

      // Update indicators
      card.playerIndicator.setAlpha(isPlayerSelected || (this.phase === 'player' && isCurrentSelection) ? 1 : 0);
      card.opponentIndicator.setAlpha(this.phase === 'opponent' && isCurrentSelection ? 1 : 0);
    });

    // Update title
    if (this.phase === 'player') {
      this.titleText.setText(this.gameMode === 'career' ? 'SELECT YOUR WRESTLER' : 'CHOOSE YOUR FIGHTER');
    } else {
      this.titleText.setText('CHOOSE YOUR OPPONENT');
    }
  }

  setupInput() {
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.randomKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // WASD alternatives
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  }

  update() {
    // Get mobile input
    const mobile = window.mobileInput || { justPressed: () => false };

    // Navigate left
    if (Phaser.Input.Keyboard.JustDown(this.leftKey) ||
        Phaser.Input.Keyboard.JustDown(this.aKey) ||
        mobile.justPressed('left')) {
      this.navigate(-1);
    }

    // Navigate right
    if (Phaser.Input.Keyboard.JustDown(this.rightKey) ||
        Phaser.Input.Keyboard.JustDown(this.dKey) ||
        mobile.justPressed('right')) {
      this.navigate(1);
    }

    // Confirm selection (attack button)
    if (Phaser.Input.Keyboard.JustDown(this.enterKey) ||
        mobile.justPressed('attack')) {
      this.confirmSelection();
    }

    // Go back (grapple button)
    if (Phaser.Input.Keyboard.JustDown(this.escKey) ||
        mobile.justPressed('grapple')) {
      this.goBack();
    }

    // Random selection
    if (Phaser.Input.Keyboard.JustDown(this.randomKey)) {
      this.randomSelect();
    }
  }

  navigate(direction) {
    if (this.phase === 'player') {
      this.selectedPlayerIndex = Phaser.Math.Wrap(
        this.selectedPlayerIndex + direction,
        0,
        this.characterKeys.length
      );
    } else {
      this.selectedOpponentIndex = Phaser.Math.Wrap(
        this.selectedOpponentIndex + direction,
        0,
        this.characterKeys.length
      );
    }

    this.sound.play('sfx-menu-navigate', { volume: 0.3 });
    this.updateSelection();
  }

  randomSelect() {
    if (this.phase === 'player') {
      this.selectedPlayerIndex = Phaser.Math.Between(0, this.characterKeys.length - 1);
    } else {
      // Avoid selecting same as player
      let newIndex;
      do {
        newIndex = Phaser.Math.Between(0, this.characterKeys.length - 1);
      } while (newIndex === this.selectedPlayerIndex && this.characterKeys.length > 1);
      this.selectedOpponentIndex = newIndex;
    }

    this.sound.play('sfx-menu-select', { volume: 0.5 });
    this.updateSelection();
  }

  confirmSelection() {
    this.sound.play('sfx-menu-select', { volume: 0.6 });

    if (this.phase === 'player') {
      const playerKey = this.characterKeys[this.selectedPlayerIndex];
      const playerChar = CHARACTERS[playerKey];

      // Career mode: skip opponent selection, go to career menu
      if (this.gameMode === 'career') {
        // Start new career with selected character
        const career = CareerManager.startNewCareer(playerKey);

        // Transition to career menu
        this.time.delayedCall(300, () => {
          TransitionManager.wipeToScene(this, 'CareerMenuScene', { career });
        });
        return;
      }

      // Non-career modes: move to opponent selection
      this.phase = 'opponent';

      // Make sure opponent isn't same as player initially
      if (this.selectedOpponentIndex === this.selectedPlayerIndex) {
        this.selectedOpponentIndex = (this.selectedPlayerIndex + 1) % this.characterKeys.length;
      }

      this.updateSelection();
    } else {
      // Both selected, start the fight!
      this.startFight();
    }
  }

  startFight() {
    const playerKey = this.characterKeys[this.selectedPlayerIndex];
    const opponentKey = this.characterKeys[this.selectedOpponentIndex];

    // Show VS text
    this.vsText.setAlpha(1);
    this.tweens.add({
      targets: this.vsText,
      scale: 1.5,
      duration: 200,
      yoyo: true
    });

    // Use flash transition to fight
    this.time.delayedCall(400, () => {
      TransitionManager.flashToScene(this, 'FightScene', {
        mode: this.gameMode,
        player: playerKey,
        opponent: opponentKey
      });
    });
  }

  goBack() {
    this.sound.play('sfx-menu-select', { volume: 0.4 });

    if (this.phase === 'opponent') {
      // Go back to player selection
      this.phase = 'player';
      this.updateSelection();
    } else {
      // Go back to menu
      this.scene.start('MenuScene');
    }
  }
}
