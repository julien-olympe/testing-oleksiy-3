import { test, expect, Page } from '@playwright/test';

// Helper function to generate unique test data
function generateTestData() {
  const timestamp = Date.now();
  return {
    username: `test_user_critical_${timestamp}`,
    email: `test_critical_${timestamp}@example.com`,
    password: 'TestPassword123!',
  };
}

test.describe('Critical Path - Complete User Journey', () => {
  let page: Page;
  let testData: ReturnType<typeof generateTestData>;
  let projectId: string | null = null;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    testData = generateTestData();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('Complete critical path - 23 steps', async () => {
    // Phase 1: User Registration (Steps 1-4)
    // Step 1: Navigate to application login screen
    await page.goto('/');
    // Wait for redirect to login page
    await expect(page).toHaveURL(/.*login/i, { timeout: 5000 });
    await expect(page.locator('text=Login').or(page.locator('h2')).first()).toBeVisible();
    
    // Step 2: Navigate to registration screen
    // Wait for page to be stable on login page
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*login/i, { timeout: 5000 });
    
    // Now click register link
    const registerLink = page.locator('a:has-text("Register")').or(page.locator('[href*="register"]')).first();
    await registerLink.waitFor({ state: 'visible', timeout: 5000 });
    await registerLink.click();
    await expect(page).toHaveURL(/.*register/i, { timeout: 5000 });

    // Step 3: Fill registration form
    await page.fill('input[name="username"], input[placeholder*="username" i], input[type="text"]:first-of-type', testData.username);
    await page.fill('input[name="email"], input[type="email"], input[placeholder*="email" i]', testData.email);
    await page.fill('input[name="password"], input[type="password"]:first-of-type', testData.password);
    const confirmPassword = page.locator('input[name="confirmPassword"], input[name="passwordConfirmation"], input[type="password"]:nth-of-type(2)');
    if (await confirmPassword.isVisible()) {
      await confirmPassword.fill(testData.password);
    }

    // Step 4: Submit registration
    // Wait for the API call to complete
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/auth/register') && response.status() !== 0,
      { timeout: 10000 }
    ).catch(() => null);
    
    await page.click('button:has-text("Register"), button[type="submit"]');
    
    // Wait for API response
    const response = await responsePromise;
    if (response && !response.ok()) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Registration API failed: ${response.status()} - ${JSON.stringify(errorData)}`);
    }
    
    // Wait for navigation to login page
    try {
      await page.waitForURL(/.*login/i, { timeout: 10000 });
    } catch (error) {
      // Check if there's an error message instead
      const errorElement = page.locator('[style*="background-color: #fee"], [style*="color: #c33"]');
      if (await errorElement.isVisible({ timeout: 2000 })) {
        const errorText = await errorElement.textContent();
        throw new Error(`Registration failed with error: ${errorText}`);
      }
      // Log current URL for debugging
      const currentUrl = page.url();
      throw new Error(`Registration did not redirect to login. Current URL: ${currentUrl}`);
    }
    
    // Verify we're on login page
    await expect(page).toHaveURL(/.*login/i, { timeout: 5000 });

    // Phase 2: User Login (Steps 5-6)
    // Step 5: Fill login form
    await page.fill('input[name="username"], input[name="usernameOrEmail"], input[type="text"]:first-of-type', testData.username);
    await page.fill('input[name="password"], input[type="password"]', testData.password);

    // Step 6: Submit login
    await page.click('button:has-text("Login"), button[type="submit"]');
    await expect(page).toHaveURL(/.*home/i, { timeout: 5000 });

    // Phase 3: Start New Project (Steps 7-8)
    // Step 7: Verify Home screen
    await page.waitForLoadState('networkidle');
    // Wait for loading to complete (wait for "Loading projects..." to disappear)
    await page.waitForSelector('text=Loading projects...', { state: 'hidden', timeout: 10000 }).catch(() => {});
    await expect(page.locator('text=/my projects/i').or(page.locator('text=/projects/i')).or(page.locator('h2')).first()).toBeVisible({ timeout: 10000 });
    const startProjectButton = page.locator('button:has-text("Start Project")');
    await expect(startProjectButton).toBeVisible({ timeout: 10000 });

    // Step 8: Navigate to Start Project screen
    await startProjectButton.click();
    await expect(page).toHaveURL(/.*projects.*new/i, { timeout: 5000 });

    // Phase 4: Select Powerplant (Step 9)
    // Step 9: Select powerplant
    const powerplantSelect = page.locator('select[name="powerplantId"], select, [role="combobox"]').first();
    await expect(powerplantSelect).toBeVisible({ timeout: 10000 });
    await powerplantSelect.selectOption({ index: 0 }); // Select first powerplant
    await page.waitForTimeout(1000); // Wait for parts/checkups to load

    // Phase 5: Create Project (Steps 10-11)
    // Step 10: Create project
    const createButton = page.locator('button:has-text("Create"), button[type="submit"]');
    await expect(createButton).toBeEnabled({ timeout: 5000 });
    await createButton.click();
    await expect(page).toHaveURL(/.*home/i, { timeout: 5000 });

    // Step 11: Verify project in list
    await expect(page.locator('text=/in progress/i, [data-status="In Progress"]').first()).toBeVisible({ timeout: 5000 });
    const projectItem = page.locator('[data-project-id], .project-item, article, [role="article"]').first();
    if (await projectItem.isVisible()) {
      const projectHref = await projectItem.getAttribute('href');
      const projectIdMatch = projectHref?.match(/\/projects\/([^\/]+)/);
      if (projectIdMatch) {
        projectId = projectIdMatch[1];
      }
    }

    // Phase 6: View Ongoing Project (Step 12)
    // Step 12: Open project
    const projectLink = page.locator('a[href*="/projects/"], [data-project-id]').first();
    await projectLink.dblclick();
    await expect(page).toHaveURL(/.*projects\/[^\/]+/i, { timeout: 5000 });

    // Phase 7: Set Checkup Status (Steps 13-16)
    // Step 13: Set first checkup status to "bad"
    const firstCheckup = page.locator('[data-checkup-id], .checkup-item, button:has-text("checkup")').first();
    await firstCheckup.click();
    const statusBad = page.locator('button:has-text("bad"), [data-status="bad"], option:has-text("bad")').first();
    if (await statusBad.isVisible()) {
      await statusBad.click();
    } else {
      // Try dropdown
      const statusSelect = page.locator('select, [role="combobox"]').first();
      await statusSelect.selectOption('bad');
    }
    await page.waitForTimeout(500);

    // Step 14: Set second checkup status to "average"
    const checkups = page.locator('[data-checkup-id], .checkup-item');
    const checkupCount = await checkups.count();
    if (checkupCount > 1) {
      await checkups.nth(1).click();
      const statusAverage = page.locator('button:has-text("average"), [data-status="average"], option:has-text("average")').first();
      if (await statusAverage.isVisible()) {
        await statusAverage.click();
      } else {
        const statusSelect = page.locator('select, [role="combobox"]').first();
        await statusSelect.selectOption('average');
      }
      await page.waitForTimeout(500);
    }

    // Step 15: Set third checkup status to "good"
    if (checkupCount > 2) {
      await checkups.nth(2).click();
      const statusGood = page.locator('button:has-text("good"), [data-status="good"], option:has-text("good")').first();
      if (await statusGood.isVisible()) {
        await statusGood.click();
      } else {
        const statusSelect = page.locator('select, [role="combobox"]').first();
        await statusSelect.selectOption('good');
      }
      await page.waitForTimeout(500);
    }

    // Step 16: Set remaining checkup statuses
    for (let i = 3; i < checkupCount && i < 10; i++) {
      await checkups.nth(i).click();
      const statusSelect = page.locator('select, [role="combobox"]').first();
      const statuses = ['bad', 'average', 'good'];
      await statusSelect.selectOption(statuses[i % 3]);
      await page.waitForTimeout(300);
    }

    // Phase 8: View Documentation (Steps 17-18)
    // Step 17: Select checkup with documentation
    await checkups.first().click();
    await page.waitForTimeout(500);
    // Documentation panel should be visible
    const docPanel = page.locator('[data-documentation], .documentation, aside, [role="complementary"]');
    if (await docPanel.count() > 0) {
      await expect(docPanel.first()).toBeVisible();
    }

    // Step 18: Select different checkup
    if (checkupCount > 1) {
      await checkups.nth(1).click();
      await page.waitForTimeout(500);
    }

    // Phase 9: Finish Report (Steps 19-20)
    // Step 19: Verify all checkups have status
    const finishButton = page.locator('button:has-text("Finish Report"), button:has-text("Finish")');
    await expect(finishButton).toBeEnabled();

    // Step 20: Finish report
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
    await finishButton.click();
    await page.waitForTimeout(2000); // Wait for PDF generation
    
    // Phase 10: Download PDF Report (Step 21)
    // Step 21: Verify PDF download
    const download = await downloadPromise;
    if (download) {
      expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
    }

    // Phase 11: Verify Project Status (Steps 22-23)
    // Step 22: Verify project status on Home screen
    await expect(page).toHaveURL(/.*home/i, { timeout: 5000 });
    await expect(page.locator('text=/finished/i, [data-status="Finished"]').first()).toBeVisible({ timeout: 5000 });

    // Step 23: Attempt to open finished project
    const finishedProject = page.locator('[data-status="Finished"], text=/finished/i').first();
    if (await finishedProject.isVisible()) {
      await finishedProject.dblclick();
      await expect(page).toHaveURL(/.*projects\/[^\/]+/i, { timeout: 5000 });
      // Verify "Finish Report" button is disabled or hidden
      const finishButtonAfter = page.locator('button:has-text("Finish Report")');
      if (await finishButtonAfter.isVisible()) {
        await expect(finishButtonAfter).toBeDisabled();
      }
    }
  });
});
