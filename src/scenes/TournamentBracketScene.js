import Phaser from 'phaser';
import { GAME, COLORS } from '../config/constants.js';
import { CHARACTERS } from '../config/characters.js';
import TournamentManager from '../systems/TournamentManager.js';
import TransitionManager from '../systems/TransitionManager.js';

export default class TournamentBracketScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TournamentBracketScene' });
  }

  init(data) {
    this.tournament = data.tournament || TournamentManager.load();
    this.viewOnly = data.viewOnly || false;
    this.fromMatch = data.fromMatch || false;
    this.matchResult = data.matchResult || null;
  }

  create() {
    // Background
    this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, 0x0a0a0a);

    // Title
    const titleText = this.tournament.completed ?
      (this.tournament.champion === this.tournament.playerCharacter ? 'CHAMPION!' : 'TOURNAMENT COMPLETE') :
      'TOURNAMENT BRACKET';

    this.add.text(GAME.WIDTH / 2, 25, titleText, {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: this.tournament.completed ? '#FFD700' : '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Draw bracket
    this.drawBracket();

    // Handle match result if coming from a fight
    if (this.fromMatch && this.matchResult) {
      this.handleMatchResult();
    } else if (!this.viewOnly) {
      this.showNextAction();
    }

    // Setup input
    this.setupInput();
  }

  drawBracket() {
    const bracket = this.tournament.bracket;
    const rounds = bracket.length;
    const isSmall = this.tournament.size === 4;

    // Calculate positions
    const startX = 80;
    const endX = GAME.WIDTH - 80;
    const roundWidth = (endX - startX) / (rounds + 0.5);

    // Draw each round
    bracket.forEach((round, roundIndex) => {
      const x = startX + roundIndex * roundWidth;
      const matchCount = round.length;

      // Round name
      const roundName = TournamentManager.getRoundName(this.tournament, roundIndex);
      this.add.text(x + roundWidth / 2, 50, roundName, {
        fontFamily: 'Arial Black',
        fontSize: '10px',
        color: '#FF4500'
      }).setOrigin(0.5);

      // Vertical spacing for matches
      const availableHeight = GAME.HEIGHT - 120;
      const spacing = availableHeight / (matchCount + 1);

      round.forEach((match, matchIndex) => {
        const y = 80 + spacing * (matchIndex + 1);
        this.drawMatch(x, y, match, roundIndex, matchIndex);
      });
    });

    // Draw champion slot
    const champX = startX + rounds * roundWidth;
    const champY = GAME.HEIGHT / 2;

    this.add.text(champX, champY - 40, 'CHAMPION', {
      fontFamily: 'Arial Black',
      fontSize: '12px',
      color: '#FFD700'
    }).setOrigin(0.5);

    const champBg = this.add.rectangle(champX, champY, 100, 40, 0x333300, 0.5);
    champBg.setStrokeStyle(2, 0xFFD700);

    if (this.tournament.champion) {
      const champName = CHARACTERS[this.tournament.champion]?.name || this.tournament.champion;
      const isPlayer = this.tournament.champion === this.tournament.playerCharacter;

      this.add.text(champX, champY, champName, {
        fontFamily: 'Arial Black',
        fontSize: '14px',
        color: isPlayer ? '#00FF00' : '#FFD700'
      }).setOrigin(0.5);
    }
  }

  drawMatch(x, y, match, roundIndex, matchIndex) {
    const boxWidth = 100;
    const boxHeight = 50;

    // Match box background
    const isCurrentMatch = this.isCurrentMatch(roundIndex, matchIndex);
    const bgColor = isCurrentMatch ? 0x333300 : 0x222222;
    const borderColor = isCurrentMatch ? 0xFFD700 : 0x444444;

    const bg = this.add.rectangle(x + boxWidth / 2, y, boxWidth, boxHeight, bgColor, 0.7);
    bg.setStrokeStyle(2, borderColor);

    // Fighter 1
    const f1Name = match.fighter1 ? (CHARACTERS[match.fighter1]?.name || match.fighter1) : 'TBD';
    const f1IsPlayer = match.fighter1 === this.tournament.playerCharacter;
    const f1IsWinner = match.winner === match.fighter1;
    const f1Color = f1IsWinner ? '#00FF00' : (f1IsPlayer ? '#FFD700' : '#FFFFFF');

    this.add.text(x + boxWidth / 2, y - 12, f1Name, {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: match.fighter1 ? f1Color : '#555555'
    }).setOrigin(0.5);

    // VS divider
    this.add.text(x + boxWidth / 2, y, 'vs', {
      fontFamily: 'Arial',
      fontSize: '8px',
      color: '#666666'
    }).setOrigin(0.5);

    // Fighter 2
    const f2Name = match.fighter2 ? (CHARACTERS[match.fighter2]?.name || match.fighter2) : 'TBD';
    const f2IsPlayer = match.fighter2 === this.tournament.playerCharacter;
    const f2IsWinner = match.winner === match.fighter2;
    const f2Color = f2IsWinner ? '#00FF00' : (f2IsPlayer ? '#FFD700' : '#FFFFFF');

    this.add.text(x + boxWidth / 2, y + 12, f2Name, {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: match.fighter2 ? f2Color : '#555555'
    }).setOrigin(0.5);

    // Winner indicator
    if (match.completed && match.winner) {
      const winnerY = match.winner === match.fighter1 ? y - 12 : y + 12;
      this.add.text(x + 10, winnerY, '>', {
        fontFamily: 'Arial Black',
        fontSize: '10px',
        color: '#00FF00'
      }).setOrigin(0.5);
    }

    // Current match highlight animation
    if (isCurrentMatch && !this.tournament.completed) {
      this.tweens.add({
        targets: bg,
        alpha: 0.5,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
  }

  isCurrentMatch(roundIndex, matchIndex) {
    const nextMatch = TournamentManager.getNextMatch(this.tournament);
    if (!nextMatch) return false;
    return nextMatch.round === roundIndex && nextMatch.matchIndex === matchIndex;
  }

  handleMatchResult() {
    const { roundIndex, matchIndex, winner } = this.matchResult;

    // Update tournament with result
    this.tournament = TournamentManager.recordResult(
      this.tournament,
      roundIndex,
      matchIndex,
      winner
    );

    // Show result announcement
    const winnerName = CHARACTERS[winner]?.name || winner;
    const playerWon = winner === this.tournament.playerCharacter;

    const resultText = playerWon ? 'VICTORY!' : `${winnerName} WINS`;
    const resultColor = playerWon ? '#00FF00' : '#FF4500';

    const announcement = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2, resultText, {
      fontFamily: 'Arial Black',
      fontSize: '36px',
      color: resultColor,
      stroke: '#000000',
      strokeThickness: 4
    });
    announcement.setOrigin(0.5);
    announcement.setDepth(100);

    // Animate and then show next action
    this.tweens.add({
      targets: announcement,
      alpha: 0,
      scale: 1.5,
      duration: 1500,
      delay: 1000,
      onComplete: () => {
        announcement.destroy();
        this.showNextAction();
      }
    });
  }

  showNextAction() {
    // Check tournament state
    if (this.tournament.completed) {
      this.showTournamentComplete();
      return;
    }

    if (!this.tournament.playerAlive) {
      this.showEliminatedOptions();
      return;
    }

    // Get player's next match
    const playerMatch = TournamentManager.getPlayerMatch(this.tournament);

    if (playerMatch) {
      this.showFightPrompt(playerMatch);
    } else {
      // Player waiting - need to simulate other matches
      this.simulateAIMatches();
    }
  }

  showFightPrompt(matchInfo) {
    const { match } = matchInfo;
    const opponent = match.fighter1 === this.tournament.playerCharacter ? match.fighter2 : match.fighter1;
    const opponentName = CHARACTERS[opponent]?.name || opponent;

    // Prompt container
    this.promptContainer = this.add.container(GAME.WIDTH / 2, GAME.HEIGHT - 70);

    const promptBg = this.add.rectangle(0, 0, 300, 60, 0x000000, 0.8);
    promptBg.setStrokeStyle(2, 0xFFD700);
    this.promptContainer.add(promptBg);

    const promptText = this.add.text(0, -15, `NEXT FIGHT: vs ${opponentName}`, {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    this.promptContainer.add(promptText);

    const actionText = this.add.text(0, 10, 'Press ENTER to FIGHT!', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#FFD700'
    }).setOrigin(0.5);
    this.promptContainer.add(actionText);

    // Pulse animation
    this.tweens.add({
      targets: actionText,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Store match info for fight start
    this.pendingMatch = matchInfo;
  }

  simulateAIMatches() {
    // Get next match
    const nextMatch = TournamentManager.getNextMatch(this.tournament);

    if (!nextMatch) {
      // All current round matches done, refresh display
      this.scene.restart({ tournament: this.tournament });
      return;
    }

    // Simulate the match
    const { round, matchIndex, match } = nextMatch;
    const winner = TournamentManager.simulateMatch(match.fighter1, match.fighter2);

    const f1Name = CHARACTERS[match.fighter1]?.name || match.fighter1;
    const f2Name = CHARACTERS[match.fighter2]?.name || match.fighter2;
    const winnerName = CHARACTERS[winner]?.name || winner;

    // Show simulation announcement
    const simText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 60, `${f1Name} vs ${f2Name}...`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#CCCCCC'
    }).setOrigin(0.5);

    this.time.delayedCall(1000, () => {
      simText.setText(`${winnerName} WINS!`);
      simText.setColor('#00FF00');

      // Record result
      this.tournament = TournamentManager.recordResult(this.tournament, round, matchIndex, winner);

      this.time.delayedCall(1000, () => {
        simText.destroy();
        // Check for more matches or player's turn
        this.scene.restart({ tournament: this.tournament });
      });
    });
  }

  showTournamentComplete() {
    const isChampion = this.tournament.champion === this.tournament.playerCharacter;
    const champName = CHARACTERS[this.tournament.champion]?.name || this.tournament.champion;

    this.promptContainer = this.add.container(GAME.WIDTH / 2, GAME.HEIGHT - 80);

    const promptBg = this.add.rectangle(0, 0, 350, 80, 0x000000, 0.9);
    promptBg.setStrokeStyle(2, isChampion ? 0xFFD700 : 0xFF4500);
    this.promptContainer.add(promptBg);

    const resultText = this.add.text(0, -20, isChampion ? 'YOU ARE THE CHAMPION!' : `${champName} WINS THE TOURNAMENT`, {
      fontFamily: 'Arial Black',
      fontSize: isChampion ? '16px' : '14px',
      color: isChampion ? '#FFD700' : '#FF4500'
    }).setOrigin(0.5);
    this.promptContainer.add(resultText);

    const actionText = this.add.text(0, 15, 'ENTER: New Tournament    ESC: Menu', {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: '#888888'
    }).setOrigin(0.5);
    this.promptContainer.add(actionText);

    this.tournamentComplete = true;
  }

  showEliminatedOptions() {
    this.promptContainer = this.add.container(GAME.WIDTH / 2, GAME.HEIGHT - 80);

    const promptBg = this.add.rectangle(0, 0, 300, 70, 0x000000, 0.9);
    promptBg.setStrokeStyle(2, 0xFF4500);
    this.promptContainer.add(promptBg);

    const resultText = this.add.text(0, -18, 'YOU HAVE BEEN ELIMINATED', {
      fontFamily: 'Arial Black',
      fontSize: '14px',
      color: '#FF4500'
    }).setOrigin(0.5);
    this.promptContainer.add(resultText);

    const actionText = this.add.text(0, 8, 'ENTER: Watch Remaining    ESC: Menu', {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: '#888888'
    }).setOrigin(0.5);
    this.promptContainer.add(actionText);

    this.eliminated = true;
  }

  startFight() {
    if (!this.pendingMatch) return;

    const { round, matchIndex, match } = this.pendingMatch;
    const opponent = match.fighter1 === this.tournament.playerCharacter ? match.fighter2 : match.fighter1;

    if (this.sound.get('sfx-menu-select')) {
      this.sound.play('sfx-menu-select', { volume: 0.6 });
    }

    this.cameras.main.flash(200, 255, 255, 255);

    this.time.delayedCall(200, () => {
      // Store match info for result handling
      this.scene.start('FightScene', {
        mode: 'tournament',
        player: this.tournament.playerCharacter,
        opponent: opponent,
        tournamentData: {
          tournament: this.tournament,
          roundIndex: round,
          matchIndex: matchIndex
        }
      });
    });
  }

  setupInput() {
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  update() {
    const mobile = window.mobileInput || { justPressed: () => false };

    if (Phaser.Input.Keyboard.JustDown(this.enterKey) ||
        mobile.justPressed('attack')) {
      if (this.pendingMatch) {
        this.startFight();
      } else if (this.tournamentComplete || this.eliminated) {
        // Continue watching or new tournament
        if (this.eliminated && !this.tournament.completed) {
          // Simulate remaining matches
          this.simulateAIMatches();
        } else {
          // New tournament
          TournamentManager.clear();
          this.scene.start('TournamentScene');
        }
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this.escKey) ||
        mobile.justPressed('grapple')) {
      if (this.sound.get('sfx-menu-select')) {
        this.sound.play('sfx-menu-select', { volume: 0.5 });
      }
      this.scene.start('MenuScene');
    }
  }
}
