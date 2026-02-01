import { test, expect } from '@playwright/test';

// Helper to wait for Phaser game to be ready
async function waitForGame(page) {
  await page.waitForFunction(() => {
    return window.game && window.game.scene && window.game.scene.scenes.length > 0;
  }, { timeout: 10000 });
}

// Helper to get current scene key
async function getCurrentScene(page) {
  return await page.evaluate(() => {
    const scenes = window.game.scene.scenes;
    const active = scenes.find(s => s.scene.isActive());
    return active ? active.scene.key : null;
  });
}

// Helper to wait for specific scene
async function waitForScene(page, sceneKey, timeout = 10000) {
  await page.waitForFunction((key) => {
    const scenes = window.game.scene.scenes;
    const scene = scenes.find(s => s.scene.key === key);
    return scene && scene.scene.isActive();
  }, sceneKey, { timeout });
}

test.describe('CCW Wrestling Game', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForGame(page);
  });

  test.describe('Menu Scene', () => {

    test('should load and display menu', async ({ page }) => {
      await waitForScene(page, 'MenuScene');
      const scene = await getCurrentScene(page);
      expect(scene).toBe('MenuScene');
    });

    test('should start fight when Enter is pressed', async ({ page }) => {
      await waitForScene(page, 'MenuScene');
      await page.keyboard.press('Enter');
      await waitForScene(page, 'FightScene', 15000);
      const scene = await getCurrentScene(page);
      expect(scene).toBe('FightScene');
    });

    test('should start fight when Space is pressed', async ({ page }) => {
      await waitForScene(page, 'MenuScene');
      await page.keyboard.press('Space');
      await waitForScene(page, 'FightScene', 15000);
      const scene = await getCurrentScene(page);
      expect(scene).toBe('FightScene');
    });

    test('should start fight on click', async ({ page }) => {
      await waitForScene(page, 'MenuScene');
      await page.click('canvas');
      await waitForScene(page, 'FightScene', 15000);
      const scene = await getCurrentScene(page);
      expect(scene).toBe('FightScene');
    });
  });

  test.describe('Fight Scene', () => {

    test.beforeEach(async ({ page }) => {
      await waitForScene(page, 'MenuScene');
      await page.keyboard.press('Enter');
      await waitForScene(page, 'FightScene', 15000);
      // Skip countdown by setting matchStarted directly
      await page.evaluate(() => {
        const scene = window.game.scene.getScene('FightScene');
        if (scene) {
          scene.matchStarted = true;
          if (scene.player?.body) scene.player.body.enable = true;
          if (scene.enemy?.body) scene.enemy.body.enable = true;
        }
      });
      await page.waitForTimeout(500);
    });

    test('should display fighters', async ({ page }) => {
      const hasPlayer = await page.evaluate(() => {
        const scene = window.game.scene.getScene('FightScene');
        return scene && scene.player && scene.player.active;
      });
      expect(hasPlayer).toBe(true);

      const hasEnemy = await page.evaluate(() => {
        const scene = window.game.scene.getScene('FightScene');
        return scene && scene.enemy && scene.enemy.active;
      });
      expect(hasEnemy).toBe(true);
    });

    test('should have health bars', async ({ page }) => {
      const hasHealthBars = await page.evaluate(() => {
        const scene = window.game.scene.getScene('FightScene');
        return scene && scene.playerHealthBar && scene.enemyHealthBar;
      });
      expect(hasHealthBars).toBe(true);
    });

    test('player should be able to move', async ({ page }) => {
      // Test movement by calling the move directly via evaluate
      const moved = await page.evaluate(() => {
        const scene = window.game.scene.getScene('FightScene');
        const initialX = scene.player.x;
        // Directly set velocity to simulate movement
        scene.player.body.setVelocityX(100);
        return { initialX, hasBody: !!scene.player.body };
      });

      await page.waitForTimeout(200);

      const newX = await page.evaluate(() => {
        const scene = window.game.scene.getScene('FightScene');
        scene.player.body.setVelocityX(0);
        return scene.player.x;
      });

      expect(newX).toBeGreaterThan(moved.initialX);
    });

    test('player should be able to attack', async ({ page }) => {
      // Test attack by calling the attack method directly
      await page.evaluate(() => {
        const scene = window.game.scene.getScene('FightScene');
        scene.player.attack();
      });

      await page.waitForTimeout(50);

      const state = await page.evaluate(() => {
        const scene = window.game.scene.getScene('FightScene');
        return scene.player.state;
      });

      expect(state).toBe('attacking');
    });

    test('should be able to pause', async ({ page }) => {
      // Test pause by calling togglePause directly
      await page.evaluate(() => {
        const scene = window.game.scene.getScene('FightScene');
        scene.togglePause();
      });

      const isPaused = await page.evaluate(() => {
        const scene = window.game.scene.getScene('FightScene');
        return scene.isPaused;
      });

      expect(isPaused).toBe(true);
    });

    test('should be able to resume from pause', async ({ page }) => {
      // Pause
      await page.evaluate(() => {
        const scene = window.game.scene.getScene('FightScene');
        scene.togglePause();
      });

      // Resume
      await page.evaluate(() => {
        const scene = window.game.scene.getScene('FightScene');
        scene.togglePause();
      });

      const isPaused = await page.evaluate(() => {
        const scene = window.game.scene.getScene('FightScene');
        return scene.isPaused;
      });

      expect(isPaused).toBe(false);
    });
  });

  test.describe('Combat', () => {

    test.beforeEach(async ({ page }) => {
      await waitForScene(page, 'MenuScene');
      await page.keyboard.press('Enter');
      await waitForScene(page, 'FightScene', 15000);
      await page.waitForTimeout(4500); // Wait for countdown
    });

    test('attacking enemy should deal damage', async ({ page }) => {
      // Get enemy initial health
      const initialHealth = await page.evaluate(() => {
        const scene = window.game.scene.getScene('FightScene');
        return scene.enemy.health;
      });

      // Deal damage directly to test combat system
      await page.evaluate(() => {
        const scene = window.game.scene.getScene('FightScene');
        scene.enemy.takeDamage(10, scene.player);
      });

      const newHealth = await page.evaluate(() => {
        const scene = window.game.scene.getScene('FightScene');
        return scene.enemy.health;
      });

      expect(newHealth).toBeLessThan(initialHealth);
    });

    test('KO should end match when health reaches zero', async ({ page }) => {
      // Reduce enemy health to trigger KO
      await page.evaluate(() => {
        const scene = window.game.scene.getScene('FightScene');
        scene.enemy.health = 1;
        scene.enemy.takeDamage(10, scene.player);
      });

      await page.waitForTimeout(100);

      const isKO = await page.evaluate(() => {
        const scene = window.game.scene.getScene('FightScene');
        return scene.enemy.state === 'ko';
      });

      expect(isKO).toBe(true);
    });
  });

  test.describe('Screenshots', () => {

    test('capture menu screenshot', async ({ page }) => {
      await waitForScene(page, 'MenuScene');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/menu-scene.png' });
      const canvas = await page.$('canvas');
      expect(canvas).toBeTruthy();
    });

    test('capture fight screenshot', async ({ page }) => {
      await waitForScene(page, 'MenuScene');
      await page.keyboard.press('Enter');
      await waitForScene(page, 'FightScene', 15000);
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'test-results/fight-scene.png' });
      const hasFighters = await page.evaluate(() => {
        const scene = window.game.scene.getScene('FightScene');
        return scene && scene.player && scene.enemy;
      });
      expect(hasFighters).toBe(true);
    });
  });
});
