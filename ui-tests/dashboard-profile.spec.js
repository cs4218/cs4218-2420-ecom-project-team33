import { test, expect } from "@playwright/test";

/*
  This e2e test will simulate the following actions for dashboard and profile:
  
  1. User initially will not be logged in.
  2. User will log in with existing credentials.
  3. User will navigate to their dashboard to view their personal information.
  4. User will update their profile information with invalid password
  5. User will update their profile information with valid fields
  5. User will revert changes
  6. User attempts to update their profile with incorrect inputs
  
  Pre-requisites for the e2e test:
  
  1. User already has an account (username: cs4218@test.com, password: cs4218@test.com)
  2. User has at least one existing order in their order history
  3. The application is running with test data loaded
*/

// Test user credentials based on the screenshots
const TEST_USER = {
  email: "cs4218@test.com",
  password: "cs4218@test.com",
  name: "CS 4218 Test Account",
  phone: "81574322",
  address: "1 Computing Drive"
};

const UPDATED_TEST_USER = {
    email: "cs4218@test.com",
    password: "cs4218@test",
    name: "CS4218 Tester",
    phone: "90881653",
    address: "2 Computing Drive"
  };

const INVALID_CREDENTIALS = {
  password_short: "cs421",
  phone_short: "12345",
  phone_non_numeric: "12hkjhldui"
};

