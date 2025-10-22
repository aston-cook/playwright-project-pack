# 🎭 Playwright Project Pack

> Complete test automation framework with real working examples for SauceDemo, TodoMVC, and API testing

[![Playwright Tests](https://github.com/aston-cook/playwright-project-pack/actions/workflows/playwright.yml/badge.svg)](https://github.com/aston-cook/playwright-project-pack/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.40-green.svg)](https://playwright.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Quick Start
```bash
# Clone the repository
git clone https://github.com/aston-cook/playwright-project-pack.git
cd playwright-project-pack

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Copy environment file
cp .env.example .env

# Run tests
npm test
```

## 📊 Test Coverage

- ✅ **88 Test Cases** across 3 browsers (264 total test runs)
- ✅ **Login/Authentication** - ~15 tests
- ✅ **Product Browsing & Sorting** - ~25 tests
- ✅ **Shopping Cart Management** - ~20 tests
- ✅ **Checkout Flow** - ~28 tests
- ✅ **100% Pass Rate** - 264/264 passing
- ✅ **Cross-Browser** - Chromium, Firefox, WebKit
- ✅ **CI/CD** - Automated testing on every push

## ✨ What's Included

- ✅ Complete SauceDemo test suite (login, products, cart, checkout)
- ✅ TodoMVC CRUD operations
- ✅ API testing examples (JSONPlaceholder, FakeStore API)
- ✅ Page Object Model architecture
- ✅ TypeScript configuration
- ✅ CI/CD with GitHub Actions
- ✅ Professional reporting

## 🎯 Test Organization
```
tests/
├── saucedemo/
│   ├── auth/
│   │   └── login.spec.ts (~15 tests)
│   ├── products/
│   │   └── products.spec.ts (~25 tests)
│   ├── cart/
│   │   └── cart.spec.ts (~20 tests)
│   └── checkout/
│       └── checkout.spec.ts (~28 tests)
```

### Test Execution
- **Per Browser:** 88 tests
- **Total Execution:** 264 tests (88 × 3 browsers)
- **Pass Rate:** 100% (264/264)
- **Browsers:** Chromium, Firefox, WebKit

## 📚 Documentation

Full documentation for each module available in the repository.

## 🛠️ Tech Stack

- Playwright
- TypeScript
- Node.js
- GitHub Actions

## 📝 License

MIT

## 👤 Author

**Aston Cook**
- GitHub: [@aston-cook](https://github.com/aston-cook)

---

⭐ If you find this project helpful, please give it a star!