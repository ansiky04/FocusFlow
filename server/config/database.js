import mongoose from 'mongoose';

/**
 * Configures and establishes connection to MongoDB using Mongoose client.
 * Server starts offline-first if MONGODB_URI is not declared in environment variables.
 */
export const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("Database connection warning: MONGODB_URI is missing or undefined in .env. Starting server in offline database mode.");
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Do not terminate application in development mode so server remains online
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
