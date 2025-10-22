import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Checkout Page Object
 * Represents the checkout information page (Step 1)
 */
export class CheckoutPage extends BasePage {
  readonly pageTitle: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  readonly errorButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.title');
    this.firstNameInput = page.locator('#first-name');
    this.lastNameInput = page.locator('#last-name');
    this.postalCodeInput = page.locator('#postal-code');
    this.continueButton = page.locator('#continue');
    this.cancelButton = page.locator('#cancel');
    this.errorMessage = page.locator('[data-test="error"]');
    this.errorButton = page.locator('.error-button');
  }

  /**
   * Navigate to checkout page
   */
  async goto() {
    await this.page.goto('/checkout-step-one.html');
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.pageTitle.textContent() || '';
  }

  /**
   * Check if on checkout page
   */
  async isOnCheckoutPage(): Promise<boolean> {
    const url = this.page.url();
    return url.includes('checkout-step-one.html');
  }

  /**
   * Fill checkout information
   */
  async fillCheckoutInformation(firstName: string, lastName: string, postalCode: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  /**
   * Fill first name
   */
  async fillFirstName(firstName: string) {
    await this.firstNameInput.fill(firstName);
  }

  /**
   * Fill last name
   */
  async fillLastName(lastName: string) {
    await this.lastNameInput.fill(lastName);
  }

  /**
   * Fill postal code
   */
  async fillPostalCode(postalCode: string) {
    await this.postalCodeInput.fill(postalCode);
  }

  /**
   * Click continue button
   */
  async clickContinue() {
    await this.continueButton.click();
  }

  /**
   * Complete checkout information and continue
   */
  async completeCheckoutInfo(firstName: string, lastName: string, postalCode: string) {
    await this.fillCheckoutInformation(firstName, lastName, postalCode);
    await this.clickContinue();
  }

  /**
   * Click cancel button
   */
  async clickCancel() {
    await this.cancelButton.click();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  /**
   * Check if error message is visible
   */
  async isErrorVisible(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * Close error message
   */
  async closeError() {
    await this.errorButton.click();
  }

  /**
   * Clear all input fields
   */
  async clearAllFields() {
    await this.firstNameInput.clear();
    await this.lastNameInput.clear();
    await this.postalCodeInput.clear();
  }

  /**
   * Get input field values
   */
  async getFormValues(): Promise<{
    firstName: string;
    lastName: string;
    postalCode: string;
  }> {
    return {
      firstName: await this.firstNameInput.inputValue(),
      lastName: await this.lastNameInput.inputValue(),
      postalCode: await this.postalCodeInput.inputValue()
    };
  }

  /**
   * Check if continue button is enabled
   */
  async isContinueButtonEnabled(): Promise<boolean> {
    return await this.continueButton.isEnabled();
  }
}

/**
 * Checkout Overview Page (Step 2)
 * Review order before final submission
 */
export class CheckoutOverviewPage extends BasePage {
  readonly pageTitle: Locator;
  readonly cartItems: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly itemQuantities: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;
  readonly paymentInfo: Locator;
  readonly shippingInfo: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.title');
    this.cartItems = page.locator('.cart_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
    this.itemQuantities = page.locator('.cart_quantity');
    this.subtotalLabel = page.locator('.summary_subtotal_label');
    this.taxLabel = page.locator('.summary_tax_label');
    this.totalLabel = page.locator('.summary_total_label');
    this.finishButton = page.locator('#finish');
    this.cancelButton = page.locator('#cancel');
    this.paymentInfo = page.locator('.summary_value_label').nth(0);
    this.shippingInfo = page.locator('.summary_value_label').nth(1);
  }

  /**
   * Navigate to checkout overview page
   */
  async goto() {
    await this.page.goto('/checkout-step-two.html');
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.pageTitle.textContent() || '';
  }

  /**
   * Check if on checkout overview page
   */
  async isOnOverviewPage(): Promise<boolean> {
    const url = this.page.url();
    return url.includes('checkout-step-two.html');
  }

  /**
   * Get all item names
   */
  async getItemNames(): Promise<string[]> {
    return await this.itemNames.allTextContents();
  }

  /**
   * Get all item prices
   */
  async getItemPrices(): Promise<number[]> {
    const priceTexts = await this.itemPrices.allTextContents();
    return priceTexts.map(price => parseFloat(price.replace('$', '')));
  }

  /**
   * Get subtotal amount
   */
  async getSubtotal(): Promise<number> {
    const text = await this.subtotalLabel.textContent() || '';
    const match = text.match(/\$([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Get tax amount
   */
  async getTax(): Promise<number> {
    const text = await this.taxLabel.textContent() || '';
    const match = text.match(/\$([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Get total amount
   */
  async getTotal(): Promise<number> {
    const text = await this.totalLabel.textContent() || '';
    const match = text.match(/\$([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Get order summary
   */
  async getOrderSummary(): Promise<{
    subtotal: number;
    tax: number;
    total: number;
    itemCount: number;
  }> {
    return {
      subtotal: await this.getSubtotal(),
      tax: await this.getTax(),
      total: await this.getTotal(),
      itemCount: await this.cartItems.count()
    };
  }

  /**
   * Get payment information
   */
  async getPaymentInfo(): Promise<string> {
    return await this.paymentInfo.textContent() || '';
  }

  /**
   * Get shipping information
   */
  async getShippingInfo(): Promise<string> {
    return await this.shippingInfo.textContent() || '';
  }

  /**
   * Click finish button to complete order
   */
  async clickFinish() {
    await this.finishButton.click();
  }

  /**
   * Click cancel button
   */
  async clickCancel() {
    await this.cancelButton.click();
  }

  /**
   * Verify total calculation is correct
   */
  async verifyTotalCalculation(): Promise<boolean> {
    const subtotal = await this.getSubtotal();
    const tax = await this.getTax();
    const total = await this.getTotal();
    const calculatedTotal = subtotal + tax;
    
    // Allow for small floating point differences
    return Math.abs(calculatedTotal - total) < 0.01;
  }

  /**
   * Complete the order
   */
  async completeOrder() {
    await this.clickFinish();
  }
}