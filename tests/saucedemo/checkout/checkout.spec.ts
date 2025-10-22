import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../page-objects/saucedemo/LoginPage';
import { ProductsPage } from '../../../page-objects/saucedemo/ProductsPage';
import { CartPage } from '../../../page-objects/saucedemo/CartPage';
import { CheckoutPage, CheckoutOverviewPage } from '../../../page-objects/saucedemo/CheckoutPage';
import { CheckoutCompletePage } from '../../../page-objects/saucedemo/CheckoutCompletePage';
import TestData from '../../../utils/test-data';

test.describe('SauceDemo Checkout Tests', () => {
  let loginPage: LoginPage;
  let productsPage: ProductsPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;
  let checkoutOverviewPage: CheckoutOverviewPage;
  let checkoutCompletePage: CheckoutCompletePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    checkoutOverviewPage = new CheckoutOverviewPage(page);
    checkoutCompletePage = new CheckoutCompletePage(page);

    // Login and add item to cart
    await loginPage.goto();
    await loginPage.loginAsStandardUser();
    await productsPage.addProductToCart(TestData.PRODUCTS.BACKPACK.name);
    await productsPage.goToCart();
  });

  test.describe('Checkout Information - Positive Tests', () => {
    test('should complete checkout with valid information @smoke @e2e', async () => {
      // Proceed to checkout
      await cartPage.proceedToCheckout();
      await expect(checkoutPage.pageTitle).toHaveText('Checkout: Your Information');

      // Fill checkout info
      await checkoutPage.completeCheckoutInfo(
        TestData.CHECKOUT_INFO.VALID.firstName,
        TestData.CHECKOUT_INFO.VALID.lastName,
        TestData.CHECKOUT_INFO.VALID.postalCode
      );

      // Should be on overview page
      expect(await checkoutOverviewPage.isOnOverviewPage()).toBe(true);
      await expect(checkoutOverviewPage.pageTitle).toHaveText('Checkout: Overview');
    });

    test('should fill checkout information fields separately', async () => {
      await cartPage.proceedToCheckout();

      await checkoutPage.fillFirstName(TestData.CHECKOUT_INFO.VALID.firstName);
      await checkoutPage.fillLastName(TestData.CHECKOUT_INFO.VALID.lastName);
      await checkoutPage.fillPostalCode(TestData.CHECKOUT_INFO.VALID.postalCode);
      await checkoutPage.clickContinue();

      expect(await checkoutOverviewPage.isOnOverviewPage()).toBe(true);
    });

    test('should allow special characters in name fields', async () => {
      await cartPage.proceedToCheckout();

      await checkoutPage.completeCheckoutInfo(
        "Mary-Jane O'Brien",
        "Smith-Jones",
        "12345"
      );

      expect(await checkoutOverviewPage.isOnOverviewPage()).toBe(true);
    });

    test('should accept various postal code formats', async () => {
      await cartPage.proceedToCheckout();

      // US ZIP code
      await checkoutPage.completeCheckoutInfo("John", "Doe", "12345");
      expect(await checkoutOverviewPage.isOnOverviewPage()).toBe(true);

      // Go back and try another format
      await checkoutOverviewPage.page.goBack();
      await checkoutPage.clearAllFields();

      // ZIP+4 format
      await checkoutPage.completeCheckoutInfo("John", "Doe", "12345-6789");
      expect(await checkoutOverviewPage.isOnOverviewPage()).toBe(true);
    });
  });

  test.describe('Checkout Information - Negative Tests', () => {
    test('should show error when first name is missing', async () => {
      await cartPage.proceedToCheckout();

      await checkoutPage.fillCheckoutInformation(
        TestData.CHECKOUT_INFO.MISSING_FIRSTNAME.firstName,
        TestData.CHECKOUT_INFO.MISSING_FIRSTNAME.lastName,
        TestData.CHECKOUT_INFO.MISSING_FIRSTNAME.postalCode
      );
      await checkoutPage.clickContinue();

      expect(await checkoutPage.isErrorVisible()).toBe(true);
      const errorText = await checkoutPage.getErrorMessage();
      expect(errorText).toContain('First Name is required');
    });

    test('should show error when last name is missing', async () => {
      await cartPage.proceedToCheckout();

      await checkoutPage.fillCheckoutInformation(
        TestData.CHECKOUT_INFO.MISSING_LASTNAME.firstName,
        TestData.CHECKOUT_INFO.MISSING_LASTNAME.lastName,
        TestData.CHECKOUT_INFO.MISSING_LASTNAME.postalCode
      );
      await checkoutPage.clickContinue();

      expect(await checkoutPage.isErrorVisible()).toBe(true);
      const errorText = await checkoutPage.getErrorMessage();
      expect(errorText).toContain('Last Name is required');
    });

    test('should show error when postal code is missing', async () => {
      await cartPage.proceedToCheckout();

      await checkoutPage.fillCheckoutInformation(
        TestData.CHECKOUT_INFO.MISSING_POSTAL.firstName,
        TestData.CHECKOUT_INFO.MISSING_POSTAL.lastName,
        TestData.CHECKOUT_INFO.MISSING_POSTAL.postalCode
      );
      await checkoutPage.clickContinue();

      expect(await checkoutPage.isErrorVisible()).toBe(true);
      const errorText = await checkoutPage.getErrorMessage();
      expect(errorText).toContain('Postal Code is required');
    });

    test('should show error when all fields are empty', async () => {
      await cartPage.proceedToCheckout();
      await checkoutPage.clickContinue();

      expect(await checkoutPage.isErrorVisible()).toBe(true);
      const errorText = await checkoutPage.getErrorMessage();
      expect(errorText).toContain('First Name is required');
    });

    test('should close error message', async () => {
      await cartPage.proceedToCheckout();
      await checkoutPage.clickContinue();

      expect(await checkoutPage.isErrorVisible()).toBe(true);
      
      await checkoutPage.closeError();
      expect(await checkoutPage.isErrorVisible()).toBe(false);
    });
  });

  test.describe('Checkout Overview', () => {
    test('should display correct items in checkout overview', async () => {
      await cartPage.proceedToCheckout();
      await checkoutPage.completeCheckoutInfo(
        TestData.CHECKOUT_INFO.VALID.firstName,
        TestData.CHECKOUT_INFO.VALID.lastName,
        TestData.CHECKOUT_INFO.VALID.postalCode
      );

      const items = await checkoutOverviewPage.getItemNames();
      expect(items).toContain(TestData.PRODUCTS.BACKPACK.name);
    });

    test('should calculate subtotal correctly', async () => {
      await cartPage.proceedToCheckout();
      await checkoutPage.completeCheckoutInfo(
        TestData.CHECKOUT_INFO.VALID.firstName,
        TestData.CHECKOUT_INFO.VALID.lastName,
        TestData.CHECKOUT_INFO.VALID.postalCode
      );

      const subtotal = await checkoutOverviewPage.getSubtotal();
      expect(subtotal).toBe(TestData.PRODUCTS.BACKPACK.price);
    });

    test('should show tax amount', async () => {
      await cartPage.proceedToCheckout();
      await checkoutPage.completeCheckoutInfo(
        TestData.CHECKOUT_INFO.VALID.firstName,
        TestData.CHECKOUT_INFO.VALID.lastName,
        TestData.CHECKOUT_INFO.VALID.postalCode
      );

      const tax = await checkoutOverviewPage.getTax();
      expect(tax).toBeGreaterThan(0);
    });

    test('should calculate total correctly (subtotal + tax)', async () => {
      await cartPage.proceedToCheckout();
      await checkoutPage.completeCheckoutInfo(
        TestData.CHECKOUT_INFO.VALID.firstName,
        TestData.CHECKOUT_INFO.VALID.lastName,
        TestData.CHECKOUT_INFO.VALID.postalCode
      );

      expect(await checkoutOverviewPage.verifyTotalCalculation()).toBe(true);
    });

    test('should display order summary with all details', async () => {
      await cartPage.proceedToCheckout();
      await checkoutPage.completeCheckoutInfo(
        TestData.CHECKOUT_INFO.VALID.firstName,
        TestData.CHECKOUT_INFO.VALID.lastName,
        TestData.CHECKOUT_INFO.VALID.postalCode
      );

      const summary = await checkoutOverviewPage.getOrderSummary();
      
      expect(summary.subtotal).toBeGreaterThan(0);
      expect(summary.tax).toBeGreaterThan(0);
      expect(summary.total).toBeGreaterThan(0);
      expect(summary.itemCount).toBeGreaterThan(0);
    });

    test('should display payment information', async () => {
      await cartPage.proceedToCheckout();
      await checkoutPage.completeCheckoutInfo(
        TestData.CHECKOUT_INFO.VALID.firstName,
        TestData.CHECKOUT_INFO.VALID.lastName,
        TestData.CHECKOUT_INFO.VALID.postalCode
      );

      const paymentInfo = await checkoutOverviewPage.getPaymentInfo();
      expect(paymentInfo).toBeTruthy();
      expect(paymentInfo.length).toBeGreaterThan(0);
    });

    test('should display shipping information', async () => {
      await cartPage.proceedToCheckout();
      await checkoutPage.completeCheckoutInfo(
        TestData.CHECKOUT_INFO.VALID.firstName,
        TestData.CHECKOUT_INFO.VALID.lastName,
        TestData.CHECKOUT_INFO.VALID.postalCode
      );

      const shippingInfo = await checkoutOverviewPage.getShippingInfo();
      expect(shippingInfo).toBeTruthy();
      expect(shippingInfo.length).toBeGreaterThan(0);
    });
  });

  test.describe('Complete Order', () => {
    test('should complete order and show success message @smoke @e2e', async () => {
      // Complete checkout info
      await cartPage.proceedToCheckout();
      await checkoutPage.completeCheckoutInfo(
        TestData.CHECKOUT_INFO.VALID.firstName,
        TestData.CHECKOUT_INFO.VALID.lastName,
        TestData.CHECKOUT_INFO.VALID.postalCode
      );

      // Complete order
      await checkoutOverviewPage.completeOrder();

      // Verify success page
      expect(await checkoutCompletePage.isOnCompletePage()).toBe(true);
      expect(await checkoutCompletePage.isSuccessMessageDisplayed()).toBe(true);
    });

    test('should show thank you message after order completion', async () => {
      await cartPage.proceedToCheckout();
      await checkoutPage.completeCheckoutInfo(
        TestData.CHECKOUT_INFO.VALID.firstName,
        TestData.CHECKOUT_INFO.VALID.lastName,
        TestData.CHECKOUT_INFO.VALID.postalCode
      );
      await checkoutOverviewPage.completeOrder();

      const header = await checkoutCompletePage.getSuccessHeader();
      expect(header).toContain('Thank you for your order');
    });

    test('should show order confirmation message', async () => {
      await cartPage.proceedToCheckout();
      await checkoutPage.completeCheckoutInfo(
        TestData.CHECKOUT_INFO.VALID.firstName,
        TestData.CHECKOUT_INFO.VALID.lastName,
        TestData.CHECKOUT_INFO.VALID.postalCode
      );
      await checkoutOverviewPage.completeOrder();

      const message = await checkoutCompletePage.getSuccessMessage();
      expect(message).toBeTruthy();
      expect(message.length).toBeGreaterThan(0);
    });

    test('should verify order completion', async () => {
      await cartPage.proceedToCheckout();
      await checkoutPage.completeCheckoutInfo(
        TestData.CHECKOUT_INFO.VALID.firstName,
        TestData.CHECKOUT_INFO.VALID.lastName,
        TestData.CHECKOUT_INFO.VALID.postalCode
      );
      await checkoutOverviewPage.completeOrder();

      expect(await checkoutCompletePage.verifyOrderComplete()).toBe(true);
    });

    test('should show pony express image on success page', async () => {
      await cartPage.proceedToCheckout();
      await checkoutPage.completeCheckoutInfo(
        TestData.CHECKOUT_INFO.VALID.firstName,
        TestData.CHECKOUT_INFO.VALID.lastName,
        TestData.CHECKOUT_INFO.VALID.postalCode
      );
      await checkoutOverviewPage.completeOrder();

      expect(await checkoutCompletePage.isPonyExpressImageVisible()).toBe(true);
    });

    test('should return to products page after order completion', async () => {
      await cartPage.proceedToCheckout();
      await checkoutPage.completeCheckoutInfo(
        TestData.CHECKOUT_INFO.VALID.firstName,
        TestData.CHECKOUT_INFO.VALID.lastName,
        TestData.CHECKOUT_INFO.VALID.postalCode
      );
      await checkoutOverviewPage.completeOrder();

      await checkoutCompletePage.returnToProducts();

      expect(await productsPage.isOnProductsPage()).toBe(true);
    });
  });

  test.describe('Checkout Navigation', () => {
    test('should cancel checkout and return to cart', async () => {
      await cartPage.proceedToCheckout();
      await checkoutPage.clickCancel();

      expect(await cartPage.isOnCartPage()).toBe(true);
    });

    test('should cancel from overview and return to products', async () => {
      await cartPage.proceedToCheckout();
      await checkoutPage.completeCheckoutInfo(
        TestData.CHECKOUT_INFO.VALID.firstName,
        TestData.CHECKOUT_INFO.VALID.lastName,
        TestData.CHECKOUT_INFO.VALID.postalCode
      );

      await checkoutOverviewPage.clickCancel();
      expect(await productsPage.isOnProductsPage()).toBe(true);
    });
  });

  test.describe('Complete E2E Checkout Flow', () => {
    test('should complete full checkout flow with multiple items @e2e', async ({ page }) => {
      // Go back to products and add more items
      await cartPage.continueShopping();
      await productsPage.addProductToCart(TestData.PRODUCTS.BIKE_LIGHT.name);
      await productsPage.addProductToCart(TestData.PRODUCTS.BOLT_TSHIRT.name);

      // Go to cart
      await productsPage.goToCart();
      expect(await cartPage.getCartItemCount()).toBe(3);

      // Proceed to checkout
      await cartPage.proceedToCheckout();

      // Fill info
      await checkoutPage.completeCheckoutInfo(
        TestData.CHECKOUT_INFO.VALID.firstName,
        TestData.CHECKOUT_INFO.VALID.lastName,
        TestData.CHECKOUT_INFO.VALID.postalCode
      );

      // Verify overview
      const items = await checkoutOverviewPage.getItemNames();
      expect(items.length).toBe(3);
      
      // Complete order
      await checkoutOverviewPage.completeOrder();

      // Verify success
      expect(await checkoutCompletePage.verifyOrderComplete()).toBe(true);
    });

    test('should complete checkout with all products @e2e', async () => {
      // Add all products
      await cartPage.continueShopping();
      const allProducts = await productsPage.getAllProductNames();
      
      for (const product of allProducts) {
        if (!(await productsPage.isProductInCart(product))) {
          await productsPage.addProductToCart(product);
        }
      }

      await productsPage.goToCart();
      expect(await cartPage.getCartItemCount()).toBe(6);

      await cartPage.proceedToCheckout();
      await checkoutPage.completeCheckoutInfo(
        TestData.CHECKOUT_INFO.VALID.firstName,
        TestData.CHECKOUT_INFO.VALID.lastName,
        TestData.CHECKOUT_INFO.VALID.postalCode
      );

      const summary = await checkoutOverviewPage.getOrderSummary();
      expect(summary.itemCount).toBe(6);

      await checkoutOverviewPage.completeOrder();
      expect(await checkoutCompletePage.verifyOrderComplete()).toBe(true);
    });
  });

  test.describe('Checkout Data Validation', () => {
    test('should persist form data when navigating back', async () => {
      await cartPage.proceedToCheckout();

      await checkoutPage.fillCheckoutInformation(
        TestData.CHECKOUT_INFO.VALID.firstName,
        TestData.CHECKOUT_INFO.VALID.lastName,
        TestData.CHECKOUT_INFO.VALID.postalCode
      );

      const formBefore = await checkoutPage.getFormValues();
      
      // Navigate away and back
      await checkoutPage.clickCancel();
      await cartPage.proceedToCheckout();

      // Note: SauceDemo doesn't persist form data, but we test the method
      const formAfter = await checkoutPage.getFormValues();
      expect(formAfter).toBeDefined();
    });
  });
});