import { Page } from "@playwright/test";
import BasePage from "./common/basePage";

class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Mini cart icon
  get mini_cartIcon() {
    return this.page.locator("//span[@class='bag bag--float-cart-closed']");
  }

  // Mini cart close button
  get miniCartCloseButton() {
    return this.page.locator("//div[@class='float-cart__close-btn']");
  }

  // add product to cart
   async addProductToCart(productName: string) {
    const addButton = this.page.locator(`//p[@class='shelf-item__title' and normalize-space()='${productName}']/ancestor::div[@class='shelf-item']//div[@class='shelf-item__buy-btn' and normalize-space()='Add to cart']`);
    await addButton.click();
    await this.waitForSpinnerToHide();
  }

  // Click mini cart button
  async clickMiniCartButton() {
    const isMiniCartOpen = await this.miniCartCloseButton.isVisible().catch(() => false);
    if (isMiniCartOpen) {
      // Mini cart is already open, do nothing
      return;
    }
    await this.mini_cartIcon.click();
    await this.waitForSpinnerToHide();
  }

  // Complete checkout flow for a specific product
  async addProductToCartAndOpenMiniCart(productName: string) {
    await this.addProductToCart(productName);
    await this.clickMiniCartButton();
  }

  // Checkout button
  get checkoutButton() {
    return this.page.locator("//div[@class='buy-btn']");
  }

  // Form fields
  get firstNameField() {
    return this.page.locator("#firstNameInput");
  }

  get lastNameField() {
    return this.page.locator("#lastNameInput");
  }

  get addressField() {
    return this.page.locator("#addressLine1Input");
  }

  get provinceField() {
    return this.page.locator("#provinceInput");
  }

  get postCodeField() {
    return this.page.locator("#postCodeInput");
  }

  get submitButton() {
    return this.page.locator("#checkout-shipping-continue");
  }

  // Click checkout button
  async clickCheckoutButton() {
    await this.checkoutButton.click();
  }

  // Fill checkout form
  async fillCheckoutForm(firstName: string, lastName: string, address: string, province: string, postCode: string) {
    await this.firstNameField.fill(firstName);
    await this.lastNameField.fill(lastName);
    await this.addressField.fill(address);
    await this.provinceField.fill(province);
    await this.postCodeField.fill(postCode);
  }

  // Submit form
  async submitForm() {
    await this.submitButton.click();
  }
}

export default CheckoutPage;