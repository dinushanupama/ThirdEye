const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Project = require('../models/Project');
const WeeklyReport = require('../models/WeeklyReport');
const connectDB = require('../config/db');

dotenv.config();

// Helper to generate dates for X weeks ago
const getPastWeek = (weeksAgo) => {
  const start = new Date();
  start.setDate(start.getDate() - (weeksAgo * 7) - start.getDay() + 1); // Monday
  const end = new Date(start);
  end.setDate(end.getDate() + 4); // Friday
  return { start, end };
};

const importData = async () => {
  try {
    await connectDB();

    // 1. Clear existing data
    await WeeklyReport.deleteMany();
    await Project.deleteMany();
    await User.deleteMany();

    console.log('Cleared existing database data...');

    // 2. Seed Users (Admin, Manager, and 4 Team Members)
    const createdUsers = await User.create([
      { name: 'Sisenco Digital', email: 'sisenco@company.com', password: 'password123', role: 'admin' },
      { name: 'Dinusha Anupama', email: 'dinusha@company.com', password: 'password123', role: 'manager' },
      { name: 'Alice Johnson', email: 'alice@company.com', password: 'password123', role: 'team_member' },
      { name: 'Bob Smith', email: 'bob@company.com', password: 'password123', role: 'team_member' },
      { name: 'Charlie Davis', email: 'charlie@company.com', password: 'password123', role: 'team_member' },
      { name: 'Diana Prince', email: 'diana@company.com', password: 'password123', role: 'team_member' }
    ]);

    const adminId = createdUsers[0]._id;
    const managerId = createdUsers[1]._id;
    const team = createdUsers.slice(2);

    console.log('Seeded Users...');

    // 3. Seed Projects
    const createdProjects = await Project.create([
      { name: 'HRDoctor Video Analysis', description: 'Heart rate measurement from video signals', assignedUsers: [team[0]._id, team[1]._id] },
      { name: 'Royal Manchester System', description: 'Concurrency-based hospital waitroom simulation', assignedUsers: [team[1]._id, team[2]._id] },
      { name: 'Battleship Formal Methods', description: 'B-Method game implementation', assignedUsers: [team[2]._id, team[3]._id] },
      { name: 'Client A Portal', description: 'Customer facing dashboard', assignedUsers: [team[0]._id, team[3]._id] }
    ]);

    console.log('Seeded Projects...');

    // Generate date ranges for the last 3 weeks + the current week
    const week3 = getPastWeek(3);
    const week2 = getPastWeek(2);
    const week1 = getPastWeek(1); // Last week
    const currentWeek = getPastWeek(0); // This week

    // 4. Seed Rich Weekly Reports
    await WeeklyReport.create([
      // --- WEEK 3 (Oldest) ---
      {
        user: team[0]._id, // Alice
        project: createdProjects[0]._id,
        weekStartDate: week3.start,
        weekEndDate: week3.end,
        status: 'Approved',
        tasks: [{ taskName: 'Dataset synchronization', status: 'Completed', plannedHours: 15, spentHours: 14, plannedPercent: 100, actualPercent: 100 }],
        achievements: [{ description: 'Successfully synced temporal data', isKeyAchievement: true }],
        hoursBreakdown: { development: 20, meetings: 5, testing: 10, documentation: 5 }
      },
      {
        user: team[1]._id, // Bob
        project: createdProjects[1]._id,
        weekStartDate: week3.start,
        weekEndDate: week3.end,
        status: 'Approved',
        tasks: [{ taskName: 'Thread pool setup', status: 'Completed', plannedHours: 10, spentHours: 12 }],
        blockers: [],
        hoursBreakdown: { development: 25, meetings: 2, testing: 8, documentation: 0 }
      },

      // --- WEEK 2 ---
      {
        user: team[0]._id, // Alice
        project: createdProjects[0]._id,
        weekStartDate: week2.start,
        weekEndDate: week2.end,
        status: 'Approved',
        tasks: [{ taskName: 'Temporal Convolutional Networks prep', status: 'Completed', plannedHours: 20, spentHours: 22 }],
        hoursBreakdown: { development: 30, meetings: 4, testing: 6, documentation: 0 }
      },
      {
        user: team[1]._id, // Bob
        project: createdProjects[1]._id,
        weekStartDate: week2.start,
        weekEndDate: week2.end,
        status: 'Approved',
        tasks: [{ taskName: 'Patient generator threads', status: 'Completed', plannedHours: 15, spentHours: 15 }],
        achievements: [{ description: 'Resolved concurrency deadlocks', isKeyAchievement: true }],
        hoursBreakdown: { development: 28, meetings: 4, testing: 8, documentation: 2 }
      },
      {
        user: team[2]._id, // Charlie
        project: createdProjects[2]._id,
        weekStartDate: week2.start,
        weekEndDate: week2.end,
        status: 'Needs Correction',
        currentVersion: 1,
        tasks: [{ taskName: 'Ship deployment logic', status: 'In Progress', plannedHours: 12, spentHours: 10, actualPercent: 80 }],
        blockers: [{ description: 'Ships placing up instead of down on grid', isKeyIssue: true }],
        latestReviewComment: 'Please revise the coordinate logic to align with coursework specifications.',
        hoursBreakdown: { development: 15, meetings: 5, testing: 10, documentation: 5 }
      },

      // --- WEEK 1 (Last Week) ---
      {
        user: team[0]._id, // Alice
        project: createdProjects[0]._id,
        weekStartDate: week1.start,
        weekEndDate: week1.end,
        status: 'Submitted',
        tasks: [{ taskName: 'Standalone XGBoost integration', status: 'Completed', plannedHours: 12, spentHours: 10 }],
        achievements: [{ description: 'Discarded hybrid model to improve latency', isKeyAchievement: true }],
        plannedNextWeek: 'Begin final dataset analysis presentation',
        hoursBreakdown: { development: 18, meetings: 3, testing: 12, documentation: 7 }
      },
      {
        user: team[2]._id, // Charlie
        project: createdProjects[2]._id,
        weekStartDate: week1.start,
        weekEndDate: week1.end,
        status: 'Approved',
        currentVersion: 2,
        tasks: [{ taskName: 'Fix ShipsLeft operation', status: 'Completed', plannedHours: 10, spentHours: 12 }],
        achievements: [{ description: 'Defined SHIP set in SETS section to fix logic failure', isKeyAchievement: true }],
        plannedNextWeek: 'Finalize ProB validation',
        hoursBreakdown: { development: 20, meetings: 2, testing: 15, documentation: 3 }
      },
      {
        user: team[3]._id, // Diana
        project: createdProjects[3]._id,
        weekStartDate: week1.start,
        weekEndDate: week1.end,
        status: 'Needs Correction',
        currentVersion: 1,
        tasks: [{ taskName: 'SQL injection mitigation', status: 'In Progress', plannedHours: 20, spentHours: 18 }],
        blockers: [{ description: 'Nmap scripting engine timeouts', isKeyIssue: true }],
        latestReviewComment: 'Add the specific Nmap commands you used to the documentation notes.',
        hoursBreakdown: { development: 25, meetings: 5, testing: 10, documentation: 0 }
      },

      // --- CURRENT WEEK (Drafts) ---
      {
        user: team[3]._id, // Diana
        project: createdProjects[3]._id,
        weekStartDate: currentWeek.start,
        weekEndDate: currentWeek.end,
        status: 'Draft',
        tasks: [{ taskName: 'Session hijacking tests', status: 'To Do', plannedHours: 15, spentHours: 0 }],
        plannedNextWeek: 'Penetration testing report',
        hoursBreakdown: { development: 5, meetings: 2, testing: 0, documentation: 0 }
      }
    ]);

    console.log('Seeded Weekly Reports across 4 weeks...');
    console.log('\n--- SEED COMPLETE ---');
    console.log('Admin Login:   sisenco@company.com / password123');
    console.log('Manager Login: dinusha@company.com / password123');
    console.log('Team Login:    alice@company.com / password123');
    
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error.message}`);
    process.exit(1);
  }
};

importData();