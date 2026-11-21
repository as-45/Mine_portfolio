import { env } from '../config/env';
import { connectDB, disconnectDB } from '../config/db';
import { AdminUser } from '../models/AdminUser';
import { hashPassword } from '../services/auth.service';

async function createAdmin() {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before running this script');
  }

  await connectDB(env.MONGODB_URI);
  await AdminUser.syncIndexes();

  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);

  const result = await AdminUser.updateOne(
    { email: env.ADMIN_EMAIL.toLowerCase() },
    { $set: { email: env.ADMIN_EMAIL.toLowerCase(), passwordHash } },
    { upsert: true },
  );

  const action = result.upsertedCount > 0 ? 'created' : 'updated (password reset)';
  console.log(`👤 Admin ${env.ADMIN_EMAIL} ${action}`);
  console.log('🔒 Now remove ADMIN_PASSWORD from your .env file');
}

createAdmin()
  .catch((err) => {
    console.error('❌ Could not create admin:', err.message);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
