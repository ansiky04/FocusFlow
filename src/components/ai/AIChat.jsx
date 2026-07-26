import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Trash2, Copy, Check, MessageSquare, Edit3, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Simple suggestions to help users get started
const SUGGESTIONS = [
  'Explain Binary Search',
  'Give me a study plan',
  'Suggest productivity tips',
  'Explain difficult topics in simple language'
];

/**
 * Custom Markdown and Basic Syntax Highlighting Parser.
 * Avoids extra library dependencies and compiles cleanly in React Router and Vite.
 */
const parseMarkdown = (text) => {
  if (!text) return '';

  // Escaping script tags for safety
  let html = text.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');

  // 1. Code blocks: ```language ... ```
  const codeBlocks = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const id = `CODE_BLOCK_PLACEHOLDER_${codeBlocks.length}`;
    codeBlocks.push({ lang, code: code.trim() });
    return `\n\n${id}\n\n`;
  });

  // 2. Headings: ### title, ## title, # title
  html = html.replace(/^### (.*?)$/gm, '<h4 class="text-xs font-bold text-slate-800 dark:text-white mt-4 mb-1.5 uppercase tracking-wide">$1</h4>');
  html = html.replace(/^## (.*?)$/gm, '<h3 class="text-sm font-extrabold text-slate-800 dark:text-white mt-5 mb-2">$1</h3>');
  html = html.replace(/^# (.*?)$/gm, '<h2 class="text-base font-black text-slate-900 dark:text-white mt-6 mb-3">$1</h2>');

  // 3. Lists
  // Bullet lists: - item or * item
  html = html.replace(/^\s*[-*]\s+(.*?)$/gm, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300 leading-relaxed">$1</li>');
  // Numbered lists: 1. item
  html = html.replace(/^\s*\d+\.\s+(.*?)$/gm, '<li class="ml-4 list-decimal text-slate-700 dark:text-slate-300 leading-relaxed">$1</li>');

  // 4. Bold: **bold**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-slate-900 dark:text-white">$1</strong>');

  // 5. Italic: *italic*
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

  // 6. Inline code: `code`
  html = html.replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 px-1 py-0.5 rounded font-mono text-[11px] text-pink-600 dark:text-pink-400">$1</code>');

  // 7. Paragraphs & Newlines
  html = html.split('\n').map(line => {
    if (line.trim().startsWith('<h') || line.trim().startsWith('<li') || line.trim().includes('CODE_BLOCK_PLACEHOLDER')) {
      return line;
    }
    return line ? `${line}<br />` : '';
  }).join('\n');

  // 8. Restore Code Blocks and Apply Basic Highlighting
  codeBlocks.forEach((block, idx) => {
    const id = `CODE_BLOCK_PLACEHOLDER_${idx}`;
    let highlighted = block.code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Syntax highlighting for JS/CS keywords
    const keywords = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|export|import|from|default|new|this|async|await|try|catch|finally|throw)\b/g;
    highlighted = highlighted.replace(keywords, '<span class="text-pink-500 font-bold">$1</span>');

    // Single line and multi-line comments
    highlighted = highlighted.replace(/(\/\/.*)$/gm, '<span class="text-slate-450 dark:text-slate-500 italic">$1</span>');
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-slate-450 dark:text-slate-500 italic">$1</span>');

    // Strings
    highlighted = highlighted.replace(/(["'`])([\s\S]*?)\1/g, '<span class="text-emerald-500">$1$2$1</span>');

    const container = `
      <div class="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/70 my-3">
        <div class="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-100 dark:bg-slate-900/60 text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest">
          <span>${block.lang || 'code'}</span>
          <button 
            onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(block.code)}'))"
            class="hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            Copy
          </button>
        </div>
        <pre class="p-3.5 overflow-x-auto font-mono text-[11px] text-slate-800 dark:text-slate-200 leading-relaxed"><code>${highlighted}</code></pre>
      </div>
    `;
    html = html.replace(id, container);
  });

  return html;
};

export default function AIChat() {
  const { token } = useApp();
  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const chatEndRef = useRef(null);

  // Fetch all chat logs on mount
  useEffect(() => {
    const fetchConversations = async () => {
      if (!token) return;
      try {
        const response = await fetch('http://localhost:5000/api/ai-chat', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.chats && data.chats.length > 0) {
          setConversations(data.chats);
          setActiveChatId(data.chats[0]._id);
        }
      } catch (err) {
        console.error("Failed to load chat conversations:", err);
      }
    };
    fetchConversations();
  }, [token]);

  // Scroll to the bottom of the message thread
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeChatId, isTyping]);

  const activeChat = conversations.find(c => c._id === activeChatId);

  const loadDefaultMessage = () => {
    return {
      sender: 'ai',
      text: "Hello! I am your FocusFlow AI assistant. Start a new chat, ask study questions, explain programming concepts, or request productivity tips to get started!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    setInputText('');
    setIsTyping(true);

    const userMessageObj = {
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date()
    };

    // Optimistically update frontend history state
    let tempChatId = activeChatId;
    if (tempChatId) {
      setConversations(prev =>
        prev.map(c => {
          if (c._id === tempChatId) {
            return { ...c, messages: [...c.messages, userMessageObj] };
          }
          return c;
        })
      );
    } else {
      // Local placeholder conversation during initial creation
      const placeholderId = `temp_${Date.now()}`;
      tempChatId = placeholderId;
      const newPlaceholderChat = {
        _id: placeholderId,
        title: textToSend.trim().substring(0, 20),
        messages: [userMessageObj],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setConversations(prev => [newPlaceholderChat, ...prev]);
      setActiveChatId(placeholderId);
    }

    try {
      const response = await fetch('http://localhost:5000/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          chatId: String(tempChatId).startsWith('temp_') ? undefined : tempChatId,
          message: textToSend.trim()
        })
      });

      const data = await response.json();
      if (data.success && data.chat) {
        // Swap placeholders with real database records
        setConversations(prev => {
          const filtered = prev.filter(c => c._id !== tempChatId && c._id !== data.chat._id);
          return [data.chat, ...filtered];
        });
        setActiveChatId(data.chat._id);
      } else {
        throw new Error(data.message || 'Failed to complete message dispatch');
      }
    } catch (err) {
      console.error('AI chat delivery error:', err);
      // Append an error notice inside the chat stream
      const errorMessageObj = {
        role: 'model',
        content: `Error: ${err.message || 'Unable to connect to assistant backend. Check server settings.'}`,
        timestamp: new Date()
      };
      setConversations(prev =>
        prev.map(c => {
          if (c._id === tempChatId) {
            return { ...c, messages: [...c.messages, errorMessageObj] };
          }
          return c;
        })
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleCreateNewChat = () => {
    setActiveChatId(null);
    setEditingChatId(null);
  };

  const handleStartRename = (e, chat) => {
    e.stopPropagation();
    setEditingChatId(chat._id);
    setEditingTitle(chat.title);
  };

  const handleSaveRename = async (chatId) => {
    if (!editingTitle.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/ai-chat/${chatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: editingTitle.trim() })
      });

      const data = await response.json();
      if (data.success && data.chat) {
        setConversations(prev =>
          prev.map(c => (c._id === chatId ? data.chat : c))
        );
      }
    } catch (err) {
      console.error('Rename request failed:', err);
    } finally {
      setEditingChatId(null);
    }
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/ai-chat/${chatId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setConversations(prev => prev.filter(c => c._id !== chatId));
        if (activeChatId === chatId) {
          const remaining = conversations.filter(c => c._id !== chatId);
          if (remaining.length > 0) {
            setActiveChatId(remaining[0]._id);
          } else {
            setActiveChatId(null);
          }
        }
      }
    } catch (err) {
      console.error('Delete request failed:', err);
    }
  };

  const handleCopyText = (text, msgId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(err => {
      console.error("Copy failed:", err);
    });
  };

  // Convert raw messages array to UI elements
  const renderMessages = () => {
    const defaultMsg = loadDefaultMessage();
    const list = activeChat ? activeChat.messages : [];

    if (list.length === 0) {
      return (
        <div className="flex gap-3 justify-start">
          <div className="h-7 w-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center flex-shrink-0">
            <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="max-w-[80%] flex flex-col">
            <div className="rounded-2xl px-4 py-2.5 text-xs md:text-sm font-medium leading-relaxed bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-850 rounded-tl-none shadow-sm">
              {defaultMsg.text}
            </div>
            <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-1 px-1">
              {defaultMsg.timestamp}
            </span>
          </div>
        </div>
      );
    }

    return list.map((msg, index) => {
      const isAI = msg.role === 'model';
      const msgId = msg._id || `msg_${index}`;
      const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

      return (
        <div key={msgId} className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}>
          {isAI && (
            <div className="h-7 w-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          )}

          <div className="max-w-[80%] flex flex-col">
            {isAI ? (
              <div 
                className="rounded-2xl px-4 py-2.5 text-xs md:text-sm font-medium leading-relaxed bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-850 rounded-tl-none shadow-sm markdown-body"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
              />
            ) : (
              <div className="rounded-2xl px-4 py-2.5 text-xs md:text-sm font-semibold leading-relaxed bg-indigo-600 text-white rounded-tr-none shadow-sm">
                {msg.content}
              </div>
            )}

            <div className={`flex items-center gap-2 mt-1 px-1 ${isAI ? 'justify-start' : 'justify-end'}`}>
              <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">
                {timeStr}
              </span>
              {isAI && (
                <button
                  onClick={() => handleCopyText(msg.content, msgId)}
                  className="text-slate-400 hover:text-slate-650 dark:text-slate-500 dark:hover:text-slate-350 p-0.5 rounded transition-colors cursor-pointer"
                  title="Copy content"
                >
                  {copiedId === msgId ? (
                    <Check className="h-3 w-3 text-emerald-500 animate-pulse" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              )}
            </div>
          </div>

          {!isAI && (
            <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-slate-650 dark:text-slate-300" />
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:shadow-xl dark:hover:shadow-indigo-950/20 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 flex flex-col md:flex-row h-[600px] shadow-sm">
      
      {/* Background decoration glow */}
      <div className="absolute -inset-px bg-gradient-to-r from-transparent via-slate-100/10 to-transparent dark:via-indigo-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

      {/* Sidebar - Conversations Panel */}
      <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800/80 flex flex-col flex-shrink-0 bg-slate-50/50 dark:bg-slate-950/20 h-[160px] md:h-full relative z-10">
        {/* Create Chat Area */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800/80 flex-shrink-0">
          <button
            onClick={handleCreateNewChat}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/40 rounded-xl transition-all duration-200 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chats list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {conversations.map(chat => {
            const isActive = chat._id === activeChatId;
            const isEditing = chat._id === editingChatId;

            return (
              <div
                key={chat._id}
                onClick={() => {
                  if (!isEditing) {
                    setActiveChatId(chat._id);
                    setEditingChatId(null);
                  }
                }}
                className={`group/item flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/30'
                    : 'text-slate-650 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-850/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 opacity-70" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => handleSaveRename(chat._id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(chat._id);
                        if (e.key === 'Escape') setEditingChatId(null);
                      }}
                      autoFocus
                      className="bg-white dark:bg-slate-900 text-slate-850 dark:text-white px-1.5 py-0.5 rounded border border-indigo-400 focus:outline-none w-full font-semibold"
                    />
                  ) : (
                    <span className="truncate pr-1">{chat.title}</span>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleStartRename(e, chat)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      title="Rename Chat"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteChat(e, chat._id)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      title="Delete Chat"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Column - Chat Window */}
      <div className="flex-1 flex flex-col min-w-0 h-full p-5 relative z-10">
        
        {/* Chat Window Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Bot className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {activeChat ? activeChat.title : 'New AI Conversation'}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide">
                FocusFlow AI • Powered by OpenRouter
              </p>
            </div>
          </div>
        </div>

        {/* Suggestion Chips (Visible only for empty/new chats) */}
        {(!activeChat || activeChat.messages.length === 0) && (
          <div className="flex flex-wrap gap-1.5 mb-3 flex-shrink-0 animate-fade-in">
            {SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(sug)}
                className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/60 border border-indigo-100/50 dark:border-indigo-900/40 px-2.5 py-1 rounded-full hover:scale-102 active:scale-98 transition-all duration-150 cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-4 min-h-0 custom-scrollbar">
          {renderMessages()}

          {/* Typing / Loading Indicators */}
          {isTyping && (
            <div className="flex gap-3 justify-start animate-pulse">
              <div className="h-7 w-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-bounce" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-850 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-550 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-550 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-550 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input box form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="flex gap-2 flex-shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            placeholder={isTyping ? "AI assistant is generating response..." : "Ask study questions, explain programming terms, summarize code..."}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs md:text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-100 dark:focus:border-indigo-500/80 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="rounded-xl bg-indigo-600 p-3 text-white shadow-md hover:bg-indigo-500 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:hover:bg-indigo-600 transition-all duration-150 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
