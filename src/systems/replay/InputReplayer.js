/**
 * Replays recorded inputs with timing
 */
export class InputReplayer {
  constructor(scene) {
    this.scene = scene;
    this.recording = null;
    this.isPlaying = false;
    this.startTime = 0;
    this.currentIndex = 0;
    this.speed = 1.0;
    this.keyStates = new Map(); // Track simulated key states
    this.onComplete = null;
    this.onEvent = null;
    this.snapshots = [];
  }

  /**
   * Load a recording for playback
   */
  load(recording) {
    this.recording = recording;
    this.currentIndex = 0;
    this.snapshots = [];
    console.log(`[InputReplayer] Loaded recording with ${recording.inputs.length} inputs`);
  }

  /**
   * Start playback
   */
  start(options = {}) {
    if (!this.recording) {
      console.error('[InputReplayer] No recording loaded');
      return false;
    }

    this.speed = options.speed || 1.0;
    this.onComplete = options.onComplete || null;
    this.onEvent = options.onEvent || null;
    this.startTime = performance.now();
    this.currentIndex = 0;
    this.isPlaying = true;
    this.keyStates.clear();

    console.log(`[InputReplayer] Started playback at ${this.speed}x speed`);
    return true;
  }

  /**
   * Stop playback
   */
  stop() {
    this.isPlaying = false;
    this.keyStates.clear();
    console.log('[InputReplayer] Stopped playback');
  }

  /**
   * Update - call from scene update loop
   */
  update() {
    if (!this.isPlaying || !this.recording) return;

    const elapsed = (performance.now() - this.startTime) * this.speed;

    // Process all inputs up to current time
    while (this.currentIndex < this.recording.inputs.length) {
      const input = this.recording.inputs[this.currentIndex];

      if (input.timestamp > elapsed) {
        break; // Not time yet
      }

      this.processInput(input);
      this.currentIndex++;
    }

    // Check if playback complete
    if (this.currentIndex >= this.recording.inputs.length) {
      this.isPlaying = false;
      console.log('[InputReplayer] Playback complete');
      if (this.onComplete) {
        this.onComplete(this.snapshots);
      }
    }
  }

  /**
   * Process a single input
   */
  processInput(input) {
    switch (input.type) {
      case 'key':
        this.processKeyInput(input);
        break;
      case 'event':
        this.processEventInput(input);
        break;
      case 'snapshot':
        this.snapshots.push(input);
        break;
    }
  }

  /**
   * Simulate a key press/release
   */
  processKeyInput(input) {
    const { key, action, player } = input;

    // Update our tracked key state
    if (action === 'down') {
      this.keyStates.set(`${player}_${key}`, true);
    } else {
      this.keyStates.delete(`${player}_${key}`);
    }

    // Dispatch actual keyboard event to the game
    if (this.scene && this.scene.input && this.scene.input.keyboard) {
      const keyObj = this.scene.input.keyboard.addKey(key);
      if (action === 'down') {
        // Simulate key down
        keyObj.isDown = true;
        keyObj.timeDown = performance.now();
        this.scene.input.keyboard.emit('keydown-' + key.toUpperCase(), { key });
      } else {
        // Simulate key up
        keyObj.isDown = false;
        keyObj.timeUp = performance.now();
        this.scene.input.keyboard.emit('keyup-' + key.toUpperCase(), { key });
      }
    }
  }

  /**
   * Process an event (for validation)
   */
  processEventInput(input) {
    if (this.onEvent) {
      this.onEvent(input.eventName, input.data, input.timestamp);
    }
  }

  /**
   * Check if a key is currently pressed in the replay
   */
  isKeyDown(player, key) {
    return this.keyStates.get(`${player}_${key}`) || false;
  }

  /**
   * Get current playback progress (0-1)
   */
  getProgress() {
    if (!this.recording || !this.recording.inputs.length) return 0;
    return this.currentIndex / this.recording.inputs.length;
  }

  /**
   * Get elapsed time
   */
  getElapsedTime() {
    if (!this.isPlaying) return 0;
    return (performance.now() - this.startTime) * this.speed;
  }
}

export default InputReplayer;
