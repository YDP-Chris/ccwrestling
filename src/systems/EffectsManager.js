import Phaser from 'phaser';
import { COLORS, COMBO } from '../config/constants.js';

// Announcer callout pools for variety
const CALLOUTS = {
  hit: ['OOH!', 'NICE!', 'SOLID!', 'BAM!', 'CRACK!', 'POW!', 'WHAM!'],
  heavyHit: ['BRUTAL!', 'DEVASTATING!', 'CRUSHING!', 'VICIOUS!', 'SAVAGE!', 'WRECKED!', 'DESTRUCTION!'],
  combo: ['COMBO!', 'CHAIN!', 'ON FIRE!', 'UNSTOPPABLE!', 'RELENTLESS!'],
  lowHealth: ['DANGER!', 'CRITICAL!', 'HANGING ON!', 'DESPERATE!', 'ON THE ROPES!', 'LAST LEGS!'],
  comeback: ['COMEBACK!', 'FIGHTING BACK!', 'REFUSES TO QUIT!', 'SECOND WIND!', 'NOT DONE YET!'],
  grapple: ['CLINCH!', 'LOCKED UP!', 'GRAPPLE!', 'TIE UP!', 'GOT EM!'],
  throw: ['THROWN!', 'SLAMMED!', 'PLANTED!', 'TOSSED!', 'LAUNCHED!', 'DOWN HARD!'],
  nearKO: ['SO CLOSE!', 'ALMOST!', 'ONE MORE HIT!', 'FINISH IT!', 'END IT!'],
  weaponPickup: ['STEEL!', 'WEAPON!', 'OH NO!', 'ARMED!', 'DANGER!'],
  tableBreak: ['THROUGH THE TABLE!', 'SHATTERED!', 'DESTROYED!', 'BROKEN!'],
  fireStart: ['FIRE!', 'IT\'S LIT!', 'FLAMES!', 'BURNING!', 'INFERNO!'],
  finisher: ['EXTREME!', 'DEVASTATING!', 'ANNIHILATION!', 'DESTRUCTION!']
};

export default class EffectsManager {
  constructor(scene) {
    this.scene = scene;

    // Track announcements to avoid spam
    this.lastAnnouncementTime = 0;
    this.announcementCooldown = 800; // ms between announcements

    // Track health for comeback detection
    this.healthTracking = new Map();

    // Create particle emitters
    this.createParticleEmitters();

    // Listen for events
    this.setupEventListeners();

    // Start ambient crowd sound
    this.startAmbientAudio();
  }

