// backend/tests/report.test.js
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Project = require('../models/Project');
const WeeklyReport = require('../models/WeeklyReport');

// Import the database setup file
require('./setup');

describe('Report API Endpoints & Ownership Security', () => {
  let userOneToken, userTwoToken;
  let userOneId, projectId;
  let reportId;

  // Set up the database with 2 users, 1 project, and 1 report before each test
  beforeEach(async () => {
    // 1. Create User One (The Owner)
    const userOne = await User.create({
      name: 'Alice Owner',
      email: 'alice@test.com',
      password: 'password123',
      role: 'team_member'
    });
    userOneId = userOne._id;
    const resOne = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'password123' });
    userOneToken = resOne.body.token;

    // 2. Create User Two (The Intruder)
    await User.create({
      name: 'Bob Intruder',
      email: 'bob@test.com',
      password: 'password123',
      role: 'team_member'
    });
    const resTwo = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bob@test.com', password: 'password123' });
    userTwoToken = resTwo.body.token;

    // 3. Create a Dummy Project
    const project = await Project.create({
      name: 'Test Project',
      description: 'Testing the reporting system'
    });
    projectId = project._id;

    // 4. Create a Report owned specifically by User One
    const report = await WeeklyReport.create({
      user: userOneId,
      project: projectId,
      weekStartDate: new Date(),
      weekEndDate: new Date(),
      status: 'Draft',
      tasks: [{ taskName: 'Initial Task', status: 'To Do', plannedHours: 5, spentHours: 0 }]
    });
    reportId = report._id;
  });

  it('should allow User One to fetch their own report', async () => {
    const res = await request(app)
      .get(`/api/reports/${reportId}`) // Assuming you have a GET /:id route
      .set('Authorization', `Bearer ${userOneToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('Draft');
    expect(res.body.tasks[0].taskName).toBe('Initial Task');
  });

  it('should allow User One to update their own report', async () => {
    const res = await request(app)
      .put(`/api/reports/${reportId}`)
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({
        status: 'Submitted',
        tasks: [{ taskName: 'Initial Task', status: 'Completed', plannedHours: 5, spentHours: 5 }]
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('Submitted');
    expect(res.body.tasks[0].status).toBe('Completed');
  });

  it('should explicitly BLOCK User Two from updating User One\'s report', async () => {
    const res = await request(app)
      .put(`/api/reports/${reportId}`)
      .set('Authorization', `Bearer ${userTwoToken}`) // Sending the INTRUDER's token
      .send({
        status: 'Approved',
        notes: 'Malicious update attempt'
      });

    // We expect a 403 Forbidden or 404 Not Found, depending on how you wrote the controller logic
    // Based on the code we wrote earlier, it should throw a 403 Not authorized
    expect(res.statusCode).toBe(403); 
    expect(res.body.message).toMatch(/Not authorized/i);
  });
});