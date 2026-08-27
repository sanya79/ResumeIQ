import "dotenv/config";
import path from "path";

import app from "./app.js";
import { connectDb } from "./config/db.js";
import logger from "./utils/logger.js";

// Handle uncaught exceptions gracefully without crashing server
process.on("uncaughtException", (err) => {
  logger.error(`[Server Error] Uncaught Exception: ${err?.message || err}`, { stack: err?.stack });
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

    logger.error(`[Server Error] Startup error: ${error?.message || error}`, { stack: error?.stack });
  });

  process.on("unhandledRejection", (err) => {
    logger.error(`[Server Error] Unhandled Promise Rejection: ${err?.message || err}`, { stack: err?.stack });
  });
};

// Initialize MongoDB and start Express listener
const startServer = async () => {
  await connectDb();
  startServerOnPort(preferredPort);
};

startServer();
