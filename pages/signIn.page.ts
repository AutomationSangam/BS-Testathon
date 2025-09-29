import { Page } from "@playwright/test";
import BasePage from "./common/basePage";

class SignInPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Sign in page elements
  get signInButton() {
    return this.page.getByRole("link", { name: "Sign In" });
  }

  get usernameDropdown() {
    return this.page.locator("#username svg");
  }

  get passwordDropdown() {
    return this.page.locator("#password svg");
  }

  get logInButton() {
    return this.page.getByRole("button", { name: "Log In" });
  }

  get usernameField() {
    return this.page.locator("#username input");
  }

  get passwordField() {
    return this.page.locator("#password input");
  }

  get logoutButton() {
    // Logout link when user is logged in
    return this.page.getByRole("link", { name: "Logout" });
  }

  get loggedInUserName() {
    // The displayed username when logged in (appears in top right)
    return this.page.locator("span.username");
  }

  // Sign in methods
  async clickSignInButton() {
    await this.signInButton.click();
  }

  async selectUsername(username: string) {
    // Click on username dropdown
    await this.usernameDropdown.click();
    // Select the username from dropdown
    await this.page.getByText(username, { exact: true }).click();
  }

  async selectPassword(password: string) {
    // Click on password dropdown
    await this.passwordDropdown.click();
    // Select the password from dropdown
    await this.page.getByText(password, { exact: true }).click();
  }

  async clickLogInButton() {
    await this.logInButton.click();
  }

  async signInWithCredentials(username: string, password: string) {
    await this.clickSignInButton();
    await this.selectUsername(username);
    await this.selectPassword(password);
    await this.clickLogInButton();
    await this.waitForSpinnerToHide(); // Using BasePage functionality
  }

  // Complete sign in with verification
  async signInAndVerify(username: string, password: string): Promise<boolean> {
    await this.signInWithCredentials(username, password);
    return await this.isUserLoggedIn();
  }

  // Navigation and validation methods
  async navigateToSignInPage() {
    await this.page.goto("/signin");
  }

  async waitForSignInPageToLoad() {
    await this.page.waitForSelector("#username", { timeout: 10000 });
    await this.page.waitForSelector("#password", { timeout: 10000 });
  }

  async isSignInPageLoaded(): Promise<boolean> {
    try {
      await this.page.waitForSelector("#username", { timeout: 5000 });
      await this.page.waitForSelector("#password", { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async isUserLoggedIn(): Promise<boolean> {
    try {
      // Check if logout button is visible
      await this.logoutButton.waitFor({ state: "visible", timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async getLoggedInUsername(): Promise<string | null> {
    try {
      return await this.loggedInUserName.textContent();
    } catch {
      return null;
    }
  }

  async logout() {
    if (await this.logoutButton.isVisible()) {
      await this.logoutButton.click();
      await this.waitForSpinnerToHide();
    }
  }
}

export default SignInPage;
