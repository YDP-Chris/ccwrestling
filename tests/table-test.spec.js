import { test, expect } from '@playwright/test';

test('Table spawns and can be used', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 550 });
  await page.goto('http://localhost:5173');

  await page.waitForTimeout(1000);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'screenshots/table-01-start.png' });

  const holdKey = async (key, duration) => {
    await page.keyboard.down(key);
    await page.waitForTimeout(duration);
    await page.keyboard.up(key);
  };

  // Wait for table to spawn (15-35 sec)
  // Fight while waiting
  for (let i = 0; i < 10; i++) {
    await holdKey('KeyD', 300);
    await page.keyboard.press('KeyJ');
    await page.waitForTimeout(300);
    await holdKey('KeyA', 200);
    await page.waitForTimeout(500);

    if (i === 5) {
      await page.screenshot({ path: 'screenshots/table-02-fighting.png' });
    }
  }

  // Wait more for table
  await page.waitForTimeout(10000);
  await page.screenshot({ path: 'screenshots/table-03-waiting.png' });

  // Try to light table on fire (F key) if near one
  await page.keyboard.press('KeyF');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/table-04-fire-attempt.png' });

  // Try table slam (L key)
  await holdKey('KeyD', 400);
  await page.keyboard.press('KeyL');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/table-05-slam-attempt.png' });

  // Continue
  for (let i = 0; i < 5; i++) {
    await holdKey('KeyD', 200);
    await page.keyboard.press('KeyL');
    await page.waitForTimeout(300);
    await page.keyboard.press('KeyJ');
    await page.waitForTimeout(200);
  }

  await page.screenshot({ path: 'screenshots/table-06-final.png' });

  console.log('Table test complete!');
});
