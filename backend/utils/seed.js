const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Project = require('../models/Project');
const WeeklyReport = require('../models/WeeklyReport');
const connectDB = require('../config/db');

// Load env variables (assuming you run this from the server root)
dotenv.config();

const importData = async () => {
  try {
    await connectDB();

    // 1. Clear existing data
    await WeeklyReport.deleteMany();
    await Project.deleteMany();
    await User.deleteMany();

    // 2. Seed Users
    // Mongoose will automatically hash 'password123' via the pre-save hook in the User model
    const createdUsers = await User.create([
      { name: 'Dinusha Anupama', email: 'dinusha@company.com', password: 'password123', role: 'manager' },
      { name: 'Alice Johnson', email: 'alice@company.com', password: 'password123', role: 'team_member' },
      { name: 'Bob Smith', email: 'bob@company.com', password: 'password123', role: 'team_member' },
      { name: 'Charlie Davis', email: 'charlie@company.com', password: 'password123', role: 'team_member' }
    ]);

    const managerId = createdUsers[0]._id;
    const teamMembers = createdUsers.slice(1);

    // 3. Seed Projects
    const createdProjects = await Project.create([
      { name: 'Internal Tooling', description: 'Development of internal company apps', assignedUsers: [teamMembers[0]._id, teamMembers[1]._id] },
      { name: 'Client A Portal', description: 'Customer facing dashboard', assignedUsers: [teamMembers[1]._id, teamMembers[2]._id] },
      { name: 'R&D', description: 'Research and experimental features', assignedUsers: [teamMembers[0]._id, teamMembers[2]._id] }
    ]);

    // 4. Seed Weekly Reports (covering different statuses)
    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date();
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 3);

    await WeeklyReport.create([
      {
        user: teamMembers[0]._id,
        project: createdProjects[0]._id,
        weekStartDate: lastWeekStart,
        weekEndDate: lastWeekEnd,
        status: 'Approved',
        tasks: [{ taskName: 'Setup auth', status: 'Completed', plannedHours: 10, spentHours: 12 }],
        achievements: [{ description: 'Finished JWT integration', isKeyAchievement: true }],
        hoursBreakdown: { development: 30, meetings: 5, testing: 5, documentation: 0 }
      },
      {
        user: teamMembers[1]._id,
        project: createdProjects[1]._id,
        weekStartDate: lastWeekStart,
        weekEndDate: lastWeekEnd,
        status: 'Needs Correction',
        tasks: [{ taskName: 'Design UI', status: 'In Progress', plannedHours: 15, spentHours: 15 }],
        blockers: [{ description: 'Waiting on client assets', isKeyIssue: true }],
        latestReviewComment: 'Please update the exact hours spent on the UI design phase.',
        currentVersion: 2
      },
      {
        user: teamMembers[2]._id,
        project: createdProjects[2]._id,
        weekStartDate: lastWeekStart,
        weekEndDate: lastWeekEnd,
        status: 'Submitted',
        tasks: [{ taskName: 'Data modeling', status: 'Completed', plannedHours: 8, spentHours: 7 }],
        plannedNextWeek: 'Begin API endpoint construction'
      }
    ]);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error.message}`);
    process.exit(1);
  }
};

importData();