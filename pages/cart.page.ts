import { Page } from "@playwright/test";
import BasePage from "./common/basePage";

class CartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Cart indicator and navigation elements - Based on actual DOM structure
  get cartIcon() {
    // The cart icon/count area - the cart automatically opens as float-cart
    return this.page.locator(".float-cart");
  }

  get cartItemCount() {
    // The number displayed in the cart indicator - there are 2 elements with numbers, taking the first
    return this.page.locator("div, span").filter({ hasText: /^\d+$/ }).first();
  }

  get bagButton() {
    // Click on the cart area to open cart
    return this.cartIcon;
  }

  get bagText() {
    // The "Bag" text element
    return this.page.getByText("Bag");
  }

  // Cart content elements - Based on actual DOM structure
  get cartItems() {
    // Cart items are in the float-cart content with product details
    return this.page.locator(
      ".float-cart__content .float-cart__shelf-container"
    );
  }

  get emptyCartMessage() {
    // Empty cart shows "Add some products in the bag :)"
    return this.page.getByText("Add some products in the bag :)");
  }

  get cartContent() {
    // The main cart content area
    return this.page.locator(".float-cart__content");
  }

  get cartModal() {
    // The cart sidebar/modal with class float-cart
    return this.page.locator(".float-cart");
  }

  get closeCartButton() {
    // The X button to close cart
    return this.page.getByText("X");
  }

  get checkoutButton() {
    // The checkout button with class buy-btn
    return this.page.locator(".buy-btn");
  }

  get continueShoppingButton() {
    // Continue shopping button when cart is empty
    return this.page.getByRole("generic", { name: "Continue Shopping" });
  }

  // Action methods
  async openCart() {
    // Cart opens automatically when items are added, but check if it's already open
    const isOpen = await this.cartModal.isVisible();
    if (!isOpen) {
      // If cart is not open, try clicking on the count area
      await this.cartItemCount.click();
      await this.waitForSpinnerToHide();
    }
  }

  async openBag() {
    // Same as openCart for this site
    await this.openCart();
  }

  async closeCart() {
    // Click X to close cart if visible
    try {
      if (await this.closeCartButton.isVisible({ timeout: 2000 })) {
        await this.closeCartButton.click();
      }
    } catch {
      // Cart might close automatically or X might not be visible
    }
  }

  // Data retrieval methods
  async getCartItemCount(): Promise<number> {
    try {
      const countText = await this.cartItemCount.textContent();
      const count = countText ? parseInt(countText.trim()) : 0;
      return isNaN(count) ? 0 : count;
    } catch {
      return 0;
    }
  }

  async isCartEmpty(): Promise<boolean> {
    try {
      // First check cart count indicator
      const count = await this.getCartItemCount();
      if (count === 0) {
        return true;
      }

      // If count shows items, double-check by opening cart
      await this.openCart();
      const isEmpty = await this.emptyCartMessage.isVisible({ timeout: 2000 });
      await this.closeCart();
      return isEmpty;
    } catch {
      // If can't determine, check cart items count
      try {
        const count = await this.getCartItemCount();
        return count === 0;
      } catch {
        return true; // Assume empty if we can't determine
      }
    }
  }

  async getCartItemsCount(): Promise<number> {
    try {
      await this.openCart();
      const count = await this.cartItems.count();
      await this.closeCart();
      return count;
    } catch {
      return 0;
    }
  }

  async getCartItemNames(): Promise<string[]> {
    try {
      await this.openCart();
      // Look for paragraph elements that contain product names
      const items = await this.cartItems
        .locator("p")
        .filter({ hasNotText: /Quantity:|\$|Apple|Samsung|Google|OnePlus/ })
        .allTextContents();
      await this.closeCart();
      return items.filter((item) => item.trim() !== "");
    } catch {
      return [];
    }
  }

  async isCartIndicatorVisible(): Promise<boolean> {
    try {
      // Check if cart is visible (it opens automatically when items are added)
      return await this.cartModal.isVisible();
    } catch {
      try {
        return await this.bagText.isVisible();
      } catch {
        return false;
      }
    }
  }

  async isCartIndicatorShowingItems(): Promise<boolean> {
    try {
      const count = await this.getCartItemCount();
      return count > 0;
    } catch {
      return false;
    }
  }

  // Wait methods
  async waitForCartToLoad() {
    // Wait for cart icon/count to be visible
    await this.cartIcon.waitFor({ state: "visible", timeout: 10000 });
  }

  async waitForCartContentToUpdate() {
    await this.page.waitForTimeout(1000); // Give cart time to update
    await this.waitForSpinnerToHide();
  }

  // Verify cart operations
  async verifyProductAddedToCart(productName: string): Promise<boolean> {
    try {
      // Check cart count is greater than 0
      const cartCount = await this.getCartItemCount();
      if (cartCount <= 0) return false;

      // Check if mini cart is visible
      const isVisible = await this.isCartIndicatorVisible();
      if (!isVisible) return false;

      // Check if specific product is in cart
      const cartItems = await this.getCartItemNames();
      return cartItems.includes(productName);
    } catch (error) {
      console.error("Error verifying product in cart:", error);
      return false;
    }
  }

  async verifyMiniCartOpened(): Promise<boolean> {
    return await this.isCartIndicatorVisible();
  }
}

export default CartPage;
