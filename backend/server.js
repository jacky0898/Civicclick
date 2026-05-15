const { PORT, NODE_ENV } = require('./config/env'); // validates all env vars on startup
const { connectDB } = require('./config/db');
const app = require('./app');

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] CivicClick running on port ${PORT} (${NODE_ENV})`);
  });
};

start().catch((err) => {
  console.error('[server] Failed to start:', err.message);
  process.exit(1);
});
