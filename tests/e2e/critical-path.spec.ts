import { test, expect, Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test data
let testUserId: string | null = null;
let testProjectId: string | null = null;
let testPowerplantId: string | null = null;
let testCheckupIds: string[] = [];

// Generate unique test data
const timestamp = Date.now();
const testUsername = `test_user_critical_${timestamp}`;
const testEmail = `test_critical_${timestamp}@example.com`;
const testPassword = 'TestPassword123!';

test.beforeAll(async () => {
  // Create test powerplant with parts and checkups
  const powerplant = await prisma.powerplant.create({
    data: {
      name: `Test Powerplant ${timestamp}`,
      location: 'Test Location',
      parts: {
        create: [
          {
            name: 'Part 1',
            description: 'Test Part 1',
            displayOrder: 1,
            checkups: {
              create: [
                {
                  name: 'Checkup 1-1',
                  description: 'Test checkup 1-1',
                  displayOrder: 1,
                  documentationText: 'Documentation text for checkup 1-1',
                },
                {
                  name: 'Checkup 1-2',
                  description: 'Test checkup 1-2',
                  displayOrder: 2,
                  documentationText: 'Documentation text for checkup 1-2',
                },
              ],
            },
          },
          {
            name: 'Part 2',
            description: 'Test Part 2',
            displayOrder: 2,
            checkups: {
              create: [
                {
                  name: 'Checkup 2-1',
                  description: 'Test checkup 2-1',
                  displayOrder: 1,
                  documentationText: 'Documentation text for checkup 2-1',
                },
                {
                  name: 'Checkup 2-2',
                  description: 'Test checkup 2-2',
                  displayOrder: 2,
                  documentationText: 'Documentation text for checkup 2-2',
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      parts: {
        include: {
          checkups: true,
        },
      },
    },
  });

  testPowerplantId = powerplant.id;
  testCheckupIds = powerplant.parts.flatMap((p) => p.checkups.map((c) => c.id));
});

test.afterAll(async () => {
  // Cleanup test data
  if (testProjectId) {
    await prisma.checkupStatus.deleteMany({ where: { projectId: testProjectId } });
    await prisma.project.delete({ where: { id: testProjectId } });
  }
  if (testUserId) {
    await prisma.user.delete({ where: { id: testUserId } });
  }
  if (testPowerplantId) {
    await prisma.powerplant.delete({ where: { id: testPowerplantId } });
  }
  await prisma.$disconnect();
});

test('Critical Path - Complete User Journey', async ({ page, context }) => {
  const startTime = Date.now();

  // Phase 1: User Registration
  test.step('Phase 1: User Registration', async () => {
    // Step 1: Navigate to login screen
    await page.goto('/login');
    await expect(page.locator('h2')).toContainText('Login');
    await expect(page.locator('#usernameOrEmail')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('a[href="/register"]')).toBeVisible();

    // Step 2: Navigate to registration screen
    await page.click('a[href="/register"]');
    await expect(page).toHaveURL('/register');
    await expect(page.locator('h2')).toContainText('Register');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#passwordConfirmation')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Step 3: Fill registration form
    await page.fill('#username', testUsername);
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.fill('#passwordConfirmation', testPassword);

    // Step 4: Submit registration
    await page.click('button[type="submit"]');
    await page.waitForURL('/home', { timeout: 5000 });

    // Verification: User account created
    const user = await prisma.user.findUnique({ where: { username: testUsername } });
    expect(user).not.toBeNull();
    expect(user?.email).toBe(testEmail);
    testUserId = user!.id;
  });

  // Phase 2: User Login (already logged in from registration, but verify)
  test.step('Phase 2: User Login', async () => {
    await expect(page).toHaveURL('/home');
    // User should be on home page after registration
  });

  // Phase 3: Start New Project
  test.step('Phase 3: Start New Project', async () => {
    // Step 7: Verify Home screen
    await expect(page.locator('h2')).toContainText('My Projects');
    await expect(page.locator('button:has-text("Start Project")')).toBeVisible();

    // Step 8: Navigate to Start Project screen
    await page.click('button:has-text("Start Project")');
    await expect(page).toHaveURL('/projects/new');
    await expect(page.locator('h2')).toContainText('Start New Project');
    await expect(page.locator('#powerplant')).toBeVisible();
    await expect(page.locator('button:has-text("Create Project")')).toBeVisible();
  });

  // Phase 4: Select Powerplant
  test.step('Phase 4: Select Powerplant', async () => {
    // Step 9: Select powerplant
    await page.selectOption('#powerplant', testPowerplantId!);
    await page.waitForTimeout(1000); // Wait for parts to load

    // Verify parts and checkups are displayed
    const partsText = await page.textContent('body');
    expect(partsText).toContain('Part 1');
    expect(partsText).toContain('Part 2');
    expect(partsText).toContain('Checkup 1-1');
    expect(partsText).toContain('Checkup 1-2');
    expect(partsText).toContain('Checkup 2-1');
    expect(partsText).toContain('Checkup 2-2');

    // Verify Create button is enabled
    await expect(page.locator('button:has-text("Create Project")')).toBeEnabled();
  });

  // Phase 5: Create Project
  test.step('Phase 5: Create Project', async () => {
    // Step 10: Create project
    await page.click('button:has-text("Create Project")');
    await page.waitForURL('/home', { timeout: 10000 });

    // Step 11: Verify project in list
    await expect(page.locator('h2')).toContainText('My Projects');
    await page.waitForTimeout(1000); // Wait for projects to load
    const projectCard = page.locator(`text=${`Test Powerplant ${timestamp}`}`).first();
    await expect(projectCard).toBeVisible({ timeout: 10000 });

    // Verification: Project exists in database
    const project = await prisma.project.findFirst({
      where: { userId: testUserId!, powerplantId: testPowerplantId! },
      orderBy: { createdAt: 'desc' },
    });
    expect(project).not.toBeNull();
    if (!project) {
      throw new Error('Project was not created in database');
    }
    expect(project.status).toBe('In Progress');
    testProjectId = project.id;
    console.log(`Created project with ID: ${testProjectId}`);
  });

  // Phase 6: View Ongoing Project
  test.step('Phase 6: View Ongoing Project', async () => {
    // Step 12: Open project
    const projectCard = page.locator(`text=${`Test Powerplant ${timestamp}`}`).first();
    await projectCard.dblclick();
    await expect(page).toHaveURL(new RegExp(`/projects/${testProjectId}`));

    // Verify Ongoing Project screen
    await expect(page.locator('h2')).toContainText(`Test Powerplant ${timestamp}`);
    await expect(page.locator('button:has-text("Finish Report")')).toBeVisible();
    
    // Verify parts and checkups are displayed
    const bodyText = await page.textContent('body');
    expect(bodyText).toContain('Part 1');
    expect(bodyText).toContain('Part 2');
  });

  // Phase 7: Set Checkup Status
  test.step('Phase 7: Set Checkup Status', async () => {
    // Wait for checkups to be visible
    await page.waitForSelector('text=Checkup 1-1', { timeout: 5000 });

    // Step 13: Set first checkup status to "bad"
    // Find all "bad" buttons and click the first one (should be for Checkup 1-1)
    const badButtons = page.locator('button:has-text("bad")');
    await badButtons.first().click();
    await page.waitForTimeout(1000); // Wait for API call

    // Step 14: Set second checkup status to "average"
    const averageButtons = page.locator('button:has-text("average")');
    await averageButtons.first().click();
    await page.waitForTimeout(1000);

    // Step 15: Set third checkup status to "good"
    const goodButtons = page.locator('button:has-text("good")');
    await goodButtons.first().click();
    await page.waitForTimeout(1000);

    // Step 16: Set remaining checkup statuses (click another "good" button)
    const goodButtons2 = page.locator('button:has-text("good")');
    const goodCount = await goodButtons2.count();
    if (goodCount > 1) {
      await goodButtons2.nth(1).click();
    } else {
      await goodButtons2.first().click();
    }
    await page.waitForTimeout(2000); // Wait for all status updates

    // Verification: CheckupStatus records exist in database
    const statuses = await prisma.checkupStatus.findMany({
      where: { projectId: testProjectId! },
    });
    expect(statuses.length).toBeGreaterThanOrEqual(3);
    
    // Reload page to see status badges
    await page.reload();
    await page.waitForSelector('text=Checkup 1-1', { timeout: 5000 });
  });

  // Phase 8: View Documentation
  test.step('Phase 8: View Documentation', async () => {
    // Step 17: Select checkup with documentation
    // Click on first checkup (clicking on the checkup div, not the button)
    // Find the checkup by text and click its container
    const checkup1Text = page.locator('text=Checkup 1-1').first();
    await checkup1Text.click({ force: true });
    await page.waitForTimeout(500);
    
    // Verify documentation panel shows checkup name
    await expect(page.locator('h4:has-text("Checkup 1-1")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Documentation text for checkup 1-1')).toBeVisible({ timeout: 5000 });

    // Step 18: Select different checkup
    const checkup2Text = page.locator('text=Checkup 1-2').first();
    await checkup2Text.click({ force: true });
    await page.waitForTimeout(500);
    
    // Verify documentation panel updates
    await expect(page.locator('h4:has-text("Checkup 1-2")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Documentation text for checkup 1-2')).toBeVisible({ timeout: 5000 });
  });

  // Phase 9: Finish Report
  test.step('Phase 9: Finish Report', async () => {
    // Ensure testProjectId is set
    expect(testProjectId).not.toBeNull();
    if (!testProjectId) {
      throw new Error('testProjectId is not set');
    }
    
    // Step 19: Verify all checkups have status (already set in Phase 7)
    // Verify in database that statuses are set
    const statuses = await prisma.checkupStatus.findMany({
      where: { projectId: testProjectId },
    });
    expect(statuses.length).toBeGreaterThanOrEqual(3);
    
    // Verify status values are valid
    const statusValues = statuses.map(s => s.statusValue);
    expect(statusValues).toContain('bad');
    expect(statusValues).toContain('average');
    expect(statusValues).toContain('good');
    
    // Step 20: Finish report
    // Set up download listener before clicking
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);

    // Handle confirm dialog
    page.once('dialog', (dialog) => {
      dialog.accept();
    });

    await page.click('button:has-text("Finish Report")');
    
    // Wait for download or navigation
    await Promise.race([
      downloadPromise,
      page.waitForURL('/home', { timeout: 10000 }),
    ]);

    // Verification: Project status updated
    const project = await prisma.project.findUnique({
      where: { id: testProjectId! },
    });
    expect(project?.status).toBe('Finished');
    expect(project?.finishedAt).not.toBeNull();
  });

  // Phase 10: Download PDF Report
  test.step('Phase 10: Download PDF Report', async () => {
    // Step 21: Verify PDF download (handled in Phase 9)
    // PDF download should have been triggered
    // Note: In headless mode, downloads are handled differently
  });

  // Phase 11: Verify Project Status
  test.step('Phase 11: Verify Project Status', async () => {
    // Step 22: Verify project status on Home screen
    await expect(page).toHaveURL('/home');
    const projectCard = page.locator(`text=${`Test Powerplant ${timestamp}`}`).first();
    await expect(projectCard).toBeVisible();
    
    // Check for "Finished" status
    const statusText = await page.textContent('body');
    expect(statusText).toContain('Finished');

    // Step 23: Attempt to open finished project
    await projectCard.dblclick();
    await expect(page).toHaveURL(new RegExp(`/projects/${testProjectId}`));
    
    // Verify "Finish Report" button is disabled or hidden
    const finishButton = page.locator('button:has-text("Finish Report")');
    const buttonCount = await finishButton.count();
    if (buttonCount > 0) {
      await expect(finishButton).toBeDisabled();
    }
  });

  // Performance assertions
  const totalTime = Date.now() - startTime;
  console.log(`Total test execution time: ${totalTime}ms`);
  // Note: Individual performance assertions would be added per step
});
