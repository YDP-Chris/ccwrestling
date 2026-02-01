/**
 * Manages career mode progression, storylines, and rivalries
 */

// PPV Events in order
const PPV_EVENTS = [
  { name: 'HARDCORE HAVOC', description: 'Where legends are born' },
  { name: 'BLOOD & GUTS', description: 'No rules, no mercy' },
  { name: 'TABLES ON FIRE', description: 'Everything burns' },
  { name: 'CHAIR SHOT CITY', description: 'Steel meets skull' },
  { name: 'DEATHMATCH DESTINY', description: 'The ultimate test' },
  { name: 'CARNAGE CROWN', description: 'Championship glory' }
];

// Story chapters
const STORY_CHAPTERS = [
  {
    id: 'rookie',
    name: 'The Rookie',
    description: 'Prove yourself in the underground scene',
    matches: 3,
    ppv: 'HARDCORE HAVOC',
    events: [
      { type: 'promo', text: 'Welcome to CCW, rookie. Think you got what it takes?', speaker: 'MANAGER' },
      { type: 'rivalry_start', rival: 'SCAR', reason: 'Scar sees you as an easy target' },
      { type: 'promo', text: 'You want to make it here? First you gotta go through ME.', speaker: 'SCAR' }
    ]
  },
  {
    id: 'rising',
    name: 'Rising Through Ranks',
    description: 'Build your reputation with blood and sweat',
    matches: 4,
    ppv: 'BLOOD & GUTS',
    events: [
      { type: 'promo', text: 'People are starting to notice you...', speaker: 'MANAGER' },
      { type: 'rivalry_end', rival: 'SCAR', result: 'You\'ve proven yourself against Scar' },
      { type: 'rivalry_start', rival: 'TANK', reason: 'Tank doesn\'t like the new competition' },
      { type: 'promo', text: 'You think you\'re tough? I\'ll break you in half!', speaker: 'TANK' }
    ]
  },
  {
    id: 'contender',
    name: 'Title Contender',
    description: 'Fight for your shot at the championship',
    matches: 4,
    ppv: 'TABLES ON FIRE',
    events: [
      { type: 'promo', text: 'You want the title? Earn it!', speaker: 'CHAMPION' },
      { type: 'betrayal', by: 'VIPER', reason: 'Viper attacks you after a match' },
      { type: 'rivalry_start', rival: 'VIPER', reason: 'Viper wants to keep you from the title' }
    ]
  },
  {
    id: 'revenge',
    name: 'Revenge Tour',
    description: 'Make everyone pay who stood in your way',
    matches: 3,
    ppv: 'CHAIR SHOT CITY',
    events: [
      { type: 'promo', text: 'Now they all fear you...', speaker: 'MANAGER' },
      { type: 'rivalry_end', rival: 'VIPER', result: 'Viper has been defeated' },
      { type: 'promo', text: 'The championship match is set!', speaker: 'ANNOUNCER' }
    ]
  },
  {
    id: 'championship',
    name: 'Championship Glory',
    description: 'The ultimate prize awaits',
    matches: 2,
    ppv: 'CARNAGE CROWN',
    events: [
      { type: 'promo', text: 'This is it. Everything you\'ve worked for.', speaker: 'MANAGER' },
      { type: 'rivalry_start', rival: 'BLAZE', reason: 'The champion stands in your way' },
      { type: 'promo', text: 'You\'ll never take this from me!', speaker: 'BLAZE' }
    ]
  }
];

// Match types that can be generated
const MATCH_TYPES = [
  { type: 'standard', name: 'Singles Match', modifier: 1 },
  { type: 'hardcore', name: 'Hardcore Match', modifier: 1.2 },
  { type: 'tables', name: 'Tables Match', modifier: 1.3 },
  { type: 'inferno', name: 'Inferno Match', modifier: 1.5 }
];

export default class CareerManager {
  static STORAGE_KEY = 'ccw-career';

  static getDefaultCareer() {
    return {
      playerCharacter: null,
      currentChapter: 0,
      matchesCompleted: 0,
      wins: 0,
      losses: 0,
      currentRival: null,
      eventsTriggered: [],
      isChampion: false,
      titleDefenses: 0,
      reputation: 0, // 0-100
      upcomingMatch: null,
      storyProgress: []
    };
  }

