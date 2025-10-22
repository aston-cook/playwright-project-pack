import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Cart Page Object
 * Represents the shopping cart page
 */
export class CartPage extends BasePage {
  readonly pageTitle: Locator;
  readonly cartItems: Locator;
  readonly cartItemNames: Locator;
  readonly cartItemPrices: Locator;
  readonly cartItemQuantities: Locator;
  readonly removeButtons: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.title');
    this.cartItems = page.locator('.cart_item');
    this.cartItemNames = page.locator('.inventory_item_name');
    this.cartItemPrices = page.locator('.inventory_item_price');
    this.cartItemQuantities = page.locator('.cart_quantity');
    this.removeButtons = page.locator('button[id^="remove-"]');
    this.continueShoppingButton = page.locator('#continue-shopping');
    this.checkoutButton = page.locator('#checkout');
    this.cartBadge = page.locator('.shopping_cart_badge');
  }

  /**
   * Navigate to cart page
   */
  async goto() {
    await this.page.goto('/cart.html');
  }

  /**
   * Get page title text
   */
  async getPageTitle(): Promise<string> {
    return await this.pageTitle.textContent() || '';
  }

  /**
   * Check if on cart page
   */
  async isOnCartPage(): Promise<boolean> {
    const url = this.page.url();
    return url.includes('cart.html');
  }

  /**
   * Get number of items in cart
   */
  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * Get all product names in cart
   */
  async getCartItemNames(): Promise<string[]> {
    return await this.cartItemNames.allTextContents();
  }

  /**
   * Get all product prices in cart
   */
  async getCartItemPrices(): Promise<number[]> {
    const priceTexts = await this.cartItemPrices.allTextContents();
    return priceTexts.map(price => parseFloat(price.replace('$', '')));
  }

  /**
   * Get all quantities in cart
   */
  async getCartItemQuantities(): Promise<number[]> {
    const quantities = await this.cartItemQuantities.allTextContents();
    return quantities.map(qty => parseInt(qty));
  }

  /**
   * Calculate total cart price
   */
  async calculateCartTotal(): Promise<number> {
    const prices = await this.getCartItemPrices();
    return prices.reduce((sum, price) => sum + price, 0);
  }

  /**
   * Remove item from cart by product name
   */
  async removeItemByName(productName: string) {
    const item = this.page.locator('.cart_item', { hasText: productName });
    await item.locator('button').click();
  }

  /**
   * Remove item from cart by index (0-based)
   */
  async removeItemByIndex(index: number) {
    await this.removeButtons.nth(index).click();
  }

  /**
   * Remove all items from cart
   */
  async removeAllItems() {
    const count = await this.removeButtons.count();
    for (let i = count - 1; i >= 0; i--) {
      await this.removeButtons.nth(i).click();
    }
  }

  /**
   * Check if cart is empty
   */
  async isCartEmpty(): Promise<boolean> {
    const count = await this.getCartItemCount();
    return count === 0;
  }

  /**
   * Check if product is in cart
   */
  async isProductInCart(productName: string): Promise<boolean> {
    const names = await this.getCartItemNames();
    return names.includes(productName);
  }

  /**
   * Get cart item details
   */
  async getCartItemDetails(productName: string): Promise<{
    name: string;
    price: number;
    quantity: number;
  }> {
    const item = this.page.locator('.cart_item', { hasText: productName });
    const name = await item.locator('.inventory_item_name').textContent() || '';
    const priceText = await item.locator('.inventory_item_price').textContent() || '$0';
    const price = parseFloat(priceText.replace('$', ''));
    const qtyText = await item.locator('.cart_quantity').textContent() || '1';
    const quantity = parseInt(qtyText);

    return { name, price, quantity };
  }

  /**
   * Click continue shopping button
   */
  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

  /**
   * Check if checkout button is enabled
   */
  async isCheckoutButtonEnabled(): Promise<boolean> {
    return await this.checkoutButton.isEnabled();
  }

  /**
   * Get cart badge count
   */
  async getCartBadgeCount(): Promise<number> {
    const isVisible = await this.cartBadge.isVisible();
    if (!isVisible) return 0;
    const badgeText = await this.cartBadge.textContent();
    return parseInt(badgeText || '0');
  }

  /**
   * Verify cart contains expected items
   */
  async verifyCartContents(expectedItems: string[]): Promise<boolean> {
    const actualItems = await this.getCartItemNames();
    return expectedItems.every(item => actualItems.includes(item));
  }

  /**
   * Get product description in cart
   */
  async getProductDescription(productName: string): Promise<string> {
    const item = this.page.locator('.cart_item', { hasText: productName });
    return await item.locator('.inventory_item_desc').textContent() || '';
  }
}