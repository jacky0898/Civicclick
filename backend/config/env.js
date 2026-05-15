require('dotenv').config();

// ─── Required — server will not start without these ───────
const required = [
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

// ─── Optional — warnings only, server still starts ────────
const optional = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'ALLOWED_ORIGINS',
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `[env] Missing required environment variables: ${missing.join(', ')}\n` +
    'Copy backend/.env.example to backend/.env and fill in the values.'
  );
}

for (const key of optional) {
  if (!process.env[key]) {
    const hint =
      key.startsWith('CLOUDINARY') ? 'Image file uploads will fail (JSON imageUrl still works).' :
      key === 'ALLOWED_ORIGINS'    ? 'Defaulting to http://localhost:3000.' :
      '';
    console.warn(`[env] Warning: ${key} is not set. ${hint}`);
  }
}

module.exports = {
  NODE_ENV:               process.env.NODE_ENV || 'development',
  PORT:                   parseInt(process.env.PORT, 10),
  MONGO_URI:              process.env.MONGO_URI,
  JWT_SECRET:             process.env.JWT_SECRET,
  JWT_REFRESH_SECRET:     process.env.JWT_REFRESH_SECRET,
  // JWT_EXPIRES_IN and JWT_REFRESH_EXPIRES_IN are documented in .env.example
  // but the values are hardcoded in auth.service.js ('15m', '7d') for simplicity.
  // To make them configurable, update auth.service.js to read these values.
  CLOUDINARY_CLOUD_NAME:  process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY:     process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET:  process.env.CLOUDINARY_API_SECRET,
  ALLOWED_ORIGINS:        process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
};
