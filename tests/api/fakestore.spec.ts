import { test, expect } from '@playwright/test';

/**
 * FakeStore API Test Suite
 * 
 * Tests the FakeStore API - a free e-commerce REST API for testing.
 * API: https://fakestoreapi.com
 */

const BASE_URL = 'https://fakestoreapi.com';

test.describe('FakeStore API - Products', () => {
  
  test('GET - should fetch all products @smoke @api', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/products`);
    
    expect(response.status()).toBe(200);
    
    const products = await response.json();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
    
    // Validate product structure
    const product = products[0];
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('title');
    expect(product).toHaveProperty('price');
    expect(product).toHaveProperty('description');
    expect(product).toHaveProperty('category');
    expect(product).toHaveProperty('image');
    expect(product).toHaveProperty('rating');
  });

  test('GET - should fetch a single product by ID @smoke @api', async ({ request }) => {
    const productId = 1;
    const response = await request.get(`${BASE_URL}/products/${productId}`);
    
    expect(response.status()).toBe(200);
    
    const product = await response.json();
    expect(product.id).toBe(productId);
    expect(typeof product.title).toBe('string');
    expect(typeof product.price).toBe('number');
    expect(product.price).toBeGreaterThan(0);
  });

  test('GET - should limit number of products returned @api', async ({ request }) => {
    const limit = 5;
    const response = await request.get(`${BASE_URL}/products?limit=${limit}`);
    
    expect(response.status()).toBe(200);
    
    const products = await response.json();
    expect(products.length).toBe(limit);
  });

  test('GET - should sort products in descending order @api', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/products?sort=desc`);
    
    expect(response.status()).toBe(200);
    
    const products = await response.json();
    expect(Array.isArray(products)).toBe(true);
    
    // Verify descending order by ID
    for (let i = 0; i < products.length - 1; i++) {
      expect(products[i].id).toBeGreaterThan(products[i + 1].id);
    }
  });
});

test.describe('FakeStore API - Categories', () => {
  
  test('GET - should fetch all categories @smoke @api', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/products/categories`);
    
    expect(response.status()).toBe(200);
    
    const categories = await response.json();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    
    // Verify expected categories exist
    expect(categories).toContain('electronics');
    expect(categories).toContain('jewelery');
  });

  test('GET - should fetch products by category @smoke @api', async ({ request }) => {
    const category = 'electronics';
    const response = await request.get(`${BASE_URL}/products/category/${category}`);
    
    expect(response.status()).toBe(200);
    
    const products = await response.json();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
    
    // Verify all products belong to the category
    products.forEach((product: any) => {
      expect(product.category).toBe(category);
    });
  });

  test('GET - should fetch products from jewelery category @api', async ({ request }) => {
    const category = 'jewelery';
    const response = await request.get(`${BASE_URL}/products/category/${category}`);
    
    expect(response.status()).toBe(200);
    
    const products = await response.json();
    expect(Array.isArray(products)).toBe(true);
    
    products.forEach((product: any) => {
      expect(product.category).toBe(category);
      expect(product.price).toBeGreaterThan(0);
    });
  });
});

test.describe('FakeStore API - Authentication', () => {
  
  test('POST - should login and receive token @smoke @api', async ({ request }) => {
    const credentials = {
      username: 'mor_2314',
      password: '83r5^_'
    };
    
    const response = await request.post(`${BASE_URL}/auth/login`, {
      data: credentials
    });
    
    expect(response.status()).toBe(201);
    
    const result = await response.json();
    expect(result).toHaveProperty('token');
    expect(typeof result.token).toBe('string');
    expect(result.token.length).toBeGreaterThan(0);
  });

  test('POST - should validate token structure @api', async ({ request }) => {
    const credentials = {
      username: 'mor_2314',
      password: '83r5^_'
    };
    
    const response = await request.post(`${BASE_URL}/auth/login`, {
      data: credentials
    });
    
    const result = await response.json();
    
    // Token should be a JWT-like string
    expect(result.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
  });
});

test.describe('FakeStore API - Carts', () => {
  
  test('GET - should fetch all carts @smoke @api', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/carts`);
    
    expect(response.status()).toBe(200);
    
    const carts = await response.json();
    expect(Array.isArray(carts)).toBe(true);
    expect(carts.length).toBeGreaterThan(0);
    
    // Validate cart structure
    const cart = carts[0];
    expect(cart).toHaveProperty('id');
    expect(cart).toHaveProperty('userId');
    expect(cart).toHaveProperty('date');
    expect(cart).toHaveProperty('products');
    expect(Array.isArray(cart.products)).toBe(true);
  });

  test('GET - should fetch a single cart by ID @api', async ({ request }) => {
    const cartId = 1;
    const response = await request.get(`${BASE_URL}/carts/${cartId}`);
    
    expect(response.status()).toBe(200);
    
    const cart = await response.json();
    expect(cart.id).toBe(cartId);
    expect(Array.isArray(cart.products)).toBe(true);
    
    // Validate product in cart
    if (cart.products.length > 0) {
      const product = cart.products[0];
      expect(product).toHaveProperty('productId');
      expect(product).toHaveProperty('quantity');
    }
  });

  test('GET - should fetch carts for specific user @api', async ({ request }) => {
    const userId = 1;
    const response = await request.get(`${BASE_URL}/carts/user/${userId}`);
    
    expect(response.status()).toBe(200);
    
    const carts = await response.json();
    expect(Array.isArray(carts)).toBe(true);
    
    // Verify all carts belong to the user
    carts.forEach((cart: any) => {
      expect(cart.userId).toBe(userId);
    });
  });

  test('POST - should create a new cart @smoke @api', async ({ request }) => {
    const newCart = {
      userId: 5,
      date: new Date().toISOString().split('T')[0],
      products: [
        { productId: 1, quantity: 2 },
        { productId: 5, quantity: 1 }
      ]
    };
    
    const response = await request.post(`${BASE_URL}/carts`, {
      data: newCart
    });
    
    expect(response.status()).toBe(201);
    
    const cart = await response.json();
    expect(cart).toHaveProperty('id');
    expect(cart.id).toBeGreaterThan(0);
  });

  test('PUT - should update an existing cart @api', async ({ request }) => {
    const cartId = 1;
    const updatedCart = {
      userId: 5,
      date: new Date().toISOString().split('T')[0],
      products: [
        { productId: 1, quantity: 5 }
      ]
    };
    
    const response = await request.put(`${BASE_URL}/carts/${cartId}`, {
      data: updatedCart
    });
    
    expect(response.status()).toBe(200);
    
    const cart = await response.json();
    expect(cart).toHaveProperty('id');
  });

  test('DELETE - should delete a cart @api', async ({ request }) => {
    const cartId = 1;
    const response = await request.delete(`${BASE_URL}/carts/${cartId}`);
    
    expect(response.status()).toBe(200);
    
    const result = await response.json();
    expect(result).toHaveProperty('id');
  });
});

