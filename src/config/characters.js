import { HEALTH, MOVEMENT } from './constants.js';

// AI personality profiles for each character
export const AI_PROFILES = {
  DUMPSTER: {
    aggressiveness: 0.5,       // Methodical, not rushing
    thinkInterval: 600,        // Slower decision making
    attackCooldown: 1200,      // Deliberate attacks
    retreatHealthThreshold: 0.2, // Fights until badly hurt
    weights: {
      approach: 0.25,
      attack: 0.20,
      retreat: 0.10,
      seekWeapon: 0.25,        // Loves weapons
      seekTable: 0.10,
      grapple: 0.10
    },
    personality: 'brawler'      // Seeks weapons, trades hits
  },
  SCAR: {
    aggressiveness: 0.7,
    thinkInterval: 400,        // Quick decisions
    attackCooldown: 700,       // Fast attacks
    retreatHealthThreshold: 0.4, // Retreats early
    weights: {
      approach: 0.30,
      attack: 0.30,
      retreat: 0.20,           // Hit and run
      seekWeapon: 0.05,
      seekTable: 0.05,
      grapple: 0.10
    },
    personality: 'hitAndRun'    // Strike and back off
  },
  BLAZE: {
    aggressiveness: 0.9,       // Hyper aggressive
    thinkInterval: 300,        // Very fast decisions
    attackCooldown: 500,       // Rapid attacks
    retreatHealthThreshold: 0.15, // Never retreats
    weights: {
      approach: 0.40,
      attack: 0.40,
      retreat: 0.05,           // Rarely retreats
      seekWeapon: 0.05,
      seekTable: 0.05,
      grapple: 0.05
    },
    personality: 'rushdown'     // All offense, no defense
  },
  TANK: {
    aggressiveness: 0.6,
    thinkInterval: 700,        // Slow and steady
    attackCooldown: 1400,      // Heavy, slow attacks
    retreatHealthThreshold: 0.1, // Almost never retreats
    weights: {
      approach: 0.35,
      attack: 0.20,
      retreat: 0.05,           // Walks you down
      seekWeapon: 0.10,
      seekTable: 0.10,
      grapple: 0.20            // Grapple heavy
    },
    personality: 'grappler'     // Closes distance, grabs you
  },
  VIPER: {
    aggressiveness: 0.65,
    thinkInterval: 450,
    attackCooldown: 800,
    retreatHealthThreshold: 0.3,
    weights: {
      approach: 0.30,
      attack: 0.25,
      retreat: 0.15,
      seekWeapon: 0.10,
      seekTable: 0.10,
      grapple: 0.10
    },
    personality: 'adaptive'     // Balanced, reads opponent
  }
};

