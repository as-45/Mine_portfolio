import { createApp } from './app';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/db';

async function start() {
  await connectDB(env.MONGODB_URI);

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received, shutting down...`);
    server.close();
    await disconnectDB();
    console.log('👋 MongoDB connection closed, bye');
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

start().catch((err) => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});
