import "dotenv/config";
import path from "path";

import app from "./app.js";
import { connectDb } from "./config/db.js";
import logger from "./utils/logger.js";

// Handle uncaught exceptions before server starts up
process.on("uncaughtException", (err) => {
  logger.error(`UNCAUGHT EXCEPTION! Shutting down server... \nError: ${err.message} \nStack: ${err.stack}`);
  process.exit(1);
});

const preferredPort = Number(process.env.PORT || 5000);

const startServerOnPort = (port) => {
  const server = app.listen(port, () => {
    logger.info(`[Server] ResumeIQ backend active in [${process.env.NODE_ENV}] mode on port: ${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      const fallbackPort = port + 1;
      logger.warn(`[Server] Port ${port} is busy. Retrying on port ${fallbackPort}...`);
      server.close(() => startServerOnPort(fallbackPort));
      return;
    }

    logger.error(`SERVER STARTUP ERROR! Shutting down... \nError: ${error.message} \nStack: ${error.stack}`);
    process.exit(1);
  });

  process.on("unhandledRejection", (err) => {
    logger.error(`UNHANDLED PROMISE REJECTION! Shutting down server... \nError: ${err.message} \nStack: ${err.stack}`);
    server.close(() => {
      process.exit(1);
    });
  });
};

// Initialize Express listener first (so Render binds port immediately), then connect to MongoDB
const startServer = async () => {
  startServerOnPort(preferredPort);
  try {
    await connectDb();
  } catch (err) {
    logger.error(`[Database] Connection failed: ${err.message}`);
  }
};

startServer();
