const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the API client using your secret key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Generate AI response for chat assistant
// @route   POST /api/ai/chat
// @access  Private
const generateResponse = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // We use gemini-3.6-flash because it is extremely fast for chat applications
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    // Give the AI some context about what its job is before passing the user's message
    const prompt = `
      You are a helpful AI assistant integrated into a team reporting application called WeeklyStatus. 
      Your job is to help software engineers write better weekly status reports, format their tasks, and resolve blockers.
      Keep your answers concise, professional, and friendly (maximum 3 short paragraphs).
      
      User's message: "${message}"
    `;

    // Call the API
    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    // Send the real AI text back to the frontend widget
    res.json({ response: aiResponse });

  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ message: 'The AI is currently unavailable. Please try again later.' });
  }
};

module.exports = { generateResponse };