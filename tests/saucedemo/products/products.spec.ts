import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../page-objects/saucedemo/LoginPage';
import { ProductsPage } from '../../../page-objects/saucedemo/ProductsPage';
import TestData from '../../../utils/test-data';

test.describe('SauceDemo Products Tests', () => {
  let loginPage: LoginPage;
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);

    // Login before each test
    await loginPage.goto();
    await loginPage.loginAsStandardUser();
    await expect(productsPage.pageTitle).toBeVisible();
  });

  test.describe('Product Display', () => {
    test('should display all products on products page @smoke', async () => {
      const productCount = await productsPage.getProductCount();
      expect(productCount).toBeGreaterThan(0);
      expect(productCount).toBe(6); // SauceDemo has 6 products
    });

    test('should display product page title', async () => {
      const title = await productsPage.getPageTitle();
      expect(title).toBe('Products');
    });

    test('should display all product names', async () => {
      const productNames = await productsPage.getAllProductNames();
      
      expect(productNames.length).toBe(6);
      expect(productNames).toContain(TestData.PRODUCTS.BACKPACK.name);
      expect(productNames).toContain(TestData.PRODUCTS.BIKE_LIGHT.name);
      expect(productNames).toContain(TestData.PRODUCTS.BOLT_TSHIRT.name);
    });

    test('should display all product prices', async () => {
      const prices = await productsPage.getAllProductPrices();
      
      expect(prices.length).toBe(6);
      
      // All prices should be positive numbers
      prices.forEach(price => {
        expect(price).toBeGreaterThan(0);
      });
    });

    test('should display product details', async () => {
      const productDetails = await productsPage.getProductDetails(TestData.PRODUCTS.BACKPACK.name);
      
      expect(productDetails.name).toBe(TestData.PRODUCTS.BACKPACK.name);
      expect(productDetails.price).toBe(TestData.PRODUCTS.BACKPACK.price);
      expect(productDetails.description).toBeTruthy();
      expect(productDetails.description.length).toBeGreaterThan(0);
    });
  });

  test.describe('Product Sorting', () => {
    test('should sort products A to Z by default @smoke', async () => {
      const isDefaultSorted = await productsPage.areProductsSortedAtoZ();
      expect(isDefaultSorted).toBe(true);
    });

    test('should sort products A to Z', async () => {
      await productsPage.sortBy('az');
      
      const isSorted = await productsPage.areProductsSortedAtoZ();
      expect(isSorted).toBe(true);
    });

    test('should sort products Z to A', async () => {
      await productsPage.sortBy('za');
      
      const isSorted = await productsPage.areProductsSortedZtoA();
      expect(isSorted).toBe(true);
    });

    test('should sort products by price low to high', async () => {
      await productsPage.sortBy('lohi');
      
      const isSorted = await productsPage.areProductsSortedLowToHigh();
      expect(isSorted).toBe(true);
    });

    test('should sort products by price high to low', async () => {
      await productsPage.sortBy('hilo');
      
      const isSorted = await productsPage.areProductsSortedHighToLow();
      expect(isSorted).toBe(true);
    });
  });

  test.describe('Add Products to Cart', () => {
    test('should add product to cart and change button to Remove', async () => {
      const productName = TestData.PRODUCTS.BACKPACK.name;
      
      // Initially not in cart
      expect(await productsPage.isProductInCart(productName)).toBe(false);

      // Add to cart
      await productsPage.addProductToCart(productName);

      // Button should now show Remove
      expect(await productsPage.isProductInCart(productName)).toBe(true);
    });

    test('should update cart badge when adding products', async () => {
      // Initially 0
      expect(await productsPage.getCartItemCount()).toBe(0);

      // Add 1 product
      await productsPage.addProductToCart(TestData.PRODUCTS.BACKPACK.name);
      expect(await productsPage.getCartItemCount()).toBe(1);

      // Add another
      await productsPage.addProductToCart(TestData.PRODUCTS.BIKE_LIGHT.name);
      expect(await productsPage.getCartItemCount()).toBe(2);

      // Add one more
      await productsPage.addProductToCart(TestData.PRODUCTS.ONESIE.name);
      expect(await productsPage.getCartItemCount()).toBe(3);
    });

    test('should add product by index', async () => {
      await productsPage.addProductToCartByIndex(0);
      expect(await productsPage.getCartItemCount()).toBe(1);
    });

    test('should add multiple products at once', async () => {
      const products = [
        TestData.PRODUCTS.BACKPACK.name,
        TestData.PRODUCTS.BIKE_LIGHT.name,
        TestData.PRODUCTS.BOLT_TSHIRT.name
      ];

      await productsPage.addMultipleProducts(products);
      expect(await productsPage.getCartItemCount()).toBe(3);

      // Verify all are in cart
      for (const product of products) {
        expect(await productsPage.isProductInCart(product)).toBe(true);
      }
    });
  });

  test.describe('Remove Products from Cart', () => {
    test('should remove product from cart and change button to Add', async () => {
      const productName = TestData.PRODUCTS.BACKPACK.name;
      
      // Add to cart
      await productsPage.addProductToCart(productName);
      expect(await productsPage.isProductInCart(productName)).toBe(true);

      // Remove from cart
      await productsPage.removeProductFromCart(productName);
      expect(await productsPage.isProductInCart(productName)).toBe(false);
    });

    test('should update cart badge when removing products', async () => {
      // Add 3 products
      await productsPage.addProductToCart(TestData.PRODUCTS.BACKPACK.name);
      await productsPage.addProductToCart(TestData.PRODUCTS.BIKE_LIGHT.name);
      await productsPage.addProductToCart(TestData.PRODUCTS.ONESIE.name);
      expect(await productsPage.getCartItemCount()).toBe(3);

      // Remove 1
      await productsPage.removeProductFromCart(TestData.PRODUCTS.BACKPACK.name);
      expect(await productsPage.getCartItemCount()).toBe(2);

      // Remove another
      await productsPage.removeProductFromCart(TestData.PRODUCTS.BIKE_LIGHT.name);
      expect(await productsPage.getCartItemCount()).toBe(1);

      // Remove last one
      await productsPage.removeProductFromCart(TestData.PRODUCTS.ONESIE.name);
      expect(await productsPage.getCartItemCount()).toBe(0);
    });
  });

  test.describe('Product Navigation', () => {
    test('should navigate to product detail page', async () => {
      const productName = await productsPage.getFirstProductName();
      await productsPage.clickProductName(productName);

      // Should be on product detail page
      const url = productsPage.page.url();
      expect(url).toContain('inventory-item.html');
    });

    test('should navigate to cart page', async () => {
      await productsPage.goToCart();

      const url = productsPage.page.url();
      expect(url).toContain('cart.html');
    });
  });

  test.describe('Product Information', () => {
    test('should display product name for each item', async () => {
      const names = await productsPage.getAllProductNames();
      
      names.forEach(name => {
        expect(name).toBeTruthy();
        expect(name.length).toBeGreaterThan(0);
      });
    });

    test('should display product price for each item', async () => {
      const prices = await productsPage.getAllProductPrices();
      
      prices.forEach(price => {
        expect(price).toBeGreaterThan(0);
        expect(price).toBeLessThan(100); // All SauceDemo products under $100
      });
    });

    test('should get correct product details', async () => {
      const details = await productsPage.getProductDetails(TestData.PRODUCTS.BACKPACK.name);
      
      expect(details.name).toBe(TestData.PRODUCTS.BACKPACK.name);
      expect(details.price).toBe(TestData.PRODUCTS.BACKPACK.price);
      expect(details.description).toContain('carry.allTheThings()');
    });
  });

  test.describe('User Menu', () => {
    test('should logout successfully', async () => {
      await productsPage.logout();

      // Should be back on login page
      expect(await loginPage.isOnLoginPage()).toBe(true);
    });
  });

  test.describe('Cart Badge Visibility', () => {
    test('should not show cart badge when cart is empty', async () => {
      const count = await productsPage.getCartItemCount();
      expect(count).toBe(0);
    });

    test('should show cart badge when items in cart', async () => {
      await productsPage.addProductToCart(TestData.PRODUCTS.BACKPACK.name);
      
      const count = await productsPage.getCartItemCount();
      expect(count).toBeGreaterThan(0);
    });
  });
});