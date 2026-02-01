import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import MenuScene from './scenes/MenuScene.js';
import CharacterSelectScene from './scenes/CharacterSelectScene.js';
import CareerMenuScene from './scenes/CareerMenuScene.js';
import OptionsScene from './scenes/OptionsScene.js';
import FightScene from './scenes/FightScene.js';
import GameOverScene from './scenes/GameOverScene.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  parent: 'game-container',
  backgroundColor: '#0D0D0D',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: 1.5
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [BootScene, TitleScene, MenuScene, CharacterSelectScene, CareerMenuScene, OptionsScene, FightScene, GameOverScene],
  pixelArt: true,
  roundPixels: true,
  input: {
    keyboard: true,
    touch: {
      capture: false  // Don't capture touch events globally, let HTML controls work
    }
  }
};

const game = new Phaser.Game(config);

// Expose game globally for testing
window.game = game;

export default game;
