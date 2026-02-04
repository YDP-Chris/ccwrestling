import Phaser from 'phaser';
import { GAME, COLORS } from '../config/constants.js';

/**
 * Practice mode overlay showing move list, input display, and damage tracker
 */
export default class PracticeOverlay {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(500);
    this.container.setScrollFactor(0);

    // Track stats
    this.comboCount = 0;
    this.comboDamage = 0;
    this.totalDamage = 0;
    this.lastInputs = [];

    this.createMoveList();
    this.createInputDisplay();
    this.createDamageTracker();

    // Listen for combat events
    this.setupEventListeners();
  }

  createMoveList() {
    // Semi-transparent background on left side
    const bg = this.scene.add.rectangle(10, 120, 160, 220, 0x000000, 0.7);
    bg.setOrigin(0, 0);
    bg.setStrokeStyle(1, 0x333333);
    this.container.add(bg);

    // Title
    const title = this.scene.add.text(90, 128, 'MOVE LIST', {
      fontFamily: 'Arial Black',
      fontSize: '12px',
      color: '#FF4500'
    });
    title.setOrigin(0.5);
    this.container.add(title);

    // Moves
    const moves = [
      { name: 'Punch', input: 'J', dmg: '8-12' },
      { name: 'Chair Hit', input: 'J+Chair', dmg: '22' },
      { name: 'Grapple', input: 'G', dmg: '-' },
      { name: 'Throw', input: 'J (grab)', dmg: '14' },
      { name: 'Body Slam', input: 'K (grab)', dmg: '16' },
      { name: 'Suplex', input: 'L (grab)', dmg: '18' },
      { name: 'DDT', input: 'G (grab)', dmg: '20' },
      { name: 'Table Slam', input: 'L', dmg: '35' },
      { name: 'Flaming Table', input: 'L+Fire', dmg: '55' },
      { name: 'Finisher', input: 'J+K', dmg: '45' }
    ];

    let y = 148;
    moves.forEach(move => {
      const nameText = this.scene.add.text(18, y, move.name, {
        fontFamily: 'Arial',
        fontSize: '9px',
        color: '#CCCCCC'
      });
      this.container.add(nameText);

      const inputText = this.scene.add.text(90, y, move.input, {
        fontFamily: 'Arial',
        fontSize: '9px',
        color: '#FFFF00'
      });
      inputText.setOrigin(0.5, 0);
      this.container.add(inputText);

      const dmgText = this.scene.add.text(155, y, move.dmg, {
        fontFamily: 'Arial',
        fontSize: '9px',
        color: '#FF4500'
      });
      dmgText.setOrigin(1, 0);
      this.container.add(dmgText);

      y += 15;
    });

    // Tips
    const tipsY = y + 10;
    const tips = [
      'F = Light table on fire',
      'Mash J to escape grabs'
    ];
    tips.forEach((tip, i) => {
      const tipText = this.scene.add.text(90, tipsY + i * 12, tip, {
        fontFamily: 'Arial',
        fontSize: '8px',
        color: '#00FF00'
      });
      tipText.setOrigin(0.5, 0);
      this.container.add(tipText);
    });
  }

  createInputDisplay() {
    // Input display at bottom-left
    const bgInput = this.scene.add.rectangle(10, GAME.HEIGHT - 60, 140, 50, 0x000000, 0.7);
    bgInput.setOrigin(0, 0);
    bgInput.setStrokeStyle(1, 0x333333);
    this.container.add(bgInput);

    const inputTitle = this.scene.add.text(80, GAME.HEIGHT - 52, 'INPUTS', {
      fontFamily: 'Arial Black',
      fontSize: '10px',
      color: '#00FF00'
    });
    inputTitle.setOrigin(0.5);
    this.container.add(inputTitle);

    // Input history display
    this.inputHistoryText = this.scene.add.text(80, GAME.HEIGHT - 28, '', {
      fontFamily: 'Courier',
      fontSize: '12px',
      color: '#FFFFFF'
    });
    this.inputHistoryText.setOrigin(0.5);
    this.container.add(this.inputHistoryText);
  }

  createDamageTracker() {
    // Damage tracker at bottom-right
    const bgDmg = this.scene.add.rectangle(GAME.WIDTH - 150, GAME.HEIGHT - 80, 140, 70, 0x000000, 0.7);
    bgDmg.setOrigin(0, 0);
    bgDmg.setStrokeStyle(1, 0x333333);
    this.container.add(bgDmg);

    const dmgTitle = this.scene.add.text(GAME.WIDTH - 80, GAME.HEIGHT - 72, 'DAMAGE', {
      fontFamily: 'Arial Black',
      fontSize: '10px',
      color: '#FF4500'
    });
    dmgTitle.setOrigin(0.5);
    this.container.add(dmgTitle);

    // Combo counter
    this.comboText = this.scene.add.text(GAME.WIDTH - 80, GAME.HEIGHT - 55, 'Combo: 0', {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: '#FFFF00'
    });
    this.comboText.setOrigin(0.5);
    this.container.add(this.comboText);

    // Combo damage
    this.comboDmgText = this.scene.add.text(GAME.WIDTH - 80, GAME.HEIGHT - 40, 'Combo Dmg: 0', {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: '#FFFFFF'
    });
    this.comboDmgText.setOrigin(0.5);
    this.container.add(this.comboDmgText);

    // Total damage
    this.totalDmgText = this.scene.add.text(GAME.WIDTH - 80, GAME.HEIGHT - 25, 'Total: 0', {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: '#888888'
    });
    this.totalDmgText.setOrigin(0.5);
    this.container.add(this.totalDmgText);
  }

  setupEventListeners() {
    // Listen for combat hits
    this.scene.events.on('combat-hit', this.onHit, this);
    this.scene.events.on('combat-combo', this.onCombo, this);
    this.scene.events.on('combat-combo-end', this.onComboEnd, this);

    // Track inputs
    this.setupInputTracking();
  }

  setupInputTracking() {
    const keys = ['W', 'A', 'S', 'D', 'J', 'K', 'L', 'G', 'F'];
    keys.forEach(key => {
      this.scene.input.keyboard.on(`keydown-${key}`, () => {
        this.recordInput(key);
      });
    });
  }

  recordInput(key) {
    this.lastInputs.push(key);
    if (this.lastInputs.length > 8) {
      this.lastInputs.shift();
    }
    this.inputHistoryText.setText(this.lastInputs.join(' '));
  }

  onHit(data) {
    // Safety check - scene may be transitioning
    if (!this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;

    const { damage, attacker } = data;

    // Only track player damage
    if (attacker && attacker.isPlayer) {
      this.totalDamage += damage || 0;
      this.comboDamage += damage || 0;
      this.updateDamageDisplay();
    }
  }

  onCombo(data) {
    // Safety check - scene may be transitioning
    if (!this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;

    const { comboCount } = data;
    this.comboCount = comboCount;
    this.updateDamageDisplay();
  }

  onComboEnd() {
    // Safety check - scene may be transitioning
    if (!this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;

    // Flash combo damage if it was significant
    if (this.comboDamage >= 30 && this.scene.tweens && this.comboDmgText) {
      this.scene.tweens.add({
        targets: this.comboDmgText,
        scale: 1.3,
        duration: 100,
        yoyo: true
      });
    }

    // Reset combo stats after a delay
    if (this.scene.time) {
      this.scene.time.delayedCall(500, () => {
        // Safety check - scene may be transitioning when timer fires
        if (!this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;
        this.comboCount = 0;
        this.comboDamage = 0;
        this.updateDamageDisplay();
      });
    }
  }

  updateDamageDisplay() {
    this.comboText.setText(`Combo: ${this.comboCount}`);
    this.comboDmgText.setText(`Combo Dmg: ${this.comboDamage}`);
    this.totalDmgText.setText(`Total: ${this.totalDamage}`);

    // Color combo based on length
    if (this.comboCount >= 5) {
      this.comboText.setColor('#FF0000');
    } else if (this.comboCount >= 3) {
      this.comboText.setColor('#FFA500');
    } else {
      this.comboText.setColor('#FFFF00');
    }
  }

  reset() {
    this.comboCount = 0;
    this.comboDamage = 0;
    this.totalDamage = 0;
    this.lastInputs = [];
    this.updateDamageDisplay();
    this.inputHistoryText.setText('');
  }

  destroy() {
    if (this.scene && this.scene.events) {
      this.scene.events.off('combat-hit', this.onHit, this);
      this.scene.events.off('combat-combo', this.onCombo, this);
      this.scene.events.off('combat-combo-end', this.onComboEnd, this);
    }
    if (this.container) this.container.destroy();
  }
}
