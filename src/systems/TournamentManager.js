import { CHARACTERS } from '../config/characters.js';

const TOURNAMENT_STORAGE_KEY = 'ccw-tournament';

/**
 * Manages tournament bracket state and progression
 */
export default class TournamentManager {
  static SIZES = [4, 8];

  /**
   * Create a new tournament bracket
   * @param {number} size - Number of participants (4 or 8)
   * @param {string} playerCharacter - Player's selected character key
   * @returns {object} Tournament state
   */
  static create(size, playerCharacter) {
    if (!TournamentManager.SIZES.includes(size)) {
      throw new Error(`Invalid tournament size: ${size}`);
    }

    // Get all character keys
    const allChars = Object.keys(CHARACTERS);

    // Build participant list starting with player
    const participants = [playerCharacter];

    // Fill with random characters
    const available = allChars.filter(c => c !== playerCharacter);
    while (participants.length < size && available.length > 0) {
      const idx = Math.floor(Math.random() * available.length);
      participants.push(available.splice(idx, 1)[0]);
    }

    // If we still need more, allow duplicates
    while (participants.length < size) {
      const idx = Math.floor(Math.random() * allChars.length);
      participants.push(allChars[idx]);
    }

    // Shuffle participants (but keep player in a random position)
    TournamentManager.shuffle(participants);

    // Create bracket structure
    const rounds = Math.log2(size);
    const bracket = [];

    // First round matches
    const firstRound = [];
    for (let i = 0; i < size; i += 2) {
      firstRound.push({
        id: `R1M${i / 2 + 1}`,
        fighter1: participants[i],
        fighter2: participants[i + 1],
        winner: null,
        completed: false
      });
    }
    bracket.push(firstRound);

    // Create empty slots for subsequent rounds
    for (let r = 1; r < rounds; r++) {
      const roundMatches = [];
      const matchCount = size / Math.pow(2, r + 1);
      for (let m = 0; m < matchCount; m++) {
        roundMatches.push({
          id: `R${r + 1}M${m + 1}`,
          fighter1: null,
          fighter2: null,
          winner: null,
          completed: false
        });
      }
      bracket.push(roundMatches);
    }

    const tournament = {
      id: Date.now(),
      size,
      playerCharacter,
      bracket,
      currentRound: 0,
      currentMatch: 0,
      playerAlive: true,
      champion: null,
      completed: false,
      createdAt: new Date().toISOString()
    };

    TournamentManager.save(tournament);
    return tournament;
  }

  /**
   * Fisher-Yates shuffle
   */
  static shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Get the next match to be played
   * @param {object} tournament
   * @returns {object|null} Next match or null if tournament complete
   */
  static getNextMatch(tournament) {
    for (let r = 0; r < tournament.bracket.length; r++) {
      for (let m = 0; m < tournament.bracket[r].length; m++) {
        const match = tournament.bracket[r][m];
        if (!match.completed && match.fighter1 && match.fighter2) {
          return { round: r, matchIndex: m, match };
        }
      }
    }
    return null;
  }

  /**
   * Get the player's current match if they have one
   * @param {object} tournament
   * @returns {object|null}
   */
  static getPlayerMatch(tournament) {
    if (!tournament.playerAlive) return null;

    for (let r = 0; r < tournament.bracket.length; r++) {
      for (let m = 0; m < tournament.bracket[r].length; m++) {
        const match = tournament.bracket[r][m];
        if (!match.completed) {
          if (match.fighter1 === tournament.playerCharacter ||
              match.fighter2 === tournament.playerCharacter) {
            return { round: r, matchIndex: m, match };
          }
        }
      }
    }
    return null;
  }

  /**
   * Check if given match involves the player
   */
  static isPlayerMatch(match, playerCharacter) {
    return match.fighter1 === playerCharacter || match.fighter2 === playerCharacter;
  }

  /**
   * Record match result and advance bracket
   * @param {object} tournament
   * @param {number} round
   * @param {number} matchIndex
   * @param {string} winnerCharacter
   * @returns {object} Updated tournament
   */
  static recordResult(tournament, round, matchIndex, winnerCharacter) {
    const match = tournament.bracket[round][matchIndex];
    match.winner = winnerCharacter;
    match.completed = true;

    // Check if player was eliminated
    if (TournamentManager.isPlayerMatch(match, tournament.playerCharacter)) {
      if (winnerCharacter !== tournament.playerCharacter) {
        tournament.playerAlive = false;
      }
    }

    // Advance winner to next round
    if (round < tournament.bracket.length - 1) {
      const nextRound = tournament.bracket[round + 1];
      const nextMatchIndex = Math.floor(matchIndex / 2);
      const nextMatch = nextRound[nextMatchIndex];

      if (matchIndex % 2 === 0) {
        nextMatch.fighter1 = winnerCharacter;
      } else {
        nextMatch.fighter2 = winnerCharacter;
      }
    } else {
      // This was the final - tournament complete
      tournament.champion = winnerCharacter;
      tournament.completed = true;
    }

    TournamentManager.save(tournament);
    return tournament;
  }

  /**
   * Simulate a match between two AI fighters
   * @param {string} fighter1
   * @param {string} fighter2
   * @returns {string} Winner character key
   */
  static simulateMatch(fighter1, fighter2) {
    // Simple simulation based on random chance
    // Could be enhanced with character stats
    return Math.random() < 0.5 ? fighter1 : fighter2;
  }

  /**
   * Get round name
   */
  static getRoundName(tournament, roundIndex) {
    const totalRounds = tournament.bracket.length;
    const remaining = totalRounds - roundIndex;

    if (remaining === 1) return 'FINAL';
    if (remaining === 2) return 'SEMI-FINALS';
    if (remaining === 3) return 'QUARTER-FINALS';
    return `ROUND ${roundIndex + 1}`;
  }

  static save(tournament) {
    try {
      localStorage.setItem(TOURNAMENT_STORAGE_KEY, JSON.stringify(tournament));
    } catch (e) {
      console.warn('Failed to save tournament:', e);
    }
  }

  static load() {
    try {
      const saved = localStorage.getItem(TOURNAMENT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load tournament:', e);
    }
    return null;
  }

  static clear() {
    localStorage.removeItem(TOURNAMENT_STORAGE_KEY);
  }
}
