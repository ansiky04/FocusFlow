import StudyPlan from '../models/StudyPlan.js';

/**
 * Generate a new AI Study Plan schedule.
 * @route POST /api/study-plans/generate
 * @access Private
 */
export const generateStudyPlan = async (req, res, next) => {
  const { examDate, availableStudyHours, subjects, difficultyLevel, revisionDays, breakDays } = req.body;

  try {
    if (!examDate || !availableStudyHours || !subjects || !difficultyLevel) {
      return res.status(400).json({
        success: false,
        message: 'Exam date, available study hours, subjects, and difficulty level are required'
      });
    }

    const targetDate = new Date(examDate);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const totalDays = Math.max(1, Math.min(30, Math.ceil(diffTime / (1000 * 60 * 60 * 24))));

    const parsedSubjects = Array.isArray(subjects) 
      ? subjects 
      : subjects.split(',').map(s => s.trim()).filter(Boolean);

    // Mock fallback study plan if OpenRouter key is missing
    if (!process.env.OPENROUTER_API_KEY) {
      console.warn("[StudyPlanner] OpenRouter API Key missing. Generating rich fallback study schedule...");
      
      const mockDays = [];
      for (let i = 1; i <= totalDays; i++) {
        const subject = parsedSubjects[(i - 1) % parsedSubjects.length] || 'General Studies';
        const isRevision = i > (totalDays - (Number(revisionDays) || 0));
        const isBreak = i % 7 === 0 && (Number(breakDays) || 0) > 0;

        if (isBreak) {
          mockDays.push({
            dayNumber: i,
            subject: 'Rest & Recovery',
            topic: 'Rest Day - Recharge your brain muscles',
            tasks: [
              { id: `t_${i}_1`, task: 'Light review of study goals', duration: '15m session', completed: false },
              { id: `t_${i}_2`, task: 'Rest, hydrate, and stretch', duration: '30m break', completed: false }
            ]
          });
        } else if (isRevision) {
          mockDays.push({
            dayNumber: i,
            subject: `${subject} (Revision)`,
            topic: `Practice & Mock review of ${subject}`,
            tasks: [
              { id: `t_${i}_1`, task: 'Solve past papers and questions', duration: '50m session', completed: false },
              { id: `t_${i}_2`, task: 'Review weak spots from flashcard history', duration: '25m session', completed: false }
            ]
          });
        } else {
          mockDays.push({
            dayNumber: i,
            subject: subject,
            topic: `Core concepts of ${subject} (Level: ${difficultyLevel})`,
            tasks: [
              { id: `t_${i}_1`, task: `Read study notes and syllabus modules for ${subject}`, duration: '50m session', completed: false },
              { id: `t_${i}_2`, task: `Complete exercises and summarize formulas`, duration: '50m session', completed: false },
              { id: `t_${i}_3`, task: 'Complete self-test questions', duration: '25m session', completed: false }
            ]
          });
        }
      }

      const plan = await StudyPlan.create({
        userId: req.user._id,
        examDate: targetDate,
        availableStudyHours: Number(availableStudyHours),
        subjects: parsedSubjects,
        difficultyLevel,
        revisionDays: Number(revisionDays) || 0,
        breakDays: Number(breakDays) || 0,
        days: mockDays
      });

      return res.status(201).json({
        success: true,
        plan
      });
    }

    // 2. Query OpenRouter
    const systemPrompt = `You are FocusFlow Study Planner AI, an expert scheduler.
    Generate a day-by-day study schedule starting from Day 1 up to Day ${totalDays} (which is the exam day window).
    Structure topics based on the subjects: [${parsedSubjects.join(', ')}], and difficulty level: ${difficultyLevel}.
    Incorporate ${revisionDays} revision days at the end of the schedule, and allocate ${breakDays} break/rest days interspersed.
    You must output a JSON object ONLY, with no extra conversational text or formatting.
    The response must exactly parse as a JSON object matching this schema:
    {
      "days": [
        {
          "dayNumber": 1,
          "subject": "Math",
          "topic": "Topic Name",
          "tasks": [
            { "id": "t_1_1", "task": "Read textbook chapter", "duration": "50m session", "completed": false }
          ]
        }
      ]
    }`;

    const userMessage = `Create a study plan for the next ${totalDays} days.
    Available Study Hours per Day: ${availableStudyHours}
    Subjects: ${parsedSubjects.join(', ')}
    Difficulty: ${difficultyLevel}
    Revision Days: ${revisionDays}
    Break Days: ${breakDays}`;

    let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://github.com/FocusFlow',
        'X-Title': 'FocusFlow Study Planner'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ]
      })
    });

    if (!response.ok) {
      console.warn("[StudyPlanner] Primary Llama model failed. Calling Gemma fallback...");
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://github.com/FocusFlow',
          'X-Title': 'FocusFlow Study Planner'
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

    // Parse JSON
    let cleanText = aiText.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(json)?/, '');
      cleanText = cleanText.replace(/```$/, '');
      cleanText = cleanText.trim();
    }

    let parsedPlan = {};
    try {
      parsedPlan = JSON.parse(cleanText);
    } catch (parseErr) {
      console.error("[StudyPlanner] Failed to parse AI JSON response. Text was:", aiText);
      throw new Error("Invalid format returned by AI study planner model.");
    }

    const plan = await StudyPlan.create({
      userId: req.user._id,
      examDate: targetDate,
      availableStudyHours: Number(availableStudyHours),
      subjects: parsedSubjects,
      difficultyLevel,
      revisionDays: Number(revisionDays) || 0,
      breakDays: Number(breakDays) || 0,
      days: parsedPlan.days || []
    });

    res.status(201).json({
      success: true,
      plan
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch user's study plans.
 * @route GET /api/study-plans
 * @access Private
 */
export const getStudyPlans = async (req, res, next) => {
  try {
    const plans = await StudyPlan.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      plans
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update the checkbox progress status of a specific task inside a study plan.
 * @route PUT /api/study-plans/:id/progress
 * @access Private
 */
export const updateStudyPlanProgress = async (req, res, next) => {
  const { dayNumber, taskId, completed } = req.body;

  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found'
      });
    }

    const day = plan.days.find(d => d.dayNumber === Number(dayNumber));
    if (day) {
      const task = day.tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !!completed;
        plan.markModified('days');
        await plan.save();
      } else {
        return res.status(404).json({
          success: false,
          message: 'Task not found in selected day'
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        message: 'Day not found in selected study plan'
      });
    }

    res.status(200).json({
      success: true,
      plan
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a study plan.
 * @route DELETE /api/study-plans/:id
 * @access Private
 */
export const deleteStudyPlan = async (req, res, next) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Study plan deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
