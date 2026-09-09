const { GoogleGenerativeAI } = require('@google/generative-ai');
const WeeklyReport = require('../models/WeeklyReport');

// @desc    Generate AI chat response
// @route   POST /api/ai/chat
// @access  Private
const generateResponse = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userRole = req.user.role; // Passed from your authMiddleware

    let systemContext = "You are a helpful AI assistant for the WeeklyStatus app.";

    // 1. Inject Database Context for Managers/Admins
    if (userRole === 'manager' || userRole === 'admin') {
      // Fetch reports from the last 14 days
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const recentReports = await WeeklyReport.find({ weekStartDate: { $gte: twoWeeksAgo } })
        .populate('user', 'name')
        .populate('project', 'name');

      // Minimize data payload to save API tokens
      const compactData = recentReports.map(r => ({
        member: r.user?.name,
        project: r.project?.name,
        status: r.status,
        tasks: r.tasks.map(t => `${t.taskName} (${t.status}, ${t.spentHours}hrs)`),
        blockers: r.blockers.map(b => b.description),
        achievements: r.achievements.map(a => a.description)
      }));

      systemContext = `
        You are an analytical AI assistant for managers using the WeeklyStatus app. 
        Here is the JSON data of the team's activity over the last 2 weeks:
        ${JSON.stringify(compactData)}
        
        Analyze this data to answer the manager's question accurately. 
        Highlight completed work, identify recurring blockers, and note workload imbalances if asked.
        Be concise, professional, and format your response clearly.
      `;
    }

    // 2. Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    // 3. Combine Context and User Prompt
    const finalPrompt = `${systemContext}\n\nManager's Query: "${prompt}"`;
    
    const result = await model.generateContent(finalPrompt);
    const responseText = result.response.text();

    res.status(200).json({ reply: responseText });
  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ message: 'Failed to generate AI response' });
  }
};

module.exports = { generateResponse };