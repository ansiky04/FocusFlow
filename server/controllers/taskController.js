import Task from '../models/Task.js';

/**
 * Fetch all tasks belonging to the currently authenticated user.
 * @route GET /api/tasks
 * @access Private
 */
export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new task for the authenticated user.
 * @route POST /api/tasks
 * @access Private
 */
export const createTask = async (req, res, next) => {
  const { title, description, priority, status, completed, dueDate, relatedHabitId, relatedHabitTitle } = req.body;

  try {
    // 1. Validation check
    if (!title || !title.trim()) {
      res.status(400);
      throw new Error('Task title is required');
    }

    // 2. Format priority (high -> High, etc.) to match Mongoose schema enums
    let priorityFormatted = 'Medium';
    if (priority) {
      priorityFormatted = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
    }

    // 3. Format status (pending -> Pending, or completed boolean checks)
    let statusFormatted = 'Pending';
    if (completed !== undefined) {
      statusFormatted = completed ? 'Completed' : 'Pending';
    } else if (status) {
      statusFormatted = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }

    // 4. Save Task
    const task = await Task.create({
      userId: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priorityFormatted,
      status: statusFormatted,
      dueDate: dueDate || undefined,
      completedAt: statusFormatted === 'Completed' ? new Date() : undefined,
      relatedHabitId: relatedHabitId || undefined,
      relatedHabitTitle: relatedHabitTitle || undefined
    });

    res.status(201).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing task matching the task ID and belonging to the user.
 * @route PUT /api/tasks/:id
 * @access Private
 */
export const updateTask = async (req, res, next) => {
  const { title, description, priority, status, completed, dueDate, relatedHabitId, relatedHabitTitle } = req.body;

  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      res.status(404);
      throw new Error('Task not found or user is not authorized');
    }

    // Update title and description if provided
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();

    // Map and update priority
    if (priority !== undefined) {
      task.priority = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
    }

    // Map and update status / completion timestamp
    if (completed !== undefined) {
      task.status = completed ? 'Completed' : 'Pending';
      task.completedAt = completed ? new Date() : undefined;
    } else if (status !== undefined) {
      task.status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      task.completedAt = task.status === 'Completed' ? new Date() : undefined;
    }

    // Update dueDate
    if (dueDate !== undefined) {
      task.dueDate = dueDate || undefined;
    }

    // Update related habit link
    if (relatedHabitId !== undefined) {
      task.relatedHabitId = relatedHabitId || undefined;
    }
    if (relatedHabitTitle !== undefined) {
      task.relatedHabitTitle = relatedHabitTitle || undefined;
    }

    const updatedTask = await task.save();

    res.status(200).json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task belonging to the user.
 * @route DELETE /api/tasks/:id
 * @access Private
 */
export const deleteTask = async (req, res, next) => {
  try {
    const result = await Task.deleteOne({ _id: req.params.id, userId: req.user._id });

    if (result.deletedCount === 0) {
      res.status(404);
      throw new Error('Task not found or user is not authorized');
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
