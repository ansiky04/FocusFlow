import AIChat from '../models/AIChat.js';

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

    // If OpenRouter API key is missing, respond with a config warning instead of failing
    if (!process.env.OPENROUTER_API_KEY) {
      const warningText = "OpenRouter API Key is missing. Please configure OPENROUTER_API_KEY in the server's `.env` file to chat!";
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

    // Prepare context history parameters mapping for OpenRouter (OpenAI-compatible schema)
    const contextMessages = chat.messages.slice(-15);
    const apiMessages = [
      {
        role: 'system',
        content: "You are FocusFlow AI, a helpful, friendly, and professional assistant. Your primary priority is to assist users with study, programming, debugging, productivity, notes, and revision. However, you should also act as a general-purpose assistant, answering questions about general knowledge, technology, history, science, mathematics, geography, current affairs, biographies, and other educational queries. Only refuse requests if they are illegal, dangerous, or harmful. Keep all responses friendly, professional, concise, and structured. Format code blocks using markdown with language labels."
      },
      ...contextMessages.map(msg => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.content
      }))
    ];

    // Attempt the requested Llama 3.1 8B Instruct Free model first
    let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://github.com/FocusFlow',
        'X-Title': 'FocusFlow'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: apiMessages
      })
    });

    // If meta-llama/llama-3.1-8b-instruct:free fails (e.g. 404 due to retirement), fall back to google/gemma-4-26b-a4b-it:free
    if (!response.ok) {
      console.warn("Llama 3.1 Free model is unavailable or returned an error. Falling back to google/gemma-4-26b-a4b-it:free...");
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://github.com/FocusFlow',
          'X-Title': 'FocusFlow'
        },
        body: JSON.stringify({
          model: 'google/gemma-4-26b-a4b-it:free',
          messages: apiMessages
        })
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API error details:", response.status, errorData);
      return res.status(response.status).json({
        success: false,
        message: `OpenRouter API error: ${response.statusText || 'Response generation failed'}`,
        details: errorData
      });
    }

    const responseData = await response.json();
    const aiText = responseData.choices?.[0]?.message?.content || "I apologize, I was unable to generate a response at this time.";

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