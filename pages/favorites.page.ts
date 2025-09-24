import { Page } from "@playwright/test";
import BasePage from "./common/basePage";

class FavoritesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Navigation elements
  get favoritesLink() {
    return this.page.locator("//a[@id='favourites' and @href='/favourites']");
  }

  get favoritesIcon() {
    return this.page.locator("//button[contains(@class, 'MuiButtonBase-root MuiIconButton-root Button')]");
  }

  // Favorites page elements
  get favoritesPageTitle() {
    return this.page.locator("h1, .page-title").filter({ hasText: /favorites|wishlist/i });
  }

  get favoritesList() {
    return this.page.locator("//div[@class='shelf-item']");
  }

  get allFavoriteItems() {
    return this.page.locator("//div[@class='shelf-item']");
  }

  // There is no empty favorites message; instead, check the count in //small[@class='products-found']
  get productsFoundLabel() {
    return this.page.locator("//small[@class='products-found']");
  }

  /**
   * Returns the number of favorite items by parsing the text of the products-found label.
   * Example label text: "1 Product(s) found." or "0 Product(s) found."
   */
  async getFavoritesCountFromLabel(): Promise<number> {
    try {
      const labelText = await this.productsFoundLabel.textContent();
      if (!labelText) return 0;
      const match = labelText.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Returns true if there are no products in favorites (i.e., "0 Product(s) found.")
   */
  async isFavoritesEmpty(): Promise<boolean> {
    const count = await this.getFavoritesCountFromLabel();
    return count === 0;
  }

  // Product-specific favorite elements (MUI heart icon buttons)
  get favoriteHeartButtons() {
    return this.page.locator("button.MuiButtonBase-root.MuiIconButton-root.Button");
  }

  // Favorited (clicked) heart icons - contains "clicked" class
  get favoritedHeartButtons() {
    return this.page.locator("button.MuiButtonBase-root.MuiIconButton-root.Button.clicked");
  }

  // Non-favorited (default) heart icons - does not contain "clicked" class
  get nonFavoritedHeartButtons() {
    return this.page.locator("button.MuiButtonBase-root.MuiIconButton-root.Button:not(.clicked)");
  }

  // Individual favorite item elements
  get favoriteItemTitles() {
    return this.page.locator("//p[@class='shelf-item__title']");
  }

  get favoriteItemPrices() {
    return this.page.locator("//div[@class='val']");
  }

  get favoriteItemImages() {
    return this.page.locator("//div[@class='shelf-item__thumb']/img");
  }

  // Navigation methods
  async navigateToFavoritesPage() {
    await this.page.goto("/favourites");
    await this.waitForPageLoad();
  }

  async navigateToFavoritesViaLink() {
    await this.favoritesLink.click();
    await this.waitForPageLoad();
  }


  // Favorite management methods (using MUI heart icon buttons)
//   async addProductToFavorites(productName: string) {
//     const productLocator = this.page.locator("p.shelf-item__title").filter({ hasText: productName });
//     const heartButton = productLocator.locator("button.MuiButtonBase-root.MuiIconButton-root.Button").first();
    
//     // Only click if not already favorited (doesn't have "clicked" class)
//     const isAlreadyFavorited = await this.isProductFavorited(productName);
//     if (!isAlreadyFavorited) {
//       await heartButton.click();
//       await this.waitForSpinnerToHide();
//     }
//   }
async addProductToFavorites(productName: string) {
    const heartButton = this.page.locator(
        `//p[@class='shelf-item__title' and normalize-space()='${productName}']
         /ancestor::div[@class='shelf-item']
         //button[contains(@class,'MuiIconButton-root')]`
      );
    const isAlreadyFavorited = await this.isProductFavorited(productName);
    if (!isAlreadyFavorited) {
        console.log(`Adding product "${productName}" to favorites`);
      await heartButton.click();
    }
  }



//   async removeProductFromFavorites(productName: string) {
//     // Remove from product listing by clicking heart icon again
//     const productLocator = this.page.locator("p.shelf-item__title").filter({ hasText: productName });
//     const heartButton = productLocator.locator("button.MuiButtonBase-root.MuiIconButton-root.Button").first();
    
//     // Only click if currently favorited (has "clicked" class)
//     const isCurrentlyFavorited = await this.isProductFavorited(productName);
//     if (isCurrentlyFavorited) {
//       await heartButton.click();
//       await this.waitForSpinnerToHide();
//     }
//   }



  // Data retrieval methods (return data, no assertions)
  
  async removeProductFromFavorites(productName: string) {
    const productLocator = this.page.locator(
      `//p[@class='shelf-item__title' and normalize-space()='${productName}']`
    );
    const heartButton = productLocator
      .locator("xpath=ancestor::div[@class='shelf-item']//button[contains(@class,'MuiIconButton-root')]")
      .first();
  
    const isCurrentlyFavorited = await this.isProductFavorited(productName);
    if (isCurrentlyFavorited) {
      await heartButton.click();
    }
  }
  
  async getFavoriteItemsCount(): Promise<number> {
    try {
      return await this.allFavoriteItems.count();
    } catch {
      return 0;
    }
  }

  async getAllFavoriteItemNames(): Promise<string[]> {
    try {
      return await this.favoriteItemTitles.allTextContents();
    } catch {
      return [];
    }
  }

  async getAllFavoriteItemPrices(): Promise<string[]> {
    try {
      return await this.favoriteItemPrices.allTextContents();
    } catch {
      return [];
    }
  }

  async getFavoritesCountFromCounter(): Promise<number> {
    try {
      const countText = await this.productsFoundLabel.textContent();
      const match = countText?.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    } catch {
      return 0;
    }
  }

  async isProductInFavorites(productName: string): Promise<boolean> {
    const favoriteItems = await this.getAllFavoriteItemNames();
    return favoriteItems.some(item => 
      item.toLowerCase().includes(productName.toLowerCase())
    );
  }

//   async isFavoritesPageEmpty(): Promise<boolean> {
//     try {
//       const isEmpty = await this.isElementVisible(this.emptyFavoritesMessage);
//       const itemCount = await this.getFavoriteItemsCount();
//       return isEmpty || itemCount === 0;
//     } catch {
//       return true;
//     }
//   }

//   async isProductFavorited(productName: string): Promise<boolean> {
//   try {
//     const productLocator = this.page.locator(
//       `//p[@class='shelf-item__title' and normalize-space()='${productName}']`
//     );
//     const heartButton = productLocator
//       .locator("xpath=ancestor::div[@class='shelf-item']//button[contains(@class,'MuiIconButton-root')]")
//       .first();

//     const classList = await heartButton.getAttribute("class");
//     return classList?.includes("clicked") || false;
//   } catch {
//     return false;
//   }
// }

async isProductFavorited(productName: string): Promise<boolean> {
    try {
      const productLocator = this.page.locator(
        `//p[@class='shelf-item__title' and normalize-space()='${productName}']`
      );
      const heartButton = productLocator
        .locator("xpath=ancestor::div[@class='shelf-item']//button[contains(@class,'MuiIconButton-root')]")
        .first();
  
      const classList = await heartButton.getAttribute("class");
      return classList?.includes("clicked") || false;
    } catch {
      return false;
    }
  }

//   async getHeartButtonState(productName: string): Promise<string> {
//     try {
//       const productLocator = this.page.locator(".shelf-item, .product-item").filter({ hasText: productName });
//       const heartButton = productLocator.locator("button.MuiButtonBase-root.MuiIconButton-root.Button").first();
      
//       // Get the class list to determine state
//       const classList = await heartButton.getAttribute("class");
      
//       if (classList?.includes("clicked")) {
//         return "favorited";
//       } else {
//         return "not-favorited";
//       }
//     } catch {
//       return "unknown";
//     }
//   }

  // Validation methods
  async getHeartButtonState(productName: string): Promise<"favorited" | "not-favorited" | "unknown"> {
    try {
      const isFav = await this.isProductFavorited(productName);
      return isFav ? "favorited" : "not-favorited";
    } catch {
      return "unknown";
    }
  }


  async waitForFavoritesPageToLoad() {
    try {
      await this.page.waitForSelector(".favorites-list, .wishlist-list, [data-testid='favorites-list'], .empty-favorites", { timeout: 10000 });
    } catch {
      // Page might not have favorites-specific elements, continue
    }
  }

  async isFavoritesPageLoaded(): Promise<boolean> {
    try {
      const url = await this.getCurrentUrl();
      const hasTitle = await this.isElementVisible(this.favoritesPageTitle);
      const hasList = await this.isElementVisible(this.favoritesList);
      
      // Check for the specific URL pattern: testathon.live/favourites
      return url.includes("favourites") || hasTitle || hasList ;
    } catch {
      return false;
    }
  }

  async getEmptyFavoritesMessage(): Promise<string> {
    try {
      return await this.productsFoundLabel.textContent() || "";
    } catch {
      return "";
    }
  }

  async getFavoritesPageTitle(): Promise<string> {
    try {
      // Document title from the browser tab
      const pageTitle = await this.page.title();
      return pageTitle || "";
    } catch {
      return "";
    }
  }

  // Utility methods for common operations


  async validateFavoriteItemStructure(itemIndex: number): Promise<{
    hasTitle: boolean;
    hasPrice: boolean;
    hasImage: boolean;
  }> {
    const item = this.allFavoriteItems.nth(itemIndex);
    
    return {
      hasTitle: await this.isElementVisible(item.locator(".shelf-item__title, h3, .product-name")),
      hasPrice: await this.isElementVisible(item.locator(".shelf-item__price, .product-price")),
      hasImage: await this.isElementVisible(item.locator("//div[@class='shelf-item__thumb']/img")),
    };
  }
}

export default FavoritesPage;
