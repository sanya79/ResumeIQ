import mongoose from "mongoose";

/**
 * MongoDB Mongoose Connection Manager
 * Configures connection parameters, handles retries, and registers operational logs.
 */
export const connectDb = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/resumeiq";

  const options = {
    autoIndex: true, // Build indexes automatically in dev (disable in heavy production)
  };

  try {
    mongoose.connection.on("connecting", () => {
      console.log("[Database] Connecting to MongoDB...");
    });

    mongoose.connection.on("connected", () => {
      console.log("[Database] Successfully connected to MongoDB.");
    });

    mongoose.connection.on("error", (err) => {
      console.error("[Database] Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("[Database] MongoDB connection lost. Attempting reconnection...");
    });

    await mongoose.connect(mongoUri, options);
  } catch (error) {
    console.error("[Database] Initial MongoDB connection failed:", error);
    process.exit(1); // Exit server process if initial database connection fails
  }
};

export default connectDb;
