import { test, expect } from '@playwright/test';

test('Chair spawns randomly during match', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 550 });
  await page.goto('http://localhost:5173');

  await page.waitForTimeout(1000);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000); // Wait for countdown

  // Screenshot at start - no chair yet
  await page.screenshot({ path: 'screenshots/chair-spawn-01-start.png' });

  const holdKey = async (key, duration) => {
    await page.keyboard.down(key);
    await page.waitForTimeout(duration);
    await page.keyboard.up(key);
  };

  // Fight for a bit while waiting for chair
  for (let i = 0; i < 8; i++) {
    // Move around and fight
    await holdKey('KeyD', 300);
    await page.keyboard.press('KeyJ');
    await page.waitForTimeout(200);
    await holdKey('KeyA', 200);
    await page.keyboard.press('KeyJ');
    await page.waitForTimeout(200);

    // Take screenshot periodically
    if (i === 3) {
      await page.screenshot({ path: 'screenshots/chair-spawn-02-waiting.png' });
    }
    if (i === 6) {
      await page.screenshot({ path: 'screenshots/chair-spawn-03-fighting.png' });
    }
  }

  // Wait more for chair to potentially spawn (8-20 sec window)
  await page.waitForTimeout(8000);
  await page.screenshot({ path: 'screenshots/chair-spawn-04-after-wait.png' });

  // Continue fighting
  for (let i = 0; i < 5; i++) {
    await holdKey('KeyD', 200);
    await page.keyboard.press('KeyJ');
    await page.waitForTimeout(300);
  }

  await page.screenshot({ path: 'screenshots/chair-spawn-05-final.png' });

  console.log('Chair spawn test complete!');
});
