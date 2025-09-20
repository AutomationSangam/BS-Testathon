import { Page } from "@playwright/test";

/**
 * Base page class that provides common functionality for all page objects
 * Extend this class for consistent behavior across all pages
 */
class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Common elements that appear on multiple pages
  get loadingSpinner() {
    return this.page.locator("div.spinner");
  }

  get errorMessage() {
    return this.page.locator(".error-message, .alert-error, [role='alert']");
  }

  get successMessage() {
    return this.page.locator(".success-message, .alert-success");
  }

  // Common actions
  async waitForPageLoad(timeout: number = 10000) {
    await this.page.waitForLoadState("networkidle", { timeout });
  }

  async waitForSpinnerToHide(timeout: number = 10000) {
    try {
      await this.loadingSpinner.waitFor({ state: "hidden", timeout });
    } catch {
      // Spinner might not be present, continue
      console.log("Spinner not found");
    }
  }

  async refreshPage() {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  // Navigation helpers
  async navigateTo(url: string) {
    await this.page.goto(url);
    await this.waitForPageLoad();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  // Common validations (return data, no assertions)
  async isElementVisible(
    locator: any,
    timeout: number = 5000
  ): Promise<boolean> {
    try {
      await locator.waitFor({ state: "visible", timeout });
      return true;
    } catch {
      return false;
    }
  }

  async isElementHidden(
    locator: any,
    timeout: number = 5000
  ): Promise<boolean> {
    try {
      await locator.waitFor({ state: "hidden", timeout });
      return true;
    } catch {
      return false;
    }
  }

  async getElementCount(locator: any): Promise<number> {
    return await locator.count();
  }

  async waitForElementToBeVisible(
    locator: any,
    timeout: number = 10000
  ): Promise<void> {
    await locator.waitFor({ state: "visible", timeout });
  }

  async waitForElementToBeHidden(
    locator: any,
    timeout: number = 10000
  ): Promise<void> {
    await locator.waitFor({ state: "hidden", timeout });
  }

  // Error handling helpers
  async hasErrorMessage(): Promise<boolean> {
    return await this.isElementVisible(this.errorMessage);
  }

  async getErrorMessageText(): Promise<string> {
    if (await this.hasErrorMessage()) {
      return (await this.errorMessage.textContent()) || "";
    }
    return "";
  }

  async hasSuccessMessage(): Promise<boolean> {
    return await this.isElementVisible(this.successMessage);
  }

  async getSuccessMessageText(): Promise<string> {
    if (await this.hasSuccessMessage()) {
      return (await this.successMessage.textContent()) || "";
    }
    return "";
  }

  // Form helpers
  async fillField(locator: any, value: string) {
    await locator.clear();
    await locator.fill(value);
  }

  async selectDropdownOption(dropdownLocator: any, optionText: string) {
    await dropdownLocator.click();
    await this.page.getByText(optionText, { exact: true }).click();
  }
  x;
}

export default BasePage;
