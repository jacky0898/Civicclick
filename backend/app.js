const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/error.middleware');
const { ALLOWED_ORIGINS } = require('./config/env');

const authRoutes = require('./modules/auth/auth.routes');
const issuesRoutes = require('./modules/issues/issues.routes');
const volunteerRoutes = require('./modules/volunteer/volunteer.routes');
const sponsorshipRoutes = require('./modules/sponsorship/sponsorship.routes');
const leaderboardRoutes = require('./modules/leaderboard/leaderboard.routes');

const app = express();

// CORS — origins controlled via ALLOWED_ORIGINS env var
const allowedOrigins = ALLOWED_ORIGINS.split(',').map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/auth', authRoutes);
app.use('/issues', issuesRoutes);
app.use('/volunteer', volunteerRoutes);
app.use('/sponsorship', sponsorshipRoutes);
app.use('/leaderboard', leaderboardRoutes);

// 404 catch-all
app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
