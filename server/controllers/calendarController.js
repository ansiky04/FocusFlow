import CalendarEvent from '../models/CalendarEvent.js';

// @desc    Get user's calendar events
// @route   GET /api/calendar
// @access  Private
export const getCalendarEvents = async (req, res, next) => {
  try {
    const { search, category, priority, startDate, endDate } = req.query;
    
    // Build query object
    const query = { userId: req.user._id };
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Priority filter
    if (priority) {
      query.priority = priority;
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }
    
    const events = await CalendarEvent.find(query).sort({ date: 1, startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new calendar event
// @route   POST /api/calendar
// @access  Private
export const createCalendarEvent = async (req, res, next) => {
  try {
    const { title, description, date, startTime, endTime, priority, category, reminderOffset } = req.body;
    
    if (!title || !date || !startTime || !endTime || !category) {
      res.status(400);
      throw new Error('Title, date, start time, end time, and category are required');
    }
    
    const event = await CalendarEvent.create({
      userId: req.user._id,
      title,
      description,
      date,
      startTime,
      endTime,
      priority,
      category,
      reminderOffset
    });
    
    res.status(201).json({
      success: true,
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update calendar event
// @route   PUT /api/calendar/:id
// @access  Private
export const updateCalendarEvent = async (req, res, next) => {
  try {
    const { title, description, date, startTime, endTime, priority, category, reminderOffset } = req.body;
    
    let event = await CalendarEvent.findById(req.params.id);
    
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }
    
    // Check ownership
    if (event.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to update this event');
    }
    
    const updatedFields = {};
    if (title !== undefined) updatedFields.title = title;
    if (description !== undefined) updatedFields.description = description;
    if (date !== undefined) updatedFields.date = date;
    if (startTime !== undefined) updatedFields.startTime = startTime;
    if (endTime !== undefined) updatedFields.endTime = endTime;
    if (priority !== undefined) updatedFields.priority = priority;
    if (category !== undefined) updatedFields.category = category;
    if (reminderOffset !== undefined) updatedFields.reminderOffset = reminderOffset;
    
    event = await CalendarEvent.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete calendar event
// @route   DELETE /api/calendar/:id
// @access  Private
export const deleteCalendarEvent = async (req, res, next) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);
    
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }
    
    // Check ownership
    if (event.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to delete this event');
    }
    
    await event.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Event removed',
    });
  } catch (error) {
    next(error);
  }
};