  static load() {
    try {
      const saved = localStorage.getItem(CareerManager.STORAGE_KEY);
      if (saved) {
        return { ...CareerManager.getDefaultCareer(), ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load career:', e);
    }
    return null; // Return null if no career exists
  }

  static save(career) {
    try {
      localStorage.setItem(CareerManager.STORAGE_KEY, JSON.stringify(career));
    } catch (e) {
      console.warn('Failed to save career:', e);
    }
  }

  static startNewCareer(playerCharacter) {
    const career = CareerManager.getDefaultCareer();
    career.playerCharacter = playerCharacter;
    career.upcomingMatch = CareerManager.generateNextMatch(career);
    CareerManager.save(career);
    return career;
  }

  static deleteCareer() {
    localStorage.removeItem(CareerManager.STORAGE_KEY);
  }

  static getCurrentChapter(career) {
    if (career.currentChapter >= STORY_CHAPTERS.length) {
      return null; // Career complete
    }
    return STORY_CHAPTERS[career.currentChapter];
  }

  static getCurrentPPV(career) {
    const chapter = CareerManager.getCurrentChapter(career);
    if (!chapter) return PPV_EVENTS[PPV_EVENTS.length - 1];
    return PPV_EVENTS.find(p => p.name === chapter.ppv) || PPV_EVENTS[0];
  }

  static generateNextMatch(career) {
    const chapter = CareerManager.getCurrentChapter(career);
    if (!chapter) {
      // Post-championship - random title defenses
      return {
        opponent: CareerManager.getRandomOpponent(career.playerCharacter),
        type: MATCH_TYPES[Math.floor(Math.random() * MATCH_TYPES.length)],
        isTitleMatch: true,
        isMainEvent: true
      };
    }

    // Check if it's time for PPV
    const matchesInChapter = career.matchesCompleted % chapter.matches;
    const isPPV = matchesInChapter === chapter.matches - 1;

    // Determine opponent
    let opponent;
    if (isPPV && career.currentRival) {
      opponent = career.currentRival;
    } else {
      opponent = CareerManager.getRandomOpponent(career.playerCharacter, career.currentRival);
    }

    // Determine match type
    const typeIndex = Math.min(Math.floor(career.reputation / 25), MATCH_TYPES.length - 1);
    const matchType = isPPV
      ? MATCH_TYPES[Math.min(typeIndex + 1, MATCH_TYPES.length - 1)]
      : MATCH_TYPES[Math.floor(Math.random() * (typeIndex + 1))];

    return {
      opponent,
      type: matchType,
      isPPV,
      ppvName: isPPV ? chapter.ppv : null,
      isTitleMatch: career.currentChapter >= 4 && isPPV,
      isMainEvent: isPPV
    };
  }

  static getRandomOpponent(playerCharacter, excludeRival = null) {
    const opponents = ['DUMPSTER', 'SCAR', 'BLAZE', 'TANK', 'VIPER']
      .filter(c => c !== playerCharacter && c !== excludeRival);
    return opponents[Math.floor(Math.random() * opponents.length)];
  }

  static recordMatchResult(career, won) {
    if (won) {
      career.wins++;
      career.reputation = Math.min(100, career.reputation + 10);
    } else {
      career.losses++;
      career.reputation = Math.max(0, career.reputation - 5);
    }

    career.matchesCompleted++;

    // Check for chapter completion
    const chapter = CareerManager.getCurrentChapter(career);
    if (chapter) {
      const matchesInChapter = career.matchesCompleted;
      const totalChapterMatches = STORY_CHAPTERS.slice(0, career.currentChapter + 1)
        .reduce((sum, ch) => sum + ch.matches, 0);

      if (matchesInChapter >= totalChapterMatches && won) {
        // Move to next chapter
        career.currentChapter++;

        // Process chapter events
        const nextChapter = CareerManager.getCurrentChapter(career);
        if (nextChapter) {
          career.storyProgress.push({
            chapter: nextChapter.id,
            timestamp: Date.now()
          });

          // Set new rival if specified
          const rivalEvent = nextChapter.events.find(e => e.type === 'rivalry_start');
          if (rivalEvent) {
            career.currentRival = rivalEvent.rival;
          }
        }
      }
    }

    // Check for championship
    if (career.currentChapter >= STORY_CHAPTERS.length && won && career.upcomingMatch?.isTitleMatch) {
      if (!career.isChampion) {
        career.isChampion = true;
      } else {
        career.titleDefenses++;
      }
    }

    // Generate next match
    career.upcomingMatch = CareerManager.generateNextMatch(career);

    CareerManager.save(career);
    return career;
  }

  static getPendingStoryEvents(career) {
    const chapter = CareerManager.getCurrentChapter(career);
    if (!chapter) return [];

    return chapter.events.filter(event => {
      const eventId = `${chapter.id}-${event.type}-${event.speaker || event.rival || ''}`;
      return !career.eventsTriggered.includes(eventId);
    });
  }

  static markEventTriggered(career, event) {
    const chapter = CareerManager.getCurrentChapter(career);
    if (!chapter) return;

    const eventId = `${chapter.id}-${event.type}-${event.speaker || event.rival || ''}`;
    if (!career.eventsTriggered.includes(eventId)) {
      career.eventsTriggered.push(eventId);
      CareerManager.save(career);
    }
  }

  static getCareerStats(career) {
    return {
      totalMatches: career.wins + career.losses,
      wins: career.wins,
      losses: career.losses,
      winRate: career.wins + career.losses > 0
        ? Math.round((career.wins / (career.wins + career.losses)) * 100)
        : 0,
      reputation: career.reputation,
      isChampion: career.isChampion,
      titleDefenses: career.titleDefenses,
      currentChapter: career.currentChapter + 1,
      totalChapters: STORY_CHAPTERS.length
    };
  }
}

export { PPV_EVENTS, STORY_CHAPTERS, MATCH_TYPES };
