import { test, expect } from '@playwright/test';

const TEST_USER = {
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'TestPassword123!'
};

test.describe('Authentication Flow', () => {
  test('User can register, login, and logout', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Go to Auth page
    await page.click('text=Sign Up/Sign In');
    await expect(page).toHaveURL(/.*auth/);

    // Default is login, switch to signup
    await page.click('button.toggle-auth-btn:has-text("Sign up")');
    await expect(page.locator('h1')).toHaveText('Create Account');

    // Fill registration form
    await page.fill('input[name="username"]', TEST_USER.username);
    await page.fill('input[name="first_name"]', 'Test');
    await page.fill('input[name="last_name"]', 'User');
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.fill('input[name="password_confirm"]', TEST_USER.password);

    // Submit registration
    await page.click('button[type="submit"]:has-text("Create Account")');

    // Wait for redirect to home
    await expect(page).toHaveURL('/');

    // Verify logged in state (Greeting appears)
    await expect(page.locator(`text=Hello, Test`)).toBeVisible();

    // Logout
    await page.click('strong:has-text("Logout")');

    // Verify logged out state
    await expect(page.locator('text=Sign Up/Sign In')).toBeVisible();

    // Now test Login
    await page.click('text=Sign Up/Sign In');
    await expect(page.locator('h1')).toHaveText('Welcome Back');

    // Fill login form
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);

    // Submit login
    await page.click('button[type="submit"]:has-text("Sign In")');

    // Wait for redirect to home
    await expect(page).toHaveURL('/');
    await expect(page.locator(`text=Hello, Test`)).toBeVisible();
  });
});
