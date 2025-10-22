import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../page-objects/saucedemo/LoginPage';
import { ProductsPage } from '../../../page-objects/saucedemo/ProductsPage';
import { CartPage } from '../../../page-objects/saucedemo/CartPage';
import TestData from '../../../utils/test-data';

test.describe('SauceDemo Cart Tests', () => {
  let loginPage: LoginPage;
  let productsPage: ProductsPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);

    // Login before each test
    await loginPage.goto();
    await loginPage.loginAsStandardUser();
    await expect(productsPage.pageTitle).toBeVisible();
  });

  test.describe('Add Items to Cart', () => {
    test('should add single item to cart @smoke', async () => {
      // Add item to cart
      await productsPage.addProductToCart(TestData.PRODUCTS.BACKPACK.name);

      // Verify cart badge shows 1
      const cartCount = await productsPage.getCartItemCount();
      expect(cartCount).toBe(1);

      // Go to cart
      await productsPage.goToCart();
      await expect(cartPage.pageTitle).toHaveText('Your Cart');

      // Verify item is in cart
      const itemsInCart = await cartPage.getCartItemNames();
      expect(itemsInCart).toContain(TestData.PRODUCTS.BACKPACK.name);
    });

    test('should add multiple items to cart', async () => {
      // Add multiple items
      await productsPage.addProductToCart(TestData.PRODUCTS.BACKPACK.name);
      await productsPage.addProductToCart(TestData.PRODUCTS.BIKE_LIGHT.name);
      await productsPage.addProductToCart(TestData.PRODUCTS.BOLT_TSHIRT.name);

      // Verify cart badge shows 3
      const cartCount = await productsPage.getCartItemCount();
      expect(cartCount).toBe(3);

      // Go to cart and verify
      await productsPage.goToCart();
      
      const itemsInCart = await cartPage.getCartItemNames();
      expect(itemsInCart).toHaveLength(3);
      expect(itemsInCart).toContain(TestData.PRODUCTS.BACKPACK.name);
      expect(itemsInCart).toContain(TestData.PRODUCTS.BIKE_LIGHT.name);
      expect(itemsInCart).toContain(TestData.PRODUCTS.BOLT_TSHIRT.name);
    });

    test('should add all items to cart', async () => {
      // Get all product names
      const allProducts = await productsPage.getAllProductNames();
      
      // Add all products
      for (const product of allProducts) {
        await productsPage.addProductToCart(product);
      }

      // Verify cart count
      const cartCount = await productsPage.getCartItemCount();
      expect(cartCount).toBe(allProducts.length);

      // Verify in cart page
      await productsPage.goToCart();
      const cartItemCount = await cartPage.getCartItemCount();
      expect(cartItemCount).toBe(allProducts.length);
    });
  });

  test.describe('Remove Items from Cart', () => {
    test('should remove item from cart on products page', async () => {
      // Add item
      await productsPage.addProductToCart(TestData.PRODUCTS.BACKPACK.name);
      expect(await productsPage.getCartItemCount()).toBe(1);

      // Remove item
      await productsPage.removeProductFromCart(TestData.PRODUCTS.BACKPACK.name);
      
      // Verify cart is empty
      const cartCount = await productsPage.getCartItemCount();
      expect(cartCount).toBe(0);
    });

    test('should remove item from cart page', async () => {
      // Add item and go to cart
      await productsPage.addProductToCart(TestData.PRODUCTS.BACKPACK.name);
      await productsPage.goToCart();

      // Remove item
      await cartPage.removeItemByName(TestData.PRODUCTS.BACKPACK.name);

      // Verify cart is empty
      expect(await cartPage.isCartEmpty()).toBe(true);
    });

    test('should remove multiple items from cart', async () => {
      // Add multiple items
      await productsPage.addProductToCart(TestData.PRODUCTS.BACKPACK.name);
      await productsPage.addProductToCart(TestData.PRODUCTS.BIKE_LIGHT.name);
      await productsPage.addProductToCart(TestData.PRODUCTS.ONESIE.name);
      
      await productsPage.goToCart();
      expect(await cartPage.getCartItemCount()).toBe(3);

      // Remove items one by one
      await cartPage.removeItemByName(TestData.PRODUCTS.BACKPACK.name);
      expect(await cartPage.getCartItemCount()).toBe(2);

      await cartPage.removeItemByName(TestData.PRODUCTS.BIKE_LIGHT.name);
      expect(await cartPage.getCartItemCount()).toBe(1);

      await cartPage.removeItemByName(TestData.PRODUCTS.ONESIE.name);
      expect(await cartPage.isCartEmpty()).toBe(true);
    });

    test('should remove all items from cart at once', async () => {
      // Add multiple items
      await productsPage.addMultipleProducts([
        TestData.PRODUCTS.BACKPACK.name,
        TestData.PRODUCTS.BIKE_LIGHT.name,
        TestData.PRODUCTS.BOLT_TSHIRT.name
      ]);

      await productsPage.goToCart();
      expect(await cartPage.getCartItemCount()).toBe(3);

      // Remove all items
      await cartPage.removeAllItems();

      // Verify cart is empty
      expect(await cartPage.isCartEmpty()).toBe(true);
    });
  });

  test.describe('Cart Navigation', () => {
    test('should navigate to cart from products page', async () => {
      await productsPage.goToCart();
      
      expect(await cartPage.isOnCartPage()).toBe(true);
      await expect(cartPage.pageTitle).toHaveText('Your Cart');
    });

    test('should continue shopping from cart', async () => {
      await productsPage.goToCart();
      await cartPage.continueShopping();

      expect(await productsPage.isOnProductsPage()).toBe(true);
    });

    test('should navigate back and forth between cart and products', async () => {
      // Go to cart
      await productsPage.goToCart();
      expect(await cartPage.isOnCartPage()).toBe(true);

      // Back to products
      await cartPage.continueShopping();
      expect(await productsPage.isOnProductsPage()).toBe(true);

      // Back to cart
      await productsPage.goToCart();
      expect(await cartPage.isOnCartPage()).toBe(true);
    });
  });

  test.describe('Cart Calculations', () => {
    test('should calculate correct cart total for single item', async () => {
      await productsPage.addProductToCart(TestData.PRODUCTS.BACKPACK.name);
      await productsPage.goToCart();

      const total = await cartPage.calculateCartTotal();
      expect(total).toBe(TestData.PRODUCTS.BACKPACK.price);
    });

    test('should calculate correct cart total for multiple items', async () => {
      // Add items
      await productsPage.addProductToCart(TestData.PRODUCTS.BACKPACK.name);
      await productsPage.addProductToCart(TestData.PRODUCTS.BIKE_LIGHT.name);
      
      await productsPage.goToCart();

      // Calculate expected total
      const expectedTotal = TestData.PRODUCTS.BACKPACK.price + TestData.PRODUCTS.BIKE_LIGHT.price;
      const actualTotal = await cartPage.calculateCartTotal();
      
      expect(actualTotal).toBeCloseTo(expectedTotal, 2);
    });

    test('should show correct item count in cart badge', async () => {
      // No items
      expect(await productsPage.getCartItemCount()).toBe(0);

      // Add 1 item
      await productsPage.addProductToCart(TestData.PRODUCTS.BACKPACK.name);
      expect(await productsPage.getCartItemCount()).toBe(1);

      // Add another item
      await productsPage.addProductToCart(TestData.PRODUCTS.BIKE_LIGHT.name);
      expect(await productsPage.getCartItemCount()).toBe(2);

      // Remove 1 item
      await productsPage.removeProductFromCart(TestData.PRODUCTS.BACKPACK.name);
      expect(await productsPage.getCartItemCount()).toBe(1);
    });
  });

  test.describe('Cart Item Details', () => {
    test('should display correct item details in cart', async ({ page }) => {
      await productsPage.addProductToCart(TestData.PRODUCTS.BACKPACK.name);
      await productsPage.goToCart();

      const itemDetails = await cartPage.getCartItemDetails(TestData.PRODUCTS.BACKPACK.name);

      expect(itemDetails.name).toBe(TestData.PRODUCTS.BACKPACK.name);
      expect(itemDetails.price).toBe(TestData.PRODUCTS.BACKPACK.price);
      expect(itemDetails.quantity).toBe(1);
    });

    test('should show product description in cart', async () => {
      await productsPage.addProductToCart(TestData.PRODUCTS.BACKPACK.name);
      await productsPage.goToCart();

      const description = await cartPage.getProductDescription(TestData.PRODUCTS.BACKPACK.name);
      expect(description).toBeTruthy();
      expect(description.length).toBeGreaterThan(0);
    });
  });

  test.describe('Empty Cart Scenarios', () => {
    test('should show empty cart when no items added', async () => {
      await productsPage.goToCart();
      
      expect(await cartPage.isCartEmpty()).toBe(true);
      expect(await cartPage.getCartItemCount()).toBe(0);
    });

    test('should show empty cart after removing all items', async () => {
      // Add items
      await productsPage.addProductToCart(TestData.PRODUCTS.BACKPACK.name);
      await productsPage.addProductToCart(TestData.PRODUCTS.BIKE_LIGHT.name);
      
      await productsPage.goToCart();

      // Remove all
      await cartPage.removeAllItems();

      expect(await cartPage.isCartEmpty()).toBe(true);
    });

    test('should allow proceeding to checkout with items', async () => {
      await productsPage.addProductToCart(TestData.PRODUCTS.BACKPACK.name);
      await productsPage.goToCart();

      expect(await cartPage.isCheckoutButtonEnabled()).toBe(true);
      
      // Note: We'll test actual checkout in checkout.spec.ts
    });
  });

  test.describe('Cart Persistence', () => {
    test('should maintain cart items when navigating between pages', async () => {
      // Add items
      await productsPage.addProductToCart(TestData.PRODUCTS.BACKPACK.name);
      await productsPage.addProductToCart(TestData.PRODUCTS.BIKE_LIGHT.name);

      // Go to cart
      await productsPage.goToCart();
      expect(await cartPage.getCartItemCount()).toBe(2);

      // Go back to products
      await cartPage.continueShopping();

      // Verify cart badge still shows 2
      expect(await productsPage.getCartItemCount()).toBe(2);

      // Go back to cart
      await productsPage.goToCart();
      expect(await cartPage.getCartItemCount()).toBe(2);
    });
  });

  test.describe('Cart Verification Methods', () => {
    test('should verify if product is in cart', async () => {
      await productsPage.addProductToCart(TestData.PRODUCTS.BACKPACK.name);
      await productsPage.goToCart();

      expect(await cartPage.isProductInCart(TestData.PRODUCTS.BACKPACK.name)).toBe(true);
      expect(await cartPage.isProductInCart(TestData.PRODUCTS.BIKE_LIGHT.name)).toBe(false);
    });

    test('should verify cart contains expected items', async () => {
      const expectedItems = [
        TestData.PRODUCTS.BACKPACK.name,
        TestData.PRODUCTS.BIKE_LIGHT.name
      ];

      await productsPage.addMultipleProducts(expectedItems);
      await productsPage.goToCart();

      expect(await cartPage.verifyCartContents(expectedItems)).toBe(true);
    });
  });
});