import { test, expect } from "@playwright/test";
import ProductListingPage from "../pages/productListing.page";
import SignInPage from "../pages/signIn.page";
import { credentials } from "../testData/credentials";

test.describe("Image Loading Validation Tests", () => {
  let productListingPage: ProductListingPage;
  let signInPage: SignInPage;

  test.beforeEach(async ({ page }) => {
    productListingPage = new ProductListingPage(page);
    signInPage = new SignInPage(page);
    await page.goto("/");
  });

  test("Validate that all product images are loaded", async ({ page }) => {
    // Sign in with specified credentials
    await signInPage.signInWithCredentials(
      credentials.NO_IMAGE_CREDS.username,
      credentials.NO_IMAGE_CREDS.password
    );

    // Wait for products to load after sign in
    await productListingPage.waitForProductsToLoad();
    await page.waitForTimeout(2000); // Additional wait for images to load

    // Get all product image sources
    const imageSources = await productListingPage.getAllProductImageSources();

    // Verify that images were found
    expect(imageSources.length).toBeGreaterThan(0);
    console.log(`Found ${imageSources.length} product images`);

    // Validate that all images have non-empty src attributes
    const allImagesHaveSource =
      await productListingPage.validateAllImagesHaveNonEmptySource();

    // Get count of images with empty sources for better debugging
    const emptySourceCount =
      await productListingPage.getImagesWithEmptySource();

    // Log image sources for debugging
    console.log("Product image sources:", imageSources);

    if (emptySourceCount > 0) {
      console.log(
        `Found ${emptySourceCount} images with empty or missing src attributes`
      );
    }

    // Assert that all images have valid src attributes
    expect(allImagesHaveSource).toBe(true);
    expect(emptySourceCount).toBe(0);

    // Additional validation: check that src attributes contain actual URLs
    const validUrlCount = imageSources.filter(
      (src) =>
        src.includes("http") || src.includes("/") || src.includes("data:image")
    ).length;

    expect(validUrlCount).toBe(imageSources.length);
  });

  test("Validate individual image attributes are present for demo user", async ({
    page,
  }) => {
    // Sign in with specified credentials
    await signInPage.signInWithCredentials(
      credentials.DEMO_USER.username,
      credentials.DEMO_USER.password
    );

    // Wait for products to load
    await productListingPage.waitForProductsToLoad();
    await page.waitForTimeout(1000);

    // Get all product images
    const images = await productListingPage.productImages.all();
    expect(images.length).toBeGreaterThan(0);

    // Validate each image individually
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const src = await image.getAttribute("src");
      const alt = await image.getAttribute("alt");

      // Validate src attribute
      expect(src).not.toBeNull();
      expect(src).not.toBeUndefined();
      expect(src).not.toBe("");
      expect(src?.trim()).not.toBe("");

      console.log(`Image ${i + 1}: src="${src}", alt="${alt}"`);

      // Optional: validate that src is a valid URL format
      expect(src).toMatch(/^(https?:\/\/|\/|data:image)/);
    }
  });
});
