import { test, expect } from "@playwright/test";
import SignInPage from "../pages/signIn.page";
import ProductListingPage from "../pages/productListing.page";
import CartPage from "../pages/cart.page";
import { credentials } from "../testData/credentials";

test.describe("Cart Persistence Tests", () => {
  let signInPage: SignInPage;
  let productListingPage: ProductListingPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    signInPage = new SignInPage(page);
    productListingPage = new ProductListingPage(page);
    cartPage = new CartPage(page);
    await page.goto("/");
  });

  test("Validate that cart value is not retained when user logs out and new user signs in", async ({
    page,
  }) => {
    // Step 1: Sign in as fav_user
    await signInPage.signInWithCredentials(
      credentials.FAV_USER.username,
      credentials.FAV_USER.password
    );

    // Verify fav_user is logged in
    const isLoggedIn = await signInPage.isUserLoggedIn();
    expect(isLoggedIn).toBe(true);

    // Wait for products to load
    await productListingPage.waitForProductsToLoad();

    // Step 2: Add at least one product to the cart
    await productListingPage.addFirstProductToCart();

    // Verify product was added to cart
    const cartItemCount = await cartPage.getCartItemCount();
    expect(cartItemCount).toBeGreaterThan(0);

    // Also verify cart shows items
    const isCartEmpty = await cartPage.isCartEmpty();
    expect(isCartEmpty).toBe(false);

    // Store the product name that was added for verification
    const addedProductName = await productListingPage.getFirstProductName();
    console.log(`Added product: ${addedProductName} to fav_user cart`);

    // Step 3: Click Logout (top-right)
    await signInPage.logout();

    // Verify user is logged out (should be back to login state)
    const isLoggedOut = !(await signInPage.isUserLoggedIn());
    expect(isLoggedOut).toBe(true);

    // Step 4: Observe the home page and sign in as demo_user
    await signInPage.signInWithCredentials(
      credentials.DEMO_USER.username,
      credentials.DEMO_USER.password
    );

    // Verify demo_user is logged in
    const isDemoUserLoggedIn = await signInPage.isUserLoggedIn();
    expect(isDemoUserLoggedIn).toBe(true);

    // Step 5: Open the cart and verify it's empty
    // Expected result: Cart should be empty for the new user
    const cartItemCountAfterLogin = await cartPage.getCartItemCount();
    const isCartEmptyAfterLogin = await cartPage.isCartEmpty();
    const cartItemsCountAfterLogin = await cartPage.getCartItemsCount();

    // These assertions will demonstrate the bug if cart is not cleared
    expect(cartItemCountAfterLogin).toBe(0);
    expect(isCartEmptyAfterLogin).toBe(true);
    expect(cartItemsCountAfterLogin).toBe(0);

    // Additional verification: Check if cart indicator shows no items
    const isCartIndicatorShowingItems =
      await cartPage.isCartIndicatorShowingItems();
    expect(isCartIndicatorShowingItems).toBe(false);

    console.log(`Cart item count for demo_user: ${cartItemCountAfterLogin}`);
    console.log(`Is cart empty for demo_user: ${isCartEmptyAfterLogin}`);
  });

  test("should maintain empty cart state for guest user after logout", async ({
    page,
  }) => {
    // Start as guest user (no login)
    await productListingPage.waitForProductsToLoad();

    // Verify cart is initially empty for guest
    const initialCartCount = await cartPage.getCartItemCount();
    expect(initialCartCount).toBe(0);

    // Sign in as fav_user
    await signInPage.signInWithCredentials(
      credentials.FAV_USER.username,
      credentials.FAV_USER.password
    );

    // Add product to cart
    await productListingPage.addFirstProductToCart();

    // Verify cart has items
    const cartWithItems = await cartPage.getCartItemCount();
    expect(cartWithItems).toBeGreaterThan(0);

    // Logout
    await signInPage.logout();

    // Now as guest user, cart should be empty
    const guestCartCount = await cartPage.getCartItemCount();
    const isGuestCartEmpty = await cartPage.isCartEmpty();

    expect(guestCartCount).toBe(0);
    expect(isGuestCartEmpty).toBe(true);
  });

  test("Validate that cart value is not retained for multiple products when user logs out and new user signs in", async ({
    page,
  }) => {
    // Sign in as fav_user
    await signInPage.signInWithCredentials(
      credentials.FAV_USER.username,
      credentials.FAV_USER.password
    );

    await productListingPage.waitForProductsToLoad();

    // Add multiple products to cart
    await productListingPage.addProductToCartByIndex(0);
    await cartPage.waitForCartContentToUpdate();

    await productListingPage.addProductToCartByIndex(1);
    await cartPage.waitForCartContentToUpdate();

    // Verify multiple items in cart
    const multipleItemsCount = await cartPage.getCartItemCount();
    expect(multipleItemsCount).toBe(2);

    // Get cart items for verification
    const cartItems = await cartPage.getCartItemNames();
    console.log(`Cart items for fav_user: ${cartItems.join(", ")}`);

    // Logout
    await signInPage.logout();

    // Sign in as different user
    await signInPage.signInWithCredentials(
      credentials.DEMO_USER.username,
      credentials.DEMO_USER.password
    );

    // Verify cart should be empty but bug will show items
    const newUserCartCount = await cartPage.getCartItemCount();
    const newUserCartItems = await cartPage.getCartItemNames();

    console.log(`Cart items for demo_user: ${newUserCartItems.join(", ")}`);
    console.log(`Cart count for demo_user: ${newUserCartCount}`);

    // This will fail if the bug exists
    expect(newUserCartCount).toBe(0);
    expect(newUserCartItems.length).toBe(0);
  });

  test.afterEach(async ({ page }) => {
    // Clean up: ensure user is logged out after each test
    try {
      await signInPage.logout();
    } catch {
      // Ignore if already logged out
    }
  });
});
