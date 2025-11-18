import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Critical Path - Complete User Journey', () => {
  let timestamp: number;
  let testUsername: string;
  let testEmail: string;
  let testPassword: string;
  let projectId: string;

  test.beforeAll(() => {
    timestamp = Date.now();
    testUsername = `test_user_critical_${timestamp}`;
    testEmail = `test_critical_${timestamp}@example.com`;
    testPassword = 'TestPassword123!';
  });

  test('Complete critical path from registration to PDF download', async ({ page }) => {
    // ============================================
    // PHASE 1: User Registration (Steps 1-4)
    // ============================================

    // Step 1: Navigate to application login screen
    await page.goto('/login');
    await expect(page.locator('h2')).toContainText('Login');
    await expect(page.locator('input[id="usernameOrEmail"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('a[href="/register"]')).toBeVisible();

    // Step 2: Navigate to registration screen
    await page.click('a[href="/register"]');
    await expect(page).toHaveURL(/.*\/register/);
    await expect(page.locator('input[id="username"]')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('input[id="passwordConfirmation"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('a[href="/login"]')).toBeVisible();

    // Step 3: Fill registration form
    await page.fill('input[id="username"]', testUsername);
    await page.fill('input[id="email"]', testEmail);
    await page.fill('input[id="password"]', testPassword);
    await page.fill('input[id="passwordConfirmation"]', testPassword);
    
    // Verify fields are filled
    await expect(page.locator('input[id="username"]')).toHaveValue(testUsername);
    await expect(page.locator('input[id="email"]')).toHaveValue(testEmail);
    await expect(page.locator('input[id="password"]')).toHaveValue(testPassword);
    await expect(page.locator('input[id="passwordConfirmation"]')).toHaveValue(testPassword);

    // Step 4: Submit registration
    await page.click('button[type="submit"]');
    // Wait for redirect to login page
    await expect(page).toHaveURL(/.*\/login/, { timeout: 5000 });
    // Check for success message or redirect (may vary based on implementation)
    await expect(page.locator('h2')).toContainText('Login');

    // ============================================
    // PHASE 2: User Login (Steps 5-6)
    // ============================================

    // Step 5: Fill login form
    await page.fill('input[id="usernameOrEmail"]', testUsername);
    await page.fill('input[id="password"]', testPassword);
    
    // Verify fields are filled
    await expect(page.locator('input[id="usernameOrEmail"]')).toHaveValue(testUsername);
    await expect(page.locator('input[id="password"]')).toHaveValue(testPassword);

    // Step 6: Submit login
    await page.click('button[type="submit"]');
    // Wait for redirect to home page
    await expect(page).toHaveURL(/.*\/home/, { timeout: 5000 });

    // ============================================
    // PHASE 3: Start New Project (Steps 7-8)
    // ============================================

    // Step 7: Verify Home screen
    await expect(page.locator('header h1')).toContainText('Wind Power Plant Investigation');
    await expect(page.locator('h2')).toContainText('My Projects');
    await expect(page.locator('button:has-text("Start Project")')).toBeVisible();
    // Verify user menu shows username
    await expect(page.locator(`text=${testUsername}`)).toBeVisible();

    // Step 8: Navigate to Start Project screen
    await page.click('button:has-text("Start Project")');
    await expect(page).toHaveURL(/.*\/projects\/new/);
    await expect(page.locator('h2')).toContainText('Start New Project');
    await expect(page.locator('select[id="powerplant"]')).toBeVisible();
    await expect(page.locator('button:has-text("Create Project")')).toBeVisible();
    await expect(page.locator('button:has-text("Back")')).toBeVisible();
    
    // Verify powerplant dropdown is populated
    const powerplantSelect = page.locator('select[id="powerplant"]');
    await expect(powerplantSelect).toBeVisible();
    // Wait for options to load (should have at least one option besides the default)
    await page.waitForSelector('select[id="powerplant"] option:not([value=""])', { timeout: 5000 });

    // ============================================
    // PHASE 4: Select Powerplant (Step 9)
    // ============================================

    // Step 9: Select powerplant
    const powerplantOptions = await powerplantSelect.locator('option:not([value=""])').all();
    expect(powerplantOptions.length).toBeGreaterThan(0);
    
    // Get the first powerplant option value
    const firstPowerplantValue = await powerplantOptions[0].getAttribute('value');
    expect(firstPowerplantValue).toBeTruthy();
    
    await powerplantSelect.selectOption(firstPowerplantValue!);
    
    // Wait for parts and checkups to load
    await page.waitForSelector('h3', { timeout: 5000 });
    await expect(page.locator('h4:has-text("Parts and Checkups:")')).toBeVisible();
    
    // Verify parts are displayed
    const parts = await page.locator('div[style*="border: 1px solid"]').all();
    expect(parts.length).toBeGreaterThanOrEqual(2);
    
    // Verify Create button is enabled
    await expect(page.locator('button:has-text("Create Project")')).toBeEnabled();

    // ============================================
    // PHASE 5: Create Project (Steps 10-11)
    // ============================================

    // Step 10: Create project
    await page.click('button:has-text("Create Project")');
    
    // Wait for redirect to home page
    await expect(page).toHaveURL(/.*\/home/, { timeout: 5000 });

    // Step 11: Verify project in list
    await expect(page.locator('h2')).toContainText('My Projects');
    
    // Find the project card (should be visible)
    const projectCards = await page.locator('div[style*="cursor: pointer"]').all();
    expect(projectCards.length).toBeGreaterThan(0);
    
    // Get the first project card and verify it shows "In Progress"
    const firstProjectCard = projectCards[0];
    await expect(firstProjectCard.locator('text=/Status:/')).toBeVisible();
    await expect(firstProjectCard.locator('text=/In Progress/')).toBeVisible();
    
    // Extract project ID from the card (we'll need it later)
    // The project card should be clickable, we'll get the ID when we open it

    // ============================================
    // PHASE 6: View Ongoing Project (Step 12)
    // ============================================

    // Step 12: Open project
    await firstProjectCard.dblclick();
    
    // Wait for navigation to project page
    await expect(page).toHaveURL(/.*\/projects\/[^/]+/, { timeout: 5000 });
    
    // Extract project ID from URL
    const url = page.url();
    const match = url.match(/\/projects\/([^/]+)/);
    if (match) {
      projectId = match[1];
    }
    
    // Verify Ongoing Project screen
    await expect(page.locator('h2')).toBeVisible(); // Powerplant name
    await expect(page.locator('button:has-text("Finish Report")')).toBeVisible();
    await expect(page.locator('h3:has-text("Parts and Checkups")')).toBeVisible();
    
    // Verify all parts are displayed
    const partSections = await page.locator('div[style*="marginBottom: 2rem"]').all();
    expect(partSections.length).toBeGreaterThan(0);
    
    // Verify checkups are displayed (they should be in the parts)
    const checkupItems = await page.locator('div[style*="cursor: pointer"]').all();
    expect(checkupItems.length).toBeGreaterThan(0);

    // ============================================
    // PHASE 7: Set Checkup Status (Steps 13-16)
    // ============================================

    // Get all checkup items
    const allCheckups = await page.locator('div[style*="cursor: pointer"]').all();
    expect(allCheckups.length).toBeGreaterThanOrEqual(3);

    // Step 13: Set first checkup status to "bad"
    const firstCheckup = allCheckups[0];
    await firstCheckup.click();
    
    // Find the status buttons within this checkup
    const badButton = firstCheckup.locator('button:has-text("bad")');
    await expect(badButton).toBeVisible();
    await badButton.click();
    
    // Wait for status update
    await page.waitForTimeout(500);
    
    // Verify status indicator shows "bad"
    await expect(firstCheckup.locator('text=/bad/')).toBeVisible();

    // Step 14: Set second checkup status to "average"
    const secondCheckup = allCheckups[1];
    await secondCheckup.click();
    
    const averageButton = secondCheckup.locator('button:has-text("average")');
    await expect(averageButton).toBeVisible();
    await averageButton.click();
    
    await page.waitForTimeout(500);
    
    // Verify status indicator shows "average"
    await expect(secondCheckup.locator('text=/average/')).toBeVisible();

    // Step 15: Set third checkup status to "good"
    const thirdCheckup = allCheckups[2];
    await thirdCheckup.click();
    
    const goodButton = thirdCheckup.locator('button:has-text("good")');
    await expect(goodButton).toBeVisible();
    await goodButton.click();
    
    await page.waitForTimeout(500);
    
    // Verify status indicator shows "good"
    await expect(thirdCheckup.locator('text=/good/')).toBeVisible();

    // Step 16: Set remaining checkup statuses
    // Set all remaining checkups to "average" for simplicity
    for (let i = 3; i < allCheckups.length; i++) {
      const checkup = allCheckups[i];
      await checkup.click();
      const avgButton = checkup.locator('button:has-text("average")');
      if (await avgButton.isVisible()) {
        await avgButton.click();
        await page.waitForTimeout(300);
      }
    }
    
    // Verify all checkups have status indicators
    const updatedCheckups = await page.locator('div[style*="cursor: pointer"]').all();
    for (const checkup of updatedCheckups) {
      const statusText = await checkup.locator('span').textContent();
      expect(statusText).toMatch(/(bad|average|good)/);
    }

    // ============================================
    // PHASE 8: View Documentation (Steps 17-18)
    // ============================================

    // Step 17: Select checkup with documentation
    // Click on a checkup to view documentation
    await updatedCheckups[0].click();
    
    // Wait for documentation panel to update
    await page.waitForTimeout(500);
    
    // Verify documentation panel is visible
    await expect(page.locator('h3:has-text("Documentation")')).toBeVisible();
    
    // The documentation panel should show the selected checkup's name
    const selectedCheckupName = await updatedCheckups[0].locator('strong').textContent();
    if (selectedCheckupName) {
      await expect(page.locator(`h4:has-text("${selectedCheckupName}")`)).toBeVisible();
    }

    // Step 18: Select different checkup
    if (updatedCheckups.length > 1) {
      await updatedCheckups[1].click();
      await page.waitForTimeout(500);
      
      // Verify documentation panel updated
      const newCheckupName = await updatedCheckups[1].locator('strong').textContent();
      if (newCheckupName) {
        await expect(page.locator(`h4:has-text("${newCheckupName}")`)).toBeVisible();
      }
    }

    // ============================================
    // PHASE 9: Finish Report (Steps 19-20)
    // ============================================

    // Step 19: Verify all checkups have status
    const finalCheckups = await page.locator('div[style*="cursor: pointer"]').all();
    for (const checkup of finalCheckups) {
      const statusText = await checkup.locator('span').textContent();
      expect(statusText).toMatch(/(bad|average|good)/);
    }
    
    // Verify Finish Report button is enabled
    await expect(page.locator('button:has-text("Finish Report")')).toBeEnabled();

    // Step 20: Finish report
    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
    
    // Handle confirmation dialog if it appears (set up before clicking)
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    
    await page.click('button:has-text("Finish Report")');
    
    // Wait for download to start
    const download = await downloadPromise;
    
    // Verify download filename
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/Project_.*\.pdf/);
    
    // Wait for navigation back to home
    await expect(page).toHaveURL(/.*\/home/, { timeout: 10000 });

    // ============================================
    // PHASE 10: Download PDF Report (Step 21)
    // ============================================

    // Step 21: Verify PDF download
    // Download is already handled in Step 20
    expect(download).toBeTruthy();
    expect(filename).toBeTruthy();
    
    // Verify file size is reasonable (should be less than 25MB)
    const downloadPath = await download.path();
    if (downloadPath) {
      const stats = fs.statSync(downloadPath);
      expect(stats.size).toBeLessThan(25 * 1024 * 1024); // 25MB
      expect(stats.size).toBeGreaterThan(0); // File should not be empty
    }

    // ============================================
    // PHASE 11: Verify Project Status (Steps 22-23)
    // ============================================

    // Step 22: Verify project status on Home screen
    await expect(page.locator('h2')).toContainText('My Projects');
    
    // Find the finished project
    const finishedProjectCards = await page.locator('div[style*="cursor: pointer"]').all();
    expect(finishedProjectCards.length).toBeGreaterThan(0);
    
    // Find the project with "Finished" status
    let finishedProject = null;
    for (const card of finishedProjectCards) {
      const statusText = await card.textContent();
      if (statusText?.includes('Finished')) {
        finishedProject = card;
        break;
      }
    }
    
    expect(finishedProject).toBeTruthy();
    if (finishedProject) {
      await expect(finishedProject.locator('text=/Status:/')).toBeVisible();
      await expect(finishedProject.locator('text=/Finished/')).toBeVisible();
    }

    // Step 23: Attempt to open finished project
    if (finishedProject) {
      await finishedProject.dblclick();
      
      // Wait for navigation
      await expect(page).toHaveURL(/.*\/projects\/[^/]+/, { timeout: 5000 });
      
      // Verify project is displayed
      await expect(page.locator('h2')).toBeVisible(); // Powerplant name
      await expect(page.locator('h3:has-text("Parts and Checkups")')).toBeVisible();
      
      // Verify Finish Report button is disabled or hidden
      const finishButton = page.locator('button:has-text("Finish Report")');
      const isVisible = await finishButton.isVisible();
      if (isVisible) {
        await expect(finishButton).toBeDisabled();
      }
      
      // Verify all status values are shown (read-only)
      const readOnlyCheckups = await page.locator('div[style*="cursor: pointer"]').all();
      for (const checkup of readOnlyCheckups) {
        const statusText = await checkup.locator('span').textContent();
        expect(statusText).toMatch(/(bad|average|good)/);
      }
    }
  });
});
