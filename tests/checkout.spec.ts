import { test, expect } from "@playwright/test";
import SignInPage from "../pages/signIn.page";
import CheckoutPage from "../pages/checkout.page";
import ProductListingPage from "../pages/productListing.page";
import CartPage from "../pages/cart.page";
import { credentials } from "../testData/credentials";

test.describe("Checkout Flow Tests", () => {
  let signInPage: SignInPage;
  let checkoutPage: CheckoutPage;
  let productListingPage: ProductListingPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    signInPage = new SignInPage(page);
    checkoutPage = new CheckoutPage(page);
    productListingPage = new ProductListingPage(page);
    cartPage = new CartPage(page);
    await page.goto("/");
  });

  test.describe("Checkout Page Tests", () => {
    test("should add iPhone 12 to cart and open mini cart", async ({ page }) => {
      // 1. Login using demo_user and verify
      const loginSuccess = await signInPage.signInAndVerify(
        credentials.DEMO_USER.username,
        credentials.DEMO_USER.password
      );
      expect(loginSuccess).toBe(true);

      // Wait for products to load
      await productListingPage.waitForProductsToLoad();

      // 2. Add iPhone 12 to cart and open mini cart
      await checkoutPage.addProductToCartAndOpenMiniCart("iPhone 12");

      // 3. Verify the complete checkout flow
      const isCheckoutSuccessful = await cartPage.verifyProductAddedToCart("iPhone 12");
      expect(isCheckoutSuccessful).toBe(true);

      const isMiniCartOpen = await cartPage.verifyMiniCartOpened();
      expect(isMiniCartOpen).toBe(true);

      console.log("Successfully completed add flow for iPhone 12");
    });

    test("should complete checkout flow", async ({ page }) => {
      // 1. Login using demo_user and verify
      const loginSuccess = await signInPage.signInAndVerify(
        credentials.DEMO_USER.username,
        credentials.DEMO_USER.password
      );
      expect(loginSuccess).toBe(true);

      // Wait for products to load
      await productListingPage.waitForProductsToLoad();

      // 2. Add iPhone 12 to cart
      await checkoutPage.addProductToCart("iPhone 12");

      // 3. Click checkout button
      await checkoutPage.clickCheckoutButton();

      // 4. Fill form
      await checkoutPage.fillCheckoutForm("John", "Doe", "123 Main St", "Ontario", "12345");

      // 5. Submit form
      await checkoutPage.submitForm();
      // wait for 1 second
      await page.waitForTimeout(1000);
      // Verify checkout success

      const isCheckoutSuccessful = await page.url().includes("/confirmation");
      expect(isCheckoutSuccessful).toBe(true);
    });

    test("should download confirmation PDF", async ({ page }) => {
      // 1. Login using demo_user and verify
      const loginSuccess = await signInPage.signInAndVerify(
        credentials.DEMO_USER.username,
        credentials.DEMO_USER.password
      );
      expect(loginSuccess).toBe(true);

      // Wait for products to load
      await productListingPage.waitForProductsToLoad();

      // 2. Add iPhone 12 to cart
      await checkoutPage.addProductToCart("iPhone 12");

      // 3. Click checkout button
      await checkoutPage.clickCheckoutButton();

      // 4. Fill form
      await checkoutPage.fillCheckoutForm("John", "Doe", "123 Main St", "Ontario", "12345");

      // 5. Submit form
      await checkoutPage.submitForm();

      // 6. Click on download link
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#downloadpdf').click();
      const download = await downloadPromise;

      // Verify download
      const path = await download.path();
      expect(path).not.toBeNull();
    });
  });
});
