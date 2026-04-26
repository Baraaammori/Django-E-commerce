import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('User can complete a checkout successfully', async ({ page }) => {
    // 1. Create a fresh user
    const username = `checkout_${Date.now()}`;
    const email = `checkout_${Date.now()}@example.com`;
    const password = 'TestPassword123!';

    await page.goto('/auth');
    await page.click('button.toggle-auth-btn:has-text("Sign up")');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="first_name"]', 'Test');
    await page.fill('input[name="last_name"]', 'User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="password_confirm"]', password);
    await page.click('button[type="submit"]:has-text("Create Account")');
    await expect(page).toHaveURL('/');

    // 2. Go to products and add to cart
    await page.goto('/products');
    await expect(page.locator('.product-card').first()).toBeVisible();
    await page.locator('.product-card a').first().click();
    await expect(page.locator('button.add-to-cart-large')).toBeVisible();
    await page.click('button.add-to-cart-large');
    
    // Wait for network/toast
    await page.waitForTimeout(1000);

    // 3. Go to cart and proceed to checkout
    await page.goto('/cart');
    await expect(page.locator('.cart-item')).toHaveCount(1);
    await page.click('button.checkout-btn');

    // 4. Fill Shipping form
    await expect(page.locator('h2:has-text("Shipping Information")')).toBeVisible();
    await page.fill('input[name="full_name"]', 'Playwright Tester');
    await page.fill('input[name="street_address"]', '123 Test Ave');
    await page.fill('input[name="city"]', 'Testing City');
    await page.fill('input[name="state"]', 'TS');
    await page.fill('input[name="postal_code"]', '12345');
    await page.fill('input[name="country"]', 'TestLand');
    
    await page.click('button:has-text("Continue to Payment")');

    // 5. Fill Payment form
    await expect(page.locator('h2:has-text("Payment Method")')).toBeVisible();
    // Default values are pre-filled in the component, so we just click Place Order
    await page.click('button:has-text("Place Order")');

    // 6. Verify Confirmation
    await expect(page.locator('text=Order Confirmed!')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Thank you for shopping at MegaMart')).toBeVisible();
  });
});
