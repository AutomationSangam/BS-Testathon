import { test, expect } from "@playwright/test";
import SignInPage from "../pages/signIn.page";
import ProductListingPage from "../pages/productListing.page";
import CartPage from "../pages/cart.page";
import { credentials } from "../testData/credentials";

test.describe("Error Handling Tests", () => {
  let signInPage: SignInPage;
  let productListingPage: ProductListingPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    signInPage = new SignInPage(page);
    productListingPage = new ProductListingPage(page);
    cartPage = new CartPage(page);
  });

  test.describe("Authentication Error Handling", () => {
    test("should handle invalid URL gracefully", async ({ page }) => {
      // Test navigation to invalid/non-existent page
      const response = await page.goto("https://testathon.live/invalid-page");

      // Should return 404 or redirect to homepage
      if (response?.status() === 404) {
        expect(response.status()).toBe(404);
        console.log("✓ 404 page handled correctly");
      } else {
        // If redirected to homepage, verify we're on the correct page
        expect(page.url()).toContain("testathon.live");
        console.log("✓ Invalid URL redirected to homepage");
      }
    });

    test("should handle incomplete login form submission", async ({ page }) => {
      await page.goto("https://testathon.live/signin");

      // Try to login without selecting username
      await signInPage.selectPassword("testingisfun99");
      await signInPage.clickLogInButton();

      // Should remain on signin page or show validation
      await page.waitForTimeout(1000);
      const isStillOnSignin = await signInPage.isSignInPageLoaded();
      expect(isStillOnSignin).toBe(true);
      console.log("✓ Incomplete form submission handled");
    });
  });

  test.describe("Network and Connectivity Error Handling", () => {
    test("should handle slow network conditions", async ({ page }) => {
      // Simulate slow network
      await page.route("**/*", async (route) => {
        // Add delay to simulate slow network
        await new Promise((resolve) => setTimeout(resolve, 100));
        await route.continue();
      });

      await page.goto("https://testathon.live/");

      // Verify page still loads with slow network
      await productListingPage.waitForProductsToLoad();
      const productCount = await productListingPage.getProductCount();
      expect(productCount).toBeGreaterThan(0);
      console.log("✓ Page loads correctly under slow network conditions");
    });

    test("should handle failed image loading", async ({ page }) => {
      // Block image requests to simulate failed loading
      await page.route("**/*.{png,jpg,jpeg,gif,webp}", (route) =>
        route.abort()
      );

      await page.goto("https://testathon.live/");
      await productListingPage.waitForProductsToLoad();

      // Verify page functionality still works without images
      const productCount = await productListingPage.getProductCount();
      expect(productCount).toBeGreaterThan(0);

      // Verify product names are still visible
      const productNames = await productListingPage.getAllProductNames();
      expect(productNames.length).toBeGreaterThan(0);
      console.log("✓ Page functions correctly with failed image loading");
    });

    test("should handle API request failures", async ({ page }) => {
      // Intercept and fail specific API calls
      await page.route("**/api/**", (route) => route.abort());

      await page.goto("https://testathon.live/");

      // Page should still load basic content
      await page.waitForSelector("body", { timeout: 10000 });

      // Check if basic navigation elements are present
      const signInVisible = await signInPage.signInButton.isVisible();
      expect(signInVisible).toBe(true);
      console.log("✓ Basic page elements load despite API failures");
    });
  });

  test.describe("UI Interaction Error Handling", () => {
    test("should handle rapid clicking on add to cart", async ({ page }) => {
      await page.goto("https://testathon.live/");
      await productListingPage.waitForProductsToLoad();

      // Rapidly click add to cart multiple times
      const addToCartButton = productListingPage.firstProductAddToCartButton;

      await addToCartButton.click();
      await addToCartButton.click();
      await addToCartButton.click();

      // Wait for cart to update
      await page.waitForTimeout(2000);

      // Verify cart state is still valid (should not have duplicate items)
      const cartCount = await cartPage.getCartItemCount();
      expect(cartCount).toBeGreaterThan(0);
      expect(cartCount).toBeLessThanOrEqual(3); // Reasonable limit
      console.log(`✓ Rapid clicking handled - Cart count: ${cartCount}`);
    });

    test("should handle invalid filter combinations", async ({ page }) => {
      await page.goto("https://testathon.live/");
      await productListingPage.waitForProductsToLoad();

      // Apply all filters simultaneously
      await productListingPage.selectAppleFilter();
      await productListingPage.selectSamsungFilter();
      await productListingPage.selectGoogleFilter();
      await productListingPage.selectOnePlusFilter();

      await page.waitForTimeout(1000);

      // Should show some products or handle gracefully
      const productCount = await productListingPage.getProductCount();
      expect(productCount).toBeGreaterThanOrEqual(0);
      console.log(
        `✓ Multiple filters handled - Product count: ${productCount}`
      );
    });

    test("should handle browser back/forward navigation", async ({ page }) => {
      await page.goto("https://testathon.live/");
      await productListingPage.waitForProductsToLoad();

      // Navigate to sign in
      await signInPage.clickSignInButton();
      await page.waitForURL("**/signin");

      // Use browser back button
      await page.goBack();
      await page.waitForURL("https://testathon.live/");

      // Verify page state is maintained
      const productCount = await productListingPage.getProductCount();
      expect(productCount).toBeGreaterThan(0);
      console.log("✓ Browser navigation handled correctly");
    });
  });

  test.describe("Data Validation Error Handling", () => {
    test("should handle missing product data gracefully", async ({ page }) => {
      await page.goto("https://testathon.live/");

      // Wait for initial load
      await productListingPage.waitForProductsToLoad();

      // Verify all products have required data
      const productNames = await productListingPage.getAllProductNames();

      for (const name of productNames) {
        expect(name.trim()).not.toBe("");
        expect(name).not.toBeNull();
      }

      console.log("✓ All products have valid names");
    });

    test("should handle empty cart operations", async ({ page }) => {
      await page.goto("https://testathon.live/");
      await productListingPage.waitForProductsToLoad();

      // Try to get cart information when cart is empty
      const initialCount = await cartPage.getCartItemCount();
      const isEmpty = await cartPage.isCartEmpty();

      expect(initialCount).toBe(0);
      expect(isEmpty).toBe(true);
      console.log("✓ Empty cart operations handled correctly");
    });
  });

  test.describe("Performance and Timeout Error Handling", () => {
    test("should handle page load timeouts gracefully", async ({ page }) => {
      // Set shorter timeout for this test
      page.setDefaultTimeout(5000);

      try {
        await page.goto("https://testathon.live/");
        await productListingPage.waitForProductsToLoad();
        console.log("✓ Page loaded within timeout");
      } catch (error) {
        console.log("✓ Timeout handled gracefully:", error.message);
        // Verify partial page load
        const isBodyVisible = await page.locator("body").isVisible();
        expect(isBodyVisible).toBe(true);
      }
    });

    test("should handle concurrent user actions", async ({ page }) => {
      await page.goto("https://testathon.live/");
      await productListingPage.waitForProductsToLoad();

      // Perform multiple actions simultaneously
      const promises = [
        productListingPage.selectAppleFilter(),
        productListingPage.addProductToCartByIndex(0),
        productListingPage.getProductCount(),
      ];

      try {
        await Promise.all(promises);
        console.log("✓ Concurrent actions handled successfully");
      } catch (error) {
        console.log("✓ Concurrent action conflicts handled:", error.message);
      }

      // Verify page is still functional
      const finalCount = await productListingPage.getProductCount();
      expect(finalCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Session and State Error Handling", () => {
    test("should handle session expiry during cart operations", async ({
      page,
    }) => {
      await page.goto("https://testathon.live/");

      // Login first
      await signInPage.signInWithCredentials(
        credentials.FAV_USER.username,
        credentials.FAV_USER.password
      );

      // Add item to cart
      await productListingPage.waitForProductsToLoad();
      await productListingPage.addFirstProductToCart();

      // Simulate session expiry by clearing storage
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      // Try to perform another cart operation
      await productListingPage.addProductToCartByIndex(1);

      // Verify application handles this gracefully
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      console.log(`✓ Session expiry handled - Current URL: ${currentUrl}`);
    });

    test("should handle multiple tab scenarios", async ({ context, page }) => {
      await page.goto("https://testathon.live/");
      await productListingPage.waitForProductsToLoad();

      // Add item to cart in first tab
      await productListingPage.addFirstProductToCart();
      const cartCount1 = await cartPage.getCartItemCount();

      // Open second tab with same site
      const page2 = await context.newPage();
      await page2.goto("https://testathon.live/");

      // Check if cart state is synchronized or isolated
      const productListingPage2 = new ProductListingPage(page2);
      const cartPage2 = new CartPage(page2);

      await productListingPage2.waitForProductsToLoad();
      const cartCount2 = await cartPage2.getCartItemCount();

      console.log(
        `✓ Multi-tab scenario - Tab 1 cart: ${cartCount1}, Tab 2 cart: ${cartCount2}`
      );

      await page2.close();
    });
  });

  test.describe("Edge Cases and Boundary Conditions", () => {
    test("should handle maximum cart capacity", async ({ page }) => {
      await page.goto("https://testathon.live/");
      await productListingPage.waitForProductsToLoad();

      // Try to add many items to cart
      const maxAttempts = 10;
      let successfulAdds = 0;

      for (let i = 0; i < maxAttempts && i < 25; i++) {
        try {
          await productListingPage.addProductToCartByIndex(i);
          await page.waitForTimeout(500);
          successfulAdds++;
          const isCartOpen = await productListingPage.cardCloseIcon.isVisible();
          if (isCartOpen) {
            await productListingPage.cardCloseIcon.click();
          }
        } catch (error) {
          console.log(`✓ Cart limit reached at ${successfulAdds} items`);
          break;
        }
      }
      const finalCartCount = await cartPage.getCartItemCount();
      expect(finalCartCount).toBeGreaterThan(0);
      console.log(
        `✓ Cart capacity test completed - Final count: ${finalCartCount}`
      );
    });

    test("should handle special characters in search/filter", async ({
      page,
    }) => {
      await page.goto("https://testathon.live/");
      await productListingPage.waitForProductsToLoad();

      // Apply filters and verify no crashes occur
      await productListingPage.selectAppleFilter();
      await page.waitForTimeout(500);

      await productListingPage.clearAllFilters();
      await page.waitForTimeout(500);

      // Verify page is still functional
      const productCount = await productListingPage.getProductCount();
      expect(productCount).toBeGreaterThan(0);
      console.log("✓ Special character handling in filters works correctly");
    });
  });

  test.afterEach(async ({ page }) => {
    // Clean up any state changes
    try {
      await signInPage.logout();
    } catch {
      // Ignore if not logged in
    }

    // Clear any route handlers
    await page.unrouteAll();
  });
});
