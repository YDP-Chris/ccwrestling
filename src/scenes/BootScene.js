import Phaser from 'phaser';
import { GAME, COLORS } from '../config/constants.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.createLoadingBar();
    this.loadAssets();
  }

  createLoadingBar() {
    const width = GAME.WIDTH;
    const height = GAME.HEIGHT;

    // Loading text
    this.loadingText = this.add.text(width / 2, height / 2 - 50, 'LOADING...', {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#DC143C'
    }).setOrigin(0.5);

    // Progress bar background
    this.progressBarBg = this.add.rectangle(width / 2, height / 2, 400, 30, 0x333333);

    // Progress bar fill
    this.progressBar = this.add.rectangle(width / 2 - 198, height / 2, 0, 26, COLORS.BLOOD_BRIGHT);
    this.progressBar.setOrigin(0, 0.5);

    // Update progress bar on load progress
    this.load.on('progress', (value) => {
      this.progressBar.width = 396 * value;
    });

    this.load.on('complete', () => {
      this.loadingText.destroy();
      this.progressBarBg.destroy();
      this.progressBar.destroy();
    });
  }

  loadAssets() {
    const basePath = 'assets';

    // === CHARACTER SPRITESHEETS ===
    // Dumpster animations (256x256 sheets with 2x2 grid = 128x128 per frame)
    this.load.spritesheet('dumpster-idle', `${basePath}/sprites/dumpster-idle.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('dumpster-walk', `${basePath}/sprites/dumpster-walk.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('dumpster-punch', `${basePath}/sprites/dumpster-punch.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('dumpster-chair', `${basePath}/sprites/dumpster-chair.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('dumpster-hit', `${basePath}/sprites/dumpster-hit.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('dumpster-down', `${basePath}/sprites/dumpster-down.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('dumpster-getup', `${basePath}/sprites/dumpster-getup.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('dumpster-victory', `${basePath}/sprites/dumpster-victory.png`, { frameWidth: 128, frameHeight: 128 });
    // Dumpster grapple animations (256x256 sheets with 2x2 grid = 128x128 per frame)
    this.load.spritesheet('dumpster-grapple', `${basePath}/sprites/dumpster-grapple.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('dumpster-grappled', `${basePath}/sprites/dumpster-grappled.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('dumpster-throw', `${basePath}/sprites/dumpster-throw.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('dumpster-throw-suplex', `${basePath}/sprites/dumpster-throw-suplex.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('dumpster-throw-ddt', `${basePath}/sprites/dumpster-throw-ddt.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('dumpster-throw-bodyslam', `${basePath}/sprites/dumpster-throw-bodyslam.png`, { frameWidth: 128, frameHeight: 128 });

    // Scar animations (256x256 sheets with 2x2 grid = 128x128 per frame)
    this.load.spritesheet('scar-idle', `${basePath}/sprites/scar-idle.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('scar-walk', `${basePath}/sprites/scar-walk.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('scar-punch', `${basePath}/sprites/scar-punch.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('scar-chair', `${basePath}/sprites/scar-chair.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('scar-hit', `${basePath}/sprites/scar-hit.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('scar-down', `${basePath}/sprites/scar-down.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('scar-getup', `${basePath}/sprites/scar-getup.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('scar-victory', `${basePath}/sprites/scar-victory.png`, { frameWidth: 128, frameHeight: 128 });
    // Scar grapple animations (256x256 sheets with 2x2 grid = 128x128 per frame)
    this.load.spritesheet('scar-grapple', `${basePath}/sprites/scar-grapple.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('scar-grappled', `${basePath}/sprites/scar-grappled.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('scar-throw', `${basePath}/sprites/scar-throw.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('scar-throw-suplex', `${basePath}/sprites/scar-throw-suplex.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('scar-throw-ddt', `${basePath}/sprites/scar-throw-ddt.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('scar-throw-bodyslam', `${basePath}/sprites/scar-throw-bodyslam.png`, { frameWidth: 128, frameHeight: 128 });

    // Blaze animations (2x2 grid spritesheets, 128x128 per frame)
    this.load.spritesheet('blaze-idle', `${basePath}/sprites/blaze-idle.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('blaze-walk', `${basePath}/sprites/blaze-walk.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('blaze-punch', `${basePath}/sprites/blaze-punch.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('blaze-hit', `${basePath}/sprites/blaze-hit.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('blaze-down', `${basePath}/sprites/blaze-down.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('blaze-victory', `${basePath}/sprites/blaze-victory.png`, { frameWidth: 128, frameHeight: 128 });

    // Tank animations (2x2 grid spritesheets, 128x128 per frame)
    this.load.spritesheet('tank-idle', `${basePath}/sprites/tank-idle.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('tank-walk', `${basePath}/sprites/tank-walk.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('tank-punch', `${basePath}/sprites/tank-punch.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('tank-hit', `${basePath}/sprites/tank-hit.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('tank-down', `${basePath}/sprites/tank-down.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('tank-victory', `${basePath}/sprites/tank-victory.png`, { frameWidth: 128, frameHeight: 128 });

    // Viper animations (2x2 grid spritesheets, 128x128 per frame)
    this.load.spritesheet('viper-idle', `${basePath}/sprites/viper-idle.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('viper-walk', `${basePath}/sprites/viper-walk.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('viper-punch', `${basePath}/sprites/viper-punch.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('viper-hit', `${basePath}/sprites/viper-hit.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('viper-down', `${basePath}/sprites/viper-down.png`, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('viper-victory', `${basePath}/sprites/viper-victory.png`, { frameWidth: 128, frameHeight: 128 });

    // === WEAPONS ===
    this.load.image('chair-ground', `${basePath}/sprites/chair-ground.webp`);
    this.load.image('chair-held', `${basePath}/sprites/chair-held.webp`);
    this.load.image('chair-swing', `${basePath}/sprites/chair-swing.webp`);
    this.load.image('table', `${basePath}/sprites/table.webp`);
    this.load.image('table-fire', `${basePath}/sprites/table-fire.webp`);
    this.load.image('table-broken', `${basePath}/sprites/table-broken.webp`);

    // === PARTICLES ===
    this.load.image('particle-blood', `${basePath}/sprites/particles/blood.webp`);
    this.load.spritesheet('particle-blood-drip', `${basePath}/sprites/particles/blood-drip.png`, { frameWidth: 64, frameHeight: 64 });
    this.load.image('particle-spark', `${basePath}/sprites/particles/spark.webp`);
    this.load.spritesheet('particle-fire', `${basePath}/sprites/particles/fire.png`, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('particle-smoke', `${basePath}/sprites/particles/smoke.png`, { frameWidth: 64, frameHeight: 64 });
    this.load.image('particle-debris', `${basePath}/sprites/particles/debris.webp`);

    // === BACKGROUNDS ===
    this.load.image('arena-warehouse', `${basePath}/backgrounds/arena-empty1.webp`);
    this.load.image('arena-basement', `${basePath}/backgrounds/arena-empty2.webp`);
    this.load.image('arena-basement2', `${basePath}/backgrounds/arena-basement2.webp`);
    this.load.image('arena-factory', `${basePath}/backgrounds/arena-factory.webp`);
    this.load.image('arena-parking', `${basePath}/backgrounds/arena-parking.webp`);

    // === UI ===
    this.load.image('logo', `${basePath}/ui/logo.webp`);
    this.load.image('healthbar-frame', `${basePath}/ui/healthbar-frame.webp`);
    this.load.image('healthbar-fill', `${basePath}/ui/healthbar-fill.webp`);
    this.load.image('meter-frame', `${basePath}/ui/meter-frame.webp`);
    this.load.image('meter-fill', `${basePath}/ui/meter-fill.webp`);
    this.load.image('damage-numbers', `${basePath}/ui/damage-numbers.webp`);
    this.load.image('cabinet-banner', `${basePath}/ui/cabinet-banner.webp`);
    this.load.image('cabinet-side-art', `${basePath}/ui/cabinet-side-art.webp`);

    // === SOUND EFFECTS ===
    this.load.audio('sfx-hit', `${basePath}/sfx/hit.mp3`);
    this.load.audio('sfx-chair-hit', `${basePath}/sfx/chair-hit.mp3`);
    this.load.audio('sfx-chair-pickup', `${basePath}/sfx/chair-pickup.mp3`);
    this.load.audio('sfx-table-break', `${basePath}/sfx/table-break.mp3`);
    this.load.audio('sfx-fire-ignite', `${basePath}/sfx/fire-ignite.mp3`);
    this.load.audio('sfx-fire-loop', `${basePath}/sfx/fire-loop.mp3`);
    this.load.audio('sfx-body-fall', `${basePath}/sfx/body-fall.mp3`);
    this.load.audio('sfx-crowd-ooh', `${basePath}/sfx/crowd-ooh.mp3`);
    this.load.audio('sfx-crowd-pop', `${basePath}/sfx/crowd-pop.mp3`);
    this.load.audio('sfx-crowd-loop', `${basePath}/sfx/crowd-loop.mp3`);
    this.load.audio('sfx-menu-select', `${basePath}/sfx/menu-select.mp3`);
    this.load.audio('sfx-menu-navigate', `${basePath}/sfx/menu-navigate.mp3`);
    this.load.audio('sfx-ko', `${basePath}/sfx/ko.mp3`);

    // === MUSIC ===
    this.load.audio('music-menu', `${basePath}/music/menu.mp3`);
    this.load.audio('music-fight', `${basePath}/music/fight.mp3`);
    this.load.audio('music-victory', `${basePath}/music/victory.mp3`);
  }

  create() {
    // Create all animations
    this.createAnimations();

    // Small delay then start title screen
    this.time.delayedCall(200, () => {
      this.scene.start('TitleScene');
    });
  }

  createAnimations() {
    // === DUMPSTER ANIMATIONS ===
    this.anims.create({
      key: 'dumpster-idle',
      frames: this.anims.generateFrameNumbers('dumpster-idle', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: 'dumpster-walk',
      frames: this.anims.generateFrameNumbers('dumpster-walk', { start: 0, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'dumpster-punch',
      frames: this.anims.generateFrameNumbers('dumpster-punch', { start: 0, end: 3 }),
      frameRate: 12,
      repeat: 0
    });

    this.anims.create({
      key: 'dumpster-chair',
      frames: this.anims.generateFrameNumbers('dumpster-chair', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'dumpster-hit',
      frames: this.anims.generateFrameNumbers('dumpster-hit', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'dumpster-down',
      frames: this.anims.generateFrameNumbers('dumpster-down', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0
    });

    this.anims.create({
      key: 'dumpster-getup',
      frames: this.anims.generateFrameNumbers('dumpster-getup', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0
    });

    this.anims.create({
      key: 'dumpster-victory',
      frames: this.anims.generateFrameNumbers('dumpster-victory', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1
    });

    // Dumpster grapple animations
    this.anims.create({
      key: 'dumpster-grapple',
      frames: this.anims.generateFrameNumbers('dumpster-grapple', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'dumpster-grappled',
      frames: this.anims.generateFrameNumbers('dumpster-grappled', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'dumpster-throw',
      frames: this.anims.generateFrameNumbers('dumpster-throw', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'dumpster-throw-suplex',
      frames: this.anims.generateFrameNumbers('dumpster-throw-suplex', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'dumpster-throw-ddt',
      frames: this.anims.generateFrameNumbers('dumpster-throw-ddt', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'dumpster-throw-bodyslam',
      frames: this.anims.generateFrameNumbers('dumpster-throw-bodyslam', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0
    });

    // === SCAR ANIMATIONS ===
    this.anims.create({
      key: 'scar-idle',
      frames: this.anims.generateFrameNumbers('scar-idle', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: 'scar-walk',
      frames: this.anims.generateFrameNumbers('scar-walk', { start: 0, end: 8 }),
      frameRate: 12,
      repeat: -1
    });

    this.anims.create({
      key: 'scar-punch',
      frames: this.anims.generateFrameNumbers('scar-punch', { start: 0, end: 3 }),
      frameRate: 14,
      repeat: 0
    });

    this.anims.create({
      key: 'scar-chair',
      frames: this.anims.generateFrameNumbers('scar-chair', { start: 0, end: 3 }),
      frameRate: 12,
      repeat: 0
    });

    this.anims.create({
      key: 'scar-hit',
      frames: this.anims.generateFrameNumbers('scar-hit', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'scar-down',
      frames: this.anims.generateFrameNumbers('scar-down', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0
    });

    this.anims.create({
      key: 'scar-getup',
      frames: this.anims.generateFrameNumbers('scar-getup', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0
    });

    this.anims.create({
      key: 'scar-victory',
      frames: this.anims.generateFrameNumbers('scar-victory', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1
    });

    // Scar grapple animations
    this.anims.create({
      key: 'scar-grapple',
      frames: this.anims.generateFrameNumbers('scar-grapple', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'scar-grappled',
      frames: this.anims.generateFrameNumbers('scar-grappled', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'scar-throw',
      frames: this.anims.generateFrameNumbers('scar-throw', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'scar-throw-suplex',
      frames: this.anims.generateFrameNumbers('scar-throw-suplex', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'scar-throw-ddt',
      frames: this.anims.generateFrameNumbers('scar-throw-ddt', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'scar-throw-bodyslam',
      frames: this.anims.generateFrameNumbers('scar-throw-bodyslam', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0
    });

    // === BLAZE ANIMATIONS ===
    this.anims.create({
      key: 'blaze-idle',
      frames: this.anims.generateFrameNumbers('blaze-idle', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1
    });
    this.anims.create({
      key: 'blaze-walk',
      frames: this.anims.generateFrameNumbers('blaze-walk', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'blaze-punch',
      frames: this.anims.generateFrameNumbers('blaze-punch', { start: 0, end: 3 }),
      frameRate: 14,
      repeat: 0
    });
    this.anims.create({
      key: 'blaze-hit',
      frames: this.anims.generateFrameNumbers('blaze-hit', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0
    });
    this.anims.create({
      key: 'blaze-down',
      frames: this.anims.generateFrameNumbers('blaze-down', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0
    });
    this.anims.create({
      key: 'blaze-victory',
      frames: this.anims.generateFrameNumbers('blaze-victory', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1
    });
    // Blaze placeholder animations (use idle/punch for grapple until proper sprites)
    ['blaze-chair', 'blaze-getup', 'blaze-grapple', 'blaze-grappled', 'blaze-throw',
     'blaze-throw-suplex', 'blaze-throw-ddt', 'blaze-throw-bodyslam'].forEach(key => {
      this.anims.create({
        key: key,
        frames: this.anims.generateFrameNumbers('blaze-punch', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: 0
      });
    });

    // === TANK ANIMATIONS ===
    this.anims.create({
      key: 'tank-idle',
      frames: this.anims.generateFrameNumbers('tank-idle', { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1
    });
    this.anims.create({
      key: 'tank-walk',
      frames: this.anims.generateFrameNumbers('tank-walk', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'tank-punch',
      frames: this.anims.generateFrameNumbers('tank-punch', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0
    });
    this.anims.create({
      key: 'tank-hit',
      frames: this.anims.generateFrameNumbers('tank-hit', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0
    });
    this.anims.create({
      key: 'tank-down',
      frames: this.anims.generateFrameNumbers('tank-down', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0
    });
    this.anims.create({
      key: 'tank-victory',
      frames: this.anims.generateFrameNumbers('tank-victory', { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1
    });
    // Tank placeholder animations
    ['tank-chair', 'tank-getup', 'tank-grapple', 'tank-grappled', 'tank-throw',
     'tank-throw-suplex', 'tank-throw-ddt', 'tank-throw-bodyslam'].forEach(key => {
      this.anims.create({
        key: key,
        frames: this.anims.generateFrameNumbers('tank-punch', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: 0
      });
    });

    // === VIPER ANIMATIONS ===
    this.anims.create({
      key: 'viper-idle',
      frames: this.anims.generateFrameNumbers('viper-idle', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1
    });
    this.anims.create({
      key: 'viper-walk',
      frames: this.anims.generateFrameNumbers('viper-walk', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'viper-punch',
      frames: this.anims.generateFrameNumbers('viper-punch', { start: 0, end: 3 }),
      frameRate: 12,
      repeat: 0
    });
    this.anims.create({
      key: 'viper-hit',
      frames: this.anims.generateFrameNumbers('viper-hit', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0
    });
    this.anims.create({
      key: 'viper-down',
      frames: this.anims.generateFrameNumbers('viper-down', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0
    });
    this.anims.create({
      key: 'viper-victory',
      frames: this.anims.generateFrameNumbers('viper-victory', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1
    });
    // Viper placeholder animations
    ['viper-chair', 'viper-getup', 'viper-grapple', 'viper-grappled', 'viper-throw',
     'viper-throw-suplex', 'viper-throw-ddt', 'viper-throw-bodyslam'].forEach(key => {
      this.anims.create({
        key: key,
        frames: this.anims.generateFrameNumbers('viper-punch', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: 0
      });
    });

    // === PARTICLE ANIMATIONS ===
    this.anims.create({
      key: 'fire-flicker',
      frames: this.anims.generateFrameNumbers('particle-fire', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'smoke-puff',
      frames: this.anims.generateFrameNumbers('particle-smoke', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0
    });
  }
}
