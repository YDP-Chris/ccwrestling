import { test, expect } from '@playwright/test';

test('Quick grapple test', async ({ page }) => {
  // Set viewport to match game size
  await page.setViewportSize({ width: 900, height: 550 });

  // Navigate to the game
  await page.goto('http://localhost:5173');

  // Wait for menu to load
  await page.waitForTimeout(1000);

  // Press Enter to start fight
  await page.keyboard.press('Enter');

  // Wait for countdown to finish
  await page.waitForTimeout(5000);

  // Function to press key for duration
  const holdKey = async (key, duration) => {
    await page.keyboard.down(key);
    await page.waitForTimeout(duration);
    await page.keyboard.up(key);
  };

  // Move towards enemy and attempt grapple
  await holdKey('KeyD', 600);

  // Try grapple a few times
  for (let i = 0; i < 5; i++) {
    await holdKey('KeyD', 100);
    await page.keyboard.press('KeyG');
    await page.waitForTimeout(100);
  }

  // Take screenshot to verify grapple state
  await page.screenshot({ path: 'screenshots/grapple-quick-test.png' });

  // Execute throw if in grapple
  await page.keyboard.press('KeyJ');
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'screenshots/grapple-quick-throw.png' });

  console.log('Quick grapple test complete');
});
