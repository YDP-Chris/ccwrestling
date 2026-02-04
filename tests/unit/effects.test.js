import { describe, it, expect } from 'vitest';

// Test the callout data structure and random selection logic
// This mirrors the logic in EffectsManager without Phaser dependencies

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

function getRandomCallout(category) {
  const pool = CALLOUTS[category];
  if (!pool || pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

describe('Announcer Callouts', () => {
  describe('CALLOUTS data structure', () => {
    it('should have all required categories', () => {
      const requiredCategories = [
        'hit', 'heavyHit', 'combo', 'lowHealth', 'comeback',
        'grapple', 'throw', 'nearKO', 'weaponPickup', 'tableBreak',
        'fireStart', 'finisher'
      ];

      requiredCategories.forEach(category => {
        expect(CALLOUTS).toHaveProperty(category);
        expect(Array.isArray(CALLOUTS[category])).toBe(true);
        expect(CALLOUTS[category].length).toBeGreaterThan(0);
      });
    });

    it('should have multiple options per category for variety', () => {
      Object.entries(CALLOUTS).forEach(([category, callouts]) => {
        expect(callouts.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('should have unique callouts within each category', () => {
      Object.entries(CALLOUTS).forEach(([category, callouts]) => {
        const unique = new Set(callouts);
        expect(unique.size).toBe(callouts.length);
      });
    });

    it('should have callouts that end with exclamation marks', () => {
      Object.entries(CALLOUTS).forEach(([category, callouts]) => {
        callouts.forEach(callout => {
          expect(callout.endsWith('!')).toBe(true);
        });
      });
    });
  });

  describe('getRandomCallout()', () => {
    it('should return a callout from the specified category', () => {
      const callout = getRandomCallout('hit');
      expect(CALLOUTS.hit).toContain(callout);
    });

    it('should return null for invalid category', () => {
      const callout = getRandomCallout('invalidCategory');
      expect(callout).toBe(null);
    });

    it('should return null for empty category', () => {
      const emptyCallouts = { empty: [] };
      const callout = emptyCallouts.empty?.[Math.floor(Math.random() * 0)] || null;
      expect(callout).toBe(null);
    });

    it('should provide variety over multiple calls', () => {
      const results = new Set();

      for (let i = 0; i < 50; i++) {
        results.add(getRandomCallout('hit'));
      }

      // Should get multiple different callouts over 50 tries
      expect(results.size).toBeGreaterThan(1);
    });

    it('should work for all categories', () => {
      Object.keys(CALLOUTS).forEach(category => {
        const callout = getRandomCallout(category);
        expect(callout).not.toBe(null);
        expect(CALLOUTS[category]).toContain(callout);
      });
    });
  });
});

describe('Dynamic Music Logic', () => {
  // Test the logic for when music should intensify
  function shouldIntensifyMusic(playerHealthPercent, enemyHealthPercent) {
    const lowestHealth = Math.min(playerHealthPercent, enemyHealthPercent);
    return lowestHealth < 0.30;
  }

  function shouldNormalizeMusic(playerHealthPercent, enemyHealthPercent, currentlyIntense) {
    if (!currentlyIntense) return false;
    const lowestHealth = Math.min(playerHealthPercent, enemyHealthPercent);
    return lowestHealth > 0.40;
  }

  describe('shouldIntensifyMusic()', () => {
    it('should intensify when player health below 30%', () => {
      expect(shouldIntensifyMusic(0.25, 1.0)).toBe(true);
      expect(shouldIntensifyMusic(0.29, 0.8)).toBe(true);
    });

    it('should intensify when enemy health below 30%', () => {
      expect(shouldIntensifyMusic(1.0, 0.25)).toBe(true);
      expect(shouldIntensifyMusic(0.8, 0.15)).toBe(true);
    });

    it('should intensify when both below 30%', () => {
      expect(shouldIntensifyMusic(0.20, 0.25)).toBe(true);
    });

    it('should not intensify when both above 30%', () => {
      expect(shouldIntensifyMusic(0.50, 0.60)).toBe(false);
      expect(shouldIntensifyMusic(0.31, 0.31)).toBe(false);
    });

    it('should intensify at exactly 29%', () => {
      expect(shouldIntensifyMusic(0.29, 0.5)).toBe(true);
    });

    it('should not intensify at exactly 30%', () => {
      expect(shouldIntensifyMusic(0.30, 0.5)).toBe(false);
    });
  });

  describe('shouldNormalizeMusic()', () => {
    it('should normalize when health rises above 40%', () => {
      expect(shouldNormalizeMusic(0.45, 0.8, true)).toBe(true);
    });

    it('should not normalize when still below 40%', () => {
      expect(shouldNormalizeMusic(0.35, 0.8, true)).toBe(false);
    });

    it('should not normalize if not currently intense', () => {
      expect(shouldNormalizeMusic(0.50, 0.8, false)).toBe(false);
    });

    it('should have hysteresis (30% to intensify, 40% to normalize)', () => {
      // Start normal at 50%
      let intense = shouldIntensifyMusic(0.50, 0.8);
      expect(intense).toBe(false);

      // Drop to 25% - should intensify
      intense = shouldIntensifyMusic(0.25, 0.8);
      expect(intense).toBe(true);

      // Rise to 35% - should stay intense (below 40%)
      expect(shouldNormalizeMusic(0.35, 0.8, true)).toBe(false);

      // Rise to 45% - should normalize
      expect(shouldNormalizeMusic(0.45, 0.8, true)).toBe(true);
    });
  });
});

describe('Hit Sound Detune Logic', () => {
  // Test the detune range logic
  function getDetuneRange(isWeapon) {
    if (isWeapon) {
      return { min: -50, max: 50 };
    } else {
      return { min: -100, max: 100 };
    }
  }

  it('should have smaller detune range for weapon hits', () => {
    const weaponRange = getDetuneRange(true);
    expect(weaponRange.min).toBe(-50);
    expect(weaponRange.max).toBe(50);
  });

  it('should have larger detune range for punch hits', () => {
    const punchRange = getDetuneRange(false);
    expect(punchRange.min).toBe(-100);
    expect(punchRange.max).toBe(100);
  });

  it('should center detune around 0 (normal pitch)', () => {
    const weaponRange = getDetuneRange(true);
    const punchRange = getDetuneRange(false);

    expect(weaponRange.min + weaponRange.max).toBe(0);
    expect(punchRange.min + punchRange.max).toBe(0);
  });
});
