import { test, expect } from "@playwright/test";
import SignInPage from "../pages/signIn.page";
import ProductListingPage from "../pages/productListing.page";
import { credentials } from "../testData/credentials";

test.describe("User Authentication Tests", () => {
  let signInPage: SignInPage;
  let productListingPage: ProductListingPage;

  test.beforeEach(async ({ page }) => {
    signInPage = new SignInPage(page);
    productListingPage = new ProductListingPage(page);
    await page.goto("/");
  });

  test("should verify user is signed in successfully with NO_IMAGE_CREDS", async ({
    page,
  }) => {
    // Sign in with specified credentials
    await signInPage.signInWithCredentials(
      credentials.NO_IMAGE_CREDS.username,
      credentials.NO_IMAGE_CREDS.password
    );

    // Wait for navigation to complete
    await page.waitForURL("**/testathon.live/?signin=true");

    // Verify user is signed in by checking the username display
    const usernameDisplay = page.locator(
      `text=${credentials.NO_IMAGE_CREDS.username}`
    );
    await expect(usernameDisplay).toBeVisible();

    // Verify logout link is available
    const logoutLink = page.getByRole("link", { name: "Logout" });
    await expect(logoutLink).toBeVisible();

    // Verify products are loaded
    const productCount = await productListingPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);
    console.log(`Products loaded after sign in: ${productCount}`);
  });

  test("should verify user is signed in successfully with DEMO_USER", async ({
    page,
  }) => {
    // Sign in with demo user credentials
    await signInPage.signInWithCredentials(
      credentials.DEMO_USER.username,
      credentials.DEMO_USER.password
    );

    // Wait for navigation to complete
    await page.waitForURL("**/testathon.live/?signin=true");

    // Verify user is signed in by checking the username display
    const usernameDisplay = page.locator(
      `text=${credentials.DEMO_USER.username}`
    );
    await expect(usernameDisplay).toBeVisible();

    // Verify logout link is available
    const logoutLink = page.getByRole("link", { name: "Logout" });
    await expect(logoutLink).toBeVisible();

    // Verify products are loaded
    const productCount = await productListingPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);
    console.log(`Products loaded after sign in: ${productCount}`);
  });

  test("should verify logout functionality", async ({ page }) => {
    // Sign in first
    await signInPage.signInWithCredentials(
      credentials.DEMO_USER.username,
      credentials.DEMO_USER.password
    );

    // Verify user is logged in
    await page.waitForURL("**/testathon.live/?signin=true");
    let isLoggedIn = await signInPage.isUserLoggedIn();
    expect(isLoggedIn).toBe(true);

    // Logout
    await signInPage.logout();

    // Verify user is logged out (sign-in link should be visible)
    const signInLink = page.getByRole("link", { name: "Sign In" });
    await expect(signInLink).toBeVisible();
  });

  test("should validate sign-in page elements are present", async ({
    page,
  }) => {
    // Navigate to sign-in page
    await signInPage.clickSignInButton();

    // Verify sign-in page elements are visible
    await expect(signInPage.usernameDropdown).toBeVisible();
    await expect(signInPage.passwordDropdown).toBeVisible();
    await expect(signInPage.logInButton).toBeVisible();

    // Verify page title
    const pageTitle = await signInPage.getPageTitle();
    expect(pageTitle).toBe("StackDemo");
  });
});
