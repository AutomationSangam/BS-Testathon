# BS-Testathon - Playwright TypeScript with BrowserStack Integration

<div align="center">
  <img src="https://playwright.dev/img/playwright-logo.svg" alt="Playwright Logo" width="200" height="100">
  <img src="https://www.browserstack.com/images/layout/browserstack-logo-600x315.png" alt="BrowserStack Logo" width="200" height="100">
</div>

<div align="center">

[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![BrowserStack](https://img.shields.io/badge/BrowserStack-FF6600?style=for-the-badge&logo=browserstack&logoColor=white)](https://www.browserstack.com/)

</div>

A comprehensive test automation framework using Playwright with TypeScript, integrated with BrowserStack for cross-browser testing across multiple platforms and devices.

## 🚀 Features

- **Cross-Browser Testing**: Chrome, Firefox, and WebKit support
- **BrowserStack Integration**: Run tests on 3000+ real browsers and devices
- **TypeScript Support**: Full type safety and modern JavaScript features
- **Page Object Model**: Organized and maintainable test architecture
- **Parallel Execution**: Run tests concurrently for faster execution
- **Local Testing**: BrowserStack Local for testing staging/localhost applications
- **Test Observability**: Intelligent test reporting and debugging
- **Environment Configuration**: Flexible configuration with environment variables

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 14 or higher)
- **npm** or **yarn**
- **BrowserStack Account** - [Sign up here](https://www.browserstack.com/users/sign_up)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AutomationSangam/BS-Testathon.git
   cd BS-Testathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

## ⚙️ Configuration

### BrowserStack Setup

1. **Create a `.env` file** in the project root:
   ```bash
   touch .env
   ```

2. **Add your BrowserStack credentials** to the `.env` file:
   ```env
   BROWSERSTACK_USERNAME=your_username_here
   BROWSERSTACK_ACCESS_KEY=your_access_key_here
   ```

   > 💡 **Tip**: You can find your credentials in the [BrowserStack Automate Dashboard](https://automate.browserstack.com/)

3. **Configure test settings** in `browserstack.yml`:
   - Update `projectName` and `buildName` as needed
   - Modify browser/device combinations in the `platforms` section
   - Adjust `parallelsPerPlatform` based on your BrowserStack plan

### Playwright Configuration

The `playwright.config.ts` file contains:
- Test directory configuration
- Browser projects setup
- Reporter settings
- Retry and timeout configurations

## 🧪 Running Tests

### Local Execution

Run tests locally using Playwright:

```bash
# Run all tests
npx playwright test

# Run tests in headed mode
npx playwright test --headed

# Run specific test file
npx playwright test tests/example.spec.ts

# Run tests with UI mode
npx playwright test --ui
```

### BrowserStack Execution

Run tests on BrowserStack cloud:

```bash
# Run tests on BrowserStack
npx browserstack-node-sdk playwright test

# Run specific test file on BrowserStack
npx browserstack-node-sdk playwright test tests/example.spec.ts

# Run with custom build name
npx browserstack-node-sdk playwright test --build-name "Custom Build Name"
```

### Test Reports

View test results:

```bash
# Open HTML report (after local execution)
npx playwright show-report

# View BrowserStack dashboard
# Visit: https://automate.browserstack.com/dashboard
```

## 📁 Project Structure

```
BS-Testathon/
├── pages/                    # Page Object Model (POM) classes
│   ├── BasePage.ts          # Base page with common functionality
│   ├── HomePage.ts          # Home page object
│   └── LoginPage.ts         # Login page object (example)
├── tests/                    # Main test directory
│   └── example.spec.ts       # Basic Playwright tests
├── tests-examples/           # Example test files
│   └── demo-todo-app.spec.ts # TodoMVC comprehensive test suite
├── browserstack.yml          # BrowserStack configuration
├── playwright.config.ts      # Playwright configuration
├── package.json             # Dependencies and scripts
├── .env                     # Environment variables (create this)
└── README.md               # Project documentation
```

## 📝 Test Examples

### Basic Test (`tests/example.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});
```

### Advanced Test Suite (`tests-examples/demo-todo-app.spec.ts`)
- Complete TodoMVC application testing
- CRUD operations testing
- State management validation
- Navigation and routing tests
- Local storage persistence tests

## 🏗️ Page Object Model (POM)

The project uses the Page Object Model pattern to organize and maintain test code efficiently. Page objects encapsulate web page elements and actions, making tests more readable and maintainable.

### Page Object Structure

#### Base Page (`pages/BasePage.ts`)
```typescript
import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string) {
    await this.page.goto(url);
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }
}
```

#### Example Page Object (`pages/HomePage.ts`)
```typescript
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly searchBox: Locator;
  readonly searchButton: Locator;
  readonly logo: Locator;

  constructor(page: Page) {
    super(page);
    this.searchBox = page.locator('[data-testid="search-input"]');
    this.searchButton = page.locator('[data-testid="search-button"]');
    this.logo = page.locator('[data-testid="logo"]');
  }

  async search(query: string) {
    await this.searchBox.fill(query);
    await this.searchButton.click();
  }

  async verifyPageLoaded() {
    await expect(this.logo).toBeVisible();
  }
}
```

#### Using Page Objects in Tests
```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test('search functionality', async ({ page }) => {
  const homePage = new HomePage(page);
  
  await homePage.goto('https://example.com');
  await homePage.verifyPageLoaded();
  await homePage.search('playwright testing');
  
  // Assert search results
  await expect(page).toHaveURL(/.*search.*/);
});
```

### Benefits of Page Object Model

- **Maintainability**: Changes to UI elements require updates in one place only
- **Reusability**: Page objects can be used across multiple test files
- **Readability**: Tests become more readable and business-focused
- **Separation of Concerns**: Test logic separated from page interaction logic

## 🌐 Browser Coverage

### BrowserStack Platforms (configured in `browserstack.yml`):
- **Windows 11**: Chrome (latest)
- **macOS Ventura**: WebKit (latest)
- **Windows 11**: Firefox (latest)

### Local Browsers:
- Chromium
- Firefox
- WebKit

## 🛡️ Best Practices

1. **Environment Variables**: Never commit credentials to version control
2. **Page Object Model**: Use POM pattern for maintainable and reusable code (see `pages/` folder)
3. **Test Data Management**: Use fixtures for test data and avoid hardcoded values
4. **Parallel Execution**: Leverage BrowserStack's parallel testing capabilities
5. **Test Isolation**: Ensure tests are independent and can run in any order
6. **Descriptive Test Names**: Use clear, descriptive test names that explain the expected behavior
7. **Wait Strategies**: Use explicit waits instead of hard-coded delays
8. **Data-driven Testing**: Parameterize tests for different data sets and scenarios

## 🔧 Troubleshooting

### Common Issues

1. **BrowserStack Authentication Errors**
   ```bash
   # Verify credentials
   echo $BROWSERSTACK_USERNAME
   echo $BROWSERSTACK_ACCESS_KEY
   ```

2. **Local Testing Issues**
   - Ensure `browserstackLocal: true` is set in `browserstack.yml`
   - Check firewall settings for local tunnel

3. **Test Failures**
   ```bash
   # Run with debug mode
   npx playwright test --debug
   
   # Generate trace for failed tests
   npx playwright test --trace on
   ```

4. **Dependency Issues**
   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📊 Monitoring and Reporting

### BrowserStack Features Enabled:
- **Test Observability**: Intelligent test reporting
- **Console Logs**: Error-level logging
- **Network Logs**: Disabled (can be enabled)
- **Screenshots**: Available for debugging

### Local Reporting:
- HTML reports generated after test execution
- Trace viewer for detailed debugging
- Console output with test results

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-test`)
3. Commit your changes (`git commit -am 'Add new test suite'`)
4. Push to the branch (`git push origin feature/new-test`)
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🔗 Useful Links

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [BrowserStack Automate Documentation](https://www.browserstack.com/docs/automate)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [BrowserStack Node SDK](https://github.com/browserstack/browserstack-node-sdk)

## 📞 Support

- **BrowserStack Support**: [Contact BrowserStack](https://www.browserstack.com/contact)
- **Playwright Community**: [Discord](https://discord.gg/playwright) | [GitHub Discussions](https://github.com/microsoft/playwright/discussions)
- **Project Issues**: [GitHub Issues](https://github.com/AutomationSangam/BS-Testathon/issues)

---

**Happy Testing! 🎭**