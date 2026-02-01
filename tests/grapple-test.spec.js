import { test, expect } from '@playwright/test';

test('Grapple wrestling match', async ({ page }) => {
  // Set viewport to match game size
  await page.setViewportSize({ width: 900, height: 550 });

  // Navigate to the game
  await page.goto('http://localhost:5173');

  // Wait for menu to load and click to start
  await page.waitForTimeout(1000);

  // Take screenshot of menu
  await page.screenshot({ path: 'screenshots/01-menu.png' });

  // Press Enter to start fight
  await page.keyboard.press('Enter');

  // Wait for countdown to finish (about 4 seconds)
  await page.waitForTimeout(4500);

  // Take screenshot at fight start
  await page.screenshot({ path: 'screenshots/02-fight-start.png' });

  // Function to press key for duration
  const holdKey = async (key, duration) => {
    await page.keyboard.down(key);
    await page.waitForTimeout(duration);
    await page.keyboard.up(key);
  };

  // Play the match - move right towards enemy and try grapples
  console.log('Moving towards enemy...');

  // Move right towards enemy
  await holdKey('KeyD', 800);
  await page.screenshot({ path: 'screenshots/03-approaching.png' });

  // Try some punches first
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('KeyJ');
    await page.waitForTimeout(300);
  }

  // Move closer
  await holdKey('KeyD', 400);

  // Attempt grapple
  console.log('Attempting grapple...');
  await page.keyboard.press('KeyG');
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'screenshots/04-grapple-attempt-1.png' });

  // Move closer if needed and try again
  await holdKey('KeyD', 300);
  await page.keyboard.press('KeyG');
  await page.waitForTimeout(200);

  // Keep trying grapple while moving closer
  for (let i = 0; i < 5; i++) {
    await holdKey('KeyD', 150);
    await page.keyboard.press('KeyG');
    await page.waitForTimeout(100);
  }

  // Take screenshot - hopefully in grapple
  await page.screenshot({ path: 'screenshots/05-grapple-locked.png' });

  // Press J to execute throw
  await page.waitForTimeout(300);
  await page.keyboard.press('KeyJ');
  await page.waitForTimeout(100);
  await page.screenshot({ path: 'screenshots/06-throw-execute.png' });

  // Wait for throw animation
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/07-after-throw.png' });

  // Continue fighting - mix of attacks and grapples
  console.log('Continuing match...');

  for (let round = 0; round < 8; round++) {
    // Move towards enemy
    await holdKey('KeyD', 400);

    // Mix attacks and grapples
    if (round % 2 === 0) {
      // Try grapple
      for (let i = 0; i < 3; i++) {
        await holdKey('KeyD', 100);
        await page.keyboard.press('KeyG');
        await page.waitForTimeout(50);
      }
      // Execute throw if in grapple
      await page.waitForTimeout(200);
      await page.keyboard.press('KeyJ');
    } else {
      // Regular attacks
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press('KeyJ');
        await page.waitForTimeout(250);
      }
    }

    await page.waitForTimeout(300);

    // Screenshot every other round
    if (round % 2 === 0) {
      await page.screenshot({ path: `screenshots/08-round-${round}.png` });
    }
  }

  // Final push - aggressive grappling
  console.log('Final push...');
  for (let i = 0; i < 10; i++) {
    await holdKey('KeyD', 100);
    await page.keyboard.press('KeyG');
    await page.waitForTimeout(100);
    await page.keyboard.press('KeyJ');
    await page.waitForTimeout(200);
  }

  await page.screenshot({ path: 'screenshots/09-final.png' });

  // Wait a bit more to see if match ends
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screenshots/10-end.png' });

  console.log('Test complete! Check screenshots folder.');
});