export const CHARACTERS = {
  DUMPSTER: {
    name: 'Dumpster',
    spriteKey: 'dumpster',
    health: HEALTH.MAX,
    speed: MOVEMENT.SPEED * 0.9, // Slower, more powerful
    width: 64,
    height: 64,
    hitboxWidth: 40,
    hitboxHeight: 56,
    hitboxOffsetX: 12,
    hitboxOffsetY: 4,
    attackPower: 1.1, // Hits harder
    defense: 1.1, // Takes less damage
    // Animation keys (prefix with spriteKey)
    animations: {
      idle: 'dumpster-idle',
      walk: 'dumpster-walk',
      punch: 'dumpster-punch',
      chair: 'dumpster-chair',
      hit: 'dumpster-hit',
      down: 'dumpster-down',
      getup: 'dumpster-getup',
      victory: 'dumpster-victory',
      // Grapple animations
      grapple: 'dumpster-grapple',
      grappled: 'dumpster-grappled',
      throw: 'dumpster-throw',
      throwSuplex: 'dumpster-throw-suplex',
      throwDdt: 'dumpster-throw-ddt',
      throwBodyslam: 'dumpster-throw-bodyslam'
    }
  },
  SCAR: {
    name: 'Scar',
    spriteKey: 'scar',
    health: HEALTH.MAX,
    speed: MOVEMENT.SPEED * 1.1, // Faster
    width: 64,
    height: 64,
    hitboxWidth: 36,
    hitboxHeight: 54,
    hitboxOffsetX: 14,
    hitboxOffsetY: 5,
    attackPower: 1.05, // Slight damage boost
    defense: 0.95, // Slightly fragile (was 0.9)
    animations: {
      idle: 'scar-idle',
      walk: 'scar-walk',
      punch: 'scar-punch',
      chair: 'scar-chair',
      hit: 'scar-hit',
      down: 'scar-down',
      getup: 'scar-getup',
      victory: 'scar-victory',
      // Grapple animations
      grapple: 'scar-grapple',
      grappled: 'scar-grappled',
      throw: 'scar-throw',
      throwSuplex: 'scar-throw-suplex',
      throwDdt: 'scar-throw-ddt',
      throwBodyslam: 'scar-throw-bodyslam'
    }
  },

  BLAZE: {
    name: 'Blaze',
    spriteKey: 'blaze',
    health: HEALTH.MAX * 0.9, // Glass cannon - less health (was 0.85)
    speed: MOVEMENT.SPEED * 1.2, // Very fast
    width: 64,
    height: 64,
    hitboxWidth: 34,
    hitboxHeight: 52,
    hitboxOffsetX: 15,
    hitboxOffsetY: 6,
    attackPower: 1.2, // High damage (was 1.25)
    defense: 0.8, // Takes more damage (was 0.75)
    animations: {
      idle: 'blaze-idle',
      walk: 'blaze-walk',
      punch: 'blaze-punch',
      chair: 'blaze-chair',
      hit: 'blaze-hit',
      down: 'blaze-down',
      getup: 'blaze-getup',
      victory: 'blaze-victory',
      grapple: 'blaze-grapple',
      grappled: 'blaze-grappled',
      throw: 'blaze-throw',
      throwSuplex: 'blaze-throw-suplex',
      throwDdt: 'blaze-throw-ddt',
      throwBodyslam: 'blaze-throw-bodyslam'
    }
  },

  TANK: {
    name: 'Tank',
    spriteKey: 'tank',
    health: HEALTH.MAX * 1.15, // Extra health (was 1.2)
    speed: MOVEMENT.SPEED * 0.8, // Slow but playable (was 0.75)
    width: 64,
    height: 64,
    hitboxWidth: 48,
    hitboxHeight: 58,
    hitboxOffsetX: 8,
    hitboxOffsetY: 3,
    attackPower: 1.25, // Devastating hits (was 1.3)
    defense: 1.2, // Tanky (was 1.25)
    animations: {
      idle: 'tank-idle',
      walk: 'tank-walk',
      punch: 'tank-punch',
      chair: 'tank-chair',
      hit: 'tank-hit',
      down: 'tank-down',
      getup: 'tank-getup',
      victory: 'tank-victory',
      grapple: 'tank-grapple',
      grappled: 'tank-grappled',
      throw: 'tank-throw',
      throwSuplex: 'tank-throw-suplex',
      throwDdt: 'tank-throw-ddt',
      throwBodyslam: 'tank-throw-bodyslam'
    }
  },

  VIPER: {
    name: 'Viper',
    spriteKey: 'viper',
    health: HEALTH.MAX,
    speed: MOVEMENT.SPEED, // Balanced
    width: 64,
    height: 64,
    hitboxWidth: 38,
    hitboxHeight: 54,
    hitboxOffsetX: 13,
    hitboxOffsetY: 5,
    attackPower: 1.0,
    defense: 1.0,
    animations: {
      idle: 'viper-idle',
      walk: 'viper-walk',
      punch: 'viper-punch',
      chair: 'viper-chair',
      hit: 'viper-hit',
      down: 'viper-down',
      getup: 'viper-getup',
      victory: 'viper-victory',
      grapple: 'viper-grapple',
      grappled: 'viper-grappled',
      throw: 'viper-throw',
      throwSuplex: 'viper-throw-suplex',
      throwDdt: 'viper-throw-ddt',
      throwBodyslam: 'viper-throw-bodyslam'
    }
  }
};

export const WEAPON_TYPES = {
  CHAIR: {
    name: 'Steel Chair',
    damage: 22,
    range: 50,
    textures: {
      ground: 'chair-ground',
      held: 'chair-held',
      swing: 'chair-swing'
    }
  }
};

export const TABLE_CONFIG = {
  textures: {
    intact: 'table',
    fire: 'table-fire',
    broken: 'table-broken'
  },
  damage: {
    slam: 35,
    fireslam: 55
  }
};

export default CHARACTERS;
