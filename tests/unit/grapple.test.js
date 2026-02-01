import { describe, it, expect, beforeEach } from 'vitest';
import { GrappleLogic } from '../../src/systems/GrappleLogic.js';
import { GRAPPLE, FIGHTER_STATES } from '../../src/config/constants.js';

describe('GrappleLogic', () => {
  describe('canInitiateGrapple', () => {
    it('should allow grapple when idle and no weapon', () => {
      expect(GrappleLogic.canInitiateGrapple(FIGHTER_STATES.IDLE, false)).toBe(true);
    });

    it('should allow grapple when walking and no weapon', () => {
      expect(GrappleLogic.canInitiateGrapple(FIGHTER_STATES.WALKING, false)).toBe(true);
    });

    it('should NOT allow grapple when holding a weapon', () => {
      expect(GrappleLogic.canInitiateGrapple(FIGHTER_STATES.IDLE, true)).toBe(false);
    });

    it('should NOT allow grapple when attacking', () => {
      expect(GrappleLogic.canInitiateGrapple(FIGHTER_STATES.ATTACKING, false)).toBe(false);
    });

    it('should NOT allow grapple when in hitstun', () => {
      expect(GrappleLogic.canInitiateGrapple(FIGHTER_STATES.HITSTUN, false)).toBe(false);
    });

    it('should NOT allow grapple when down', () => {
      expect(GrappleLogic.canInitiateGrapple(FIGHTER_STATES.DOWN, false)).toBe(false);
    });

    it('should NOT allow grapple when already grappling', () => {
      expect(GrappleLogic.canInitiateGrapple(FIGHTER_STATES.GRAPPLING, false)).toBe(false);
    });

    it('should NOT allow grapple when KO', () => {
      expect(GrappleLogic.canInitiateGrapple(FIGHTER_STATES.KO, false)).toBe(false);
    });
  });

  describe('isInGrappleRange', () => {
    it('should return true when within range', () => {
      expect(GrappleLogic.isInGrappleRange(100, 200, 150, 200)).toBe(true);
    });

    it('should return true at exact range boundary', () => {
      expect(GrappleLogic.isInGrappleRange(0, 0, GRAPPLE.INITIATE_RANGE, 0)).toBe(true);
    });

    it('should return false when beyond range', () => {
      expect(GrappleLogic.isInGrappleRange(0, 0, GRAPPLE.INITIATE_RANGE + 1, 0)).toBe(false);
    });

    it('should calculate diagonal distance correctly', () => {
      // Distance should be sqrt(50^2 + 50^2) ≈ 70.7
      expect(GrappleLogic.isInGrappleRange(0, 0, 50, 50)).toBe(true);
      // Distance should be sqrt(60^2 + 60^2) ≈ 84.8 (beyond 80)
      expect(GrappleLogic.isInGrappleRange(0, 0, 60, 60)).toBe(false);
    });
  });

  describe('getDistance', () => {
    it('should calculate horizontal distance', () => {
      expect(GrappleLogic.getDistance(0, 0, 100, 0)).toBe(100);
    });

    it('should calculate vertical distance', () => {
      expect(GrappleLogic.getDistance(0, 0, 0, 50)).toBe(50);
    });

    it('should calculate diagonal distance (3-4-5 triangle)', () => {
      expect(GrappleLogic.getDistance(0, 0, 30, 40)).toBe(50);
    });

    it('should return 0 for same position', () => {
      expect(GrappleLogic.getDistance(100, 200, 100, 200)).toBe(0);
    });
  });

  describe('checkEscapeSuccess', () => {
    it('should fail with 0 mashes', () => {
      expect(GrappleLogic.checkEscapeSuccess(0)).toBe(false);
    });

    it('should fail with partial mashes', () => {
      expect(GrappleLogic.checkEscapeSuccess(GRAPPLE.ESCAPE_THRESHOLD - 2)).toBe(false);
    });

    it('should succeed at threshold - 1 (next mash succeeds)', () => {
      expect(GrappleLogic.checkEscapeSuccess(GRAPPLE.ESCAPE_THRESHOLD - 1)).toBe(true);
    });

    it('should succeed when already at threshold', () => {
      expect(GrappleLogic.checkEscapeSuccess(GRAPPLE.ESCAPE_THRESHOLD)).toBe(true);
    });
  });

  describe('getMoveDamage', () => {
    it('should return correct THROW damage', () => {
      expect(GrappleLogic.getMoveDamage('THROW')).toBe(GRAPPLE.DAMAGE.THROW);
    });

    it('should return correct BODY_SLAM damage', () => {
      expect(GrappleLogic.getMoveDamage('BODY_SLAM')).toBe(GRAPPLE.DAMAGE.BODY_SLAM);
    });

    it('should return correct SUPLEX damage', () => {
      expect(GrappleLogic.getMoveDamage('SUPLEX')).toBe(GRAPPLE.DAMAGE.SUPLEX);
    });

    it('should return correct DDT damage', () => {
      expect(GrappleLogic.getMoveDamage('DDT')).toBe(GRAPPLE.DAMAGE.DDT);
    });

    it('should return base THROW damage for unknown move', () => {
      expect(GrappleLogic.getMoveDamage('PILEDRIVER')).toBe(GRAPPLE.DAMAGE.THROW);
    });

    it('damage values should be in correct order (DDT > SUPLEX > BODY_SLAM > THROW)', () => {
      expect(GRAPPLE.DAMAGE.DDT).toBeGreaterThan(GRAPPLE.DAMAGE.SUPLEX);
      expect(GRAPPLE.DAMAGE.SUPLEX).toBeGreaterThan(GRAPPLE.DAMAGE.BODY_SLAM);
      expect(GRAPPLE.DAMAGE.BODY_SLAM).toBeGreaterThan(GRAPPLE.DAMAGE.THROW);
    });
  });

  describe('getMeterGain', () => {
    it('should return correct INITIATE meter gain', () => {
      expect(GrappleLogic.getMeterGain('INITIATE')).toBe(GRAPPLE.METER.INITIATE);
    });

    it('should return correct ESCAPE meter gain', () => {
      expect(GrappleLogic.getMeterGain('ESCAPE')).toBe(GRAPPLE.METER.ESCAPE);
    });

    it('should return correct THROW meter gain', () => {
      expect(GrappleLogic.getMeterGain('THROW')).toBe(GRAPPLE.METER.THROW);
    });

    it('should return correct THROWN meter gain', () => {
      expect(GrappleLogic.getMeterGain('THROWN')).toBe(GRAPPLE.METER.THROWN);
    });

    it('should return 0 for unknown action', () => {
      expect(GrappleLogic.getMeterGain('UNKNOWN')).toBe(0);
    });
  });

  describe('selectThrowMove', () => {
    it('should return one of the valid moves', () => {
      const moves = GrappleLogic.getAvailableMoves();
      const selected = GrappleLogic.selectThrowMove();
      expect(moves).toContain(selected);
    });

    it('should use seeded random for deterministic selection', () => {
      // Mock random that always returns 0
      const mockRandom0 = () => 0;
      expect(GrappleLogic.selectThrowMove(mockRandom0)).toBe('THROW');

      // Mock random that returns 0.25
      const mockRandom025 = () => 0.25;
      expect(GrappleLogic.selectThrowMove(mockRandom025)).toBe('BODY_SLAM');

      // Mock random that returns 0.5
      const mockRandom05 = () => 0.5;
      expect(GrappleLogic.selectThrowMove(mockRandom05)).toBe('SUPLEX');

      // Mock random that returns 0.75
      const mockRandom075 = () => 0.75;
      expect(GrappleLogic.selectThrowMove(mockRandom075)).toBe('DDT');
    });
  });

  describe('calculateFinalDamage', () => {
    it('should return base damage with default modifiers', () => {
      expect(GrappleLogic.calculateFinalDamage(20)).toBe(20);
    });

    it('should increase damage with high attack power', () => {
      expect(GrappleLogic.calculateFinalDamage(20, 1.1, 1.0)).toBe(22);
    });

    it('should decrease damage with high defense', () => {
      expect(GrappleLogic.calculateFinalDamage(20, 1.0, 1.1)).toBe(18);
    });

    it('should combine attack power and defense', () => {
      // 20 * 1.1 = 22, 22 / 1.1 ≈ 20
      expect(GrappleLogic.calculateFinalDamage(20, 1.1, 1.1)).toBe(20);
    });

    it('should round to integer', () => {
      expect(GrappleLogic.calculateFinalDamage(15, 1.1, 1.0)).toBe(17); // 16.5 rounded
    });
  });

  describe('shouldAutoExecute', () => {
    it('should NOT auto-execute immediately', () => {
      expect(GrappleLogic.shouldAutoExecute(1000, 1000)).toBe(false);
    });

    it('should NOT auto-execute before window expires', () => {
      expect(GrappleLogic.shouldAutoExecute(1000, 1000 + GRAPPLE.ESCAPE_WINDOW - 1)).toBe(false);
    });

    it('should auto-execute exactly at window expiry', () => {
      expect(GrappleLogic.shouldAutoExecute(1000, 1000 + GRAPPLE.ESCAPE_WINDOW)).toBe(true);
    });

    it('should auto-execute after window expires', () => {
      expect(GrappleLogic.shouldAutoExecute(1000, 1000 + GRAPPLE.ESCAPE_WINDOW + 500)).toBe(true);
    });
  });

  describe('isValidStateTransition', () => {
    it('should allow IDLE -> GRAPPLING', () => {
      expect(GrappleLogic.isValidStateTransition(FIGHTER_STATES.IDLE, FIGHTER_STATES.GRAPPLING)).toBe(true);
    });

    it('should allow IDLE -> GRAPPLED', () => {
      expect(GrappleLogic.isValidStateTransition(FIGHTER_STATES.IDLE, FIGHTER_STATES.GRAPPLED)).toBe(true);
    });

    it('should allow WALKING -> GRAPPLING', () => {
      expect(GrappleLogic.isValidStateTransition(FIGHTER_STATES.WALKING, FIGHTER_STATES.GRAPPLING)).toBe(true);
    });

    it('should allow GRAPPLING -> THROWING', () => {
      expect(GrappleLogic.isValidStateTransition(FIGHTER_STATES.GRAPPLING, FIGHTER_STATES.THROWING)).toBe(true);
    });

    it('should allow GRAPPLING -> IDLE (escape)', () => {
      expect(GrappleLogic.isValidStateTransition(FIGHTER_STATES.GRAPPLING, FIGHTER_STATES.IDLE)).toBe(true);
    });

    it('should allow GRAPPLED -> IDLE (escape)', () => {
      expect(GrappleLogic.isValidStateTransition(FIGHTER_STATES.GRAPPLED, FIGHTER_STATES.IDLE)).toBe(true);
    });

    it('should allow GRAPPLED -> DOWN (thrown)', () => {
      expect(GrappleLogic.isValidStateTransition(FIGHTER_STATES.GRAPPLED, FIGHTER_STATES.DOWN)).toBe(true);
    });

    it('should allow THROWING -> IDLE', () => {
      expect(GrappleLogic.isValidStateTransition(FIGHTER_STATES.THROWING, FIGHTER_STATES.IDLE)).toBe(true);
    });

    it('should NOT allow GRAPPLING -> GRAPPLED', () => {
      expect(GrappleLogic.isValidStateTransition(FIGHTER_STATES.GRAPPLING, FIGHTER_STATES.GRAPPLED)).toBe(false);
    });

    it('should NOT allow ATTACKING -> GRAPPLING', () => {
      expect(GrappleLogic.isValidStateTransition(FIGHTER_STATES.ATTACKING, FIGHTER_STATES.GRAPPLING)).toBe(false);
    });
  });

  describe('getAvailableMoves', () => {
    it('should return all four moves', () => {
      const moves = GrappleLogic.getAvailableMoves();
      expect(moves).toHaveLength(4);
      expect(moves).toContain('THROW');
      expect(moves).toContain('BODY_SLAM');
      expect(moves).toContain('SUPLEX');
      expect(moves).toContain('DDT');
    });
  });
});

