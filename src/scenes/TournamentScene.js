import Phaser from 'phaser';
import { GAME, COLORS } from '../config/constants.js';
import { CHARACTERS } from '../config/characters.js';
import TournamentManager from '../systems/TournamentManager.js';
import TransitionManager from '../systems/TransitionManager.js';

export default class TournamentScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TournamentScene' });
  }

  init(data) {
    this.existingTournament = TournamentManager.load();
    this.phase = this.existingTournament ? 'resume' : 'size';
    this.selectedSize = 4;
    this.selectedCharIndex = 0;
    this.characters = Object.keys(CHARACTERS);
    this.hasStarted = false;
  }

  create() {
    // Background
    this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, 0x0a0a0a);

    // Title
    this.add.text(GAME.WIDTH / 2, 40, 'TOURNAMENT', {
      fontFamily: 'Arial Black',
      fontSize: '36px',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Create phase-specific content
    this.contentContainer = this.add.container(0, 0);

    if (this.phase === 'resume') {
      this.createResumeScreen();
    } else {
      this.createSizeSelection();
    }

    // Navigation hint
    this.hintText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 20, '', {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: '#555555'
    }).setOrigin(0.5);
    this.updateHint();

    // Setup input
    this.setupInput();
  }

  createResumeScreen() {
    this.contentContainer.removeAll(true);
    const t = this.existingTournament;

    // Tournament info
    const charName = CHARACTERS[t.playerCharacter]?.name || t.playerCharacter;
    const roundName = TournamentManager.getRoundName(t, t.bracket.findIndex(r => r.some(m => !m.completed)) || 0);

    this.contentContainer.add(this.add.text(GAME.WIDTH / 2, 100, 'TOURNAMENT IN PROGRESS', {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#FF4500'
    }).setOrigin(0.5));

    this.contentContainer.add(this.add.text(GAME.WIDTH / 2, 140, `${t.size}-Fighter Tournament`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#CCCCCC'
    }).setOrigin(0.5));

    this.contentContainer.add(this.add.text(GAME.WIDTH / 2, 165, `Playing as: ${charName}`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#FFFFFF'
    }).setOrigin(0.5));

    this.contentContainer.add(this.add.text(GAME.WIDTH / 2, 190, `Current Round: ${roundName}`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: t.playerAlive ? '#00FF00' : '#FF4500'
    }).setOrigin(0.5));

    if (!t.playerAlive) {
      this.contentContainer.add(this.add.text(GAME.WIDTH / 2, 220, 'You have been eliminated!', {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: '#FF4500'
      }).setOrigin(0.5));
    }

    // Options
    this.resumeOptions = [];
    const optionsY = 270;

    if (t.playerAlive && !t.completed) {
      const continueText = this.add.text(GAME.WIDTH / 2, optionsY, 'CONTINUE TOURNAMENT', {
        fontFamily: 'Arial Black',
        fontSize: '18px',
        color: '#00FF00'
      }).setOrigin(0.5);
      this.resumeOptions.push({ text: continueText, action: 'continue' });
      this.contentContainer.add(continueText);
    }

    const viewText = this.add.text(GAME.WIDTH / 2, optionsY + 35, 'VIEW BRACKET', {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    this.resumeOptions.push({ text: viewText, action: 'bracket' });
    this.contentContainer.add(viewText);

    const newText = this.add.text(GAME.WIDTH / 2, optionsY + 70, 'NEW TOURNAMENT', {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    this.resumeOptions.push({ text: newText, action: 'new' });
    this.contentContainer.add(newText);

    const backText = this.add.text(GAME.WIDTH / 2, optionsY + 105, 'BACK TO MENU', {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#888888'
    }).setOrigin(0.5);
    this.resumeOptions.push({ text: backText, action: 'menu' });
    this.contentContainer.add(backText);

    this.resumeOptionIndex = 0;
    this.updateResumeSelection();
  }

  updateResumeSelection() {
    this.resumeOptions.forEach((opt, i) => {
      const isSelected = i === this.resumeOptionIndex;
      opt.text.setScale(isSelected ? 1.1 : 1);
      if (opt.action === 'continue') {
        opt.text.setColor(isSelected ? '#00FF00' : '#006600');
      } else if (opt.action === 'menu') {
        opt.text.setColor(isSelected ? '#FFFFFF' : '#888888');
      } else {
        opt.text.setColor(isSelected ? '#FFD700' : '#888888');
      }
    });
  }

  createSizeSelection() {
    this.contentContainer.removeAll(true);
    this.phase = 'size';

    this.contentContainer.add(this.add.text(GAME.WIDTH / 2, 120, 'SELECT TOURNAMENT SIZE', {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#FF4500'
    }).setOrigin(0.5));

    // Size options
    const sizes = [4, 8];
    this.sizeTexts = sizes.map((size, i) => {
      const x = GAME.WIDTH / 2 + (i - 0.5) * 150;
      const text = this.add.text(x, 200, `${size} FIGHTERS`, {
        fontFamily: 'Arial Black',
        fontSize: '24px',
        color: i === 0 ? '#FFD700' : '#888888'
      }).setOrigin(0.5);

      const desc = this.add.text(x, 230, i === 0 ? '2 Rounds' : '3 Rounds', {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#666666'
      }).setOrigin(0.5);

      this.contentContainer.add(text);
      this.contentContainer.add(desc);

      return { text, desc, size };
    });

    this.sizeIndex = 0;
    this.updateSizeSelection();
  }

  updateSizeSelection() {
    this.sizeTexts.forEach((item, i) => {
      const isSelected = i === this.sizeIndex;
      item.text.setColor(isSelected ? '#FFD700' : '#888888');
      item.text.setScale(isSelected ? 1.1 : 1);
      item.desc.setColor(isSelected ? '#CCCCCC' : '#666666');
    });
    this.selectedSize = this.sizeTexts[this.sizeIndex].size;
  }

  createCharacterSelection() {
    this.contentContainer.removeAll(true);
    this.phase = 'character';

    this.contentContainer.add(this.add.text(GAME.WIDTH / 2, 100, 'SELECT YOUR FIGHTER', {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#FF4500'
    }).setOrigin(0.5));

    // Character display
    this.charTexts = [];
    const startX = GAME.WIDTH / 2 - (this.characters.length - 1) * 80 / 2;

    this.characters.forEach((charKey, i) => {
      const config = CHARACTERS[charKey];
      const x = startX + i * 80;

      // Character portrait placeholder (use sprite if available)
      const portrait = this.add.rectangle(x, 180, 60, 60, COLORS.BLOOD_DEEP, 0.5);
      portrait.setStrokeStyle(2, i === 0 ? 0xFFD700 : 0x333333);
      this.contentContainer.add(portrait);

      // Name
      const nameText = this.add.text(x, 230, config.name.toUpperCase(), {
        fontFamily: 'Arial Black',
        fontSize: '10px',
        color: i === 0 ? '#FFFFFF' : '#666666'
      }).setOrigin(0.5);
      this.contentContainer.add(nameText);

      this.charTexts.push({ portrait, nameText, charKey });
    });

    // Character description
    this.charDescText = this.add.text(GAME.WIDTH / 2, 280, '', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#CCCCCC',
      align: 'center'
    }).setOrigin(0.5);
    this.contentContainer.add(this.charDescText);

    this.selectedCharIndex = 0;
    this.updateCharacterSelection();
  }

  updateCharacterSelection() {
    this.charTexts.forEach((item, i) => {
      const isSelected = i === this.selectedCharIndex;
      item.portrait.setStrokeStyle(3, isSelected ? 0xFFD700 : 0x333333);
      item.nameText.setColor(isSelected ? '#FFFFFF' : '#666666');
    });

    // Update description
    const selected = CHARACTERS[this.characters[this.selectedCharIndex]];
    this.charDescText.setText(selected.style || '');
  }

  startTournament() {
    if (this.hasStarted) return;
    this.hasStarted = true;

    const playerChar = this.characters[this.selectedCharIndex];
    const tournament = TournamentManager.create(this.selectedSize, playerChar);

    if (this.sound.get('sfx-menu-select')) {
      this.sound.play('sfx-menu-select', { volume: 0.6 });
    }

    this.cameras.main.flash(200, 255, 255, 255);

    this.time.delayedCall(200, () => {
      TransitionManager.wipeToScene(this, 'TournamentBracketScene', { tournament });
    });
  }

  setupInput() {
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  updateHint() {
    switch (this.phase) {
      case 'resume':
        this.hintText.setText('UP/DOWN: Select    ENTER: Confirm    ESC: Back');
        break;
      case 'size':
        this.hintText.setText('LEFT/RIGHT: Select Size    ENTER: Confirm    ESC: Back');
        break;
      case 'character':
        this.hintText.setText('LEFT/RIGHT: Select Fighter    ENTER: Start    ESC: Back');
        break;
    }
  }

  update() {
    if (this.hasStarted) return;

    const mobile = window.mobileInput || { justPressed: () => false };

    switch (this.phase) {
      case 'resume':
        this.handleResumeInput(mobile);
        break;
      case 'size':
        this.handleSizeInput(mobile);
        break;
      case 'character':
        this.handleCharacterInput(mobile);
        break;
    }
  }

  handleResumeInput(mobile) {
    if (Phaser.Input.Keyboard.JustDown(this.upKey) ||
        Phaser.Input.Keyboard.JustDown(this.wKey) ||
        mobile.justPressed('up')) {
      this.resumeOptionIndex = Math.max(0, this.resumeOptionIndex - 1);
      this.playNavSound();
      this.updateResumeSelection();
    }

    if (Phaser.Input.Keyboard.JustDown(this.downKey) ||
        Phaser.Input.Keyboard.JustDown(this.sKey) ||
        mobile.justPressed('down')) {
      this.resumeOptionIndex = Math.min(this.resumeOptions.length - 1, this.resumeOptionIndex + 1);
      this.playNavSound();
      this.updateResumeSelection();
    }

    if (Phaser.Input.Keyboard.JustDown(this.enterKey) ||
        mobile.justPressed('attack')) {
      const action = this.resumeOptions[this.resumeOptionIndex].action;
      this.playSelectSound();

      switch (action) {
        case 'continue':
          TransitionManager.wipeToScene(this, 'TournamentBracketScene', { tournament: this.existingTournament });
          break;
        case 'bracket':
          TransitionManager.wipeToScene(this, 'TournamentBracketScene', { tournament: this.existingTournament, viewOnly: true });
          break;
        case 'new':
          TournamentManager.clear();
          this.createSizeSelection();
          this.updateHint();
          break;
        case 'menu':
          this.scene.start('MenuScene');
          break;
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.escKey) ||
        mobile.justPressed('grapple')) {
      this.playSelectSound();
      this.scene.start('MenuScene');
    }
  }

  handleSizeInput(mobile) {
    if (Phaser.Input.Keyboard.JustDown(this.leftKey) ||
        Phaser.Input.Keyboard.JustDown(this.aKey) ||
        mobile.justPressed('left')) {
      this.sizeIndex = Math.max(0, this.sizeIndex - 1);
      this.playNavSound();
      this.updateSizeSelection();
    }

    if (Phaser.Input.Keyboard.JustDown(this.rightKey) ||
        Phaser.Input.Keyboard.JustDown(this.dKey) ||
        mobile.justPressed('right')) {
      this.sizeIndex = Math.min(this.sizeTexts.length - 1, this.sizeIndex + 1);
      this.playNavSound();
      this.updateSizeSelection();
    }

    if (Phaser.Input.Keyboard.JustDown(this.enterKey) ||
        mobile.justPressed('attack')) {
      this.playSelectSound();
      this.createCharacterSelection();
      this.updateHint();
    }

    if (Phaser.Input.Keyboard.JustDown(this.escKey) ||
        mobile.justPressed('grapple')) {
      this.playSelectSound();
      this.scene.start('MenuScene');
    }
  }

  handleCharacterInput(mobile) {
    if (Phaser.Input.Keyboard.JustDown(this.leftKey) ||
        Phaser.Input.Keyboard.JustDown(this.aKey) ||
        mobile.justPressed('left')) {
      this.selectedCharIndex = Math.max(0, this.selectedCharIndex - 1);
      this.playNavSound();
      this.updateCharacterSelection();
    }

    if (Phaser.Input.Keyboard.JustDown(this.rightKey) ||
        Phaser.Input.Keyboard.JustDown(this.dKey) ||
        mobile.justPressed('right')) {
      this.selectedCharIndex = Math.min(this.characters.length - 1, this.selectedCharIndex + 1);
      this.playNavSound();
      this.updateCharacterSelection();
    }

    if (Phaser.Input.Keyboard.JustDown(this.enterKey) ||
        mobile.justPressed('attack')) {
      this.startTournament();
    }

    if (Phaser.Input.Keyboard.JustDown(this.escKey) ||
        mobile.justPressed('grapple')) {
      this.playSelectSound();
      this.createSizeSelection();
      this.updateHint();
    }
  }

  playNavSound() {
    if (this.sound.get('sfx-menu-navigate')) {
      this.sound.play('sfx-menu-navigate', { volume: 0.3 });
    }
  }

  playSelectSound() {
    if (this.sound.get('sfx-menu-select')) {
      this.sound.play('sfx-menu-select', { volume: 0.5 });
    }
  }
}
