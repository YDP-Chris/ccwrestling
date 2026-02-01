import { test, expect } from '@playwright/test';

test('Chair weapon test', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 550 });
  await page.goto('http://localhost:5173');

  // Wait for menu
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/chair-01-menu.png' });

  // Start fight
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000); // Wait for countdown

  await page.screenshot({ path: 'screenshots/chair-02-start.png' });

  // Helper to hold key
  const holdKey = async (key, duration) => {
    await page.keyboard.down(key);
    await page.waitForTimeout(duration);
    await page.keyboard.up(key);
  };

  // Move towards center where chair is
  await holdKey('KeyD', 500);
  await page.screenshot({ path: 'screenshots/chair-03-approach.png' });

  // Try to pick up chair (K key)
  await page.keyboard.press('KeyK');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshots/chair-04-pickup.png' });

  // Move around with chair
  await holdKey('KeyD', 300);
  await page.screenshot({ path: 'screenshots/chair-05-holding.png' });

  // Attack with chair (J key)
  await page.keyboard.press('KeyJ');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshots/chair-06-swing.png' });

  // Move towards enemy and attack
  await holdKey('KeyD', 400);
  await page.keyboard.press('KeyJ');
  await page.waitForTimeout(200);
  await page.keyboard.press('KeyJ');
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'screenshots/chair-07-attack.png' });

  console.log('Chair test complete!');
});
