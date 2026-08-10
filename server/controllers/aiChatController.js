import AIChat from '../models/AIChat.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Fetch all chat conversations mapped to the authenticated user.
 * @route GET /api/ai-chat
 * @access Private
 */
export const getChats = async (req, res, next) => {
  try {
    const chats = await AIChat.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      count: chats.length,
      chats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send a user message, fetch OpenRouter response (with fallback), and append both to the chat log.
 * @route POST /api/ai-chat
 * @access Private
 */
export const sendMessage = async (req, res, next) => {
  const { chatId, message } = req.body;

  try {
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    let chat;
    let isNewChat = false;

    if (chatId) {
      chat = await AIChat.findOne({ _id: chatId, userId: req.user._id });
      if (!chat) {
        return res.status(404).json({
          success: false,
          message: 'Chat conversation not found'
        });
      }
    } else {
      isNewChat = true;
      chat = new AIChat({
        userId: req.user._id,
        title: 'New Chat',
        messages: []
      });
    }

    // Append user message
    chat.messages.push({
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    });

    // Auto-generate title for first-turn new chats
    if (isNewChat) {
      const words = message.trim().split(/\s+/);
      const titleSnippet = words.slice(0, 5).join(' ');
      chat.title = titleSnippet.length > 30 ? `${titleSnippet.substring(0, 30)}...` : titleSnippet;
    }

    // If Gemini API key is missing, respond with a config warning instead of failing
    if (!process.env.GEMINI_API_KEY) {
      const warningText = "Gemini API Key is missing. Please configure GEMINI_API_KEY in the server's `.env` file to chat!";
      chat.messages.push({
        role: 'model',
        content: warningText,
        timestamp: new Date()
      });
      await chat.save();
      return res.status(200).json({
        success: true,
        chat
      });
    }

    // Initialize the Google Generative AI with the API key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "You are FocusFlow AI, a helpful, friendly, and professional assistant. Your primary priority is to assist users with study, programming, debugging, productivity, notes, and revision. However, you should also act as a general-purpose assistant, answering questions about general knowledge, technology, history, science, mathematics, geography, current affairs, biographies, and other educational queries. Only refuse requests if they are illegal, dangerous, or harmful. Keep all responses friendly, professional, concise, and structured. Format code blocks using markdown with language labels.",
    });

    // Prepare context history parameters mapping for Gemini
    const contextMessages = chat.messages.slice(-15);
    const apiMessages = contextMessages.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Call the Gemini API using the conversation history
    const geminiChat = model.startChat({
      history: apiMessages.slice(0, -1), // Everything except the last message
    });

    // The last message is the new user input
    const lastMessage = apiMessages[apiMessages.length - 1].parts[0].text;

    let aiText = "";
    try {
      const result = await geminiChat.sendMessage(lastMessage);
      aiText = result.response.text() || "I apologize, I was unable to generate a response at this time.";
    } catch (apiError) {
      console.error("Gemini API error details:", apiError);
      return res.status(500).json({
        success: false,
        message: `Gemini API error: ${apiError.message || 'Response generation failed'}`,
        details: apiError
      });
    }

    // Append AI response (mapping assistant back to model role for AIChat database validation schema)
    chat.messages.push({
      role: 'model',
      content: aiText,
      timestamp: new Date()
    });

    // Update conversation details in MongoDB
    await chat.save();

    res.status(200).json({
      success: true,
      chat
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rename a chat conversation.
 * @route PUT /api/ai-chat/:chatId
 * @access Private
 */
export const renameChat = async (req, res, next) => {
  const { chatId } = req.params;
  const { title } = req.body;

  try {
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const chat = await AIChat.findOneAndUpdate(
      { _id: chatId, userId: req.user._id },
      { title: title.trim() },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat conversation not found'
      });
    }

    res.status(200).json({
      success: true,
      chat
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a chat conversation.
 * @route DELETE /api/ai-chat/:chatId
 * @access Private
 */
export const deleteChat = async (req, res, next) => {
  const { chatId } = req.params;

  try {
    const chat = await AIChat.findOneAndDelete({ _id: chatId, userId: req.user._id });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat conversation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear all chat history conversations for the user.
 * @route DELETE /api/ai-chat
 * @access Private
 */
export const clearAllChats = async (req, res, next) => {
  try {
    await AIChat.deleteMany({ userId: req.user._id });
    res.status(200).json({
      success: true,
      message: 'All chats cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};