  getRandomCallout(category) {
    const pool = CALLOUTS[category];
    if (!pool || pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  canAnnounce() {
    const now = Date.now();
    if (now - this.lastAnnouncementTime < this.announcementCooldown) {
      return false;
    }
    return true;
  }

  announce(text, color = COLORS.WHITE, fontSize = '32px') {
    if (!this.canAnnounce()) return;
    this.lastAnnouncementTime = Date.now();
    this.showAnnouncement(text, color, 800, fontSize);
  }

  createParticleEmitters() {
    try {
      // Blood particles
      if (this.scene.textures.exists('particle-blood')) {
        this.bloodEmitter = this.scene.add.particles(0, 0, 'particle-blood', {
          speed: { min: 50, max: 150 },
          angle: { min: 0, max: 360 },
          scale: { start: 0.3, end: 0 },
          lifespan: 500,
          gravityY: 200,
          emitting: false
        });
        this.bloodEmitter.setDepth(50);
      } else {
        console.warn('particle-blood texture not found');
      }

      // Spark particles
      if (this.scene.textures.exists('particle-spark')) {
        this.sparkEmitter = this.scene.add.particles(0, 0, 'particle-spark', {
          speed: { min: 100, max: 200 },
          angle: { min: 0, max: 360 },
          scale: { start: 0.4, end: 0 },
          lifespan: 300,
          emitting: false
        });
        this.sparkEmitter.setDepth(50);
      } else {
        console.warn('particle-spark texture not found');
      }

      // Debris particles
      if (this.scene.textures.exists('particle-debris')) {
        this.debrisEmitter = this.scene.add.particles(0, 0, 'particle-debris', {
          speed: { min: 50, max: 150 },
          angle: { min: -90, max: -45 },
          scale: { start: 0.3, end: 0.1 },
          lifespan: 800,
          gravityY: 300,
          rotate: { min: 0, max: 360 },
          emitting: false
        });
        this.debrisEmitter.setDepth(50);
      } else {
        console.warn('particle-debris texture not found');
      }

      // Fire particles
      if (this.scene.textures.exists('particle-fire')) {
        this.fireEmitter = this.scene.add.particles(0, 0, 'particle-fire', {
          speed: { min: 30, max: 80 },
          angle: { min: -120, max: -60 },
          scale: { start: 0.5, end: 0 },
          lifespan: 400,
          alpha: { start: 1, end: 0 },
          emitting: false
        });
        this.fireEmitter.setDepth(50);
      } else {
        console.warn('particle-fire texture not found');
      }
    } catch (error) {
      console.error('Error creating particle emitters:', error);
    }
  }

  startAmbientAudio() {
    try {
      // Start fight music
      if (this.scene.cache.audio.exists('music-fight')) {
        this.fightMusic = this.scene.sound.add('music-fight', {
          loop: true,
          volume: 0.3
        });
        this.fightMusic.play();
      }

      // Start crowd ambience
      if (this.scene.cache.audio.exists('sfx-crowd-loop')) {
        this.crowdAmbience = this.scene.sound.add('sfx-crowd-loop', {
          loop: true,
          volume: 0.15
        });
        this.crowdAmbience.play();
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  setupEventListeners() {
    // Combat events
    this.scene.events.on('combat-hit', this.onCombatHit, this);
    this.scene.events.on('combat-combo', this.onCombo, this);
    this.scene.events.on('combat-combo-end', this.onComboEnd, this);
    this.scene.events.on('combat-table-slam', this.onTableSlam, this);
    this.scene.events.on('combat-finisher', this.onFinisher, this);
    this.scene.events.on('combat-grapple-start', this.onGrappleStart, this);
    this.scene.events.on('combat-grapple-throw', this.onGrappleThrowEffect, this);

    // Fighter events
    this.scene.events.on('fighter-damaged', this.onFighterDamaged, this);
    this.scene.events.on('fighter-burning', this.onFighterBurning, this);
    this.scene.events.on('fighter-ko', this.onFighterKO, this);
    this.scene.events.on('fighter-grapple-escape', this.onGrappleEscape, this);

    // Table events
    this.scene.events.on('table-ignited', this.onTableIgnited, this);
    this.scene.events.on('table-broken', this.onTableBroken, this);

    // Weapon events
    this.scene.events.on('fighter-weapon-pickup', this.onWeaponPickup, this);
  }

  // === SOUND EFFECTS ===
  playSound(key, volume = 0.5) {
    try {
      if (this.scene.cache.audio.exists(key)) {
        this.scene.sound.play(key, { volume });
      }
    } catch (e) {
      console.warn('Sound playback error:', key, e);
    }
  }

  playHitSound(isWeapon = false) {
    if (isWeapon) {
      // Vary weapon hit pitch slightly
      const detune = Phaser.Math.Between(-50, 50);
      this.playSoundWithDetune('sfx-chair-hit', 0.6, detune);
    } else {
      // Vary punch sound pitch for variety without new audio files
      const detune = Phaser.Math.Between(-100, 100);
      this.playSoundWithDetune('sfx-hit', 0.5, detune);
    }
  }

  playSoundWithDetune(key, volume = 0.5, detune = 0) {
    try {
      if (this.scene.cache.audio.exists(key)) {
        this.scene.sound.play(key, { volume, detune });
      }
    } catch (e) {
      console.warn('Sound playback error:', key, e);
    }
  }

  playCrowdReaction(isBig = false) {
    if (isBig) {
      this.playSound('sfx-crowd-pop', 0.5);
    } else {
      this.playSound('sfx-crowd-ooh', 0.4);
    }
  }

  // === SCREEN SHAKE EFFECTS ===
  shakeLight() {
    this.scene.cameras.main.shake(100, 0.005);
  }

  shakeHeavy() {
    this.scene.cameras.main.shake(200, 0.015);
  }

  shakeDevastating() {
    this.scene.cameras.main.shake(300, 0.025);
  }

  // === PARTICLE EFFECTS ===
  spawnBlood(x, y, count = 8) {
    try {
      if (this.bloodEmitter && this.bloodEmitter.active) {
        this.bloodEmitter.emitParticleAt(x, y, count);
      }
    } catch (e) {
      console.warn('Blood particle error:', e);
    }
  }

  spawnSparks(x, y, count = 12) {
    try {
      if (this.sparkEmitter && this.sparkEmitter.active) {
        this.sparkEmitter.emitParticleAt(x, y, count);
      }
    } catch (e) {
      console.warn('Spark particle error:', e);
    }
  }

  spawnDebris(x, y, count = 10) {
    try {
      if (this.debrisEmitter && this.debrisEmitter.active) {
        this.debrisEmitter.emitParticleAt(x, y, count);
      }
    } catch (e) {
      console.warn('Debris particle error:', e);
    }
  }

  spawnFire(x, y, count = 5) {
    try {
      if (this.fireEmitter && this.fireEmitter.active) {
        this.fireEmitter.emitParticleAt(x, y, count);
      }
    } catch (e) {
      console.warn('Fire particle error:', e);
    }
  }

  // === VISUAL EFFECTS ===
  flashSprite(sprite, color = COLORS.BLOOD_BRIGHT, duration = 100) {
    if (!sprite || !sprite.active) return;
    sprite.setTint(color);
    this.scene.time.delayedCall(duration, () => {
      if (sprite && sprite.active) {
        sprite.clearTint();
      }
    });
  }

  showAnnouncement(text, color = COLORS.BLOOD_BRIGHT, duration = 1500, fontSize = '48px') {
    const colorHex = typeof color === 'number'
      ? `#${color.toString(16).padStart(6, '0')}`
      : color;

    const announcement = this.scene.add.text(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      text,
      {
        fontFamily: 'Arial Black',
        fontSize: fontSize,
        color: colorHex,
        stroke: '#000000',
        strokeThickness: 6
      }
    );
    announcement.setOrigin(0.5);
    announcement.setDepth(1000);  // Very high depth to be above everything
    announcement.setScrollFactor(0);

    // Scale in
    announcement.setScale(0);
    this.scene.tweens.add({
      targets: announcement,
      scale: 1,
      duration: 150,
      ease: 'Back.easeOut'
    });

    // Fade out
    this.scene.tweens.add({
      targets: announcement,
      alpha: 0,
      scale: 1.2,
      delay: duration - 200,
      duration: 200,
      onComplete: () => {
        announcement.destroy();
      }
    });
  }

  // === EVENT HANDLERS ===
  onCombatHit(hitData) {
    const { target, isWeaponHit, position, comboCount = 1 } = hitData;

    // Play sound
    this.playHitSound(isWeaponHit);

    // Spawn blood (more blood for higher combos)
    const bloodCount = (isWeaponHit ? 12 : 6) + Math.min(comboCount - 1, 4) * 2;
    this.spawnBlood(position.x, position.y, bloodCount);

    // Sparks for weapon hits or high combos
    if (isWeaponHit || comboCount >= 3) {
      this.spawnSparks(position.x, position.y, 8 + comboCount * 2);
    }

    // Screen shake scales with combo
    const shakeIntensity = COMBO.SHAKE_BASE + (comboCount - 1) * COMBO.SHAKE_PER_HIT;
    const shakeDuration = 100 + comboCount * 20;
    this.scene.cameras.main.shake(shakeDuration, shakeIntensity * 0.005);

    // Crowd reaction for combos and weapon hits
    if (isWeaponHit || comboCount >= 2) {
      this.playCrowdReaction(comboCount >= 3);
    } else {
      this.playCrowdReaction(false);
    }

    // Flash target
    this.flashSprite(target);
  }

  onCombo(comboData) {
    const { comboCount, comboMultiplier, position } = comboData;

    // Show combo counter above target
    this.showComboCounter(comboCount, comboMultiplier, position.x, position.y);

    // Announcer callout at key combo milestones
    if (comboCount === 3) {
      this.announce('COMBO!', COLORS.YELLOW, '32px');
    } else if (comboCount === 4) {
      this.announce('ON FIRE!', COLORS.FIRE_ORANGE, '36px');
    } else if (comboCount >= 5) {
      this.announce('BRUTAL!', COLORS.BLOOD_BRIGHT, '40px');
    }
  }

  showComboCounter(count, multiplier, x, y) {
    // Color based on combo length
    let color = '#FFFF00'; // Yellow for 2-hit
    if (count >= 3) color = '#FFA500'; // Orange for 3-hit
    if (count >= 4) color = '#FF4500'; // Red-orange for 4-hit
    if (count >= 5) color = '#FF0000'; // Red for 5+

    // Create combo text
    const comboText = this.scene.add.text(x, y, `${count} HIT!`, {
      fontFamily: 'Arial Black',
      fontSize: `${24 + count * 4}px`,
      color: color,
      stroke: '#000000',
      strokeThickness: 4
    });
    comboText.setOrigin(0.5);
    comboText.setDepth(1000);

    // Show multiplier beneath
    const multiplierText = this.scene.add.text(x, y + 30, `x${multiplier.toFixed(1)}`, {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3
    });
    multiplierText.setOrigin(0.5);
    multiplierText.setDepth(1000);

    // Animate: pop in, float up, fade out
    comboText.setScale(0);
    multiplierText.setScale(0);

    this.scene.tweens.add({
      targets: [comboText, multiplierText],
      scale: 1,
      duration: 100,
      ease: 'Back.easeOut'
    });

    this.scene.tweens.add({
      targets: comboText,
      y: y - 40,
      alpha: 0,
      delay: 400,
      duration: 300,
      onComplete: () => comboText.destroy()
    });

    this.scene.tweens.add({
      targets: multiplierText,
      y: y - 10,
      alpha: 0,
      delay: 400,
      duration: 300,
      onComplete: () => multiplierText.destroy()
    });
  }

  onComboEnd(data) {
    const { fighter, finalCount } = data;

    // Big combo ender announcement
    if (finalCount >= 4) {
      this.announce(`${finalCount} HIT COMBO!`, COLORS.FIRE_ORANGE, '36px');
      this.playCrowdReaction(true);
    }
  }

  onTableSlam(data) {
    const { target, table, wasOnFire } = data;

    // Sound
    this.playSound('sfx-table-break', 0.7);
    this.playCrowdReaction(true);

    // Big shake
    this.shakeDevastating();

    // Debris from table
    this.spawnDebris(table.x, table.y, 15);

    // Blood from target
    this.spawnBlood(target.x, target.y, 10);

    // Fire effects if flaming
    if (wasOnFire) {
      this.spawnFire(target.x, target.y, 10);
      this.showAnnouncement('FLAMING TABLE!', COLORS.FIRE_ORANGE, 1500);
    } else {
      this.showAnnouncement('TABLE SLAM!', COLORS.CHROME, 1000);
    }
  }

  onFinisher(data) {
    const { target, attacker } = data;

    // Sound
    this.playSound('sfx-chair-hit', 0.8);
    this.playCrowdReaction(true);

    // Maximum shake
    this.shakeDevastating();

    // Lots of blood
    this.spawnBlood(target.x, target.y, 20);

    // Sparks
    this.spawnSparks(target.x, target.y, 15);

    // Big announcement with variety
    const callout = this.getRandomCallout('finisher');
    this.showAnnouncement(callout, COLORS.FIRE_ORANGE, 2000, '72px');

    // Slow motion effect
    this.scene.time.timeScale = 0.3;
    this.scene.time.delayedCall(500, () => {
      this.scene.time.timeScale = 1;
    });
  }

  onFighterDamaged(fighter, damage, attacker) {
    // Track health for comeback detection
    const prevHealth = this.healthTracking.get(fighter) || fighter.maxHealth;
    const currentHealth = fighter.health;
    this.healthTracking.set(fighter, currentHealth);

    const healthPercent = currentHealth / fighter.maxHealth;

    // Low health warning (first time dropping below 25%)
    if (healthPercent <= 0.25 && prevHealth / fighter.maxHealth > 0.25) {
      const callout = this.getRandomCallout('lowHealth');
      this.announce(callout, COLORS.RED, '36px');
      this.playCrowdReaction(true);
    }

    // Near KO (below 10%)
    if (healthPercent <= 0.10 && healthPercent > 0) {
      const callout = this.getRandomCallout('nearKO');
      this.announce(callout, COLORS.BLOOD_BRIGHT, '28px');
    }

    // Detect comeback (was low, now dealing damage back)
    if (attacker) {
      const attackerHealth = attacker.health / attacker.maxHealth;
      if (attackerHealth <= 0.30 && damage >= 15) {
        const callout = this.getRandomCallout('comeback');
        this.announce(callout, COLORS.GREEN, '32px');
      }
    }

    // Heavy hit callout
    if (damage >= 20) {
      const callout = this.getRandomCallout('heavyHit');
      this.announce(callout, COLORS.FIRE_ORANGE, '36px');
      this.playCrowdReaction(true);
    } else if (damage >= 15) {
      this.playCrowdReaction(true);
    }
  }

  onFighterBurning(fighter) {
    this.spawnFire(fighter.x, fighter.y - 20, 3);
    this.flashSprite(fighter, COLORS.FIRE_ORANGE, 150);
  }

  onFighterKO(fighter) {
    // KO sound
    this.playSound('sfx-ko', 0.8);
    this.playSound('sfx-body-fall', 0.6);
    this.playCrowdReaction(true);

    // Big shake
    this.shakeDevastating();

    // Blood
    this.spawnBlood(fighter.x, fighter.y, 15);

    // KO announcement
    this.showAnnouncement('K.O.!', COLORS.BLOOD_BRIGHT, 2000, '72px');

    // Fade out fight music
    if (this.fightMusic) {
      this.scene.tweens.add({
        targets: this.fightMusic,
        volume: 0,
        duration: 1000
      });
    }
  }

  onTableIgnited(table) {
    this.playSound('sfx-fire-ignite', 0.6);
    const callout = this.getRandomCallout('fireStart');
    this.showAnnouncement(callout, COLORS.FIRE_ORANGE, 800, '36px');

    // Start fire loop sound
    if (!this.fireLoopSound) {
      this.fireLoopSound = this.scene.sound.add('sfx-fire-loop', {
        loop: true,
        volume: 0.3
      });
      this.fireLoopSound.play();
    }

    // Start continuous fire particles on table
    this.burningTable = table;
    this.fireParticleTimer = this.scene.time.addEvent({
      delay: 150,
      callback: () => {
        if (this.burningTable && this.burningTable.isOnFire()) {
          this.spawnFire(this.burningTable.x + Phaser.Math.Between(-40, 40),
                        this.burningTable.y - 20, 3);
        }
      },
      loop: true
    });
  }

  onTableBroken(table, wasOnFire) {
    this.playSound('sfx-table-break', 0.7);
    this.spawnDebris(table.x, table.y, 20);

    // Table break callout
    const callout = this.getRandomCallout('tableBreak');
    this.announce(callout, wasOnFire ? COLORS.FIRE_ORANGE : COLORS.CHROME, '32px');

    if (wasOnFire) {
      this.spawnFire(table.x, table.y, 15);
      // Stop fire loop sound
      if (this.fireLoopSound) {
        this.fireLoopSound.stop();
        this.fireLoopSound = null;
      }
      // Stop fire particle timer
      if (this.fireParticleTimer) {
        this.fireParticleTimer.destroy();
        this.fireParticleTimer = null;
      }
      this.burningTable = null;
    }
  }

  onWeaponPickup(fighter, weapon) {
    this.playSound('sfx-chair-pickup', 0.5);
    this.flashSprite(weapon, COLORS.CHROME, 200);

    // Random weapon pickup callout
    if (this.canAnnounce() && Math.random() < 0.5) {
      const callout = this.getRandomCallout('weaponPickup');
      this.announce(callout, COLORS.CHROME, '28px');
    }
  }

  onGrappleStart(data) {
    const { attacker, target } = data;

    // Play grapple sound
    this.playSound('sfx-hit', 0.4);

    // Light screen shake
    this.shakeLight();

    // Show "GRAPPLE!" text between fighters
    const midX = (attacker.x + target.x) / 2;
    const midY = Math.min(attacker.y, target.y) - 60;

    this.showAnnouncement('CLINCH!', COLORS.CHROME, 800, '28px');

    // Crowd reacts
    this.playCrowdReaction(false);
  }

  onGrappleThrowEffect(data) {
    const { attacker, target, moveName, damage, position } = data;

    // Play impact sound
    this.playSound('sfx-hit', 0.7);

    // Heavy shake for throw impact
    this.shakeHeavy();

    // Blood from impact
    this.spawnBlood(position.x, position.y, 10);

    // Format move name nicely
    const displayName = moveName.replace('_', ' ');

    // Show move name with big impact
    this.showAnnouncement(displayName + '!', COLORS.BLOOD_BRIGHT, 1200, '42px');

    // Big crowd reaction
    this.playCrowdReaction(true);

    // Dust/debris at landing spot
    this.scene.time.delayedCall(300, () => {
      this.spawnDebris(target.x, target.y + 30, 8);
    });
  }

  onGrappleEscape(fighter, attacker) {
    // Play escape sound
    this.playSound('sfx-hit', 0.3);

    // Show escape text
    this.showAnnouncement('ESCAPE!', COLORS.GREEN, 600, '28px');

    // Light shake
    this.shakeLight();

    // Small crowd reaction
    this.playCrowdReaction(false);
  }

  stopAllAudio() {
    if (this.fightMusic) {
      this.fightMusic.stop();
    }
    if (this.crowdAmbience) {
      this.crowdAmbience.stop();
    }
    if (this.fireLoopSound) {
      this.fireLoopSound.stop();
    }
    if (this.fireParticleTimer) {
      this.fireParticleTimer.destroy();
      this.fireParticleTimer = null;
    }
  }

  destroy() {
    // Stop audio
    this.stopAllAudio();

    // Remove event listeners
    this.scene.events.off('combat-hit', this.onCombatHit, this);
    this.scene.events.off('combat-combo', this.onCombo, this);
    this.scene.events.off('combat-combo-end', this.onComboEnd, this);
    this.scene.events.off('combat-table-slam', this.onTableSlam, this);
    this.scene.events.off('combat-finisher', this.onFinisher, this);
    this.scene.events.off('combat-grapple-start', this.onGrappleStart, this);
    this.scene.events.off('combat-grapple-throw', this.onGrappleThrowEffect, this);
    this.scene.events.off('fighter-damaged', this.onFighterDamaged, this);
    this.scene.events.off('fighter-burning', this.onFighterBurning, this);
    this.scene.events.off('fighter-ko', this.onFighterKO, this);
    this.scene.events.off('fighter-grapple-escape', this.onGrappleEscape, this);
    this.scene.events.off('table-ignited', this.onTableIgnited, this);
    this.scene.events.off('table-broken', this.onTableBroken, this);
    this.scene.events.off('fighter-weapon-pickup', this.onWeaponPickup, this);

    // Destroy emitters
    if (this.bloodEmitter) this.bloodEmitter.destroy();
    if (this.sparkEmitter) this.sparkEmitter.destroy();
    if (this.debrisEmitter) this.debrisEmitter.destroy();
    if (this.fireEmitter) this.fireEmitter.destroy();
  }
}
