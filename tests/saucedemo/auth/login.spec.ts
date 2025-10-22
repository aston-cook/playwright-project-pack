import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../page-objects/saucedemo/LoginPage';
import { ProductsPage } from '../../../page-objects/saucedemo/ProductsPage';
import TestData from '../../../utils/test-data';

test.describe('SauceDemo Login Tests', () => {
  let loginPage: LoginPage;
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    await loginPage.goto();
  });

  test.describe('Positive Login Tests', () => {
    test('should login successfully with valid standard user credentials @smoke', async () => {
      await loginPage.login(
        TestData.USERS.STANDARD.username,
        TestData.USERS.STANDARD.password
      );

      await expect(productsPage.pageTitle).toBeVisible();
      await expect(productsPage.pageTitle).toHaveText('Products');
      expect(await productsPage.isOnProductsPage()).toBe(true);
    });

    test('should login successfully with performance glitch user', async () => {
      await loginPage.login(
        TestData.USERS.PERFORMANCE.username,
        TestData.USERS.PERFORMANCE.password
      );

      await expect(productsPage.pageTitle).toBeVisible();
      expect(await productsPage.isOnProductsPage()).toBe(true);
    });

    test('should login successfully with problem user', async () => {
      await loginPage.login(
        TestData.USERS.PROBLEM.username,
        TestData.USERS.PROBLEM.password
      );

      await expect(productsPage.pageTitle).toBeVisible();
      expect(await productsPage.isOnProductsPage()).toBe(true);
    });
  });

  test.describe('Negative Login Tests', () => {
    test('should show error for locked out user @smoke', async () => {
      await loginPage.login(
        TestData.USERS.LOCKED.username,
        TestData.USERS.LOCKED.password
      );

      await expect(loginPage.errorMessage).toBeVisible();
      const errorText = await loginPage.getErrorMessage();
      expect(errorText).toContain('Sorry, this user has been locked out');
    });

    test('should show error for invalid username', async () => {
      await loginPage.login(
        TestData.INVALID_USERS.WRONG_USERNAME.username,
        TestData.INVALID_USERS.WRONG_USERNAME.password
      );

      await expect(loginPage.errorMessage).toBeVisible();
      const errorText = await loginPage.getErrorMessage();
      expect(errorText).toContain('Username and password do not match');
    });

    test('should show error for invalid password', async () => {
      await loginPage.login(
        TestData.INVALID_USERS.WRONG_PASSWORD.username,
        TestData.INVALID_USERS.WRONG_PASSWORD.password
      );

      await expect(loginPage.errorMessage).toBeVisible();
      const errorText = await loginPage.getErrorMessage();
      expect(errorText).toContain('Username and password do not match');
    });

    test('should show error for empty username', async () => {
      await loginPage.login(
        TestData.INVALID_USERS.EMPTY_USERNAME.username,
        TestData.INVALID_USERS.EMPTY_USERNAME.password
      );

      await expect(loginPage.errorMessage).toBeVisible();
      const errorText = await loginPage.getErrorMessage();
      expect(errorText).toContain('Username is required');
    });

    test('should show error for empty password', async () => {
      await loginPage.login(
        TestData.INVALID_USERS.EMPTY_PASSWORD.username,
        TestData.INVALID_USERS.EMPTY_PASSWORD.password
      );

      await expect(loginPage.errorMessage).toBeVisible();
      const errorText = await loginPage.getErrorMessage();
      expect(errorText).toContain('Password is required');
    });

    test('should show error for both fields empty', async () => {
      await loginPage.login(
        TestData.INVALID_USERS.BOTH_EMPTY.username,
        TestData.INVALID_USERS.BOTH_EMPTY.password
      );

      await expect(loginPage.errorMessage).toBeVisible();
      const errorText = await loginPage.getErrorMessage();
      expect(errorText).toContain('Username is required');
    });
  });

  test.describe('Login Page UI Tests', () => {
    test('should display all login page elements', async () => {
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
      expect(await loginPage.isLoginButtonEnabled()).toBe(true);
    });

    test('should be able to close error message', async () => {
      await loginPage.login('invalid', 'invalid');
      await expect(loginPage.errorMessage).toBeVisible();
      
      await loginPage.closeErrorMessage();
      await expect(loginPage.errorMessage).not.toBeVisible();
    });

    test('should clear input fields', async () => {
      await loginPage.fillUsername('testuser');
      await loginPage.fillPassword('testpass');
      
      expect(await loginPage.getUsernameValue()).toBe('testuser');
      expect(await loginPage.getPasswordValue()).toBe('testpass');
      
      await loginPage.clearUsername();
      await loginPage.clearPassword();
      
      expect(await loginPage.getUsernameValue()).toBe('');
      expect(await loginPage.getPasswordValue()).toBe('');
    });
  });

  test.describe('Login Flow Tests', () => {
    test('should successfully complete login and logout flow @e2e', async ({ page }) => {
      // Login
      await loginPage.loginAsStandardUser();
      await expect(productsPage.pageTitle).toBeVisible();
      
      // Logout
      await productsPage.logout();
      expect(await loginPage.isOnLoginPage()).toBe(true);
    });

    test('should redirect to products page after successful login', async () => {
      await loginPage.loginAsStandardUser();
      
      const url = await loginPage.page.url();
      expect(url).toContain('inventory.html');
      await expect(productsPage.pageTitle).toHaveText('Products');
    });
  });
});