describe('Grapple Constants', () => {
  it('should have reasonable INITIATE_RANGE', () => {
    expect(GRAPPLE.INITIATE_RANGE).toBeGreaterThan(40);
    expect(GRAPPLE.INITIATE_RANGE).toBeLessThan(150);
  });

  it('should require multiple mashes to escape', () => {
    expect(GRAPPLE.ESCAPE_THRESHOLD).toBeGreaterThan(1);
    expect(GRAPPLE.ESCAPE_THRESHOLD).toBeLessThan(20);
  });

  it('should have escape window between 1-5 seconds', () => {
    expect(GRAPPLE.ESCAPE_WINDOW).toBeGreaterThanOrEqual(1000);
    expect(GRAPPLE.ESCAPE_WINDOW).toBeLessThanOrEqual(5000);
  });

  it('should have damage values between fist and chair damage', () => {
    // Fist: 8-12, Chair: 22
    expect(GRAPPLE.DAMAGE.THROW).toBeGreaterThan(12);
    expect(GRAPPLE.DAMAGE.DDT).toBeLessThanOrEqual(22);
  });

  it('should have positive meter gains', () => {
    expect(GRAPPLE.METER.INITIATE).toBeGreaterThan(0);
    expect(GRAPPLE.METER.ESCAPE).toBeGreaterThan(0);
    expect(GRAPPLE.METER.THROW).toBeGreaterThan(0);
    expect(GRAPPLE.METER.THROWN).toBeGreaterThan(0);
  });
});
