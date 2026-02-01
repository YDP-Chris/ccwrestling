import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SeededRandom } from '../../src/systems/replay/SeededRandom.js';
import { InputRecorder } from '../../src/systems/replay/InputRecorder.js';

describe('SeededRandom', () => {
  describe('deterministic output', () => {
    it('should produce same sequence with same seed', () => {
      const rng1 = new SeededRandom(12345);
      const rng2 = new SeededRandom(12345);

      const seq1 = [rng1.next(), rng1.next(), rng1.next()];
      const seq2 = [rng2.next(), rng2.next(), rng2.next()];

      expect(seq1).toEqual(seq2);
    });

    it('should produce different sequences with different seeds', () => {
      const rng1 = new SeededRandom(12345);
      const rng2 = new SeededRandom(54321);

      expect(rng1.next()).not.toEqual(rng2.next());
    });

    it('should reset to initial state', () => {
      const rng = new SeededRandom(42);
      const first = rng.next();
      rng.next();
      rng.next();
      rng.reset();
      expect(rng.next()).toBe(first);
    });
  });

  describe('next()', () => {
    it('should return values between 0 and 1', () => {
      const rng = new SeededRandom(999);
      for (let i = 0; i < 100; i++) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });
  });

  describe('between()', () => {
    it('should return integers in range', () => {
      const rng = new SeededRandom(123);
      for (let i = 0; i < 100; i++) {
        const value = rng.between(1, 10);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(10);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('should be deterministic', () => {
      const rng1 = new SeededRandom(456);
      const rng2 = new SeededRandom(456);

      const values1 = Array.from({ length: 10 }, () => rng1.between(1, 100));
      const values2 = Array.from({ length: 10 }, () => rng2.between(1, 100));

      expect(values1).toEqual(values2);
    });
  });

  describe('pick()', () => {
    it('should pick items from array', () => {
      const rng = new SeededRandom(789);
      const items = ['a', 'b', 'c', 'd'];

      for (let i = 0; i < 50; i++) {
        const picked = rng.pick(items);
        expect(items).toContain(picked);
      }
    });

    it('should be deterministic', () => {
      const rng1 = new SeededRandom(111);
      const rng2 = new SeededRandom(111);
      const items = ['THROW', 'BODY_SLAM', 'SUPLEX', 'DDT'];

      const picks1 = Array.from({ length: 10 }, () => rng1.pick(items));
      const picks2 = Array.from({ length: 10 }, () => rng2.pick(items));

      expect(picks1).toEqual(picks2);
    });
  });

  describe('getSeed()', () => {
    it('should return the initial seed', () => {
      const rng = new SeededRandom(42424);
      rng.next();
      rng.next();
      expect(rng.getSeed()).toBe(42424);
    });
  });
});

describe('InputRecorder', () => {
  let recorder;

  beforeEach(() => {
    recorder = new InputRecorder();
    // Mock performance.now
    vi.spyOn(performance, 'now').mockReturnValue(0);
  });

  describe('start()', () => {
    it('should initialize recording state', () => {
      recorder.start({ seed: 12345 });

      expect(recorder.isRecording).toBe(true);
      expect(recorder.inputs).toHaveLength(0);
      expect(recorder.metadata.seed).toBe(12345);
    });

    it('should auto-generate seed if not provided', () => {
      recorder.start();
      expect(recorder.metadata.seed).toBeDefined();
      expect(typeof recorder.metadata.seed).toBe('number');
    });
  });

  describe('stop()', () => {
    it('should return recording and stop', () => {
      recorder.start({ seed: 100 });
      recorder.recordKey('KeyJ', 'down', 1);

      const recording = recorder.stop();

      expect(recorder.isRecording).toBe(false);
      expect(recording.metadata.seed).toBe(100);
      expect(recording.inputs).toHaveLength(1);
    });

    it('should include duration in metadata', () => {
      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(5000);

      recorder.start();
      const recording = recorder.stop();

      expect(recording.metadata.duration).toBe(5000);
    });
  });

  describe('recordKey()', () => {
    it('should record key events with timestamps', () => {
      recorder.start();

      vi.spyOn(performance, 'now').mockReturnValue(100);
      recorder.recordKey('KeyJ', 'down', 1);

      vi.spyOn(performance, 'now').mockReturnValue(200);
      recorder.recordKey('KeyJ', 'up', 1);

      expect(recorder.inputs).toHaveLength(2);
      expect(recorder.inputs[0]).toMatchObject({
        type: 'key',
        key: 'KeyJ',
        action: 'down',
        player: 1,
        timestamp: 100
      });
      expect(recorder.inputs[1].timestamp).toBe(200);
    });

    it('should not record when not recording', () => {
      recorder.recordKey('KeyJ', 'down', 1);
      expect(recorder.inputs).toHaveLength(0);
    });
  });

  describe('recordEvent()', () => {
    it('should record events with data', () => {
      recorder.start();

      vi.spyOn(performance, 'now').mockReturnValue(500);
      recorder.recordEvent('grapple-initiate', { attacker: 'player1' });

      expect(recorder.inputs).toHaveLength(1);
      expect(recorder.inputs[0]).toMatchObject({
        type: 'event',
        eventName: 'grapple-initiate',
        data: { attacker: 'player1' },
        timestamp: 500
      });
    });
  });

  describe('recordSnapshot()', () => {
    it('should record state snapshots', () => {
      recorder.start();

      vi.spyOn(performance, 'now').mockReturnValue(1000);
      recorder.recordSnapshot({
        player: { health: 80, x: 100, y: 200 },
        enemy: { health: 90, x: 300, y: 200 }
      });

      expect(recorder.inputs).toHaveLength(1);
      expect(recorder.inputs[0].type).toBe('snapshot');
      expect(recorder.inputs[0].state.player.health).toBe(80);
    });
  });

  describe('getRecording()', () => {
    it('should return structured recording', () => {
      recorder.start({ seed: 999, player1: 'DUMPSTER', player2: 'SCAR' });
      recorder.recordKey('KeyD', 'down', 1);

      const recording = recorder.getRecording();

      expect(recording.version).toBe(1);
      expect(recording.metadata.seed).toBe(999);
      expect(recording.inputs).toHaveLength(1);
    });
  });

  describe('toJSON()', () => {
    it('should serialize recording to JSON string', () => {
      recorder.start({ seed: 123 });
      recorder.recordKey('KeyJ', 'down', 1);

      const json = recorder.toJSON();
      const parsed = JSON.parse(json);

      expect(parsed.metadata.seed).toBe(123);
      expect(parsed.inputs).toHaveLength(1);
    });
  });
});

describe('Recording and Replay Integration', () => {
  it('should maintain input order and timing', () => {
    const recorder = new InputRecorder();

    vi.spyOn(performance, 'now')
      .mockReturnValueOnce(0)    // start
      .mockReturnValueOnce(100)  // key 1
      .mockReturnValueOnce(150)  // key 2
      .mockReturnValueOnce(200)  // key 3
      .mockReturnValueOnce(300); // stop

    recorder.start({ seed: 42 });
    recorder.recordKey('KeyD', 'down', 1);
    recorder.recordKey('KeyG', 'down', 1);
    recorder.recordKey('KeyJ', 'down', 1);

    const recording = recorder.stop();

    expect(recording.inputs).toHaveLength(3);
    expect(recording.inputs[0].timestamp).toBe(100);
    expect(recording.inputs[1].timestamp).toBe(150);
    expect(recording.inputs[2].timestamp).toBe(200);
    expect(recording.inputs[0].key).toBe('KeyD');
    expect(recording.inputs[1].key).toBe('KeyG');
    expect(recording.inputs[2].key).toBe('KeyJ');
  });

  it('should handle mixed input and event recording', () => {
    const recorder = new InputRecorder();

    vi.spyOn(performance, 'now')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(150)
      .mockReturnValueOnce(200);

    recorder.start();
    recorder.recordKey('KeyG', 'down', 1);
    recorder.recordEvent('grapple-initiate', { damage: 14 });

    const recording = recorder.getRecording();

    expect(recording.inputs[0].type).toBe('key');
    expect(recording.inputs[1].type).toBe('event');
  });
});
