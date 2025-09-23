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
    // Product count text shows "25 Product(s) found."
    return this.page.getByText(/\d+ Product\(s\) found\./);
  }

  get allProductContainers() {
    // Each product container has the product title
    return this.page
      .locator("div")
      .filter({ has: this.page.locator("p.shelf-item__title") });
  }

  get spinner() {
    return this.page.locator("div.spinner");
  }

  get productImages() {
    return this.page.locator("div.shelf-item img");
  }

  // Cart-related elements - Based on actual DOM structure
  get addToCartButtons() {
    // "Add to cart" elements are generic divs with that text
    return this.page.getByText("Add to cart");
  }

  get firstProduct() {
    // First product has ID="1"
    return this.page.locator('[id="1"]');
  }

  get firstProductAddToCartButton() {
    // "Add to cart" button in first product
    return this.firstProduct.locator(".shelf-item__buy-btn");
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
    // Wait for product titles to be visible
    await this.page.waitForSelector("p.shelf-item__title", { timeout: 10000 });
  }

  // Image validation methods
  async getAllProductImageSources(): Promise<string[]> {
    // Get all product images from the containers
    const images = await this.allProductContainers.locator("img").all();
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

  // Cart interaction methods
  async addFirstProductToCart() {
    await this.firstProductAddToCartButton.click();
    await this.waitForSpinnerToHide();
  }

  async addProductToCartByIndex(index: number) {
    // Products have IDs starting from 1, so index 0 = ID "1", index 1 = ID "2", etc.
    const productId = (index + 1).toString();
    const product = this.page.locator(`[id="${productId}"]`);
    const addButton = product.locator(".shelf-item__buy-btn");
    await addButton.click();
    await this.waitForSpinnerToHide();
  }

  async addProductToCartByName(productName: string) {
    const productElement = this.page.locator("[id]").filter({
      has: this.page.locator(`p.shelf-item__title:has-text("${productName}")`),
    });
    const addButton = productElement.locator(".shelf-item__buy-btn");
    await addButton.click();
    await this.waitForSpinnerToHide();
  }

  async getFirstProductName(): Promise<string> {
    const firstProductTitle = this.firstProduct
      .locator("p.shelf-item__title")
      .first();
    return (await firstProductTitle.textContent()) || "";
  }

  async isAddToCartButtonVisible(): Promise<boolean> {
    try {
      return await this.firstProductAddToCartButton.isVisible();
    } catch {
      return false;
    }
  }
}

export default ProductListingPage;
