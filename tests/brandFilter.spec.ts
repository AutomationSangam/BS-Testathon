import { test, expect } from "@playwright/test";
import ProductListingPage from "../pages/productListing.page";

test.describe("Mobile Brand Filter Tests", () => {
  let productListingPage: ProductListingPage;

  test.beforeEach(async ({ page }) => {
    productListingPage = new ProductListingPage(page);
    await page.goto("/");
    await productListingPage.waitForProductsToLoad();
  });

  test("should filter Apple products and show only iphones", async ({
    page,
  }) => {
    // Get initial product count to verify filter is working
    const initialCount = await productListingPage.getProductCount();
    expect(initialCount).toBeGreaterThan(0);

    // Apply Apple filter
    await productListingPage.selectAppleFilter();

    // Wait for filter to be applied and products to update
    await page.waitForTimeout(1000);

    // Verify all visible products contain 'iphone' in their name
    const products = await productListingPage.getAllProductNames();
    expect(products.length).toBeGreaterThan(0);
    const allContainIphone =
      await productListingPage.checkAllProductsContainKeyword("iphone");
    expect(allContainIphone).toBe(true);

    // Verify filtered count is less than initial count (filter is working)
    const filteredCount = await productListingPage.getProductCount();
    expect(filteredCount).toBeLessThan(initialCount);
    expect(filteredCount).toBeGreaterThan(0);
  });

  test("should filter Samsung products and show only Galaxy devices", async ({
    page,
  }) => {
    // Apply Samsung filter
    await productListingPage.selectSamsungFilter();

    // Wait for filter to be applied
    await page.waitForTimeout(1000);

    // Verify all visible products contain 'Galaxy' in their name
    const products = await productListingPage.getAllProductNames();
    expect(products.length).toBeGreaterThan(0);
    const allContainGalaxy =
      await productListingPage.checkAllProductsContainKeyword("Galaxy");
    expect(allContainGalaxy).toBe(true);

    // Verify we have Samsung products showing
    const filteredCount = await productListingPage.getProductCount();
    expect(filteredCount).toBeGreaterThan(0);
  });

  test("should filter Google products and show only Pixel devices", async ({
    page,
  }) => {
    // Apply Google filter
    await productListingPage.selectGoogleFilter();

    // Wait for filter to be applied
    await page.waitForTimeout(1000);

    // Verify all visible products contain 'Pixel' in their name
    const products = await productListingPage.getAllProductNames();
    expect(products.length).toBeGreaterThan(0);
    const allContainPixel =
      await productListingPage.checkAllProductsContainKeyword("Pixel");
    expect(allContainPixel).toBe(true);

    // Verify we have Google products showing
    const filteredCount = await productListingPage.getProductCount();
    expect(filteredCount).toBeGreaterThan(0);
  });

  test("should filter OnePlus products and show only One Plus devices", async ({
    page,
  }) => {
    // Apply OnePlus filter
    await productListingPage.selectOnePlusFilter();

    // Wait for filter to be applied
    await page.waitForTimeout(1000);

    // Verify all visible products contain 'One Plus' in their name
    const products = await productListingPage.getAllProductNames();
    expect(products.length).toBeGreaterThan(0);
    const allContainOnePlus =
      await productListingPage.checkAllProductsContainKeyword("One Plus");
    expect(allContainOnePlus).toBe(true);

    // Verify we have OnePlus products showing
    const filteredCount = await productListingPage.getProductCount();
    expect(filteredCount).toBeGreaterThan(0);
  });

  test("should show all products when no filter is applied", async ({
    page,
  }) => {
    // Ensure no filters are applied
    await productListingPage.clearAllFilters();

    // Wait for all products to load
    await page.waitForTimeout(1000);

    // Verify we have all 25 products (based on the initial observation)
    const totalCount = await productListingPage.getProductCount();
    expect(totalCount).toBe(25);
  });

  test("should allow multiple brand filters to be applied simultaneously", async ({
    page,
  }) => {
    // Get initial count
    const initialCount = await productListingPage.getProductCount();

    // Apply Apple and Samsung filters together
    await productListingPage.selectAppleFilter();
    await productListingPage.selectSamsungFilter();

    // Wait for filters to be applied
    await page.waitForTimeout(1000);

    // Get all product names
    const products = await productListingPage.getAllProductNames();

    // Verify each product contains either 'iPhone' or 'Galaxy'
    expect(products.length).toBeGreaterThan(0);
    for (const product of products) {
      const productLower = product.toLowerCase();
      expect(
        productLower.includes("iphone") || productLower.includes("galaxy")
      ).toBeTruthy();
    }

    // Verify filtered count shows expected combined results
    const combinedCount = await productListingPage.getProductCount();
    expect(combinedCount).toBeGreaterThan(0);
    expect(combinedCount).toBeLessThanOrEqual(initialCount);
  });

  test("should clear filters and show all products when filters are unchecked", async ({
    page,
  }) => {
    // Apply a filter first
    await productListingPage.selectAppleFilter();
    await page.waitForTimeout(1000);

    // Verify filter is working (reduced product count)
    const filteredCount = await productListingPage.getProductCount();
    expect(filteredCount).toBeLessThan(25);

    // Clear all filters
    await productListingPage.clearAllFilters();
    await page.waitForTimeout(1000);

    // Verify all products are shown again
    const finalCount = await productListingPage.getProductCount();
    expect(finalCount).toBe(25);
  });
});
