// Game constants
export const GAME = {
  WIDTH: 800,
  HEIGHT: 450,
  ARENA_TOP: 150,
  ARENA_BOTTOM: 400
};

// Damage values
export const DAMAGE = {
  FIST_MIN: 8,
  FIST_MAX: 12,
  CHAIR: 22,
  TABLE_SLAM: 35,
  FLAMING_TABLE: 55,
  FIRE_DOT: 3,
  FIRE_TICKS: 6,
  FINISHER: 45
};

// Combat settings
export const COMBAT = {
  FIST_RANGE: 80,
  CHAIR_RANGE: 100,
  TABLE_SLAM_RANGE: 100,
  HITSTUN_BASE: 200,
  HITSTUN_PER_DAMAGE: 10,
  KNOCKBACK_FORCE: 200,
  ATTACK_DURATION: 300,
  PICKUP_RANGE: 80
};

// Extreme meter settings
export const METER = {
  MAX: 100,
  GAIN_HIT_DEALT: 5,
  GAIN_HIT_TAKEN: 3,
  GAIN_WEAPON_HIT: 8,
  GAIN_TABLE_BREAK: 20
};

// Movement settings
export const MOVEMENT = {
  SPEED: 280  // Increased for responsive feel
};

// Health settings
export const HEALTH = {
  MAX: 300  // Increased for ~5 minute matches
};

// Colors
export const COLORS = {
  BLOOD_BRIGHT: 0xDC143C,
  BLOOD_DEEP: 0x6B0F1A,
  FIRE_ORANGE: 0xFF4500,
  FIRE_AMBER: 0xFFB800,
  VOID: 0x0D0D0D,
  CHROME: 0xC0C0C0,
  WHITE: 0xFFFFFF,
  BLACK: 0x000000,
  GREEN: 0x00FF00,
  YELLOW: 0xFFFF00,
  RED: 0xFF0000
};

// Fighter states
export const FIGHTER_STATES = {
  IDLE: 'idle',
  WALKING: 'walking',
  ATTACKING: 'attacking',
  HITSTUN: 'hitstun',
  DOWN: 'down',
  GETUP: 'getup',
  KO: 'ko',
  GRAPPLING: 'grappling',
  GRAPPLED: 'grappled',
  THROWING: 'throwing'
};

// Timing
export const TIMING = {
  KO_DELAY: 2000,
  GETUP_DURATION: 500,
  DOWN_DURATION: 1000,
  FIRE_TICK_INTERVAL: 500
};

// Grapple system settings
export const GRAPPLE = {
  INITIATE_RANGE: 110,  // Comfortable range for 2.5x scaled sprites
  ESCAPE_THRESHOLD: 5,
  ESCAPE_WINDOW: 2000,
  LOCK_DURATION: 500,
  DAMAGE: {
    THROW: 14,
    BODY_SLAM: 16,
    SUPLEX: 18,
    DDT: 20
  },
  METER: {
    INITIATE: 3,
    ESCAPE: 5,
    THROW: 10,
    THROWN: 4
  }
};
