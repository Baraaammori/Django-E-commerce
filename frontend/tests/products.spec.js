import { test, expect } from '@playwright/test';

test.describe('Products Browsing Flow', () => {
  test('User can browse homepage and products', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Check banner
    await expect(page.locator('text=Welcome to worldwide Megamart!')).toBeVisible();

    // Featured products should load
    await expect(page.locator('.deal-card')).toHaveCount(5);

    // Go to products page via navigation
    // (In mobile menu or using direct URL. Let's use direct URL for simplicity, or click "Groceries" category)
    await page.goto('/products');

    // Wait for products to load
    await expect(page.locator('.product-card').first()).toBeVisible();

    // Filter by a category (assuming "Smartphones" category exists from DummyJSON)
    const categoryButton = page.locator('button.category-btn:has-text("smartphones")');
    if (await categoryButton.isVisible()) {
      await categoryButton.click();
      await page.waitForTimeout(1000); // Wait for network
      // Verify product card is visible
      await expect(page.locator('.product-card').first()).toBeVisible();
    }

    // Go to product details page
    await page.locator('.product-card a').first().click();
    
    // Check product title and add to cart button
    await expect(page.locator('.product-title')).toBeVisible();
    await expect(page.locator('button:has-text("Add to Cart")')).toBeVisible();
  });
});
