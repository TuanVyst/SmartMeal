import { test, expect } from '@playwright/test';

const FE_URL = 'http://localhost:5173';

test('debug recipe ingredients dropdown matching', async ({ page }) => {
  // Listen for console logs
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });

  // 1) Go to login page
  console.log('Navigating to login...');
  await page.goto(`${FE_URL}/login`);
  await page.waitForLoadState('networkidle');

  // 2) Fill in login credentials
  console.log('Logging in...');
  
  // Find username input by inspecting elements or trying general selectors
  const usernameInput = page.locator('input[type="text"], input[name="username"], input[placeholder*="tên"], input[placeholder*="email"]');
  const passwordInput = page.locator('input[type="password"]');
  
  await usernameInput.first().fill('admin');
  await passwordInput.first().fill('Admin@123');

  // Click login button
  await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
  
  // Wait for login redirection
  await page.waitForTimeout(3000);
  console.log('Navigated URL:', page.url());

  // 3) Go to admin recipes page
  console.log('Navigating to admin recipes...');
  await page.goto(`${FE_URL}/admin/recipes`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // 4) Find the recipe "Cá Hộp Chưng Trứng Thịt Băm" and click Edit
  console.log('Locating recipe...');
  const row = page.locator('tr', { hasText: 'Cá Hộp Chưng Trứng Thịt Băm' }).first();
  await expect(row).toBeVisible();

  // Find Edit button inside row
  const editButton = row.locator('button').filter({ hasText: /Sửa|Edit/i }).first();
  console.log('Clicking Edit...');
  await editButton.click();

  // Wait for the modal to be visible
  console.log('Waiting for modal...');
  await page.waitForTimeout(2000);

  // 5) Inspect the loaded ingredients in the modal
  const ingredientRows = page.locator('.dynamic-list-container .dynamic-list-row');
  const count = await ingredientRows.count();
  console.log(`Loaded ${count} ingredient rows in the modal.`);

  for (let i = 0; i < count; i++) {
    const rowLoc = ingredientRows.nth(i);
    const select = rowLoc.locator('select');
    const selectVal = await select.inputValue().catch(() => 'ERROR');
    
    const qtyInput = rowLoc.locator('input[type="number"]').first();
    const qtyVal = await qtyInput.inputValue().catch(() => 'ERROR');

    const uomInput = rowLoc.locator('input[type="text"]').first();
    const uomVal = await uomInput.inputValue().catch(() => 'ERROR');

    // Get the name of the selected option
    const selectedText = await select.evaluate(el => el.options[el.selectedIndex]?.text).catch(() => 'ERROR');

    console.log(`Row ${i + 1}: Select Value='${selectVal}' (Text: '${selectedText}'), Qty='${qtyVal}', UOM='${uomVal}'`);
  }

  // Take a screenshot of the modal to verify visually
  await page.screenshot({ path: 'scratch_modal_screenshot.png' });
  console.log('Screenshot saved to scratch_modal_screenshot.png');
});
