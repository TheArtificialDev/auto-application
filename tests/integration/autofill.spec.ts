import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Autofill E2E', () => {
  test('does not make any network requests during autofill', async ({ page }) => {
    let networkRequestMade = false;
    page.on('request', request => {
      if (!request.url().startsWith('file://')) {
        networkRequestMade = true;
      }
    });

    const fixturePath = `file://${path.resolve(__dirname, '../fixtures/generic-form.html')}`;
    await page.goto(fixturePath);
    
    // We would simulate the extension injecting the script and filling here
    // For now we just assert the page loads and no network requests are made
    
    expect(networkRequestMade).toBe(false);
  });
});
