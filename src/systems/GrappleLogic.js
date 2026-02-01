/**
 * Pure grapple logic - no Phaser dependencies
 * Extracted for unit testing
 */

import { GRAPPLE, FIGHTER_STATES } from '../config/constants.js';

export class GrappleLogic {
  /**
   * Check if a fighter can initiate a grapple
   */
  static canInitiateGrapple(fighterState, hasWeapon) {
    const canAct = fighterState === FIGHTER_STATES.IDLE || fighterState === FIGHTER_STATES.WALKING;
    return canAct && !hasWeapon;
  }

  /**
   * Check if target is in range for grapple
   */
  static isInGrappleRange(attackerX, attackerY, targetX, targetY) {
    const distance = Math.sqrt(
      Math.pow(targetX - attackerX, 2) +
      Math.pow(targetY - attackerY, 2)
    );
    return distance <= GRAPPLE.INITIATE_RANGE;
  }

  /**
   * Calculate distance between two fighters
   */
  static getDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  /**
   * Check if escape attempt succeeded
   */
  static checkEscapeSuccess(currentMashCount) {
    return currentMashCount + 1 >= GRAPPLE.ESCAPE_THRESHOLD;
  }

  /**
   * Get damage for a grapple move
   */
  static getMoveDamage(moveName) {
    return GRAPPLE.DAMAGE[moveName] || GRAPPLE.DAMAGE.THROW;
  }

  /**
   * Get meter gain for an action
   */
  static getMeterGain(action) {
    return GRAPPLE.METER[action] || 0;
  }

  /**
   * Select a random throw move (with optional seeded random)
   */
  static selectThrowMove(randomFn = Math.random) {
    const moves = ['THROW', 'BODY_SLAM', 'SUPLEX', 'DDT'];
    const index = Math.floor(randomFn() * moves.length);
    return moves[index];
  }

  /**
   * Calculate final damage with attack power and defense modifiers
   */
  static calculateFinalDamage(baseDamage, attackPower = 1.0, defense = 1.0) {
    return Math.round(Math.round(baseDamage * attackPower) / defense);
  }

  /**
   * Determine if a grapple should auto-execute (timeout reached)
   */
  static shouldAutoExecute(grappleStartTime, currentTime) {
    return (currentTime - grappleStartTime) >= GRAPPLE.ESCAPE_WINDOW;
  }

  /**
   * Get all available throw moves
   */
  static getAvailableMoves() {
    return ['THROW', 'BODY_SLAM', 'SUPLEX', 'DDT'];
  }

  /**
   * Validate grapple state transition
   */
  static isValidStateTransition(fromState, toState) {
    const validTransitions = {
      [FIGHTER_STATES.IDLE]: [FIGHTER_STATES.GRAPPLING, FIGHTER_STATES.GRAPPLED],
      [FIGHTER_STATES.WALKING]: [FIGHTER_STATES.GRAPPLING, FIGHTER_STATES.GRAPPLED],
      [FIGHTER_STATES.GRAPPLING]: [FIGHTER_STATES.THROWING, FIGHTER_STATES.IDLE],
      [FIGHTER_STATES.GRAPPLED]: [FIGHTER_STATES.IDLE, FIGHTER_STATES.DOWN],
      [FIGHTER_STATES.THROWING]: [FIGHTER_STATES.IDLE]
    };

    return validTransitions[fromState]?.includes(toState) || false;
  }
}

export default GrappleLogic;
