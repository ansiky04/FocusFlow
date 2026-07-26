import mongoose from 'mongoose';

/**
 * Handles database connection initialization and event logging.
 * NOTE: Do NOT call this function inside server.js yet as per Phase requirements.
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};
