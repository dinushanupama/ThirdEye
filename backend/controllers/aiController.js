// @desc    Generate AI response for chat assistant
// @route   POST /api/ai/chat
// @access  Private
const generateResponse = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // --- simulated AI Logic ---
    // (To upgrade this later, you would install the '@google/generative-ai' or 'openai' package
    // and pass the `message` variable to their API here).
    
    let aiResponse = "I'm your AI reporting assistant. How can I help you today?";
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('blocker') || lowerMessage.includes('stuck')) {
      aiResponse = "If you are facing a blocker, make sure to add it to the 'Blockers & Challenges' section of your report and check the 'Key Issue' box so your manager sees it immediately.";
    } else if (lowerMessage.includes('hours') || lowerMessage.includes('time')) {
      aiResponse = "Remember to accurately split your planned hours vs. actual spent hours for each task. This helps managers balance team workloads.";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      aiResponse = "Hello! Do you need help formatting your weekly report?";
    } else {
      aiResponse = `I received your message about: "${message}". As a demo AI, I recommend reviewing the project guidelines for specific formatting questions!`;
    }

    // Simulate network delay to make it feel like a real AI generating text
    setTimeout(() => {
      res.json({ response: aiResponse });
    }, 1000);

  } catch (error) {
    res.status(500).json({ message: 'AI processing failed' });
  }
};

module.exports = { generateResponse };