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
