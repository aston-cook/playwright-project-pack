import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Checkout Complete Page Object
 * Represents the order confirmation page
 */
export class CheckoutCompletePage extends BasePage {
  readonly pageTitle: Locator;
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;
  readonly ponyExpressImage: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.title');
    this.completeHeader = page.locator('.complete-header');
    this.completeText = page.locator('.complete-text');
    this.backHomeButton = page.locator('#back-to-products');
    this.ponyExpressImage = page.locator('.pony_express');
  }

  /**
   * Navigate to checkout complete page
   */
  async goto() {
    await this.page.goto('/checkout-complete.html');
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.pageTitle.textContent() || '';
  }

  /**
   * Check if on checkout complete page
   */
  async isOnCompletePage(): Promise<boolean> {
    const url = this.page.url();
    return url.includes('checkout-complete.html');
  }

  /**
   * Get success header text
   */
  async getSuccessHeader(): Promise<string> {
    return await this.completeHeader.textContent() || '';
  }

  /**
   * Get success message text
   */
  async getSuccessMessage(): Promise<string> {
    return await this.completeText.textContent() || '';
  }

  /**
   * Check if success message is displayed
   */
  async isSuccessMessageDisplayed(): Promise<boolean> {
    return await this.completeHeader.isVisible();
  }

  /**
   * Check if pony express image is visible
   */
  async isPonyExpressImageVisible(): Promise<boolean> {
    return await this.ponyExpressImage.isVisible();
  }

  /**
   * Click back home button
   */
  async clickBackHome() {
    await this.backHomeButton.click();
  }

  /**
   * Return to products page
   */
  async returnToProducts() {
    await this.clickBackHome();
  }

  /**
   * Verify order completion
   */
  async verifyOrderComplete(): Promise<boolean> {
    const headerVisible = await this.isSuccessMessageDisplayed();
    const onCorrectPage = await this.isOnCompletePage();
    const header = await this.getSuccessHeader();
    
    return headerVisible && onCorrectPage && header.includes('Thank you');
  }
}