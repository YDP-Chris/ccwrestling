import Phaser from 'phaser';
import { GAME, COLORS, TIMING, COMBAT, METER, DAMAGE } from '../config/constants.js';
import { CHARACTERS } from '../config/characters.js';
import { CONTROLS } from '../config/controls.js';
import Fighter from '../entities/Fighter.js';
import Chair from '../entities/Chair.js';
import Table from '../entities/Table.js';
import CombatSystem from '../systems/CombatSystem.js';
import EffectsManager from '../systems/EffectsManager.js';
import AIController from '../systems/AIController.js';
import HealthBar from '../ui/HealthBar.js';
import ExtremeMeter from '../ui/ExtremeMeter.js';
import DamageNumbers from '../ui/DamageNumbers.js';
import ComboCounter from '../ui/ComboCounter.js';
import MatchTimer from '../ui/MatchTimer.js';
import { ReplayManager } from '../systems/replay/index.js';
import StatsManager from '../systems/StatsManager.js';
import CareerManager from '../systems/CareerManager.js';

export default class FightScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FightScene' });
  }

  init(data = {}) {
    // Reset all state when scene starts/restarts
    this.matchOver = false;
    this.winner = null;
    this.isPaused = false;
    this.matchStarted = false;
    this.hintText = null;

    // Game mode and character selection
    this.gameMode = data.mode || 'quick';
    this.playerCharKey = data.player || 'DUMPSTER';
    this.opponentCharKey = data.opponent || 'SCAR';

    // Arcade/Survival mode data
    this.arcadeProgress = data.arcadeProgress || 0;
    this.carryHealth = data.carryHealth || null;  // For survival mode

    // Career mode data
    this.career = data.career || null;
    this.matchType = data.matchType || null;
    this.isPPV = data.isPPV || false;
    this.isTitleMatch = data.isTitleMatch || false;

    // Replay mode from scene data
    this.replayMode = data.replayMode || 'none'; // 'none', 'record', 'play'
    this.replayData = data.replayData || null;
    this.replaySeed = data.replaySeed || null;

    // Best of 3 mode round tracking
    this.currentRound = data.currentRound || 1;
    this.playerRoundWins = data.playerRoundWins || 0;
    this.opponentRoundWins = data.opponentRoundWins || 0;

    // Load settings
    this.loadSettings();
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('ccw-settings');
      if (saved) {
        this.settings = JSON.parse(saved);
      } else {
        this.settings = {
          matchLength: 'medium',
          difficulty: 'normal',
          musicVolume: 0.4,
          sfxVolume: 0.6
        };
      }
    } catch (e) {
      this.settings = {
        matchLength: 'medium',
        difficulty: 'normal',
        musicVolume: 0.4,
        sfxVolume: 0.6
      };
    }
  }

  create() {
    try {
      console.log('FightScene: Starting create()');

      // Arena background - randomly select from available arenas
      const arenas = ['arena-warehouse', 'arena-basement', 'arena-basement2', 'arena-factory', 'arena-parking'];
      const selectedArena = Phaser.Utils.Array.GetRandom(arenas);
      console.log('FightScene: Loading arena background:', selectedArena);
      const arena = this.add.image(GAME.WIDTH / 2, GAME.HEIGHT / 2, selectedArena);
      arena.setDisplaySize(GAME.WIDTH, GAME.HEIGHT);
      arena.setDepth(0);

      // Initialize systems
      console.log('FightScene: Creating EffectsManager');
      this.effectsManager = new EffectsManager(this);
      console.log('FightScene: Creating CombatSystem');
      this.combatSystem = new CombatSystem(this);

      // Initialize replay system
      console.log('FightScene: Creating ReplayManager');
      this.replayManager = new ReplayManager(this);

      // Start recording or playback based on mode
      if (this.replayMode === 'record') {
        this.replayManager.startRecording({
          seed: this.replaySeed,
          player1: 'DUMPSTER',
          player2: 'SCAR'
        });
      } else if (this.replayMode === 'play' && this.replayData) {
        this.replayManager.startReplay(this.replayData, {
          onComplete: (snapshots) => this.onReplayComplete(snapshots)
        });
      }

      // Weapons arrays
      this.chairs = [];
      this.tables = [];

      // Create arena objects
      console.log('FightScene: Creating weapons');
      this.createWeapons();

      // Create fighters
      console.log('FightScene: Creating fighters');
      this.createFighters();

      // Apply survival mode health carry-over
      if (this.gameMode === 'survival' && this.carryHealth !== null) {
        this.player.health = this.carryHealth;
      }

      // Create AI
      console.log('FightScene: Creating AI');
      this.createAI();

      // Create UI
      console.log('FightScene: Creating UI');
      this.createUI();

      // Setup input
      console.log('FightScene: Setting up input');
      this.setupInput();

      // Setup event listeners
      this.setupEvents();

      // Match state
      this.matchOver = false;
      this.winner = null;
      this.isPaused = false;
      this.matchStarted = false;  // Freeze until countdown

      // Pause overlay
      this.pauseOverlay = null;

      // Show countdown then FIGHT!
      console.log('FightScene: Scene created successfully!');
      this.showCountdown();
    } catch (error) {
      console.error('FightScene create() error:', error);
    }
  }

  showCountdown() {
    console.log('showCountdown called');
    // Freeze fighters during countdown
    this.player.body.enable = false;
    this.enemy.body.enable = false;

    // First show fighter intro, then countdown
    this.showFighterIntro(() => {
      this.startCountdownSequence();
    });
  }

  showFighterIntro(onComplete) {
    const introContainer = this.add.container(0, 0);
    introContainer.setDepth(3000);

    // Dim background
    const dimBg = this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, 0x000000, 0.7);
    introContainer.add(dimBg);

    // Player name (slides in from left)
    const playerName = this.add.text(-200, GAME.HEIGHT / 2 - 60, this.playerConfig.name.toUpperCase(), {
      fontFamily: 'Arial Black',
      fontSize: '42px',
      color: '#00FF00',
      stroke: '#000000',
      strokeThickness: 6
    });
    playerName.setOrigin(0.5);
    introContainer.add(playerName);

    // Opponent name (slides in from right)
    const opponentName = this.add.text(GAME.WIDTH + 200, GAME.HEIGHT / 2 + 60, this.opponentConfig.name.toUpperCase(), {
      fontFamily: 'Arial Black',
      fontSize: '42px',
      color: '#FF0000',
      stroke: '#000000',
      strokeThickness: 6
    });
    opponentName.setOrigin(0.5);
    introContainer.add(opponentName);

    // VS text (scales in)
    const vsText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2, 'VS', {
      fontFamily: 'Arial Black',
      fontSize: '72px',
      color: '#FF4500',
      stroke: '#000000',
      strokeThickness: 8
    });
    vsText.setOrigin(0.5);
    vsText.setScale(0);
    introContainer.add(vsText);

    // Slide in player name
    this.tweens.add({
      targets: playerName,
      x: GAME.WIDTH / 2 - 100,
      duration: 400,
      ease: 'Power2'
    });

    // Slide in opponent name
    this.tweens.add({
      targets: opponentName,
      x: GAME.WIDTH / 2 + 100,
      duration: 400,
      ease: 'Power2'
    });

    // Scale in VS text
    this.time.delayedCall(300, () => {
      this.tweens.add({
        targets: vsText,
        scale: 1,
        duration: 300,
        ease: 'Back.easeOut'
      });
    });

    // Hold for a moment, then fade out
    this.time.delayedCall(1500, () => {
      this.tweens.add({
        targets: introContainer,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          introContainer.destroy();
          onComplete();
        }
      });
    });
  }

  startCountdownSequence() {
    // For bestof3 mode, show round number first
    if (this.gameMode === 'bestof3') {
      this.showRoundAnnouncement(() => {
        this.runCountdown();
      });
    } else {
      this.runCountdown();
    }
  }

  showRoundAnnouncement(onComplete) {
    // Show round indicator and score
    const roundText = this.add.text(
      GAME.WIDTH / 2,
      GAME.HEIGHT / 2 - 40,
      `ROUND ${this.currentRound}`,
      {
        fontFamily: 'Arial Black',
        fontSize: '48px',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 6
      }
    );
    roundText.setOrigin(0.5);
    roundText.setDepth(2000);
    roundText.setScale(0);

    // Show score below
    const scoreText = this.add.text(
      GAME.WIDTH / 2,
      GAME.HEIGHT / 2 + 20,
      `${this.playerRoundWins} - ${this.opponentRoundWins}`,
      {
        fontFamily: 'Arial Black',
        fontSize: '36px',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 4
      }
    );
    scoreText.setOrigin(0.5);
    scoreText.setDepth(2000);
    scoreText.setAlpha(0);

    // Animate round text in
    this.tweens.add({
      targets: roundText,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    // Fade in score
    this.tweens.add({
      targets: scoreText,
      alpha: 1,
      duration: 200,
      delay: 200
    });

    // Fade out and continue
    this.time.delayedCall(1200, () => {
      this.tweens.add({
        targets: [roundText, scoreText],
        alpha: 0,
        duration: 300,
        onComplete: () => {
          roundText.destroy();
          scoreText.destroy();
          onComplete();
        }
      });
    });
  }

  runCountdown() {
    const countdownSequence = ['3', '2', '1', 'FIGHT!'];
    let index = 0;

    const showNext = () => {
      if (index < countdownSequence.length) {
        const text = countdownSequence[index];
        const color = text === 'FIGHT!' ? COLORS.BLOOD_BRIGHT : COLORS.WHITE;
        const size = text === 'FIGHT!' ? '72px' : '96px';
        console.log('Showing countdown:', text);

        // Create countdown text directly (more reliable than effectsManager)
        const countdownText = this.add.text(
          GAME.WIDTH / 2,
          GAME.HEIGHT / 2,
          text,
          {
            fontFamily: 'Arial Black',
            fontSize: size,
            color: typeof color === 'number' ? `#${color.toString(16).padStart(6, '0')}` : '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 8
          }
        );
        countdownText.setOrigin(0.5);
        countdownText.setDepth(2000);  // Very high depth

        // Scale animation
        countdownText.setScale(0);
        this.tweens.add({
          targets: countdownText,
          scale: 1,
          duration: 200,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.tweens.add({
              targets: countdownText,
              alpha: 0,
              scale: 1.5,
              duration: 300,
              delay: 300,
              onComplete: () => countdownText.destroy()
            });
          }
        });

        index++;
        this.time.delayedCall(800, showNext);
      } else {
        // Unfreeze and start match
        console.log('Countdown complete, starting match');
        this.player.body.enable = true;
        this.enemy.body.enable = true;
        this.matchStarted = true;

        // Start match timer
        if (this.matchTimer) {
          this.matchTimer.start();
        }

        // Weapon spawning disabled for now
        // this.scheduleChairSpawn();
        // this.scheduleTableSpawn();
      }
    };

    this.time.delayedCall(300, showNext);
  }

  // Legacy method kept for reference, now handled by showFighterIntro
  createWeapons() {
    // Chairs spawn randomly during match (see scheduleChairSpawn)
    // Tables spawn randomly during match (see scheduleTableSpawn)
    // No initial weapons - they appear during the match
  }

  scheduleChairSpawn() {
    // Random delay between 8-20 seconds for first/next chair
    const delay = Phaser.Math.Between(8000, 20000);

    this.chairSpawnTimer = this.time.delayedCall(delay, () => {
      this.spawnChair();
    });
  }

  spawnChair() {
    // Only spawn if no chair exists
    if (this.chairs.length > 0) {
      // Chair already exists, schedule next check
      this.scheduleChairSpawn();
      return;
    }

    // Random position in arena (avoid edges)
    const x = Phaser.Math.Between(150, GAME.WIDTH - 150);
    const y = Phaser.Math.Between(200, 350);

    // Create chair
    const chair = new Chair(this, x, y);
    this.chairs.push(chair);

    // Announcement
    this.effectsManager.showAnnouncement('STEEL CHAIR!', COLORS.CHROME, 1000, '28px');

    // Play sound
    if (this.sound.get('sfx-chair-pickup')) {
      this.sound.play('sfx-chair-pickup', { volume: 0.5 });
    }

    // Chair drop-in effect
    chair.setScale(0);
    this.tweens.add({
      targets: chair,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    // Schedule next potential spawn (in case this one breaks)
    this.scheduleChairSpawn();
  }

  scheduleTableSpawn() {
    // Random delay between 15-35 seconds for table
    const delay = Phaser.Math.Between(15000, 35000);

    this.tableSpawnTimer = this.time.delayedCall(delay, () => {
      this.spawnTable();
    });
  }

  spawnTable() {
    // Only spawn if no intact table exists
    const hasIntactTable = this.tables.some(t => t.isIntact());
    if (hasIntactTable) {
      this.scheduleTableSpawn();
      return;
    }

    // Random position (more central, needs space)
    const x = Phaser.Math.Between(200, GAME.WIDTH - 200);
    const y = Phaser.Math.Between(220, 320);

    // Create table
    const table = new Table(this, x, y);
    this.tables.push(table);

    // Announcement
    this.effectsManager.showAnnouncement('TABLE!', COLORS.FIRE_ORANGE, 1000, '32px');

    // Play sound
    if (this.sound.get('sfx-table-break')) {
      this.sound.play('sfx-table-break', { volume: 0.3 });
    }

    // Table slide-in effect
    table.setAlpha(0);
    table.y -= 50;
    this.tweens.add({
      targets: table,
      alpha: 1,
      y: y,
      duration: 400,
      ease: 'Bounce.easeOut'
    });

    // Schedule next potential spawn
    this.scheduleTableSpawn();
  }

  createFighters() {
    // Open warehouse/basement floor - wider play area for 2.5x scaled fighters
    const floorLeft = 80;
    const floorRight = GAME.WIDTH - 80;
    const floorTop = 120;
    const floorBottom = GAME.HEIGHT - 80;

    // Get character configs
    const playerConfig = CHARACTERS[this.playerCharKey] || CHARACTERS.DUMPSTER;
    const opponentConfig = CHARACTERS[this.opponentCharKey] || CHARACTERS.SCAR;

    // Store for UI display
    this.playerConfig = playerConfig;
    this.opponentConfig = opponentConfig;

    // Player - left side
    this.player = new Fighter(
      this,
      180,
      280,
      playerConfig,
      true
    );
    this.combatSystem.addFighter(this.player);

    // Enemy - right side
    this.enemy = new Fighter(
      this,
      620,
      280,
      opponentConfig,
      false
    );
    this.combatSystem.addFighter(this.enemy);

    // Keep fighters within floor bounds
    const bounds = new Phaser.Geom.Rectangle(
      floorLeft,
      floorTop,
      floorRight - floorLeft,
      floorBottom - floorTop
    );
    this.player.body.setBoundsRectangle(bounds);
    this.enemy.body.setBoundsRectangle(bounds);
  }

  createAI() {
    // AI settings based on difficulty
    const difficultySettings = {
      easy: { aggressiveness: 0.25, thinkInterval: 1000, attackCooldown: 2000 },
      normal: { aggressiveness: 0.4, thinkInterval: 700, attackCooldown: 1500 },
      hard: { aggressiveness: 0.7, thinkInterval: 400, attackCooldown: 800 }
    };

    const difficulty = this.settings?.difficulty || 'normal';
    const settings = difficultySettings[difficulty];

    // Practice mode - AI doesn't attack
    if (this.gameMode === 'practice') {
      settings.aggressiveness = 0;
      settings.attackCooldown = 99999;
    }

    // Create AI controller for enemy
    this.aiController = new AIController(this, this.enemy, this.player, settings);
  }

  createUI() {
    // Player health bar (left side)
    this.playerHealthBar = new HealthBar(this, 20, 20, this.player, false);

    // Enemy health bar (right side, flipped)
    this.enemyHealthBar = new HealthBar(this, GAME.WIDTH - 20, 20, this.enemy, true);

    // Extreme meter (player only for now)
    this.extremeMeter = new ExtremeMeter(this, this.player);

    // Floating damage numbers
    this.damageNumbers = new DamageNumbers(this);

    // Combo counter
    this.comboCounter = new ComboCounter(this);

    // Match timer
    this.matchTimer = new MatchTimer(this, this.settings);

    // Character names (dynamic based on selection)
    this.add.text(25, 45, this.playerConfig.name.toUpperCase(), {
      fontFamily: 'Arial Black',
      fontSize: '12px',
      color: '#FFFFFF'
    });

    this.add.text(GAME.WIDTH - 25, 45, this.opponentConfig.name.toUpperCase(), {
      fontFamily: 'Arial Black',
      fontSize: '12px',
      color: '#FFFFFF'
    }).setOrigin(1, 0);

    // Game mode indicator (for non-quick modes)
    if (this.gameMode === 'career' && this.matchType) {
      // Show match type for career
      const matchLabel = this.matchType.name || 'Match';
      const labelColor = this.isPPV ? '#FFD700' : '#FF4500';
      this.add.text(GAME.WIDTH / 2, 15, matchLabel, {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: labelColor
      }).setOrigin(0.5);

      // Title match indicator
      if (this.isTitleMatch) {
        this.add.text(GAME.WIDTH / 2, 28, '🏆 TITLE MATCH', {
          fontFamily: 'Arial',
          fontSize: '9px',
          color: '#FFD700'
        }).setOrigin(0.5);
      }
    } else if (this.gameMode === 'bestof3') {
      // Best of 3 mode - show round indicator
      this.add.text(GAME.WIDTH / 2, 10, `ROUND ${this.currentRound}`, {
        fontFamily: 'Arial Black',
        fontSize: '12px',
        color: '#FFD700'
      }).setOrigin(0.5);

      // Show round score
      this.roundScoreText = this.add.text(GAME.WIDTH / 2, 26, `${this.playerRoundWins} - ${this.opponentRoundWins}`, {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: '#FFFFFF'
      }).setOrigin(0.5);
    } else if (this.gameMode !== 'quick') {
      const modeLabels = {
        arcade: 'ARCADE',
        survival: 'SURVIVAL',
        practice: 'PRACTICE'
      };
      this.add.text(GAME.WIDTH / 2, 15, modeLabels[this.gameMode], {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: '#FF4500'
      }).setOrigin(0.5);
    }
  }

  setupInput() {
    // Player 1 controls
    this.cursors = {
      up: this.input.keyboard.addKey(CONTROLS.PLAYER1.UP),
      down: this.input.keyboard.addKey(CONTROLS.PLAYER1.DOWN),
      left: this.input.keyboard.addKey(CONTROLS.PLAYER1.LEFT),
      right: this.input.keyboard.addKey(CONTROLS.PLAYER1.RIGHT)
    };

    this.attackKey = this.input.keyboard.addKey(CONTROLS.PLAYER1.ATTACK);
    this.pickupKey = this.input.keyboard.addKey(CONTROLS.PLAYER1.PICKUP);
    this.tableSlamKey = this.input.keyboard.addKey(CONTROLS.PLAYER1.TABLE_SLAM);
    this.lightFireKey = this.input.keyboard.addKey(CONTROLS.PLAYER1.LIGHT_FIRE);
    this.grappleKey = this.input.keyboard.addKey(CONTROLS.PLAYER1.GRAPPLE);

    // Pause - use KeyCodes directly for reliability
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.menuEnterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // Use P key for pause (ESC can be intercepted by browser)
    this.input.keyboard.on('keydown-P', () => {
      console.log('P key pressed for pause');
      if (this.matchStarted && !this.matchOver) {
        this.togglePause();
      }
    });

    // Also try ESC with preventDefault
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        console.log('Window ESC captured');
        if (this.matchStarted && !this.matchOver) {
          this.togglePause();
        }
      }
    });

    // Ensure canvas has focus for keyboard input
    this.game.canvas.focus();

    // Record key events if recording
    if (this.replayMode === 'record') {
      this.setupInputRecording();
    }
  }

  setupInputRecording() {
    // Track key down events
    const recordKeys = [
      CONTROLS.PLAYER1.UP, CONTROLS.PLAYER1.DOWN,
      CONTROLS.PLAYER1.LEFT, CONTROLS.PLAYER1.RIGHT,
      CONTROLS.PLAYER1.ATTACK, CONTROLS.PLAYER1.PICKUP,
      CONTROLS.PLAYER1.TABLE_SLAM, CONTROLS.PLAYER1.LIGHT_FIRE,
      CONTROLS.PLAYER1.GRAPPLE
    ];

    recordKeys.forEach(key => {
      this.input.keyboard.on(`keydown-${key}`, () => {
        this.replayManager.recordKey(key, 'down', 1);
      });
      this.input.keyboard.on(`keyup-${key}`, () => {
        this.replayManager.recordKey(key, 'up', 1);
      });
    });
  }

  setupEvents() {
    // Fighter KO
    this.events.on('fighter-ko', this.onFighterKO, this);

    // Pickup events
    this.events.on('fighter-pickup', this.onFighterPickup, this);

    // Light fire events
    this.events.on('fighter-light-fire', this.onFighterLightFire, this);

    // Table slam events
    this.events.on('fighter-table-slam', this.onFighterTableSlam, this);

    // Grapple events
    this.events.on('combat-grapple-start', this.onGrappleStart, this);
    this.events.on('combat-grapple-throw', this.onGrappleThrow, this);
    this.events.on('fighter-grapple-escape', this.onGrappleEscape, this);

    // Weapon events
    this.events.on('chair-broken', this.onChairBroken, this);
    this.events.on('table-broken', this.onTableBroken, this);
    this.events.on('table-ignited', this.onTableIgnited, this);

    // Match timer events
    this.events.on('match-time-up', this.onMatchTimeUp, this);
  }

  onMatchTimeUp() {
    if (this.matchOver) return;

    // Determine winner by health
    const playerHealth = this.player.health / this.player.maxHealth;
    const enemyHealth = this.enemy.health / this.enemy.maxHealth;

    if (playerHealth > enemyHealth) {
      this.winner = this.player;
    } else if (enemyHealth > playerHealth) {
      this.winner = this.enemy;
    } else {
      // Draw - player wins by default in single player
      this.winner = this.player;
    }

    this.matchOver = true;

    // Show time decision announcement
    this.effectsManager.showAnnouncement('TIME!', COLORS.FIRE_ORANGE, 1500, '48px');

    // Winner plays victory animation
    this.time.delayedCall(500, () => {
      this.winner.victory();
    });

    // Handle Best of 3 mode
    if (this.gameMode === 'bestof3') {
      this.time.delayedCall(TIMING.KO_DELAY + 500, () => {
        this.handleRoundEnd();
      });
      return;
    }

    // Transition to game over
    this.time.delayedCall(TIMING.KO_DELAY + 500, () => {
      this.effectsManager.stopAllAudio();
      this.scene.start('GameOverScene', {
        winner: this.winner.config.name,
        playerWon: this.winner === this.player,
        recording: this.lastRecording,
        mode: this.gameMode,
        player: this.playerCharKey,
        opponent: this.opponentCharKey,
        playerHealth: this.player.health,
        arcadeProgress: this.arcadeProgress || 0,
        timeDecision: true,
        career: this.career,
        isPPV: this.isPPV,
        isTitleMatch: this.isTitleMatch
      });
    });
  }

  onChairBroken(chair) {
    // Remove from chairs array
    const index = this.chairs.indexOf(chair);
    if (index > -1) {
      this.chairs.splice(index, 1);
    }
    // Show announcement
    this.effectsManager.showAnnouncement('CHAIR DESTROYED!', COLORS.CHROME, 800, '24px');
  }

  onTableBroken(table, wasOnFire) {
    // Show announcement
    const msg = wasOnFire ? 'FLAMING TABLE BREAK!' : 'TABLE BREAK!';
    const color = wasOnFire ? COLORS.FIRE_ORANGE : COLORS.CHROME;
    this.effectsManager.showAnnouncement(msg, color, 1000, '28px');

    // Screen shake
    if (wasOnFire) {
      this.effectsManager.shakeHeavy();
    } else {
      this.effectsManager.shakeLight();
    }

    // Play sound
    if (this.sound.get('sfx-table-break')) {
      this.sound.play('sfx-table-break', { volume: 0.7 });
    }
  }

  onTableIgnited(table) {
    this.effectsManager.showAnnouncement('TABLE ON FIRE!', COLORS.FIRE_ORANGE, 800, '24px');
    this.effectsManager.shakeLight();
  }

  onFighterKO(fighter) {
    if (this.matchOver) return;

    this.matchOver = true;
    this.winner = fighter === this.player ? this.enemy : this.player;

    // Record stats
    if (this.gameMode !== 'practice') {
      StatsManager.recordMatch({
        playerWon: this.winner === this.player,
        playerCharacter: this.playerCharKey,
        opponentCharacter: this.opponentCharKey,
        mode: this.gameMode,
        wasKO: true,
        damageDealt: this.enemy.maxHealth - this.enemy.health,
        damageTaken: this.player.maxHealth - this.player.health,
        arcadeProgress: this.arcadeProgress,
        survivalStreak: this.gameMode === 'survival' ? (this.winner === this.player ? 1 : 0) : 0
      });
    }

    // Winner plays victory animation
    this.winner.victory();

    // Stop recording and record final snapshot
    if (this.replayManager && this.replayManager.isRecording()) {
      this.replayManager.recordSnapshot(this.replayManager.captureSnapshot());
      this.replayManager.recordEvent('match-end', {
        winner: this.winner.config.name,
        playerWon: this.winner === this.player
      });
      const recording = this.replayManager.stopRecording();
      // Store recording for potential save
      this.lastRecording = recording;
      console.log('[FightScene] Recording stopped. Inputs:', recording?.inputs?.length);
    }

    // Handle Best of 3 mode round logic
    if (this.gameMode === 'bestof3') {
      this.handleRoundEnd();
      return;
    }

    // Transition to game over
    this.time.delayedCall(TIMING.KO_DELAY, () => {
      this.effectsManager.stopAllAudio();
      this.scene.start('GameOverScene', {
        winner: this.winner.config.name,
        playerWon: this.winner === this.player,
        recording: this.lastRecording,
        mode: this.gameMode,
        player: this.playerCharKey,
        opponent: this.opponentCharKey,
        playerHealth: this.player.health,
        arcadeProgress: this.arcadeProgress || 0,
        career: this.career,
        isPPV: this.isPPV,
        isTitleMatch: this.isTitleMatch
      });
    });
  }

  handleRoundEnd() {
    const playerWonRound = this.winner === this.player;

    // Update round wins
    if (playerWonRound) {
      this.playerRoundWins++;
    } else {
      this.opponentRoundWins++;
    }

    // Check for match winner (first to 2)
    const matchWinner = this.playerRoundWins >= 2 ? 'player' :
                        this.opponentRoundWins >= 2 ? 'opponent' : null;

    // Show round result
    const roundResultText = playerWonRound ? 'ROUND WIN!' : 'ROUND LOST';
    const resultColor = playerWonRound ? '#00FF00' : '#FF0000';

    this.time.delayedCall(1000, () => {
      const resultDisplay = this.add.text(
        GAME.WIDTH / 2,
        GAME.HEIGHT / 2 - 30,
        roundResultText,
        {
          fontFamily: 'Arial Black',
          fontSize: '48px',
          color: resultColor,
          stroke: '#000000',
          strokeThickness: 6
        }
      );
      resultDisplay.setOrigin(0.5);
      resultDisplay.setDepth(2000);

      // Show updated score
      const scoreDisplay = this.add.text(
        GAME.WIDTH / 2,
        GAME.HEIGHT / 2 + 30,
        `${this.playerRoundWins} - ${this.opponentRoundWins}`,
        {
          fontFamily: 'Arial Black',
          fontSize: '36px',
          color: '#FFFFFF',
          stroke: '#000000',
          strokeThickness: 4
        }
      );
      scoreDisplay.setOrigin(0.5);
      scoreDisplay.setDepth(2000);

      this.time.delayedCall(2000, () => {
        resultDisplay.destroy();
        scoreDisplay.destroy();

        if (matchWinner) {
          // Match is over - go to game over
          this.effectsManager.stopAllAudio();
          this.scene.start('GameOverScene', {
            winner: matchWinner === 'player' ?
              CHARACTERS[this.playerCharKey].name :
              CHARACTERS[this.opponentCharKey].name,
            playerWon: matchWinner === 'player',
            recording: this.lastRecording,
            mode: this.gameMode,
            player: this.playerCharKey,
            opponent: this.opponentCharKey,
            playerHealth: this.player.health,
            playerRoundWins: this.playerRoundWins,
            opponentRoundWins: this.opponentRoundWins
          });
        } else {
          // Continue to next round
          this.startNextRound();
        }
      });
    });
  }

  startNextRound() {
    this.currentRound++;

    // Restart the scene with preserved round data
    this.effectsManager.stopAllAudio();
    this.scene.restart({
      mode: 'bestof3',
      player: this.playerCharKey,
      opponent: this.opponentCharKey,
      currentRound: this.currentRound,
      playerRoundWins: this.playerRoundWins,
      opponentRoundWins: this.opponentRoundWins
    });
  }

  onReplayComplete(snapshots) {
    console.log('[FightScene] Replay complete. Snapshots:', snapshots?.length);
    // Could compare snapshots to validate replay accuracy
  }

  onFighterPickup(fighter) {
    // Already holding something
    if (fighter.hasWeapon()) return;

    // Check for nearby chairs
    for (const chair of this.chairs) {
      if (!chair.canPickup()) continue;

      const distance = Phaser.Math.Distance.Between(
        fighter.x, fighter.y,
        chair.x, chair.y
      );

      if (distance <= COMBAT.PICKUP_RANGE * 2) { // Account for sprite scale
        fighter.pickupWeapon(chair);
        break;
      }
    }
  }

  onFighterLightFire(fighter) {
    console.log('Light fire pressed');
    // Check for nearby tables
    for (const table of this.tables) {
      console.log('Table state:', table.state, 'isIntact:', table.isIntact(), 'isOnFire:', table.isOnFire());
      if (!table.isIntact() || table.isOnFire()) continue;

      const distance = Phaser.Math.Distance.Between(
        fighter.x, fighter.y,
        table.x, table.y
      );
      console.log('Distance to table:', distance, 'Required:', COMBAT.PICKUP_RANGE * 3);

      if (distance <= COMBAT.PICKUP_RANGE * 3) {  // Increased range
        console.log('Igniting table!');
        table.ignite();
        this.events.emit('table-ignited', table);
        // Show feedback
        this.effectsManager.showAnnouncement('TABLE ON FIRE!', COLORS.FIRE_ORANGE, 1000, '28px');
        break;
      } else if (distance <= COMBAT.PICKUP_RANGE * 5) {
        // Too far - show hint
        this.showHint('Get closer to light table (F)');
      }
    }
  }

  showHint(text) {
    if (this.hintText) {
      this.hintText.destroy();
    }
    this.hintText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 60, text, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#FFFF00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 6 }
    });
    this.hintText.setOrigin(0.5);
    this.hintText.setDepth(1000);  // High depth to be visible

    this.time.delayedCall(1500, () => {
      if (this.hintText) {
        this.hintText.destroy();
        this.hintText = null;
      }
    });
  }

  onFighterTableSlam(fighter) {
    // Find nearby table
    let nearestTable = null;
    let nearestDist = Infinity;

    for (const table of this.tables) {
      if (!table.isIntact()) continue;

      const dist = Phaser.Math.Distance.Between(
        fighter.x, fighter.y,
        table.x, table.y
      );

      if (dist < nearestDist && dist <= COMBAT.TABLE_SLAM_RANGE * 2) {
        nearestTable = table;
        nearestDist = dist;
      }
    }

    if (!nearestTable) return;

    // Get the opponent
    const target = fighter === this.player ? this.enemy : this.player;

    // Check if target is close enough
    const targetDist = Phaser.Math.Distance.Between(
      fighter.x, fighter.y,
      target.x, target.y
    );

    if (targetDist > COMBAT.FIST_RANGE * 3) return;
    if (!fighter.canAct()) return;
    if (target.state === 'down' || target.state === 'ko') return;

    // Perform slam
    this.combatSystem.performTableSlam(fighter, target, nearestTable);
  }

  tryFinisher() {
    // Check if player has full meter
    if (this.player.extremeMeter < METER.MAX) return;

    // Check if enemy is in range
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.enemy.x, this.enemy.y
    );

    if (distance <= COMBAT.FIST_RANGE * 3) {
      // Perform finisher
      if (this.combatSystem.performFinisher(this.player, this.enemy)) {
        // Effects are handled by EffectsManager
      }
    }
  }

  onGrappleStart(data) {
    console.log('Grapple started!', data);
    // Effects handled by EffectsManager
  }

  onGrappleThrow(data) {
    console.log('Grapple throw!', data.moveName, data.damage);
    // Effects handled by EffectsManager
  }

  onGrappleEscape(fighter, attacker) {
    console.log('Grapple escaped!');
    // Effects handled by EffectsManager
  }

  togglePause() {
    console.log('togglePause called, current isPaused:', this.isPaused);
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      console.log('Pausing game');
      this.physics.pause();
      this.showPauseOverlay();
    } else {
      console.log('Resuming game');
      this.physics.resume();
      this.hidePauseOverlay();
    }
  }

  showPauseOverlay() {
    // Dim background
    this.pauseOverlay = this.add.container(0, 0);
    this.pauseOverlay.setDepth(10000); // Above everything including fighters

    const dimBg = this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, 0x000000, 0.8);
    this.pauseOverlay.add(dimBg);

    const pauseText = this.add.text(GAME.WIDTH / 2, 50, 'PAUSED', {
      fontFamily: 'Arial Black',
      fontSize: '48px',
      color: '#FFFFFF'
    });
    pauseText.setOrigin(0.5);
    this.pauseOverlay.add(pauseText);

    // Controls reference
    const controlsTitle = this.add.text(GAME.WIDTH / 2, 100, 'CONTROLS', {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#FF4500'
    });
    controlsTitle.setOrigin(0.5);
    this.pauseOverlay.add(controlsTitle);

    const controls = [
      ['WASD', 'Move'],
      ['J', 'Attack / Mash to Escape'],
      ['K', 'Pickup Weapon'],
      ['G', 'Grapple (near opponent)'],
      ['L', 'Table Slam'],
      ['F', 'Light Table on Fire'],
      ['J+K', 'Finisher (when meter full)']
    ];

    let controlY = 130;
    controls.forEach(([key, action]) => {
      const keyText = this.add.text(GAME.WIDTH / 2 - 100, controlY, key, {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: '#FFFF00'
      });
      keyText.setOrigin(1, 0.5);
      this.pauseOverlay.add(keyText);

      const actionText = this.add.text(GAME.WIDTH / 2 - 80, controlY, action, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#CCCCCC'
      });
      actionText.setOrigin(0, 0.5);
      this.pauseOverlay.add(actionText);

      controlY += 22;
    });

    // Tips
    const tipsTitle = this.add.text(GAME.WIDTH / 2, 295, 'TIPS', {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#00FF00'
    });
    tipsTitle.setOrigin(0.5);
    this.pauseOverlay.add(tipsTitle);

    const tips = [
      'Heavy hits (20+ dmg) cause knockdown',
      'Mash J to escape grapples',
      'Build meter for devastating finishers'
    ];

    let tipY = 320;
    tips.forEach(tip => {
      const tipText = this.add.text(GAME.WIDTH / 2, tipY, '• ' + tip, {
        fontFamily: 'Arial',
        fontSize: '11px',
        color: '#888888'
      });
      tipText.setOrigin(0.5);
      this.pauseOverlay.add(tipText);
      tipY += 18;
    });

    // Resume/Quit options
    const resumeText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 50, 'P - Resume    ENTER - Menu', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#FFFFFF'
    });
    resumeText.setOrigin(0.5);
    this.pauseOverlay.add(resumeText);
  }

  hidePauseOverlay() {
    if (this.pauseOverlay) {
      this.pauseOverlay.destroy();
      this.pauseOverlay = null;
    }
  }

  update(time, delta) {
    // Get mobile input for pause
    const mobile = window.mobileInput || { justPressed: () => false };

    // Handle pause (only after match started)
    if (this.matchStarted) {
      if (Phaser.Input.Keyboard.JustDown(this.pauseKey) || mobile.justPressed('pause')) {
        console.log('Pause triggered');
        this.togglePause();
        return;
      }
    }

    // Handle quit to menu while paused
    if (this.isPaused) {
      if (Phaser.Input.Keyboard.JustDown(this.menuEnterKey) || mobile.justPressed('attack')) {
        this.effectsManager.stopAllAudio();
        this.scene.start('MenuScene');
      }
      return;
    }

    // Don't update gameplay until match starts
    if (!this.matchStarted || this.matchOver) return;

    // Update replay system
    if (this.replayManager) {
      this.replayManager.update();
    }

    // Create combined input that merges keyboard and mobile touch
    const combinedCursors = {
      up: { isDown: this.cursors.up.isDown || mobile.up },
      down: { isDown: this.cursors.down.isDown || mobile.down },
      left: { isDown: this.cursors.left.isDown || mobile.left },
      right: { isDown: this.cursors.right.isDown || mobile.right }
    };

    // For action buttons, we need both the Phaser key (for JustDown) and mobile justPressed state
    const combinedAttack = {
      isDown: this.attackKey.isDown || mobile.attack,
      phaserKey: this.attackKey,
      mobileJustPressed: mobile.justPressed('attack')
    };
    const combinedPickup = {
      isDown: this.pickupKey.isDown || mobile.pickup,
      phaserKey: this.pickupKey,
      mobileJustPressed: mobile.justPressed('pickup')
    };
    const combinedSlam = {
      isDown: this.tableSlamKey.isDown || mobile.slam,
      phaserKey: this.tableSlamKey,
      mobileJustPressed: mobile.justPressed('slam')
    };
    const combinedGrapple = {
      isDown: this.grappleKey.isDown || mobile.grapple,
      phaserKey: this.grappleKey,
      mobileJustPressed: mobile.justPressed('grapple')
    };

    // Update player with combined input
    this.player.update(
      combinedCursors,
      combinedAttack,
      combinedPickup,
      combinedSlam,
      this.lightFireKey,
      combinedGrapple
    );

    // Check for finisher (Attack + Pickup pressed together when meter full)
    if (combinedAttack.isDown && combinedPickup.isDown) {
      this.tryFinisher();
    }

    // Update weapons
    for (const chair of this.chairs) {
      chair.update();
    }

    for (const table of this.tables) {
      table.update(time, delta);
    }

    // Update AI
    this.aiController.update(time, delta);

    // DEBUG: Set extremely high depth to ensure enemy is visible
    this.enemy.setDepth(9999);

    // Update UI
    this.playerHealthBar.update();
    this.enemyHealthBar.update();
    this.extremeMeter.update();

    // Update match timer
    if (this.matchTimer) {
      this.matchTimer.update(time, delta);
    }
  }

  shutdown() {
    this.events.off('fighter-ko', this.onFighterKO, this);
    this.events.off('fighter-pickup', this.onFighterPickup, this);
    this.events.off('fighter-light-fire', this.onFighterLightFire, this);
    this.events.off('fighter-table-slam', this.onFighterTableSlam, this);
    this.events.off('combat-grapple-start', this.onGrappleStart, this);
    this.events.off('combat-grapple-throw', this.onGrappleThrow, this);
    this.events.off('fighter-grapple-escape', this.onGrappleEscape, this);
    this.events.off('chair-broken', this.onChairBroken, this);
    this.events.off('table-broken', this.onTableBroken, this);
    this.events.off('table-ignited', this.onTableIgnited, this);
    this.events.off('match-time-up', this.onMatchTimeUp, this);

    if (this.combatSystem) this.combatSystem.destroy();
    if (this.effectsManager) this.effectsManager.destroy();
    if (this.aiController) this.aiController.destroy();
    if (this.playerHealthBar) this.playerHealthBar.destroy();
    if (this.enemyHealthBar) this.enemyHealthBar.destroy();
    if (this.extremeMeter) this.extremeMeter.destroy();
    if (this.damageNumbers) this.damageNumbers.destroy();
    if (this.comboCounter) this.comboCounter.destroy();
    if (this.matchTimer) this.matchTimer.destroy();

    // Stop any active replay
    if (this.replayManager) {
      if (this.replayManager.isRecording()) {
        this.replayManager.stopRecording();
      }
      if (this.replayManager.isPlaying()) {
        this.replayManager.stopReplay();
      }
    }

    // Stop weapon spawn timers
    if (this.chairSpawnTimer) {
      this.chairSpawnTimer.destroy();
      this.chairSpawnTimer = null;
    }
    if (this.tableSpawnTimer) {
      this.tableSpawnTimer.destroy();
      this.tableSpawnTimer = null;
    }

    this.hidePauseOverlay();
  }
}
