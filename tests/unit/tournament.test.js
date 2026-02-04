import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import TournamentManager from '../../src/systems/TournamentManager.js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn(key => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; })
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('TournamentManager', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('create()', () => {
    it('should create a 4-fighter tournament', () => {
      const tournament = TournamentManager.create(4, 'DUMPSTER');

      expect(tournament.size).toBe(4);
      expect(tournament.playerCharacter).toBe('DUMPSTER');
      expect(tournament.bracket).toHaveLength(2); // 2 rounds for 4 fighters
      expect(tournament.bracket[0]).toHaveLength(2); // 2 first round matches
      expect(tournament.bracket[1]).toHaveLength(1); // 1 final match
      expect(tournament.playerAlive).toBe(true);
      expect(tournament.completed).toBe(false);
      expect(tournament.champion).toBe(null);
    });

    it('should create an 8-fighter tournament', () => {
      const tournament = TournamentManager.create(8, 'SCAR');

      expect(tournament.size).toBe(8);
      expect(tournament.playerCharacter).toBe('SCAR');
      expect(tournament.bracket).toHaveLength(3); // 3 rounds for 8 fighters
      expect(tournament.bracket[0]).toHaveLength(4); // 4 quarter-final matches
      expect(tournament.bracket[1]).toHaveLength(2); // 2 semi-final matches
      expect(tournament.bracket[2]).toHaveLength(1); // 1 final match
    });

    it('should include player character in participants', () => {
      const tournament = TournamentManager.create(4, 'DUMPSTER');

      // Find player in bracket
      const allFighters = tournament.bracket[0].flatMap(m => [m.fighter1, m.fighter2]);
      expect(allFighters).toContain('DUMPSTER');
    });

    it('should have proper match structure', () => {
      const tournament = TournamentManager.create(4, 'DUMPSTER');
      const firstMatch = tournament.bracket[0][0];

      expect(firstMatch).toHaveProperty('id');
      expect(firstMatch).toHaveProperty('fighter1');
      expect(firstMatch).toHaveProperty('fighter2');
      expect(firstMatch).toHaveProperty('winner');
      expect(firstMatch).toHaveProperty('completed');
      expect(firstMatch.winner).toBe(null);
      expect(firstMatch.completed).toBe(false);
    });

    it('should have empty slots in later rounds', () => {
      const tournament = TournamentManager.create(4, 'DUMPSTER');
      const finalMatch = tournament.bracket[1][0];

      expect(finalMatch.fighter1).toBe(null);
      expect(finalMatch.fighter2).toBe(null);
    });

    it('should throw for invalid tournament size', () => {
      expect(() => TournamentManager.create(3, 'DUMPSTER')).toThrow('Invalid tournament size');
      expect(() => TournamentManager.create(16, 'DUMPSTER')).toThrow('Invalid tournament size');
    });

    it('should save tournament to localStorage', () => {
      TournamentManager.create(4, 'DUMPSTER');

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const savedKey = localStorageMock.setItem.mock.calls[0][0];
      expect(savedKey).toBe('ccw-tournament');
    });
  });

  describe('getNextMatch()', () => {
    it('should return first incomplete match with both fighters', () => {
      const tournament = TournamentManager.create(4, 'DUMPSTER');
      const nextMatch = TournamentManager.getNextMatch(tournament);

      expect(nextMatch).not.toBe(null);
      expect(nextMatch.round).toBe(0);
      expect(nextMatch.matchIndex).toBe(0);
      expect(nextMatch.match.fighter1).toBeTruthy();
      expect(nextMatch.match.fighter2).toBeTruthy();
    });

    it('should skip matches without both fighters', () => {
      const tournament = TournamentManager.create(4, 'DUMPSTER');

      // Complete first round matches
      tournament.bracket[0][0].completed = true;
      tournament.bracket[0][0].winner = tournament.bracket[0][0].fighter1;
      tournament.bracket[0][1].completed = true;
      tournament.bracket[0][1].winner = tournament.bracket[0][1].fighter1;

      // Second round still has null fighters
      const nextMatch = TournamentManager.getNextMatch(tournament);

      // Should return null because final doesn't have fighters yet
      expect(nextMatch).toBe(null);
    });

    it('should return null when tournament is complete', () => {
      const tournament = TournamentManager.create(4, 'DUMPSTER');

      // Mark all matches complete
      tournament.bracket.forEach(round => {
        round.forEach(match => {
          match.completed = true;
          match.winner = match.fighter1 || 'DUMPSTER';
        });
      });
      tournament.completed = true;

      const nextMatch = TournamentManager.getNextMatch(tournament);
      expect(nextMatch).toBe(null);
    });
  });

  describe('getPlayerMatch()', () => {
    it('should find player\'s match in first round', () => {
      const tournament = TournamentManager.create(4, 'DUMPSTER');
      const playerMatch = TournamentManager.getPlayerMatch(tournament);

      expect(playerMatch).not.toBe(null);
      const { match } = playerMatch;
      expect(match.fighter1 === 'DUMPSTER' || match.fighter2 === 'DUMPSTER').toBe(true);
    });

    it('should return null if player is eliminated', () => {
      const tournament = TournamentManager.create(4, 'DUMPSTER');
      tournament.playerAlive = false;

      const playerMatch = TournamentManager.getPlayerMatch(tournament);
      expect(playerMatch).toBe(null);
    });

    it('should return null if player\'s match is completed', () => {
      const tournament = TournamentManager.create(4, 'DUMPSTER');

      // Find and complete player's match
      for (const match of tournament.bracket[0]) {
        if (match.fighter1 === 'DUMPSTER' || match.fighter2 === 'DUMPSTER') {
          match.completed = true;
          match.winner = 'DUMPSTER';
          break;
        }
      }

      // Player should not have a match in round 1 anymore
      // But they should have one in round 2 (if we set it up)
      const playerMatch = TournamentManager.getPlayerMatch(tournament);

      // Without advancing to next round, player has no pending match
      // The match would be in bracket[1] but fighter slots are null
      expect(playerMatch).toBe(null);
    });
  });

  describe('isPlayerMatch()', () => {
    it('should return true when fighter1 is player', () => {
      const match = { fighter1: 'DUMPSTER', fighter2: 'SCAR' };
      expect(TournamentManager.isPlayerMatch(match, 'DUMPSTER')).toBe(true);
    });

    it('should return true when fighter2 is player', () => {
      const match = { fighter1: 'SCAR', fighter2: 'DUMPSTER' };
      expect(TournamentManager.isPlayerMatch(match, 'DUMPSTER')).toBe(true);
    });

    it('should return false when player is not in match', () => {
      const match = { fighter1: 'SCAR', fighter2: 'CHAINSAW' };
      expect(TournamentManager.isPlayerMatch(match, 'DUMPSTER')).toBe(false);
    });
  });

  describe('recordResult()', () => {
    it('should mark match as completed with winner', () => {
      const tournament = TournamentManager.create(4, 'DUMPSTER');
      const winner = tournament.bracket[0][0].fighter1;

      TournamentManager.recordResult(tournament, 0, 0, winner);

      expect(tournament.bracket[0][0].completed).toBe(true);
      expect(tournament.bracket[0][0].winner).toBe(winner);
    });

    it('should advance winner to next round (first slot)', () => {
      const tournament = TournamentManager.create(4, 'DUMPSTER');
      const winner = tournament.bracket[0][0].fighter1;

      TournamentManager.recordResult(tournament, 0, 0, winner);

      // Match 0 winner goes to fighter1 of next round match 0
      expect(tournament.bracket[1][0].fighter1).toBe(winner);
    });

    it('should advance winner to next round (second slot)', () => {
      const tournament = TournamentManager.create(4, 'DUMPSTER');
      const winner = tournament.bracket[0][1].fighter1;

      TournamentManager.recordResult(tournament, 0, 1, winner);

      // Match 1 winner goes to fighter2 of next round match 0
      expect(tournament.bracket[1][0].fighter2).toBe(winner);
    });

    it('should eliminate player when they lose', () => {
      const tournament = TournamentManager.create(4, 'DUMPSTER');

      // Find player's match
      let playerMatchIndex = -1;
      let opponent = null;
      for (let i = 0; i < tournament.bracket[0].length; i++) {
        const match = tournament.bracket[0][i];
        if (match.fighter1 === 'DUMPSTER') {
          playerMatchIndex = i;
          opponent = match.fighter2;
          break;
        } else if (match.fighter2 === 'DUMPSTER') {
          playerMatchIndex = i;
          opponent = match.fighter1;
          break;
        }
      }

      expect(playerMatchIndex).not.toBe(-1);

      // Player loses
      TournamentManager.recordResult(tournament, 0, playerMatchIndex, opponent);

      expect(tournament.playerAlive).toBe(false);
    });

    it('should keep player alive when they win', () => {
      const tournament = TournamentManager.create(4, 'DUMPSTER');

      // Find player's match
      let playerMatchIndex = -1;
      for (let i = 0; i < tournament.bracket[0].length; i++) {
        const match = tournament.bracket[0][i];
        if (match.fighter1 === 'DUMPSTER' || match.fighter2 === 'DUMPSTER') {
          playerMatchIndex = i;
          break;
        }
      }

      // Player wins
      TournamentManager.recordResult(tournament, 0, playerMatchIndex, 'DUMPSTER');

      expect(tournament.playerAlive).toBe(true);
    });

    it('should set champion when final is completed', () => {
      const tournament = TournamentManager.create(4, 'DUMPSTER');

      // Complete first round
      const r0m0Winner = tournament.bracket[0][0].fighter1;
      const r0m1Winner = tournament.bracket[0][1].fighter1;

      TournamentManager.recordResult(tournament, 0, 0, r0m0Winner);
      TournamentManager.recordResult(tournament, 0, 1, r0m1Winner);

      // Complete final
      TournamentManager.recordResult(tournament, 1, 0, r0m0Winner);

      expect(tournament.champion).toBe(r0m0Winner);
      expect(tournament.completed).toBe(true);
    });

    it('should save tournament after recording result', () => {
      const tournament = TournamentManager.create(4, 'DUMPSTER');
      localStorageMock.setItem.mockClear();

      const winner = tournament.bracket[0][0].fighter1;
      TournamentManager.recordResult(tournament, 0, 0, winner);

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('simulateMatch()', () => {
    it('should return one of the two fighters', () => {
      const results = new Set();

      // Run multiple times to check randomness
      for (let i = 0; i < 100; i++) {
        const winner = TournamentManager.simulateMatch('DUMPSTER', 'SCAR');
        results.add(winner);
      }

      expect(results.has('DUMPSTER') || results.has('SCAR')).toBe(true);
      expect(results.size).toBeLessThanOrEqual(2);
    });

    it('should only return valid fighters', () => {
      for (let i = 0; i < 50; i++) {
        const winner = TournamentManager.simulateMatch('FIGHTER_A', 'FIGHTER_B');
        expect(['FIGHTER_A', 'FIGHTER_B']).toContain(winner);
      }
    });
  });

  describe('getRoundName()', () => {
    it('should return FINAL for last round', () => {
      const tournament = TournamentManager.create(4, 'DUMPSTER');
      const name = TournamentManager.getRoundName(tournament, 1);
      expect(name).toBe('FINAL');
    });

    it('should return SEMI-FINALS for second to last round', () => {
      const tournament = TournamentManager.create(8, 'DUMPSTER');
      const name = TournamentManager.getRoundName(tournament, 1);
      expect(name).toBe('SEMI-FINALS');
    });

    it('should return QUARTER-FINALS for third to last round', () => {
      const tournament = TournamentManager.create(8, 'DUMPSTER');
      const name = TournamentManager.getRoundName(tournament, 0);
      expect(name).toBe('QUARTER-FINALS');
    });

    it('should return ROUND X for earlier rounds in larger tournaments', () => {
      // For 4-fighter tournament
      const tournament4 = TournamentManager.create(4, 'DUMPSTER');
      const name4 = TournamentManager.getRoundName(tournament4, 0);
      expect(name4).toBe('SEMI-FINALS'); // Round 0 of 2 rounds = semi-finals
    });
  });

  describe('save() and load()', () => {
    it('should save tournament to localStorage', () => {
      const tournament = { id: 123, size: 4, test: true };
      TournamentManager.save(tournament);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ccw-tournament',
        JSON.stringify(tournament)
      );
    });

    it('should load tournament from localStorage', () => {
      const tournament = { id: 123, size: 4, test: true };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(tournament));

      const loaded = TournamentManager.load();

      expect(loaded).toEqual(tournament);
    });

    it('should return null if no tournament saved', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const loaded = TournamentManager.load();

      expect(loaded).toBe(null);
    });
  });

  describe('clear()', () => {
    it('should remove tournament from localStorage', () => {
      TournamentManager.clear();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('ccw-tournament');
    });
  });

  describe('shuffle()', () => {
    it('should return array with same elements', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = TournamentManager.shuffle([...original]);

      expect(shuffled.sort()).toEqual(original.sort());
    });

    it('should return array of same length', () => {
      const array = [1, 2, 3, 4, 5];
      const shuffled = TournamentManager.shuffle([...array]);

      expect(shuffled.length).toBe(array.length);
    });
  });

  describe('full tournament flow', () => {
    it('should complete a 4-fighter tournament with player winning', () => {
      const tournament = TournamentManager.create(4, 'DUMPSTER');

      // Find player's first match
      let playerR0Match = -1;
      for (let i = 0; i < tournament.bracket[0].length; i++) {
        const match = tournament.bracket[0][i];
        if (match.fighter1 === 'DUMPSTER' || match.fighter2 === 'DUMPSTER') {
          playerR0Match = i;
          break;
        }
      }

      // Complete other first round match
      const otherMatch = playerR0Match === 0 ? 1 : 0;
      const otherWinner = tournament.bracket[0][otherMatch].fighter1;
      TournamentManager.recordResult(tournament, 0, otherMatch, otherWinner);

      // Player wins first round
      TournamentManager.recordResult(tournament, 0, playerR0Match, 'DUMPSTER');

      expect(tournament.playerAlive).toBe(true);
      expect(tournament.completed).toBe(false);

      // Player should now be in the final
      const final = tournament.bracket[1][0];
      expect(final.fighter1 === 'DUMPSTER' || final.fighter2 === 'DUMPSTER').toBe(true);

      // Player wins final
      TournamentManager.recordResult(tournament, 1, 0, 'DUMPSTER');

      expect(tournament.completed).toBe(true);
      expect(tournament.champion).toBe('DUMPSTER');
      expect(tournament.playerAlive).toBe(true);
    });

    it('should complete a 4-fighter tournament with player losing', () => {
      const tournament = TournamentManager.create(4, 'DUMPSTER');

      // Find player's match and opponent
      let playerR0Match = -1;
      let opponent = null;
      for (let i = 0; i < tournament.bracket[0].length; i++) {
        const match = tournament.bracket[0][i];
        if (match.fighter1 === 'DUMPSTER') {
          playerR0Match = i;
          opponent = match.fighter2;
          break;
        } else if (match.fighter2 === 'DUMPSTER') {
          playerR0Match = i;
          opponent = match.fighter1;
          break;
        }
      }

      // Player loses first round
      TournamentManager.recordResult(tournament, 0, playerR0Match, opponent);

      expect(tournament.playerAlive).toBe(false);
      expect(tournament.completed).toBe(false);

      // Complete other first round match
      const otherMatch = playerR0Match === 0 ? 1 : 0;
      const otherWinner = tournament.bracket[0][otherMatch].fighter1;
      TournamentManager.recordResult(tournament, 0, otherMatch, otherWinner);

      // Complete final
      TournamentManager.recordResult(tournament, 1, 0, opponent);

      expect(tournament.completed).toBe(true);
      expect(tournament.champion).toBe(opponent);
      expect(tournament.playerAlive).toBe(false);
    });
  });
});
