/**
 * Records timestamped inputs for replay
 */
export class InputRecorder {
  constructor() {
    this.inputs = [];
    this.startTime = 0;
    this.isRecording = false;
    this.metadata = {};
  }

  /**
   * Start recording inputs
   */
  start(metadata = {}) {
    this.inputs = [];
    this.startTime = performance.now();
    this.isRecording = true;
    this.metadata = {
      ...metadata,
      startedAt: new Date().toISOString(),
      seed: metadata.seed || Date.now()
    };
    console.log('[InputRecorder] Started recording');
  }

  /**
   * Stop recording
   */
  stop() {
    this.isRecording = false;
    this.metadata.endedAt = new Date().toISOString();
    this.metadata.duration = performance.now() - this.startTime;
    this.metadata.inputCount = this.inputs.length;
    console.log(`[InputRecorder] Stopped. Recorded ${this.inputs.length} inputs`);
    return this.getRecording();
  }

  /**
   * Record a key event
   */
  recordKey(key, type, player = 1) {
    if (!this.isRecording) return;

    const timestamp = performance.now() - this.startTime;
    this.inputs.push({
      type: 'key',
      key,
      action: type, // 'down' or 'up'
      player,
      timestamp
    });
  }

  /**
   * Record a game event (for validation during replay)
   */
  recordEvent(eventName, data = {}) {
    if (!this.isRecording) return;

    const timestamp = performance.now() - this.startTime;
    this.inputs.push({
      type: 'event',
      eventName,
      data,
      timestamp
    });
  }

  /**
   * Record game state snapshot (for validation)
   */
  recordSnapshot(state) {
    if (!this.isRecording) return;

    const timestamp = performance.now() - this.startTime;
    this.inputs.push({
      type: 'snapshot',
      state,
      timestamp
    });
  }

  /**
   * Get the complete recording
   */
  getRecording() {
    return {
      version: 1,
      metadata: this.metadata,
      inputs: [...this.inputs]
    };
  }

  /**
   * Export recording as JSON string
   */
  toJSON() {
    return JSON.stringify(this.getRecording(), null, 2);
  }

  /**
   * Save recording to localStorage
   */
  saveToStorage(name) {
    const key = `ccw_replay_${name}`;
    localStorage.setItem(key, this.toJSON());
    console.log(`[InputRecorder] Saved to ${key}`);
  }

  /**
   * List saved recordings
   */
  static listSaved() {
    const recordings = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('ccw_replay_')) {
        const name = key.replace('ccw_replay_', '');
        try {
          const data = JSON.parse(localStorage.getItem(key));
          recordings.push({
            name,
            metadata: data.metadata,
            inputCount: data.inputs?.length || 0
          });
        } catch (e) {
          console.warn(`Invalid recording: ${key}`);
        }
      }
    }
    return recordings;
  }

  /**
   * Load recording from localStorage
   */
  static loadFromStorage(name) {
    const key = `ccw_replay_${name}`;
    const json = localStorage.getItem(key);
    if (!json) return null;
    try {
      return JSON.parse(json);
    } catch (e) {
      console.error(`Failed to parse recording: ${key}`);
      return null;
    }
  }
}

export default InputRecorder;
