// backend/tests/auth.test.js
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

// Import our database setup file
require('./setup'); 

describe('Auth API Endpoints', () => {
  
  // Create a dummy user before testing login
  beforeEach(async () => {
    await User.create({
      name: 'Test Manager',
      email: 'test@manager.com',
      password: 'password123',
      role: 'manager'
    });
  });

  it('should authenticate a valid user and return a token', async () => {
    const response = await request(app)
      .post('/api/auth/login') // Adjust this path if your route is different
      .send({
        email: 'test@manager.com',
        password: 'password123'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.email).toBe('test@manager.com');
    expect(response.body.role).toBe('manager');
  });

  it('should reject login with an incorrect password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@manager.com',
        password: 'wrongpassword'
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('message');
  });
});