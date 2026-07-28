import dotenv from "dotenv";
import path from "path";

// Configure dotenv to read variables from .env file
dotenv.config();

import app from "./app.js";
import { connectDb } from "./config/db.js";
import logger from "./utils/logger.js";

// Handle uncaught exceptions before server starts up
process.on("uncaughtException", (err) => {
  logger.error(`UNCAUGHT EXCEPTION! Shutting down server... \nError: ${err.message} \nStack: ${err.stack}`);
  process.exit(1);
});

const port = process.env.PORT || 5000;

// Initialize MongoDB and start Express listener
const startServer = async () => {
  await connectDb();

  const server = app.listen(port, () => {
    logger.info(`[Server] ResumeIQ backend active in [${process.env.NODE_ENV}] mode on port: ${port}`);
  });

  // Handle unhandled promise rejections gracefully
  process.on("unhandledRejection", (err) => {
    logger.error(`UNHANDLED PROMISE REJECTION! Shutting down server... \nError: ${err.message} \nStack: ${err.stack}`);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();