test.describe('FakeStore API - Users', () => {
  
  test('GET - should fetch all users @api', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/users`);
    
    expect(response.status()).toBe(200);
    
    const users = await response.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
    
    // Validate user structure
    const user = users[0];
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('username');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('address');
    expect(user).toHaveProperty('phone');
  });

  test('GET - should fetch user by ID @api', async ({ request }) => {
    const userId = 1;
    const response = await request.get(`${BASE_URL}/users/${userId}`);
    
    expect(response.status()).toBe(200);
    
    const user = await response.json();
    expect(user.id).toBe(userId);
    expect(user.email).toContain('@');
  });
});

test.describe('FakeStore API - Integration Tests', () => {
  
  test('E2E - should complete product to cart flow @e2e @api', async ({ request }) => {
    // Step 1: Get all products
    const productsResponse = await request.get(`${BASE_URL}/products`);
    expect(productsResponse.status()).toBe(200);
    const products = await productsResponse.json();
    const selectedProduct = products[0];
    
    // Step 2: Login
    const loginResponse = await request.post(`${BASE_URL}/auth/login`, {
      data: {
        username: 'mor_2314',
        password: '83r5^_'
      }
    });
    expect(loginResponse.status()).toBe(201);
    const { token } = await loginResponse.json();
    expect(token).toBeTruthy();
    
    // Step 3: Create cart with selected product
    const cartResponse = await request.post(`${BASE_URL}/carts`, {
      data: {
        userId: 1,
        date: new Date().toISOString().split('T')[0],
        products: [
          { productId: selectedProduct.id, quantity: 2 }
        ]
      }
    });
    expect(cartResponse.status()).toBe(201);
    const cart = await cartResponse.json();
    expect(cart.id).toBeGreaterThan(0);
  });

  test('E2E - should verify product availability before adding to cart @e2e @api', async ({ request }) => {
    // Get product
    const productId = 1;
    const productResponse = await request.get(`${BASE_URL}/products/${productId}`);
    expect(productResponse.status()).toBe(200);
    const product = await productResponse.json();
    
    // Verify product exists and has valid data
    expect(product.id).toBe(productId);
    expect(product.price).toBeGreaterThan(0);
    
    // Add to cart
    const cartResponse = await request.post(`${BASE_URL}/carts`, {
      data: {
        userId: 1,
        date: new Date().toISOString().split('T')[0],
        products: [
          { productId: product.id, quantity: 1 }
        ]
      }
    });
    expect(cartResponse.status()).toBe(201);
  });
});

test.describe('FakeStore API - Performance', () => {
  
  test('should respond quickly to product requests @api', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${BASE_URL}/products`);
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(3000);
    
    console.log(`API Response Time: ${responseTime}ms`);
  });
});