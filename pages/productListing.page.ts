import { Page } from "@playwright/test";
import BasePage from "./common/basePage";

class ProductListingPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Brand filter checkboxes
  get appleFilter() {
    return this.page.locator("label").filter({ hasText: "Apple" });
  }

  get samsungFilter() {
    return this.page.locator("label").filter({ hasText: "Samsung" });
  }

  get googleFilter() {
    return this.page.locator("label").filter({ hasText: "Google" });
  }

  get onePlusFilter() {
    return this.page.locator("label").filter({ hasText: "OnePlus" });
  }

  // Product elements
  get allProducts() {
    return this.page.locator("p.shelf-item__title");
  }

  get productCount() {
    return this.page.locator("text=/\\d+ Product\\(s\\) found\\./");
  }

  get spinner() {
    return this.page.locator("div.spinner");
  }

  get productImages() {
    return this.page.locator("div.shelf-item img");
  }

  // Methods to apply filters
  async selectAppleFilter() {
    await this.appleFilter.check();
    await this.waitForSpinnerToHide(); // Using BasePage functionality
  }

  async selectSamsungFilter() {
    await this.samsungFilter.check();
    await this.waitForSpinnerToHide(); // Using BasePage functionality
  }

  async selectGoogleFilter() {
    await this.googleFilter.check();
    await this.waitForSpinnerToHide(); // Using BasePage functionality
  }

  async selectOnePlusFilter() {
    await this.onePlusFilter.check();
    await this.waitForSpinnerToHide(); // Using BasePage functionality
  }

  async clearAllFilters() {
    await this.appleFilter.uncheck();
    await this.samsungFilter.uncheck();
    await this.googleFilter.uncheck();
    await this.onePlusFilter.uncheck();
  }

  // Methods to get product data for verification
  async getAllProductNames(): Promise<string[]> {
    return await this.allProducts.allTextContents();
  }

  async checkAllProductsContainKeyword(keyword: string): Promise<boolean> {
    const products = await this.getAllProductNames();
    if (products.length === 0) return false;

    return products.every((product) =>
      product.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  async getProductCount(): Promise<number> {
    const countText = await this.productCount.textContent();
    const match = countText?.match(/(\d+) Product\(s\) found\./);
    return match ? parseInt(match[1]) : 0;
  }

  async waitForProductsToLoad() {
    await this.page.waitForSelector(
      'p:has-text("iPhone"), p:has-text("Galaxy"), p:has-text("Pixel"), p:has-text("One Plus")',
      { timeout: 10000 }
    );
  }

  // Image validation methods
  async getAllProductImageSources(): Promise<string[]> {
    const images = await this.productImages.all();
    const srcValues = await Promise.all(
      images.map(async (img) => {
        const src = await img.getAttribute("src");
        return src || "";
      })
    );
    return srcValues;
  }

  async validateAllImagesHaveNonEmptySource(): Promise<boolean> {
    const srcValues = await this.getAllProductImageSources();
    return srcValues.every((src) => src.trim() !== "");
  }

  async getImagesWithEmptySource(): Promise<number> {
    const srcValues = await this.getAllProductImageSources();
    return srcValues.filter((src) => src.trim() === "").length;
  }
}

export default ProductListingPage;
