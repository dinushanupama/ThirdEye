ThirdEye - Enterprise Reporting System

ThirdEye is a secure, role-based MERN stack application designed to streamline team reporting, project tracking, and managerial oversight. It features an integrated Retrieval-Augmented Generation (RAG) AI assistant to provide dynamic team insights.

📋 Prerequisites
Before you begin, ensure you have the following installed on your machine:

Node.js: (v16.x or higher)
MongoDB: A local MongoDB instance running, or a MongoDB Atlas cluster URI.
Git: To clone the repository.

⚙️ 1. Environment Configuration (.env)
You will need to configure your environment variables for both the backend and the frontend.

Backend (/backend/.env)
Create a .env file in the backend directory and add the following keys:

Code snippet

PORT=5000
MONGO_URI=paste_the_mongo_uri
JWT_SECRET=your_super_secret_key_here
GEMINI_API_KEY=paste_the_Gemini_api_key

📦 2. Installing Dependencies
The application is split into two distinct directories. You must install the dependencies for both.

Open a terminal and install backend dependencies:

Bash
cd backend
npm install

Open a second terminal and install frontend dependencies:

Bash
cd frontend
npm install

🗄️ 3. Running & Seeding the Database
To properly evaluate the dashboard and AI insights, the database must be populated with initial data. A custom seed script has been provided to clear out old data and generate a rich set of users, projects, and 4 weeks of simulated reports.

In the backend terminal, run:

Bash
node utils/seed.js

Wait for the console to display: --- SEED COMPLETE ---

🚀 4. Running the Application
Once the database is seeded, you can spin up the development servers.

Start the Backend Server:
In the backend terminal, run:

Bash
npm run dev

(You should see: Server running in development mode on port 5000 and MongoDB Connected)

Start the Frontend Server:
In the frontend terminal, run:

Bash
npm run dev

(Navigate to the local URL provided in the console, usually http://localhost:5173 or http://localhost:3000)

🧪 5. Evaluation Guide (RBAC)
The system utilizes strict Role-Based Access Control (RBAC). Please use the following seeded credentials to evaluate the system from different user perspectives.

Admin View
Email: sisenco@company.com

Password: password123

Features to test: Navigate to User Management to test creating, editing, and deleting users, as well as instantly swapping roles. Admins have global access but cannot submit personal reports.

Manager View
Email: dinusha@company.com

Password: password123

Features to test: Navigate to the Team Dashboard and Team Insights views. Test the AI Chat Assistant in the bottom right corner—ask it analytical questions (e.g., "Summarize this week's blockers" or "What did Alice work on?").

Team Member View
Email: alice@company.com (or bob@company.com)

Password: password123

Features to test: Navigate to My Reports and New Report. Notice that Team Members are strictly blocked from viewing the Manager Dashboard or User Management pages. Their AI Assistant prompts will also switch to writing-assistance mode rather than analytics mode.

🛡️ 6. Running the Automated Security Tests
To verify the integrity of the endpoints and the RBAC security model, an automated Jest testing suite is included. It utilizes a MongoDB Memory Server to ensure test data does not corrupt the development database.

In the backend terminal, run:

Bash
npm test

The test suite covers Authentication validity, User Management role restrictions, and Report Ownership data isolation.
