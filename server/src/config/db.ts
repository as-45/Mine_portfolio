import mongoose from 'mongoose';

export async function connectDB(uri: string) {
  mongoose.connection.on('connected', () => console.log('✅ MongoDB connected'));
  mongoose.connection.on('disconnected', () => console.log('⚠️  MongoDB disconnected'));
  mongoose.connection.on('error', (err) => console.error('❌ MongoDB error:', err.message));

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
}

export async function disconnectDB() {
  await mongoose.disconnect();
}

const STATES: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

export function getDBStatus() {
  return STATES[mongoose.connection.readyState] ?? 'unknown';
}
