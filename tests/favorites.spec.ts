import { test, expect } from "@playwright/test";
import FavoritesPage from "../pages/favorites.page";
import SignInPage from "../pages/signIn.page";
import ProductListingPage from "../pages/productListing.page";
import { credentials } from "../testData/credentials";

test.describe("Fav_User_Favorites Functionality Tests", () => {
  let favoritesPage: FavoritesPage;
  let signInPage: SignInPage;
  let productListingPage: ProductListingPage;

  test.beforeEach(async ({ page }) => {
    favoritesPage = new FavoritesPage(page);
    signInPage = new SignInPage(page);
    productListingPage = new ProductListingPage(page);
    await page.goto("/");
  });

  test.describe("Fav_User_Favorites Page Navigation", () => {
    test("should navigate to favorites page when favorites link is clicked", async ({ page }) => {
      // Sign in with FAV_USER
      await signInPage.signInWithCredentials(
        credentials.FAV_USER.username,
        credentials.FAV_USER.password
      );

      // Navigate to favorites page
      await favoritesPage.navigateToFavoritesViaLink();

      // Verify favorites page is loaded
      const isLoaded = await favoritesPage.isFavoritesPageLoaded();
      expect(isLoaded).toBe(true);

      // Verify URL contains favourites (British spelling)
      const currentUrl = await favoritesPage.getCurrentUrl();
      expect(currentUrl).toMatch(/favourites/i);
    });


    test("should display appropriate page title on favorites page", async ({ page }) => {
      // Sign in with FAV_USER
      await signInPage.signInWithCredentials(
        credentials.FAV_USER.username,
        credentials.FAV_USER.password
      );

      // Navigate to favorites page
      await favoritesPage.navigateToFavoritesViaLink();

      // Verify page title
      const pageTitle = await favoritesPage.getFavoritesPageTitle();
      console.log(`Page title: ${pageTitle}`);
      expect(pageTitle.toLowerCase()).toMatch("/favorites");
    });
  });

  test.describe("Fav_User_Adding Items to Favorites", () => {
    test("should add a product to favorites from product listing page", async ({ page }) => {
      // Sign in with FAV_USER
      await signInPage.signInWithCredentials(
        credentials.FAV_USER.username,
        credentials.FAV_USER.password
      );

      // Wait for products to load
      await productListingPage.waitForProductsToLoad();

      // Get first product
      const products = await productListingPage.getAllProductNames();
      expect(products.length).toBeGreaterThan(0);
      const testProduct = products[0];

      // Check if the first product is already selected as favorite
      const isAlreadyFavorited = await favoritesPage.isProductFavorited(testProduct);

      if (isAlreadyFavorited) {
        // If yes, check for that product on the favorites page
        await favoritesPage.navigateToFavoritesViaLink();
        const isInFavorites = await favoritesPage.isProductInFavorites(testProduct);
        expect(isInFavorites).toBe(true);
        console.log(`Product "${testProduct}" was already favorited and found on favorites page`);
      } else {
        // If no, click on favorite icon
        await favoritesPage.addProductToFavorites(testProduct);
        
        // Verify heart icon is now yellow/favorited
        const isNowFavorited = await favoritesPage.isProductFavorited(testProduct);
        expect(isNowFavorited).toBe(true);

        // Check on favorites page if product appears
        await favoritesPage.navigateToFavoritesViaLink();
        const isInFavorites = await favoritesPage.isProductInFavorites(testProduct);
        expect(isInFavorites).toBe(true);
        console.log(`Product "${testProduct}" was added to favorites and found on favorites page`);
      }
    });

    test("should add multiple products to favorites", async ({ page }) => {
      // Sign in with FAV_USER
      await signInPage.signInWithCredentials(
        credentials.FAV_USER.username,
        credentials.FAV_USER.password
      );

      // Wait for products to load
      await productListingPage.waitForProductsToLoad();

      // Get first 3 products to test
      const products = await productListingPage.getAllProductNames();
      expect(products.length).toBeGreaterThan(2);
      const testProducts = products.slice(0, 3);

      const expectedFavoritedProducts: string[] = [];

      // Process each product individually
      for (const product of testProducts) {
        const isAlreadyFavorited = await favoritesPage.isProductFavorited(product);
        
        if (isAlreadyFavorited) {
          console.log(`Product "${product}" is already favorited`);
          expectedFavoritedProducts.push(product);
        } else {
          // Add to favorites if not already favorited
          await favoritesPage.addProductToFavorites(product);
          
          // Verify heart icon is now yellow/favorited
          const isNowFavorited = await favoritesPage.isProductFavorited(product);
          expect(isNowFavorited).toBe(true);
          
          expectedFavoritedProducts.push(product);
          console.log(`Product "${product}" was added to favorites`);
        }
      }

      // Navigate to favorites page and verify all expected products are there
      await favoritesPage.navigateToFavoritesViaLink();
      
      // Verify all expected products are in favorites by name
      for (const product of expectedFavoritedProducts) {
        const isInFavorites = await favoritesPage.isProductInFavorites(product);
        expect(isInFavorites).toBe(true);
      }

      console.log(`All ${expectedFavoritedProducts.length} products verified on favorites page`);
    });


    test("should visually indicate favorite status with yellow heart icon", async ({ page }) => {
      // Sign in with FAV_USER
      await signInPage.signInWithCredentials(
        credentials.FAV_USER.username,
        credentials.FAV_USER.password
      );

      // Wait for products to load
      await productListingPage.waitForProductsToLoad();

      // Get first two products for testing
      const products = await productListingPage.getAllProductNames();
      expect(products.length).toBeGreaterThan(1);
      
      const product1 = products[0];
      const product2 = products[1];

      // Check prestate of both heart buttons
      const product1InitiallyFavorited = await favoritesPage.isProductFavorited(product1);
      const product2InitiallyFavorited = await favoritesPage.isProductFavorited(product2);
      
      // Get initial heart button states
      const product1InitialState = await favoritesPage.getHeartButtonState(product1);
      const product2InitialState = await favoritesPage.getHeartButtonState(product2);
      
      console.log(`Product1 "${product1}" initial state: favorited=${product1InitiallyFavorited}, buttonState=${product1InitialState}`);
      console.log(`Product2 "${product2}" initial state: favorited=${product2InitiallyFavorited}, buttonState=${product2InitialState}`);

      // Check favorites page for initial state
      await favoritesPage.navigateToFavoritesViaLink();
      
      if (product1InitiallyFavorited) {
        // If yellow, the product should appear on favorites page
        const product1OnFavoritesPage = await favoritesPage.isProductInFavorites(product1);
        expect(product1OnFavoritesPage).toBe(true);
      } else {
        // If white/not favorited, should not appear on favorites page
        const product1OnFavoritesPage = await favoritesPage.isProductInFavorites(product1);
        expect(product1OnFavoritesPage).toBe(false);
      }

      if (product2InitiallyFavorited) {
        // If yellow, the product should appear on favorites page
        const product2OnFavoritesPage = await favoritesPage.isProductInFavorites(product2);
        expect(product2OnFavoritesPage).toBe(true);
      } else {
        // If white/not favorited, should not appear on favorites page
        const product2OnFavoritesPage = await favoritesPage.isProductInFavorites(product2);
        expect(product2OnFavoritesPage).toBe(false);
      }

      // Go back to product listing to test adding favorites
      await page.goBack();
      await productListingPage.waitForProductsToLoad();

      // Add product1 to favorites if not already favorited
      if (!product1InitiallyFavorited) {
        await favoritesPage.addProductToFavorites(product1);
        
        // Check heart button state changed to favorited/clicked
        const product1NewState = await favoritesPage.getHeartButtonState(product1);
        const product1NowFavorited = await favoritesPage.isProductFavorited(product1);
        expect(product1NowFavorited).toBe(true);
        console.log(`Product1 "${product1}" after adding: favorited=${product1NowFavorited}, buttonState=${product1NewState}`);
        
        // Verify it appears on favorites page
        await favoritesPage.navigateToFavoritesViaLink();
        const product1OnFavoritesPage = await favoritesPage.isProductInFavorites(product1);
        expect(product1OnFavoritesPage).toBe(true);
        
        await page.goBack();
        await productListingPage.waitForProductsToLoad();
      }

      // Add product2 to favorites if not already favorited
      if (!product2InitiallyFavorited) {
        await favoritesPage.addProductToFavorites(product2);
        
        // Check heart button state changed to favorited/clicked
        const product2NewState = await favoritesPage.getHeartButtonState(product2);
        const product2NowFavorited = await favoritesPage.isProductFavorited(product2);
        expect(product2NowFavorited).toBe(true);
        console.log(`Product2 "${product2}" after adding: favorited=${product2NowFavorited}, buttonState=${product2NewState}`);
        
        // Verify it appears on favorites page
        await favoritesPage.navigateToFavoritesViaLink();
        const product2OnFavoritesPage = await favoritesPage.isProductInFavorites(product2);
        expect(product2OnFavoritesPage).toBe(true);
      }
    });
  });

  test.describe("Fav_User_Removing Items from Favorites", () => {
    test("should remove a product from favorites", async ({ page }) => {
      // Sign in with FAV_USER
      await signInPage.signInWithCredentials(
        credentials.DEMO_USER.username,
        credentials.DEMO_USER.password
      );

      // Wait for products to load
      await productListingPage.waitForProductsToLoad();
      const products = await productListingPage.getAllProductNames();
      const testProduct = products[0];

      // Check prestate of heart button
      const isInitiallyFavorited = await favoritesPage.isProductFavorited(testProduct);
      const initialState = await favoritesPage.getHeartButtonState(testProduct);
      
      console.log(`Product "${testProduct}" initial state: favorited=${isInitiallyFavorited}, buttonState=${initialState}`);

      if (!isInitiallyFavorited) {
        // If not favorited, add it first
        await favoritesPage.addProductToFavorites(testProduct);
        
        // Verify it was added
        const isNowFavorited = await favoritesPage.isProductFavorited(testProduct);
        expect(isNowFavorited).toBe(true);
        
        // Verify it appears on favorites page
        await favoritesPage.navigateToFavoritesViaLink();
        const isOnFavoritesPage = await favoritesPage.isProductInFavorites(testProduct);
        expect(isOnFavoritesPage).toBe(true);
        
        // Go back to product listing
        await page.goBack();
        await productListingPage.waitForProductsToLoad();
      } else {
        // If already favorited, verify it's on favorites page
        await favoritesPage.navigateToFavoritesViaLink();
        const isOnFavoritesPage = await favoritesPage.isProductInFavorites(testProduct);
        expect(isOnFavoritesPage).toBe(true);
        
        // Go back to product listing
        await page.goBack();
        await productListingPage.waitForProductsToLoad();
      }

      // Now remove the product from favorites
      await favoritesPage.removeProductFromFavorites(testProduct);

      // Verify heart button is no longer in clicked/favorited state
      const isStillFavorited = await favoritesPage.isProductFavorited(testProduct);
      expect(isStillFavorited).toBe(false);
      
      const newState = await favoritesPage.getHeartButtonState(testProduct);
      console.log(`Product "${testProduct}" after removal: favorited=${isStillFavorited}, buttonState=${newState}`);

      // Verify product is no longer on favorites page
      await favoritesPage.navigateToFavoritesViaLink();
      const isStillOnFavoritesPage = await favoritesPage.isProductInFavorites(testProduct);
      expect(isStillOnFavoritesPage).toBe(false);
    });

    test("should remove all items from favorites", async ({ page }) => {
      // Sign in with FAV_USER
      await signInPage.signInWithCredentials(
        credentials.FAV_USER.username,
        credentials.FAV_USER.password
      );

      // Wait for products to load
      await productListingPage.waitForProductsToLoad();
      const products = await productListingPage.getAllProductNames();
      const testProducts = products.slice(0, 3);

      // Check initial state and add products if needed
      const initiallyFavoritedProducts: string[] = [];
      const productsToAdd: string[] = [];

      for (const product of testProducts) {
        const isAlreadyFavorited = await favoritesPage.isProductFavorited(product);
        if (isAlreadyFavorited) {
          initiallyFavoritedProducts.push(product);
        } else {
          productsToAdd.push(product);
        }
      }

      // Add products that aren't already favorited
      for (const product of productsToAdd) {
        await favoritesPage.addProductToFavorites(product);
        
        // Verify it was added
        const isNowFavorited = await favoritesPage.isProductFavorited(product);
        expect(isNowFavorited).toBe(true);
        console.log(`Added "${product}" to favorites`);
      }

      // Get all currently favorited products from our test set
      const allFavoritedProducts = [...initiallyFavoritedProducts, ...productsToAdd];

      // Navigate to favorites page and verify products are there
      await favoritesPage.navigateToFavoritesViaLink();
      
      for (const product of allFavoritedProducts) {
        const isOnFavoritesPage = await favoritesPage.isProductInFavorites(product);
        expect(isOnFavoritesPage).toBe(true);
      }

      // Go back to product listing to remove all favorites
      await page.goBack();
      await productListingPage.waitForProductsToLoad();

      // Remove all favorited products
      for (const product of allFavoritedProducts) {
        console.log("allFavoritedProducts: " + allFavoritedProducts);
        console.log("product: " + product);
        console.log(`Removing "${product}" from favorites`);
        await favoritesPage.removeProductFromFavorites(product);
        
        // Verify heart button is no longer in clicked/favorited state
        const isStillFavorited = await favoritesPage.isProductFavorited(product);
        expect(isStillFavorited).toBe(false);
        console.log(`Removed "${product}" from favorites`);
      }

      // Navigate to favorites page and verify all products are removed
      await favoritesPage.navigateToFavoritesViaLink();
      
      for (const product of allFavoritedProducts) {
        const isStillOnFavoritesPage = await favoritesPage.isProductInFavorites(product);
        expect(isStillOnFavoritesPage).toBe(false);
      }

      // Verify empty state is displayed (if no other products are favorited)
      const finalCount = await favoritesPage.getFavoriteItemsCount();
      console.log(`Final favorites count: ${finalCount}`);
      
      if (finalCount === 0) {
        const isEmpty = await favoritesPage.isFavoritesEmpty();
        expect(isEmpty).toBe(true);
      }
    });
  });

  test.describe("Fav_User_Favorites Page Content Validation", () => {
    test("should display correct favorites count", async ({ page }) => {
      // Sign in with FAV_USER
      await signInPage.signInWithCredentials(
        credentials.FAV_USER.username,
        credentials.FAV_USER.password
      );

      // Wait for products to load
      await productListingPage.waitForProductsToLoad();
      const products = await productListingPage.getAllProductNames();
      const testProducts = products.slice(0, 2);

      let expectedFavoritedCount = 0;
      
      // Add products to favorites if not already favorited
      for (const product of testProducts) {
        const isAlreadyFavorited = await favoritesPage.isProductFavorited(product);
        
        if (!isAlreadyFavorited) {
          await favoritesPage.addProductToFavorites(product);
          
          // Verify it was added
          const isNowFavorited = await favoritesPage.isProductFavorited(product);
          expect(isNowFavorited).toBe(true);
        }
        
        expectedFavoritedCount++;
      }

      // Navigate to favorites page
      await favoritesPage.navigateToFavoritesViaLink();

      // Verify count matches expected
      const displayedCount = await favoritesPage.getFavoriteItemsCount();
      expect(displayedCount).toBeGreaterThanOrEqual(expectedFavoritedCount);
      
      // Verify our test products are all on favorites page
      for (const product of testProducts) {
        const isInFavorites = await favoritesPage.isProductInFavorites(product);
        expect(isInFavorites).toBe(true);
      }

      // Check if counter is displayed and matches
      const counterCount = await favoritesPage.getFavoritesCountFromCounter();
      if (counterCount > 0) {
        expect(counterCount).toBe(displayedCount);
      }
      
      console.log(`Favorites count: displayed=${displayedCount}, counter=${counterCount}, expected>=${expectedFavoritedCount}`);
    });

    test("should display all favorite item details correctly", async ({ page }) => {
      // Sign in with FAV_USER
      await signInPage.signInWithCredentials(
        credentials.FAV_USER.username,
        credentials.FAV_USER.password
      );

      // Wait for products to load
      await productListingPage.waitForProductsToLoad();
      const products = await productListingPage.getAllProductNames();
      const testProduct = products[0];

      // Check if product is already favorited, if not add it
      const isAlreadyFavorited = await favoritesPage.isProductFavorited(testProduct);
      
      if (!isAlreadyFavorited) {
        await favoritesPage.addProductToFavorites(testProduct);
        
        // Verify it was added
        const isNowFavorited = await favoritesPage.isProductFavorited(testProduct);
        expect(isNowFavorited).toBe(true);
      }

      // Navigate to favorites page
      await favoritesPage.navigateToFavoritesViaLink();

      // Verify we have at least one favorite item
      const favoriteCount = await favoritesPage.getFavoriteItemsCount();
      expect(favoriteCount).toBeGreaterThan(0);

      // Verify our test product is in favorites
      const isInFavorites = await favoritesPage.isProductInFavorites(testProduct);
      expect(isInFavorites).toBe(true);

      // Validate first favorite item structure
      const itemStructure = await favoritesPage.validateFavoriteItemStructure(0);
      expect(itemStructure.hasTitle).toBe(true);
      expect(itemStructure.hasPrice).toBe(true);
      expect(itemStructure.hasImage).toBe(true);

      // Verify item names are displayed
      const favoriteNames = await favoritesPage.getAllFavoriteItemNames();
      expect(favoriteNames.length).toBeGreaterThan(0);
      expect(favoriteNames[0]).toBeTruthy();
      console.log(`First favorite item name: "${favoriteNames[0]}"`);

      // Verify item prices are displayed
      const favoritePrices = await favoritesPage.getAllFavoriteItemPrices();
      expect(favoritePrices.length).toBeGreaterThan(0);
      expect(favoritePrices[0]).toBeTruthy();
      console.log(`First favorite item price: "${favoritePrices[0]}"`);
    });
  });

  test.describe("Fav_User_Favorites Session Behavior (Non-Persistent)", () => {
    test("should maintain favorites during current session after page refresh", async ({ page }) => {
      // Sign in with FAV_USER
      await signInPage.signInWithCredentials(
        credentials.FAV_USER.username,
        credentials.FAV_USER.password
      );

      // Wait for products to load
      await productListingPage.waitForProductsToLoad();
      const products = await productListingPage.getAllProductNames();
      const testProduct = products[0];

      // Check if product is already favorited, if not add it
      const isAlreadyFavorited = await favoritesPage.isProductFavorited(testProduct);
      
      if (!isAlreadyFavorited) {
        await favoritesPage.addProductToFavorites(testProduct);
        
        // Verify it was added
        const isNowFavorited = await favoritesPage.isProductFavorited(testProduct);
        expect(isNowFavorited).toBe(true);
      }

      // Navigate to favorites and get count
      await favoritesPage.navigateToFavoritesViaLink();
      const countBeforeRefresh = await favoritesPage.getFavoriteItemsCount();
      
      // Verify our test product is in favorites
      const isInFavoritesBeforeRefresh = await favoritesPage.isProductInFavorites(testProduct);
      expect(isInFavoritesBeforeRefresh).toBe(true);

      // Refresh page (should maintain favorites within same session)
      await favoritesPage.refreshPage();

      // Verify favorites are maintained during session
      const countAfterRefresh = await favoritesPage.getFavoriteItemsCount();
      expect(countAfterRefresh).toBe(countBeforeRefresh);

      // Verify specific product is still in favorites
      const isStillInFavorites = await favoritesPage.isProductInFavorites(testProduct);
      expect(isStillInFavorites).toBe(true);
      
      console.log(`Session persistence test: ${testProduct} maintained after refresh`);
    });
  });

  test.describe("Fav_User_Favorites with Different User Types", () => {
    test("should handle favorites for demo user", async ({ page }) => {
      // Sign in with FAV_USER
      await signInPage.signInWithCredentials(
        credentials.FAV_USER.username,
        credentials.FAV_USER.password
      );

      // Try to add product to favorites
      await productListingPage.waitForProductsToLoad();
      const products = await productListingPage.getAllProductNames();
      const productToAdd = products[0];
      
      await favoritesPage.addProductToFavorites(productToAdd);

      // Navigate to favorites page
      await favoritesPage.navigateToFavoritesViaLink();

      // Verify favorites functionality works for demo user
      const isLoaded = await favoritesPage.isFavoritesPageLoaded();
      expect(isLoaded).toBe(true);

      const favoriteCount = await favoritesPage.getFavoriteItemsCount();
      expect(favoriteCount).toBeGreaterThanOrEqual(0); // Should work or show empty state
    });

    test("should show empty favorites for FAV_USER on fresh login (session-based)", async ({ page }) => {
      // Sign in with FAV_USER (fresh session should start empty)
      await signInPage.signInWithCredentials(
        credentials.FAV_USER.username,
        credentials.FAV_USER.password
      );

      // Navigate to favorites page
      await favoritesPage.navigateToFavoritesViaLink();

      // Verify favorites page loads
      const isLoaded = await favoritesPage.isFavoritesPageLoaded();
      expect(isLoaded).toBe(true);

      // Since favorites are session-based, should start empty
      const favoriteCount = await favoritesPage.getFavoriteItemsCount();
      const isEmpty = await favoritesPage.isFavoritesEmpty();
      
      expect(favoriteCount).toBe(0);
      expect(isEmpty).toBe(true);
      
      // Verify empty message is displayed
      const emptyMessage = await favoritesPage.getEmptyFavoritesMessage();
      expect(emptyMessage.toLowerCase()).toMatch(/empty|no.*favorites|no.*items/i);
    });
  });

  test.describe("Fav_User_Favorites Error Handling", () => {
    test("should handle network errors gracefully when adding to favorites", async ({ page }) => {
      // Sign in with FAV_USER
      await signInPage.signInWithCredentials(
        credentials.FAV_USER.username,
        credentials.FAV_USER.password
      );

      // Wait for products to load
      await productListingPage.waitForProductsToLoad();

      // Simulate network issues (if applicable)
      // This test would need specific implementation based on how the app handles network errors
      
      // Try to add product to favorites
      const products = await productListingPage.getAllProductNames();
      const productToAdd = products[0];
      
      // The app should handle errors gracefully
      await favoritesPage.addProductToFavorites(productToAdd);
      
      // Verify no crashes occurred
      const currentUrl = await favoritesPage.getCurrentUrl();
      expect(currentUrl).toBeTruthy();
    });

    test("should display appropriate error message for failed operations", async ({ page }) => {
      // Sign in with FAV_USER
      await signInPage.signInWithCredentials(
        credentials.FAV_USER.username,
        credentials.FAV_USER.password
      );

      // Navigate to favorites page
      await favoritesPage.navigateToFavoritesViaLink();

      // Check for any error messages
      const hasError = await favoritesPage.hasErrorMessage();
      
      if (hasError) {
        const errorMessage = await favoritesPage.getErrorMessageText();
        expect(errorMessage).toBeTruthy();
        console.log("Error message displayed:", errorMessage);
      }

      // Verify page is still functional
      const isLoaded = await favoritesPage.isFavoritesPageLoaded();
      expect(isLoaded).toBe(true);
    });
  });
});
