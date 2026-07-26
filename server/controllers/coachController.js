import CoachReport from '../models/CoachReport.js';
import FocusSession from '../models/FocusSession.js';
import FocusAttempt from '../models/FocusAttempt.js';

/**
 * Generate a new AI Coach productivity report from past logs.
 * @route POST /api/coach/generate
 * @access Private
 */
export const generateCoachReport = async (req, res, next) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    // 1. Gather historical metrics
    const sessions = await FocusSession.find({
      userId: req.user._id,
      createdAt: { $gte: startOfWeek }
    });

    const attempts = await FocusAttempt.find({
      userId: req.user._id,
      time: { $gte: startOfWeek }
    });

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.completed).length;
    const totalFocusSeconds = sessions.reduce((acc, s) => acc + (s.completed ? s.duration : 0), 0);
    const totalFocusHours = (totalFocusSeconds / 3600).toFixed(1);

    const attemptsLog = attempts.length > 0 
      ? attempts.map(a => `- Website: ${a.website} at ${new Date(a.time).toLocaleString()}`).join('\n')
      : 'None';

    // Placeholder data fallback if OpenRouter is unconfigured
    if (!process.env.OPENROUTER_API_KEY) {
      console.warn("[AICoach] OpenRouter API Key missing. Generating rich placeholder coaching analysis...");
      
      const suggestedBlocked = [...new Set(attempts.map(a => a.website))];
      if (suggestedBlocked.length === 0) {
        suggestedBlocked.push('youtube.com', 'instagram.com');
      }

      const report = await CoachReport.create({
        userId: req.user._id,
        weekStartDate: startOfWeek,
        strengths: [
          `Maintained focus for a total of ${totalFocusHours} hours across ${completedSessions} successful sessions.`,
          "Successfully avoided distractions during key work windows.",
          "Consistency in completing study timers."
        ],
        weaknesses: [
          attempts.length > 0 ? `Logged ${attempts.length} attempts to open distracting domains.` : "Minor inconsistencies in focus schedules.",
          "Vulnerability to social media/entertainment domains during afternoon hours."
        ],
        bestStudyTimings: [
          "9:00 AM - 12:00 PM (Highest focus consistency)",
          "4:00 PM - 6:00 PM (Solid work output)"
        ],
        suggestedBlockedWebsites: suggestedBlocked,
        weeklyProductivitySummary: `Over the past week, you completed ${completedSessions} out of ${totalSessions} focus blocks, accumulating ${totalFocusHours} hours of deep focus. You logged ${attempts.length} blocked distraction visits, indicating a strong support from your Focus Shield.`,
        motivationalFeedback: "Great effort this week! You are building excellent study muscles. Keep the Focus Shield active and try allocating your hardest tasks to the morning window!"
      });

      return res.status(201).json({
        success: true,
        report
      });
    }

    // 2. Prepare OpenRouter prompt
    const promptData = {
      focusHours: totalFocusHours,
      completedSessions,
      failedSessions: totalSessions - completedSessions,
      distractionsBlocked: attempts.length,
      distractionLog: attemptsLog
    };

    const systemPrompt = `You are FocusFlow AI Coach, an expert productivity counselor. 
    Analyze the provided focus sessions log and blocked attempts list, and return a JSON object ONLY. 
    Do NOT return any conversational preface, markdown wrappers, or trailing text.
    The response must exactly parse as a JSON object matching this schema:
    {
      "strengths": ["Strength detail 1", "Strength detail 2"],
      "weaknesses": ["Weakness detail 1", "Weakness detail 2"],
      "bestStudyTimings": ["Time range 1 (reason)", "Time range 2 (reason)"],
      "suggestedBlockedWebsites": ["domain1.com", "domain2.com"],
      "weeklyProductivitySummary": "Weekly summary text...",
      "motivationalFeedback": "Direct, encouraging coach feedback text..."
    }`;

    const userMessage = `Here is my productivity log from the past 7 days:
    - Total Focus Hours Logged: ${promptData.focusHours} hours
    - Completed Focus Sessions: ${promptData.completedSessions}
    - Mismatched or Cancelled Sessions: ${promptData.failedSessions}
    - Total Blocked Distractions: ${promptData.distractionsBlocked}
    
    Blocked Distraction Log:
    ${promptData.distractionLog}
    
    Please run a deep cognitive performance analysis.`;

    // 3. Request analysis from OpenRouter
    let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://github.com/FocusFlow',
        'X-Title': 'FocusFlow AI Coach'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ]
      })
    });

    // Fallback model call
    if (!response.ok) {
      console.warn("[AICoach] Primary Llama model failed. Calling Gemma fallback...");
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://github.com/FocusFlow',
          'X-Title': 'FocusFlow AI Coach'
        },
        body: JSON.stringify({
          model: 'google/gemma-4-26b-a4b-it:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ]
        })
      });
    }

    if (!response.ok) {
      throw new Error(`OpenRouter returned status ${response.status}`);
    }

    const resData = await response.json();
    const aiText = resData.choices?.[0]?.message?.content || '{}';

    // 4. Sanitize and parse JSON response
    let cleanText = aiText.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(json)?/, '');
      cleanText = cleanText.replace(/```$/, '');
      cleanText = cleanText.trim();
    }

    let parsedReport = {};
    try {
      parsedReport = JSON.parse(cleanText);
    } catch (parseErr) {
      console.error("[AICoach] Failed to parse AI JSON response. Text was:", aiText);
      throw new Error("Invalid format returned by AI model.");
    }

    // 5. Create report in MongoDB
    const report = await CoachReport.create({
      userId: req.user._id,
      weekStartDate: startOfWeek,
      strengths: parsedReport.strengths || [],
      weaknesses: parsedReport.weaknesses || [],
      bestStudyTimings: parsedReport.bestStudyTimings || [],
      suggestedBlockedWebsites: parsedReport.suggestedBlockedWebsites || [],
      weeklyProductivitySummary: parsedReport.weeklyProductivitySummary || 'Analysis complete.',
      motivationalFeedback: parsedReport.motivationalFeedback || 'Keep up the solid work!'
    });

    res.status(201).json({
      success: true,
      report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch past coach reports.
 * @route GET /api/coach/reports
 * @access Private
 */
export const getCoachReports = async (req, res, next) => {
  try {
    const reports = await CoachReport.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      reports
    });
  } catch (error) {
    next(error);
  }
};
