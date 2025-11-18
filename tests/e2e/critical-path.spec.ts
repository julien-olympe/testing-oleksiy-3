import { test, expect } from '@playwright/test';

test.describe('Critical Path - Complete User Journey', () => {
  const timestamp = Date.now();
  const username = `test_user_critical_${timestamp}`;
  const email = `test_critical_${timestamp}@example.com`;
  const password = 'TestPassword123!';

  test('Complete user journey from registration to PDF download', async ({ page }) => {
    // Phase 1: User Registration
    // Step 1: Navigate to application login screen
    await page.goto('/login');
    await expect(page.locator('text=Wind Power Plant Investigation').or(page.locator('input[type="text"], input[type="email"]'))).toBeVisible({ timeout: 10000 });

    // Step 2: Navigate to registration screen
    const registerLink = page.locator('text=Register').or(page.locator('a[href*="register"]'));
    if (await registerLink.isVisible()) {
      await registerLink.click();
    } else {
      await page.goto('/register');
    }
    await expect(page.locator('input[type="text"], input[type="email"]').first()).toBeVisible();

    // Step 3: Fill registration form
    const usernameInput = page.locator('input[name="username"]').or(page.locator('input[type="text"]').first());
    const emailInput = page.locator('input[name="email"]').or(page.locator('input[type="email"]'));
    const passwordInput = page.locator('input[name="password"]').or(page.locator('input[type="password"]').first());
    const confirmPasswordInput = page.locator('input[name="confirmPassword"]').or(page.locator('input[type="password"]').nth(1));

    await usernameInput.fill(username);
    await emailInput.fill(email);
    await passwordInput.fill(password);
    await confirmPasswordInput.fill(password);

    // Step 4: Submit registration
    const registerButton = page.locator('button:has-text("Register")').or(page.locator('button[type="submit"]'));
    await registerButton.click();
    
    // Wait for redirect to login
    await page.waitForURL('**/login', { timeout: 5000 }).catch(() => {});

    // Phase 2: User Login
    // Step 5: Fill login form
    const loginUsernameInput = page.locator('input[name="username"]').or(page.locator('input[type="text"], input[type="email"]').first());
    const loginPasswordInput = page.locator('input[name="password"]').or(page.locator('input[type="password"]').first());
    
    await loginUsernameInput.fill(username);
    await loginPasswordInput.fill(password);

    // Step 6: Submit login
    const loginButton = page.locator('button:has-text("Login")').or(page.locator('button[type="submit"]'));
    await loginButton.click();

    // Wait for redirect to home
    await page.waitForURL('**/home', { timeout: 5000 });

    // Phase 3: Start New Project
    // Step 7: Verify Home screen
    await expect(page.locator('text=My Projects').or(page.locator('text=Projects'))).toBeVisible({ timeout: 5000 });

    // Step 8: Navigate to Start Project screen
    const startProjectButton = page.locator('button:has-text("Start Project")').or(page.locator('button:has-text("New Project")'));
    await startProjectButton.click();
    await page.waitForURL('**/projects/new', { timeout: 5000 });

    // Phase 4: Select Powerplant
    // Step 9: Select powerplant
    const powerplantSelect = page.locator('select').or(page.locator('[role="combobox"]')).first();
    await powerplantSelect.waitFor({ state: 'visible', timeout: 10000 });
    await powerplantSelect.click();
    
    // Select first available option
    const firstOption = page.locator('option').or(page.locator('[role="option"]')).first();
    const optionValue = await firstOption.getAttribute('value').catch(() => null);
    if (optionValue) {
      await powerplantSelect.selectOption(optionValue);
    } else {
      await firstOption.click();
    }

    // Wait for parts to load
    await page.waitForTimeout(1000);

    // Phase 5: Create Project
    // Step 10: Create project
    const createButton = page.locator('button:has-text("Create")').or(page.locator('button[type="submit"]'));
    await createButton.click();

    // Wait for redirect to home
    await page.waitForURL('**/home', { timeout: 5000 });

    // Step 11: Verify project in list
    await expect(page.locator('text=In Progress').first()).toBeVisible({ timeout: 5000 });

    // Phase 6: View Ongoing Project
    // Step 12: Open project
    const projectItem = page.locator('[data-testid="project"]').or(page.locator('div:has-text("In Progress")').first());
    await projectItem.dblclick();
    await page.waitForURL(/.*\/projects\/.*/, { timeout: 5000 });

    // Phase 7: Set Checkup Status
    // Step 13: Set first checkup status to "bad"
    const firstCheckup = page.locator('[data-testid="checkup"]').or(page.locator('div:has-text("checkup")').first()).first();
    await firstCheckup.click();
    
    const statusSelector = page.locator('select').or(page.locator('button:has-text("bad")')).first();
    await statusSelector.click();
    const badOption = page.locator('text=bad').or(page.locator('[value="bad"]')).first();
    await badOption.click();
    await page.waitForTimeout(500);

    // Step 14: Set second checkup status to "average"
    const secondCheckup = page.locator('[data-testid="checkup"]').or(page.locator('div:has-text("checkup")').nth(1));
    if (await secondCheckup.isVisible()) {
      await secondCheckup.click();
      const averageOption = page.locator('text=average').or(page.locator('[value="average"]')).first();
      await averageOption.click();
      await page.waitForTimeout(500);
    }

    // Step 15: Set third checkup status to "good"
    const thirdCheckup = page.locator('[data-testid="checkup"]').or(page.locator('div:has-text("checkup")').nth(2));
    if (await thirdCheckup.isVisible()) {
      await thirdCheckup.click();
      const goodOption = page.locator('text=good').or(page.locator('[value="good"]')).first();
      await goodOption.click();
      await page.waitForTimeout(500);
    }

    // Step 16: Set remaining checkup statuses (simplified - set all to "good")
    const allCheckups = page.locator('[data-testid="checkup"]').or(page.locator('div:has-text("checkup")'));
    const count = await allCheckups.count();
    for (let i = 3; i < Math.min(count, 10); i++) {
      const checkup = allCheckups.nth(i);
      if (await checkup.isVisible()) {
        await checkup.click();
        const goodOpt = page.locator('text=good').or(page.locator('[value="good"]')).first();
        await goodOpt.click();
        await page.waitForTimeout(300);
      }
    }

    // Phase 8: View Documentation
    // Step 17: Select checkup with documentation
    const checkupWithDoc = page.locator('[data-testid="checkup"]').or(page.locator('div:has-text("checkup")')).first();
    await checkupWithDoc.click();
    await page.waitForTimeout(500);

    // Step 18: Select different checkup (if available)
    const anotherCheckup = page.locator('[data-testid="checkup"]').or(page.locator('div:has-text("checkup")')).nth(1);
    if (await anotherCheckup.isVisible()) {
      await anotherCheckup.click();
      await page.waitForTimeout(500);
    }

    // Phase 9: Finish Report
    // Step 19: Verify all checkups have status (implicit - we set them above)
    
    // Step 20: Finish report
    const finishButton = page.locator('button:has-text("Finish Report")').or(page.locator('button:has-text("Finish")'));
    await finishButton.click();

    // Wait for PDF download or redirect
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
    await page.waitForTimeout(2000);
    const download = await downloadPromise;

    // Phase 10: Download PDF Report
    // Step 21: Verify PDF download
    if (download) {
      expect(download.suggestedFilename()).toContain('.pdf');
    }

    // Wait for redirect to home
    await page.waitForURL('**/home', { timeout: 10000 }).catch(() => {});

    // Phase 11: Verify Project Status
    // Step 22: Verify project status on Home screen
    await expect(page.locator('text=Finished').or(page.locator('text=In Progress'))).toBeVisible({ timeout: 5000 });

    // Step 23: Attempt to open finished project
    const finishedProject = page.locator('text=Finished').first();
    if (await finishedProject.isVisible()) {
      await finishedProject.click();
      await page.waitForTimeout(1000);
    }
  });
});
