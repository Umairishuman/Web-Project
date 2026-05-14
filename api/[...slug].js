// Vercel serverless wrapper for the Express backend.
// Catch-all dynamic route: matches every /api/* request.
// MongoDB connection is cached across warm invocations.

const mongoose = require('mongoose');
const app = require('../backend/app');

let connectionPromise = null;

async function ensureDb() {
  if (mongoose.connection.readyState === 1) return;
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000,
      })
      .catch((err) => {
        connectionPromise = null;
        throw err;
      });
  }
  await connectionPromise;
}

module.exports = async (req, res) => {
  try {
    await ensureDb();
  } catch (err) {
    console.error('DB connection failed:', err.message);
    res.status(503).json({ success: false, message: 'Database unavailable' });
    return;
  }
  return app(req, res);
};
