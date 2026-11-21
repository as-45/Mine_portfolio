// Runs BEFORE each test file is loaded, so src/config/env.ts sees these values.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long';
process.env.MONGODB_URI = 'mongodb://placeholder-not-used-in-tests';
// Make sure tests never send real emails, even if .env has a Resend key.
process.env.RESEND_API_KEY = '';
