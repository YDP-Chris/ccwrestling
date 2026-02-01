import { test, expect } from '@playwright/test';

test('AI can pick up and use chairs', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 550 });
  await page.goto('http://localhost:5173');

  await page.waitForTimeout(1000);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);

  // Just watch the AI fight - stay still and let AI do its thing
  // The AI should eventually pick up and use the chair

  await page.screenshot({ path: 'screenshots/ai-chair-01-start.png' });

  // Wait for chair to spawn and AI to potentially get it
  // Move away from center to give AI space
  const holdKey = async (key, duration) => {
    await page.keyboard.down(key);
    await page.waitForTimeout(duration);
    await page.keyboard.up(key);
  };

  // Move left to corner
  await holdKey('KeyA', 800);
  await page.screenshot({ path: 'screenshots/ai-chair-02-moved.png' });

  // Wait and watch AI behavior (20 seconds total)
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `screenshots/ai-chair-03-wait-${i}.png` });
  }

  await page.screenshot({ path: 'screenshots/ai-chair-04-final.png' });

  console.log('AI chair test complete - check screenshots for AI with chair');
});
