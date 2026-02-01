/**
 * Manages player statistics and records
 * Persists to localStorage
 */
export default class StatsManager {
  static STORAGE_KEY = 'ccw-player-stats';

  static getDefaultStats() {
    return {
      totalMatches: 0,
      totalWins: 0,
      totalLosses: 0,
      totalKOs: 0,
      longestWinStreak: 0,
      currentWinStreak: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      favoriteCharacter: null,
      characterStats: {},
      modeStats: {
        quick: { wins: 0, losses: 0 },
        arcade: { wins: 0, losses: 0, bestProgress: 0 },
        survival: { wins: 0, losses: 0, bestStreak: 0 },
        practice: { sessions: 0 }
      },
      achievements: [],
      lastPlayed: null
    };
  }

  static load() {
    try {
      const saved = localStorage.getItem(StatsManager.STORAGE_KEY);
      if (saved) {
        const stats = JSON.parse(saved);
        // Merge with defaults to handle new fields
        return { ...StatsManager.getDefaultStats(), ...stats };
      }
    } catch (e) {
      console.warn('Failed to load stats:', e);
    }
    return StatsManager.getDefaultStats();
  }

  static save(stats) {
    try {
      stats.lastPlayed = new Date().toISOString();
      localStorage.setItem(StatsManager.STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('Failed to save stats:', e);
    }
  }

  static recordMatch(result) {
    const stats = StatsManager.load();
    const {
      playerWon,
      playerCharacter,
      opponentCharacter,
      mode,
      wasKO,
      damageDealt,
      damageTaken,
      arcadeProgress,
      survivalStreak
    } = result;

    // Update totals
    stats.totalMatches++;
    if (playerWon) {
      stats.totalWins++;
      stats.currentWinStreak++;
      if (stats.currentWinStreak > stats.longestWinStreak) {
        stats.longestWinStreak = stats.currentWinStreak;
      }
    } else {
      stats.totalLosses++;
      stats.currentWinStreak = 0;
    }

    if (wasKO) {
      stats.totalKOs++;
    }

    stats.totalDamageDealt += damageDealt || 0;
    stats.totalDamageTaken += damageTaken || 0;

    // Update character stats
    if (!stats.characterStats[playerCharacter]) {
      stats.characterStats[playerCharacter] = {
        matches: 0,
        wins: 0,
        losses: 0,
        kos: 0
      };
    }
    const charStats = stats.characterStats[playerCharacter];
    charStats.matches++;
    if (playerWon) {
      charStats.wins++;
    } else {
      charStats.losses++;
    }
    if (wasKO && playerWon) {
      charStats.kos++;
    }

    // Update favorite character
    let maxMatches = 0;
    for (const [char, data] of Object.entries(stats.characterStats)) {
      if (data.matches > maxMatches) {
        maxMatches = data.matches;
        stats.favoriteCharacter = char;
      }
    }

    // Update mode stats
    if (mode && stats.modeStats[mode]) {
      if (playerWon) {
        stats.modeStats[mode].wins++;
      } else {
        stats.modeStats[mode].losses++;
      }

      if (mode === 'arcade' && arcadeProgress) {
        if (arcadeProgress > (stats.modeStats.arcade.bestProgress || 0)) {
          stats.modeStats.arcade.bestProgress = arcadeProgress;
        }
      }

      if (mode === 'survival' && survivalStreak) {
        if (survivalStreak > (stats.modeStats.survival.bestStreak || 0)) {
          stats.modeStats.survival.bestStreak = survivalStreak;
        }
      }
    }

    // Check achievements
    StatsManager.checkAchievements(stats);

    // Save
    StatsManager.save(stats);

    return stats;
  }

  static recordPracticeSession() {
    const stats = StatsManager.load();
    stats.modeStats.practice.sessions++;
    StatsManager.save(stats);
  }

  static checkAchievements(stats) {
    const achievements = stats.achievements || [];

    const newAchievements = [];

    // First Win
    if (stats.totalWins >= 1 && !achievements.includes('first_win')) {
      achievements.push('first_win');
      newAchievements.push({ id: 'first_win', name: 'First Blood', desc: 'Win your first match' });
    }

    // 10 Wins
    if (stats.totalWins >= 10 && !achievements.includes('ten_wins')) {
      achievements.push('ten_wins');
      newAchievements.push({ id: 'ten_wins', name: 'Rising Star', desc: 'Win 10 matches' });
    }

    // 50 Wins
    if (stats.totalWins >= 50 && !achievements.includes('fifty_wins')) {
      achievements.push('fifty_wins');
      newAchievements.push({ id: 'fifty_wins', name: 'Veteran', desc: 'Win 50 matches' });
    }

    // 5 Win Streak
    if (stats.longestWinStreak >= 5 && !achievements.includes('five_streak')) {
      achievements.push('five_streak');
      newAchievements.push({ id: 'five_streak', name: 'On Fire', desc: 'Win 5 matches in a row' });
    }

    // 10 Win Streak
    if (stats.longestWinStreak >= 10 && !achievements.includes('ten_streak')) {
      achievements.push('ten_streak');
      newAchievements.push({ id: 'ten_streak', name: 'Unstoppable', desc: 'Win 10 matches in a row' });
    }

    // 10 KOs
    if (stats.totalKOs >= 10 && !achievements.includes('ten_kos')) {
      achievements.push('ten_kos');
      newAchievements.push({ id: 'ten_kos', name: 'Knockout Artist', desc: 'Get 10 KOs' });
    }

    // Try all characters
    if (Object.keys(stats.characterStats).length >= 4 && !achievements.includes('try_all')) {
      achievements.push('try_all');
      newAchievements.push({ id: 'try_all', name: 'Roster Explorer', desc: 'Play with all characters' });
    }

    stats.achievements = achievements;

    return newAchievements;
  }

  static getWinRate() {
    const stats = StatsManager.load();
    if (stats.totalMatches === 0) return 0;
    return Math.round((stats.totalWins / stats.totalMatches) * 100);
  }

  static getCharacterWinRate(character) {
    const stats = StatsManager.load();
    const charStats = stats.characterStats[character];
    if (!charStats || charStats.matches === 0) return 0;
    return Math.round((charStats.wins / charStats.matches) * 100);
  }

  static reset() {
    localStorage.removeItem(StatsManager.STORAGE_KEY);
  }
}
