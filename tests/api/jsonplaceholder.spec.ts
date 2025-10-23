import { test, expect } from '@playwright/test';

/**
 * JSONPlaceholder API Test Suite
 * 
 * Tests the JSONPlaceholder REST API - a free fake API for testing.
 * API: https://jsonplaceholder.typicode.com
 */

const BASE_URL = 'https://jsonplaceholder.typicode.com';

test.describe('JSONPlaceholder API - GET Requests', () => {
  
  test('GET - should fetch all posts @smoke @api', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/posts`);
    
    expect(response.status()).toBe(200);
    
    const posts = await response.json();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBe(100);
    
    // Validate first post structure
    expect(posts[0]).toHaveProperty('userId');
    expect(posts[0]).toHaveProperty('id');
    expect(posts[0]).toHaveProperty('title');
    expect(posts[0]).toHaveProperty('body');
  });

  test('GET - should fetch a single post by ID @smoke @api', async ({ request }) => {
    const postId = 1;
    const response = await request.get(`${BASE_URL}/posts/${postId}`);
    
    expect(response.status()).toBe(200);
    
    const post = await response.json();
    expect(post.id).toBe(postId);
    expect(post).toHaveProperty('userId');
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('body');
    expect(typeof post.title).toBe('string');
    expect(typeof post.body).toBe('string');
  });

  test('GET - should fetch posts for specific user @api', async ({ request }) => {
    const userId = 1;
    const response = await request.get(`${BASE_URL}/posts?userId=${userId}`);
    
    expect(response.status()).toBe(200);
    
    const posts = await response.json();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);
    
    // Verify all posts belong to the user
    posts.forEach((post: any) => {
      expect(post.userId).toBe(userId);
    });
  });

  test('GET - should fetch comments for a post @api', async ({ request }) => {
    const postId = 1;
    const response = await request.get(`${BASE_URL}/posts/${postId}/comments`);
    
    expect(response.status()).toBe(200);
    
    const comments = await response.json();
    expect(Array.isArray(comments)).toBe(true);
    expect(comments.length).toBeGreaterThan(0);
    
    // Validate comment structure
    expect(comments[0]).toHaveProperty('postId');
    expect(comments[0]).toHaveProperty('id');
    expect(comments[0]).toHaveProperty('name');
    expect(comments[0]).toHaveProperty('email');
    expect(comments[0]).toHaveProperty('body');
    expect(comments[0].postId).toBe(postId);
  });

  test('GET - should return 404 for non-existent post @api', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/posts/99999`);
    
    expect(response.status()).toBe(404);
  });
});

test.describe('JSONPlaceholder API - POST Requests', () => {
  
  test('POST - should create a new post @smoke @api', async ({ request }) => {
    const newPost = {
      title: 'Test Post Title',
      body: 'This is a test post body with some content.',
      userId: 1
    };
    
    const response = await request.post(`${BASE_URL}/posts`, {
      data: newPost
    });
    
    expect(response.status()).toBe(201);
    
    const createdPost = await response.json();
    expect(createdPost).toHaveProperty('id');
    expect(createdPost.title).toBe(newPost.title);
    expect(createdPost.body).toBe(newPost.body);
    expect(createdPost.userId).toBe(newPost.userId);
    expect(createdPost.id).toBe(101);
  });

  test('POST - should validate response headers @api', async ({ request }) => {
    const newPost = {
      title: 'Header Validation Post',
      body: 'Testing headers',
      userId: 1
    };
    
    const response = await request.post(`${BASE_URL}/posts`, {
      data: newPost
    });
    
    expect(response.status()).toBe(201);
    expect(response.headers()['content-type']).toContain('application/json');
  });
});

test.describe('JSONPlaceholder API - PUT Requests', () => {
  
  test('PUT - should update an existing post @smoke @api', async ({ request }) => {
    const postId = 1;
    const updatedPost = {
      id: postId,
      title: 'Updated Post Title',
      body: 'This post has been updated with new content.',
      userId: 1
    };
    
    const response = await request.put(`${BASE_URL}/posts/${postId}`, {
      data: updatedPost
    });
    
    expect(response.status()).toBe(200);
    
    const post = await response.json();
    expect(post.id).toBe(postId);
    expect(post.title).toBe(updatedPost.title);
    expect(post.body).toBe(updatedPost.body);
    expect(post.userId).toBe(updatedPost.userId);
  });

  test('PATCH - should partially update a post @api', async ({ request }) => {
    const postId = 1;
    const partialUpdate = {
      title: 'Only Title Updated'
    };
    
    const response = await request.patch(`${BASE_URL}/posts/${postId}`, {
      data: partialUpdate
    });
    
    expect(response.status()).toBe(200);
    
    const post = await response.json();
    expect(post.title).toBe(partialUpdate.title);
    expect(post).toHaveProperty('body');
    expect(post).toHaveProperty('userId');
  });
});

test.describe('JSONPlaceholder API - DELETE Requests', () => {
  
  test('DELETE - should remove a post @smoke @api', async ({ request }) => {
    const postId = 1;
    const response = await request.delete(`${BASE_URL}/posts/${postId}`);
    
    expect(response.status()).toBe(200);
  });

  test('DELETE - should return empty object after deletion @api', async ({ request }) => {
    const postId = 1;
    const response = await request.delete(`${BASE_URL}/posts/${postId}`);
    
    expect(response.status()).toBe(200);
    
    const result = await response.json();
    expect(result).toEqual({});
  });
});

test.describe('JSONPlaceholder API - Users Endpoint', () => {
  
  test('GET - should fetch all users @api', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/users`);
    
    expect(response.status()).toBe(200);
    
    const users = await response.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBe(10);
    
    // Validate user structure
    const user = users[0];
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('username');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('address');
    expect(user).toHaveProperty('phone');
    expect(user).toHaveProperty('website');
    expect(user).toHaveProperty('company');
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

test.describe('JSONPlaceholder API - Response Time', () => {
  
  test('GET - should respond within acceptable time @api', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${BASE_URL}/posts`);
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(3000);
  });
});