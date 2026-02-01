import { HEALTH, MOVEMENT } from './constants.js';

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
    attackPower: 1.0,
    defense: 0.9, // Takes more damage
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
    health: HEALTH.MAX * 0.85, // Glass cannon - less health
    speed: MOVEMENT.SPEED * 1.2, // Very fast
    width: 64,
    height: 64,
    hitboxWidth: 34,
    hitboxHeight: 52,
    hitboxOffsetX: 15,
    hitboxOffsetY: 6,
    attackPower: 1.25, // High damage
    defense: 0.75, // Takes more damage
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
    health: HEALTH.MAX * 1.2, // Extra health
    speed: MOVEMENT.SPEED * 0.75, // Slow
    width: 64,
    height: 64,
    hitboxWidth: 48,
    hitboxHeight: 58,
    hitboxOffsetX: 8,
    hitboxOffsetY: 3,
    attackPower: 1.3, // Devastating hits
    defense: 1.25, // Tanky
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
