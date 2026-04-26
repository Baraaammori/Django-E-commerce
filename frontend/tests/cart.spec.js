import { test, expect } from '@playwright/test';

test.describe('Cart Flow', () => {
  test('User can add to cart, update quantity, and remove item', async ({ page }) => {
    // 1. Create a fresh user
    const username = `cartuser_${Date.now()}`;
    const email = `cart_${Date.now()}@example.com`;
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

    // 2. Go to products
    await page.goto('/products');
    await expect(page.locator('.product-card').first()).toBeVisible();

    // 3. Go to first product detail page
    await page.locator('.product-card a').first().click();
    await expect(page.locator('button.add-to-cart-large')).toBeVisible();

    // 4. Add to cart
    await page.click('button.add-to-cart-large');
    
    // Wait for toast notification (success)
    await expect(page.locator('.go3958317564')).toBeVisible({ timeout: 5000 }).catch(() => {}); // Optional wait for toast

    // 5. Go to cart
    await page.goto('/cart');
    await expect(page.locator('.cart-item')).toHaveCount(1);
    
    // 6. Update quantity
    const qtySpan = page.locator('.cart-qty-selector span');
    await expect(qtySpan).toHaveText('1');
    
    await page.click('.cart-qty-selector button:has(.lucide-plus)');
    await page.waitForTimeout(1000); // Wait for API response
    await expect(qtySpan).toHaveText('2');

    // 7. Remove item
    await page.click('button.remove-btn');
    await page.waitForTimeout(1000); // Wait for API response
    
    // 8. Verify cart is empty
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
  });
});