test.describe('Dashboard and Profile E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto("/");
    
    // Click on login 
    await page.getByRole('link', { name: 'Login' }).click();
    
    // Fill login form and submit
    await page.getByPlaceholder('Enter Your Email').fill(TEST_USER.email);
    await page.getByPlaceholder('Enter Your Password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'LOGIN' }).click();
    
    // Verify logged in by checking user name in navbar
    await expect(page.getByText(TEST_USER.name)).toBeVisible();
  });
  
  test('User can access dashboard and view personal information', async ({ page }) => {
    // Navigate to dashboard via dropdown
    await page.getByRole('button', { name: TEST_USER.name }).click();
    await page.getByRole('link', { name: 'DASHBOARD' }).click();
    
    // Verify we're on dashboard page
    await expect(page).toHaveURL(/.*\/dashboard\/user/);
    
    // Verify dashboard menu items are visible
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Profile' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Orders' })).toBeVisible();
    
    // Check user information is displayed correctly
    await expect(page.getByRole('heading', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('heading', { name: TEST_USER.name })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Contact' })).toBeVisible();
    await expect(page.getByRole('heading', { name: TEST_USER.phone })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('heading', { name: TEST_USER.email })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Address' })).toBeVisible();
    await expect(page.getByRole('heading', { name: TEST_USER.address })).toBeVisible();
  });

  test('User can navigate to profile page and update information', async ({ page }) => {
    // Navigate to profile page
    await page.getByRole('button', { name: TEST_USER.name }).click();
    await page.getByRole('link', { name: 'DASHBOARD' }).click();
    await page.getByRole('link', { name: 'Profile' }).click();
    
    // Verify we're on profile page
    await expect(page).toHaveURL(/.*\/dashboard\/user\/profile/);
    
    // Update credentials with short password 
    await page.getByTestId('name').click();
    await page.getByTestId('name').fill(UPDATED_TEST_USER.name);
    await page.getByTestId('password').click();
    await page.getByTestId('password').fill(INVALID_CREDENTIALS.password_short);
    await page.getByTestId('phone').click();
    await page.getByTestId('phone').fill(UPDATED_TEST_USER.phone);
    await page.getByTestId('address').click();
    await page.getByTestId('address').fill(UPDATED_TEST_USER.address);

    // Verify that the form didn't submit successfully and profile is unchanged
    await page.getByRole('link', { name: 'Dashboard' }).click();

    // Check unchanged credentials
    await expect(page.getByRole('heading', { name: TEST_USER.name })).toBeVisible();
    await expect(page.getByRole('heading', { name: TEST_USER.phone })).toBeVisible();
    await expect(page.getByRole('heading', { name: TEST_USER.email })).toBeVisible();
    await expect(page.getByRole('heading', { name: TEST_USER.address })).toBeVisible();

    // Navigate back to profile
    await page.getByRole('link', { name: 'Profile' }).click();

    // Update credentials with valid credentials 
    await page.getByTestId('name').click();
    await page.getByTestId('name').fill(UPDATED_TEST_USER.name);
    await page.getByTestId('password').click();
    await page.getByTestId('password').fill(UPDATED_TEST_USER.password);
    await page.getByTestId('phone').click();
    await page.getByTestId('phone').fill(UPDATED_TEST_USER.phone);
    await page.getByTestId('address').click();
    await page.getByTestId('address').fill(UPDATED_TEST_USER.address);
    
    // Save changes
    await page.getByRole('button', { name: 'Update' }).click();
    
    // Wait for the update to process
    await page.waitForTimeout(1000);
    
    // Navigate to dashboard
    await page.getByRole('link', { name: 'Dashboard' }).click();
    
    // Check updated credentials
    await expect(page.getByRole('heading', { name: UPDATED_TEST_USER.name })).toBeVisible();
    await expect(page.getByRole('heading', { name: UPDATED_TEST_USER.phone })).toBeVisible();
    await expect(page.getByRole('heading', { name: UPDATED_TEST_USER.email })).toBeVisible();
    await expect(page.getByRole('heading', { name: UPDATED_TEST_USER.address })).toBeVisible();

    // Revert back to original credentials
    await page.getByRole('link', { name: 'Profile' }).click();
    await page.getByTestId('name').click();
    await page.getByTestId('name').fill(TEST_USER.name);
    await page.getByTestId('password').click();
    await page.getByTestId('password').fill(TEST_USER.password);
    await page.getByTestId('phone').click();
    await page.getByTestId('phone').fill(TEST_USER.phone);
    await page.getByTestId('address').click();
    await page.getByTestId('address').fill(TEST_USER.address);
    
    // Save the reverted changes
    await page.getByRole('button', { name: 'Update' }).click();
    
    // Wait for the update to process
    await page.waitForTimeout(1000);
    
    // Verify the original values have been restored
    await expect(page.getByTestId('name')).toHaveValue(TEST_USER.name);
    await expect(page.getByTestId('phone')).toHaveValue(TEST_USER.phone);
    await expect(page.getByTestId('address')).toHaveValue(TEST_USER.address); 
  });

  test('User cannot update profile with invalid phone number', async ({ page }) => {
    // Navigate to profile page
    await page.getByRole('button', { name: TEST_USER.name }).click();
    await page.getByRole('link', { name: 'DASHBOARD' }).click();
    await page.getByRole('link', { name: 'Profile' }).click();
    
    // Test with non-numeric characters
    await page.getByTestId('phone').click();
    await page.getByTestId('phone').fill(INVALID_CREDENTIALS.phone_non_numeric);
    
    // Check if error message is shown
    await expect(page.getByText('Phone number should contain only digits')).toBeVisible();
    
    // Try to submit the form
    await page.getByRole('button', { name: 'Update' }).click();
    
    // Verify that the form didn't submit successfully
    await expect(page).toHaveURL(/.*\/dashboard\/user\/profile/);
    
    // Test with too short phone number
    await page.getByTestId('phone').click();
    await page.getByTestId('phone').clear();
    await page.getByTestId('phone').fill(INVALID_CREDENTIALS.phone_short);
    
    // Check if error message is shown
    await expect(page.getByText('Phone number should be at least 8 digits')).toBeVisible();
    
    // Try to submit the form
    await page.getByRole('button', { name: 'Update' }).click();
    
    // Verify that the form didn't submit successfully and profile is unchanged
    await page.getByRole('link', { name: 'Dashboard' }).click();
    
    // Check unchanged credentials
    await expect(page.getByRole('heading', { name: TEST_USER.name })).toBeVisible();
    await expect(page.getByRole('heading', { name: TEST_USER.phone })).toBeVisible();
    await expect(page.getByRole('heading', { name: TEST_USER.email })).toBeVisible();
    await expect(page.getByRole('heading', { name: TEST_USER.address })).toBeVisible();
  });
});