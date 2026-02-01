/**
 * Manages recording and replaying of matches
 * Integrates with FightScene
 */
import { InputRecorder } from './InputRecorder.js';
import { InputReplayer } from './InputReplayer.js';
import { SeededRandom } from './SeededRandom.js';

export class ReplayManager {
  constructor(scene) {
    this.scene = scene;
    this.recorder = new InputRecorder();
    this.replayer = new InputReplayer(scene);
    this.rng = null;
    this.mode = 'none'; // 'none', 'recording', 'playing'
  }

  /**
   * Start recording a new match
   */
  startRecording(options = {}) {
    const seed = options.seed || Date.now();
    this.rng = new SeededRandom(seed);

    this.recorder.start({
      seed,
      player1: options.player1 || 'DUMPSTER',
      player2: options.player2 || 'SCAR',
      mode: options.mode || 'vs'
    });

    this.mode = 'recording';
    console.log(`[ReplayManager] Recording started with seed: ${seed}`);

    return seed;
  }

  /**
   * Stop recording and return the recording
   */
  stopRecording() {
    if (this.mode !== 'recording') return null;

    const recording = this.recorder.stop();
    this.mode = 'none';
    return recording;
  }

  /**
   * Start playing a recording
   */
  startReplay(recording, options = {}) {
    if (!recording) {
      console.error('[ReplayManager] No recording provided');
      return false;
    }

    // Use the seed from the recording for deterministic playback
    const seed = recording.metadata?.seed || Date.now();
    this.rng = new SeededRandom(seed);

    this.replayer.load(recording);
    this.replayer.start({
      speed: options.speed || 1.0,
      onComplete: (snapshots) => this.onReplayComplete(snapshots, options.onComplete),
      onEvent: options.onEvent
    });

    this.mode = 'playing';
    console.log(`[ReplayManager] Replay started with seed: ${seed}`);
    return true;
  }

  /**
   * Handle replay completion
   */
  onReplayComplete(snapshots, callback) {
    this.mode = 'none';
    console.log('[ReplayManager] Replay complete');

    if (callback) {
      callback(snapshots);
    }
  }

  /**
   * Stop replay
   */
  stopReplay() {
    if (this.mode !== 'playing') return;
    this.replayer.stop();
    this.mode = 'none';
  }

  /**
   * Update - call from scene update
   */
  update() {
    if (this.mode === 'playing') {
      this.replayer.update();
    }
  }

  /**
   * Record a key event (call from input handlers)
   */
  recordKey(key, type, player = 1) {
    if (this.mode === 'recording') {
      this.recorder.recordKey(key, type, player);
    }
  }

  /**
   * Record a game event
   */
  recordEvent(eventName, data = {}) {
    if (this.mode === 'recording') {
      this.recorder.recordEvent(eventName, data);
    }
  }

  /**
   * Record a state snapshot
   */
  recordSnapshot(state) {
    if (this.mode === 'recording') {
      this.recorder.recordSnapshot(state);
    }
  }

  /**
   * Take a snapshot of current game state
   */
  captureSnapshot() {
    if (!this.scene) return null;

    const snapshot = {
      timestamp: performance.now(),
      player: null,
      enemy: null
    };

    if (this.scene.player) {
      snapshot.player = {
        x: this.scene.player.x,
        y: this.scene.player.y,
        health: this.scene.player.health,
        meter: this.scene.player.extremeMeter,
        state: this.scene.player.state
      };
    }

    if (this.scene.enemy) {
      snapshot.enemy = {
        x: this.scene.enemy.x,
        y: this.scene.enemy.y,
        health: this.scene.enemy.health,
        meter: this.scene.enemy.extremeMeter,
        state: this.scene.enemy.state
      };
    }

    return snapshot;
  }

  /**
   * Get the seeded RNG (use this instead of Math.random for deterministic gameplay)
   */
  getRNG() {
    return this.rng;
  }

  /**
   * Get random number (wrapper for deterministic random)
   */
  random() {
    return this.rng ? this.rng.next() : Math.random();
  }

  /**
   * Get random integer between min and max
   */
  randomBetween(min, max) {
    return this.rng ? this.rng.between(min, max) : Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Check if currently recording
   */
  isRecording() {
    return this.mode === 'recording';
  }

  /**
   * Check if currently playing
   */
  isPlaying() {
    return this.mode === 'playing';
  }

  /**
   * Save current recording to storage
   */
  saveRecording(name) {
    if (this.mode === 'recording') {
      this.recorder.saveToStorage(name);
    }
  }

  /**
   * Load recording from storage
   */
  loadRecording(name) {
    return InputRecorder.loadFromStorage(name);
  }

  /**
   * List saved recordings
   */
  listRecordings() {
    return InputRecorder.listSaved();
  }

  /**
   * Export recording as downloadable file
   */
  exportRecording(recording, filename = 'ccw-replay.json') {
    const json = JSON.stringify(recording, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Import recording from file
   */
  async importRecording(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const recording = JSON.parse(e.target.result);
          resolve(recording);
        } catch (err) {
          reject(new Error('Invalid replay file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}

export default ReplayManager;
