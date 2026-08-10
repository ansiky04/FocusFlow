import Habit from '../models/Habit.js';

/**
 * Fetch all habits belonging to the authenticated user.
 * @route GET /api/habits
 * @access Private
 */
export const getHabits = async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: habits.length,
      habits,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new habit for the authenticated user.
 * @route POST /api/habits
 * @access Private
 */
export const createHabit = async (req, res, next) => {
  const { 
    name, 
    description, 
    category, 
    icon, 
    color, 
    goalType, 
    measurementType, 
    targetValue, 
    customUnit, 
    repeat, 
    specificDays, 
    priority, 
    isArchived,
    logs 
  } = req.body;

  try {
    if (!name || !name.trim()) {
      res.status(400);
      throw new Error('Habit name is required');
    }

    const habit = await Habit.create({
      userId: req.user._id,
      name: name.trim(),
      description: description ? description.trim() : '',
      category: category || 'Study',
      icon: icon || 'BookOpen',
      color: color || 'indigo',
      goalType: goalType || 'Daily',
      measurementType: measurementType || 'checkbox',
      targetValue: targetValue || 1,
      customUnit: customUnit || '',
      repeat: repeat || 'daily',
      specificDays: specificDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      priority: priority || 'Medium',
      isArchived: isArchived || false,
      logs: logs || {}
    });

    res.status(201).json({
      success: true,
      habit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing habit matching ID and belonging to user.
 * @route PUT /api/habits/:id
 * @access Private
 */
export const updateHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });

    if (!habit) {
      res.status(404);
      throw new Error('Habit not found or user unauthorized');
    }

    const allowedUpdates = [
      'name', 'description', 'category', 'icon', 'color', 'goalType',
      'measurementType', 'targetValue', 'customUnit', 'repeat',
      'specificDays', 'priority', 'isArchived', 'logs'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        habit[field] = req.body[field];
      }
    });

    const updatedHabit = await habit.save();

    res.status(200).json({
      success: true,
      habit: updatedHabit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a habit's log for a specific dateKey.
 * @route POST /api/habits/:id/log
 * @access Private
 */
export const updateHabitLog = async (req, res, next) => {
  const { dateKey, completed, value } = req.body;

  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });

    if (!habit) {
      res.status(404);
      throw new Error('Habit not found or user unauthorized');
    }

    if (!dateKey) {
      res.status(400);
      throw new Error('dateKey is required to log habit completion');
    }

    if (!habit.logs) habit.logs = new Map();
    
    if (completed === undefined && value === undefined) {
      habit.logs.delete(dateKey);
    } else {
      habit.logs.set(dateKey, {
        completed: Boolean(completed),
        value: Number(value) || 1
      });
    }

    const updatedHabit = await habit.save();

    res.status(200).json({
      success: true,
      habit: updatedHabit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a habit belonging to the user.
 * @route DELETE /api/habits/:id
 * @access Private
 */
export const deleteHabit = async (req, res, next) => {
  try {
    const result = await Habit.deleteOne({ _id: req.params.id, userId: req.user._id });

    if (result.deletedCount === 0) {
      res.status(404);
      throw new Error('Habit not found or user unauthorized');
    }

    res.status(200).json({
      success: true,
      message: 'Habit deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
