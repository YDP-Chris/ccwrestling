import { test, expect } from '@playwright/test';

test('Chair breaks after 3 hits', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 550 });
  await page.goto('http://localhost:5173');

  await page.waitForTimeout(1000);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);

  const holdKey = async (key, duration) => {
    await page.keyboard.down(key);
    await page.waitForTimeout(duration);
    await page.keyboard.up(key);
  };

  // Move to chair and pick it up
  await holdKey('KeyD', 500);
  await page.keyboard.press('KeyK');
  await page.waitForTimeout(200);

  await page.screenshot({ path: 'screenshots/chair-break-01-pickup.png' });

  // Move towards enemy
  await holdKey('KeyD', 600);

  // Hit 1
  await page.keyboard.press('KeyJ');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'screenshots/chair-break-02-hit1.png' });

  // Chase and hit 2
  await holdKey('KeyD', 300);
  await page.keyboard.press('KeyJ');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'screenshots/chair-break-03-hit2.png' });

  // Chase and hit 3 (should break)
  await holdKey('KeyD', 300);
  await page.keyboard.press('KeyJ');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/chair-break-04-broken.png' });

  // Try to attack again (should be fist now)
  await page.keyboard.press('KeyJ');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshots/chair-break-05-fist.png' });

  console.log('Chair break test complete!');
});
