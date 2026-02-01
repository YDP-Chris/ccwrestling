/**
 * Seeded random number generator for deterministic replays
 * Uses mulberry32 algorithm
 */
export class SeededRandom {
  constructor(seed = Date.now()) {
    this.initialSeed = seed;
    this.state = seed;
  }

  /**
   * Generate next random number between 0 and 1
   */
  next() {
    this.state |= 0;
    this.state = this.state + 0x6D2B79F5 | 0;
    let t = Math.imul(this.state ^ this.state >>> 15, 1 | this.state);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  between(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Pick random item from array
   */
  pick(array) {
    return array[Math.floor(this.next() * array.length)];
  }

  /**
   * Reset to initial seed
   */
  reset() {
    this.state = this.initialSeed;
  }

  /**
   * Get current seed for saving
   */
  getSeed() {
    return this.initialSeed;
  }
}

export default SeededRandom;
