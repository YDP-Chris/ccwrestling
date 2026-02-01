import Phaser from 'phaser';
import { GAME, COLORS } from '../config/constants.js';

/**
 * Manages screen transitions between scenes
 */
export default class TransitionManager {
  /**
   * Fade out current scene, then start new scene
   */
  static fadeToScene(currentScene, targetScene, data = {}, duration = 300) {
    const camera = currentScene.cameras.main;

    camera.fadeOut(duration, 0, 0, 0);

    camera.once('camerafadeoutcomplete', () => {
      currentScene.scene.start(targetScene, data);
    });
  }

  /**
   * Wipe transition (horizontal bars)
   */
  static wipeToScene(currentScene, targetScene, data = {}, duration = 400) {
    const bars = [];
    const barCount = 8;
    const barHeight = GAME.HEIGHT / barCount;

    for (let i = 0; i < barCount; i++) {
      const bar = currentScene.add.rectangle(
        i % 2 === 0 ? -GAME.WIDTH : GAME.WIDTH * 2,
        barHeight * i + barHeight / 2,
        GAME.WIDTH,
        barHeight,
        0x000000
      );
      bar.setDepth(10000);
      bars.push(bar);

      // Staggered animation
      currentScene.tweens.add({
        targets: bar,
        x: GAME.WIDTH / 2,
        duration: duration,
        delay: i * 30,
        ease: 'Power2'
      });
    }

    // After all bars are in, start new scene
    currentScene.time.delayedCall(duration + barCount * 30 + 100, () => {
      currentScene.scene.start(targetScene, data);
    });
  }

  /**
   * Zoom out transition
   */
  static zoomOutToScene(currentScene, targetScene, data = {}, duration = 400) {
    const camera = currentScene.cameras.main;

    currentScene.tweens.add({
      targets: camera,
      zoom: 0.1,
      alpha: 0,
      duration: duration,
      ease: 'Power2',
      onComplete: () => {
        camera.zoom = 1;
        currentScene.scene.start(targetScene, data);
      }
    });

    camera.fadeOut(duration, 0, 0, 0);
  }

  /**
   * Circle wipe (iris) transition
   */
  static irisToScene(currentScene, targetScene, data = {}, duration = 500) {
    const graphics = currentScene.add.graphics();
    graphics.setDepth(10000);

    let progress = 0;
    const centerX = GAME.WIDTH / 2;
    const centerY = GAME.HEIGHT / 2;
    const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

    const updateMask = () => {
      graphics.clear();
      graphics.fillStyle(0x000000, 1);
      graphics.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);

      // Cut out circle (inverted)
      const radius = maxRadius * (1 - progress);
      if (radius > 0) {
        graphics.fillStyle(0x000000, 0);
        graphics.beginPath();
        graphics.arc(centerX, centerY, radius, 0, Math.PI * 2);
        graphics.closePath();
        graphics.fillPath();
      }
    };

    currentScene.tweens.add({
      targets: { progress: 0 },
      progress: 1,
      duration: duration,
      ease: 'Power2',
      onUpdate: (tween) => {
        progress = tween.getValue();
        updateMask();
      },
      onComplete: () => {
        currentScene.scene.start(targetScene, data);
      }
    });
  }

  /**
   * Flash transition (bright flash then fade)
   */
  static flashToScene(currentScene, targetScene, data = {}, duration = 300) {
    const camera = currentScene.cameras.main;

    // Flash white
    camera.flash(duration / 2, 255, 255, 255);

    currentScene.time.delayedCall(duration / 2, () => {
      camera.fadeOut(duration / 2, 0, 0, 0);
    });

    camera.once('camerafadeoutcomplete', () => {
      currentScene.scene.start(targetScene, data);
    });
  }

  /**
   * Shatter effect (screen breaks into pieces)
   */
  static shatterToScene(currentScene, targetScene, data = {}, duration = 600) {
    // Create screen capture effect with rectangles
    const pieces = [];
    const gridSize = 6;
    const pieceWidth = GAME.WIDTH / gridSize;
    const pieceHeight = GAME.HEIGHT / gridSize;

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const piece = currentScene.add.rectangle(
          pieceWidth * x + pieceWidth / 2,
          pieceHeight * y + pieceHeight / 2,
          pieceWidth - 2,
          pieceHeight - 2,
          0x1a1a1a
        );
        piece.setDepth(10000);
        pieces.push(piece);

        // Random falling animation
        const delay = Math.random() * 200;
        const fallDirection = Math.random() * 200 - 100;

        currentScene.tweens.add({
          targets: piece,
          y: GAME.HEIGHT + 100,
          x: piece.x + fallDirection,
          rotation: Math.random() * Math.PI * 2,
          alpha: 0,
          duration: duration,
          delay: delay,
          ease: 'Power2'
        });
      }
    }

    currentScene.time.delayedCall(duration + 100, () => {
      currentScene.scene.start(targetScene, data);
    });
  }

  /**
   * Fade in effect for new scenes
   */
  static fadeIn(scene, duration = 300) {
    scene.cameras.main.fadeIn(duration, 0, 0, 0);
  }

  /**
   * Wipe in effect for new scenes
   */
  static wipeIn(scene, duration = 400) {
    const cover = scene.add.rectangle(
      GAME.WIDTH / 2,
      GAME.HEIGHT / 2,
      GAME.WIDTH,
      GAME.HEIGHT,
      0x000000
    );
    cover.setDepth(10000);

    scene.tweens.add({
      targets: cover,
      alpha: 0,
      duration: duration,
      ease: 'Power2',
      onComplete: () => cover.destroy()
    });
  }
}
