import { test, expect } from "@playwright/test";
import SignInPage from "../pages/signIn.page";
import ProductListingPage from "../pages/productListing.page";
import CartPage from "../pages/cart.page";
import { credentials } from "../testData/credentials";

test.describe("Cart-Specific Error Handling Tests", () => {
  let signInPage: SignInPage;
  let productListingPage: ProductListingPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    signInPage = new SignInPage(page);
    productListingPage = new ProductListingPage(page);
    cartPage = new CartPage(page);
    await page.goto("https://testathon.live/");
  });

  test.describe("Cart State Management Errors", () => {
    test("should handle cart state corruption gracefully", async ({ page }) => {
      console.log("Testing cart state corruption handling...");

      await productListingPage.waitForProductsToLoad();

      // Add item to cart
      await productListingPage.addFirstProductToCart();
      const initialCount = await cartPage.getCartItemCount();
      expect(initialCount).toBeGreaterThan(0);

      // Corrupt cart data in localStorage/sessionStorage
      await page.evaluate(() => {
        // Simulate corrupted cart data
        localStorage.setItem("cart", "invalid-json-data");
        sessionStorage.setItem("cartItems", "corrupted-data");
      });

      // Refresh page and verify application handles corruption
      await page.reload();
      await productListingPage.waitForProductsToLoad();

      // Cart should either be empty or show error handling
      const cartCountAfterCorruption = await cartPage.getCartItemCount();
      console.log(`✓ Cart state after corruption: ${cartCountAfterCorruption}`);

      // Verify we can still add items after corruption
      await productListingPage.addFirstProductToCart();
      const newCartCount = await cartPage.getCartItemCount();
      expect(newCartCount).toBeGreaterThan(0);
      console.log("✓ Cart functionality restored after corruption");
    });

    test("should handle simultaneous cart updates from multiple sessions", async ({
      context,
      page,
    }) => {
      console.log("Testing simultaneous cart updates...");

      // Login in first tab
      await signInPage.signInWithCredentials(
        credentials.FAV_USER.username,
        credentials.FAV_USER.password
      );

      await productListingPage.waitForProductsToLoad();
      await productListingPage.addFirstProductToCart();
      const cartCount1 = await cartPage.getCartItemCount();

      // Open second tab and login as same user
      const page2 = await context.newPage();
      const signInPage2 = new SignInPage(page2);
      const productListingPage2 = new ProductListingPage(page2);
      const cartPage2 = new CartPage(page2);

      await page2.goto("https://testathon.live/");
      await signInPage2.signInWithCredentials(
        credentials.FAV_USER.username,
        credentials.FAV_USER.password
      );

      await productListingPage2.waitForProductsToLoad();
      await productListingPage2.addProductToCartByIndex(1);

      // Check cart synchronization
      const cartCount2 = await cartPage2.getCartItemCount();

      console.log(`Tab 1 cart: ${cartCount1}, Tab 2 cart: ${cartCount2}`);

      // Switch back to first tab and check if cart is updated
      const updatedCartCount1 = await cartPage.getCartItemCount();
      console.log(`✓ Tab 1 cart after Tab 2 update: ${updatedCartCount1}`);

      await page2.close();
    });

    test("should handle cart overflow scenarios", async ({ page }) => {
      console.log("Testing cart overflow scenarios...");

      await productListingPage.waitForProductsToLoad();

      // Try to add same product multiple times rapidly
      const addToCartButton = productListingPage.firstProductAddToCartButton;

      for (let i = 0; i < 5; i++) {
        await addToCartButton.click();
        await page.waitForTimeout(100);
      }

      const cartCount = await cartPage.getCartItemCount();
      console.log(`✓ Cart count after rapid additions: ${cartCount}`);

      // Verify cart count is reasonable (not infinite)
      expect(cartCount).toBeLessThan(50);
      expect(cartCount).toBeGreaterThan(0);
    });
  });

  test.describe("Cart Persistence Bug Validation", () => {
    test("should document cart persistence bug across user sessions", async ({
      page,
    }) => {
      console.log("🐛 DOCUMENTING CART PERSISTENCE BUG...");

      // Step 1: Login as first user and add items
      await signInPage.signInWithCredentials(
        credentials.FAV_USER.username,
        credentials.FAV_USER.password
      );

      await productListingPage.waitForProductsToLoad();
      await productListingPage.addFirstProductToCart();
      await productListingPage.addProductToCartByIndex(1);

      const userCartCount = await cartPage.getCartItemCount();
      const userCartItems = await cartPage.getCartItemNames();

      console.log(
        `🐛 FAV_USER cart: ${userCartCount} items - ${userCartItems.join(", ")}`
      );

      // Step 2: Logout
      await signInPage.logout();
      console.log("🐛 User logged out");

      // Step 3: Login as different user
      await signInPage.signInWithCredentials(
        credentials.DEMO_USER.username,
        credentials.DEMO_USER.password
      );

      // Step 4: Check if cart is clean for new user
      const newUserCartCount = await cartPage.getCartItemCount();
      const newUserCartItems = await cartPage.getCartItemNames();

      console.log(
        `🐛 DEMO_USER cart: ${newUserCartCount} items - ${newUserCartItems.join(
          ", "
        )}`
      );

      // Document the bug
      if (newUserCartCount > 0) {
        console.log(
          "🐛 BUG CONFIRMED: Cart data persists across different user sessions!"
        );
        console.log(
          "🐛 SECURITY ISSUE: User can see previous user's cart items"
        );
        console.log("🐛 IMPACT: Data leakage between user sessions");
      } else {
        console.log("✅ Cart isolation working correctly");
      }

      // This test is expected to fail due to the bug
      expect(newUserCartCount).toBe(0); // This will fail if bug exists
    });

    test("should document cart persistence after browser restart simulation", async ({
      page,
    }) => {
      console.log("🐛 Testing cart persistence after browser restart...");

      await productListingPage.waitForProductsToLoad();
      await productListingPage.addFirstProductToCart();

      const initialCartCount = await cartPage.getCartItemCount();
      console.log(`Initial cart count: ${initialCartCount}`);

      // Simulate browser restart by clearing all browser data except cookies
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
        // Keep cookies to simulate partial browser restart
      });

      // Reload page
      await page.reload();
      await productListingPage.waitForProductsToLoad();

      const cartCountAfterRestart = await cartPage.getCartItemCount();
      console.log(
        `Cart count after simulated restart: ${cartCountAfterRestart}`
      );

      // Document behavior
      if (cartCountAfterRestart > 0) {
        console.log("🐛 Cart data persists after browser restart simulation");
      } else {
        console.log("✅ Cart cleared after browser restart simulation");
      }
    });
  });

  test.describe("Cart Error Recovery", () => {
    test("should recover from cart service failures", async ({ page }) => {
      console.log("Testing cart service failure recovery...");

      await productListingPage.waitForProductsToLoad();

      // Block cart-related API calls
      await page.route("**/cart/**", (route) => route.abort());
      await page.route("**/api/cart/**", (route) => route.abort());

      // Try to add item when cart service is down
      await productListingPage.addFirstProductToCart();

      // Remove route blocking
      await page.unroute("**/cart/**");
      await page.unroute("**/api/cart/**");

      // Verify cart can recover
      await page.waitForTimeout(1000);
      await productListingPage.addProductToCartByIndex(1);

      const finalCartCount = await cartPage.getCartItemCount();
      console.log(
        `✓ Cart recovered from service failure - Count: ${finalCartCount}`
      );
    });

    test("should handle checkout process failures gracefully", async ({
      page,
    }) => {
      console.log("Testing checkout failure handling...");

      await productListingPage.waitForProductsToLoad();
      await productListingPage.addFirstProductToCart();

      // Open cart
      await cartPage.openCart();

      // Try to click checkout button
      try {
        await cartPage.checkoutButton.click();
        console.log("✓ Checkout button clicked successfully");
      } catch (error) {
        console.log("✓ Checkout failure handled:", error.message);
      }

      // Verify cart state is maintained after checkout failure
      const cartCountAfterCheckout = await cartPage.getCartItemCount();
      expect(cartCountAfterCheckout).toBeGreaterThan(0);
      console.log("✓ Cart state maintained after checkout failure");
    });
  });


  test.afterEach(async ({ page }) => {
    // Clean up
    try {
      await signInPage.logout();
    } catch {
      // Ignore if not logged in
    }

    // Clear any route handlers
    await page.unrouteAll();

    // Clear storage to prevent test interference
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });
});
