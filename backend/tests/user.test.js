// backend/tests/user.test.js
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

// Import the database setup file
require('./setup');

describe('User Management API (Role-Based Security)', () => {
  let adminToken;
  let teamMemberToken;

  // Before each test, seed the database with two different types of users
  // and log them both in so we have their JWT tokens ready to use.
  beforeEach(async () => {
    // 1. Create and authenticate an Admin
    await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    
    adminToken = adminRes.body.token;

    // 2. Create and authenticate a standard Team Member
    await User.create({
      name: 'Team Member',
      email: 'team@test.com',
      password: 'password123',
      role: 'team_member'
    });
    const teamRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'team@test.com', password: 'password123' });
    
    teamMemberToken = teamRes.body.token;
  });

  it('should allow an Admin to fetch all users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`); // Pass the admin token

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBe(2); // Should find the 2 users we created in beforeEach
  });

  it('should explicitly BLOCK a standard Team Member from fetching users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${teamMemberToken}`); // Pass the standard token

    // Your admin middleware should reject this with a 401 Unauthorized status
    expect(res.statusCode).toBe(401); 
    expect(res.body.message).toMatch(/Not authorized/i);
  });

  it('should allow an Admin to create a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'New Developer',
        email: 'newdev@test.com',
        password: 'password123',
        role: 'team_member'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('New Developer');
    expect(res.body.email).toBe('newdev@test.com');
  });
});