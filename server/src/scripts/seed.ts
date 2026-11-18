import { env } from '../config/env';
import { connectDB, disconnectDB } from '../config/db';
import { Project } from '../models/Project';
import { seedProjects } from '../data/projects.seed';

async function seed() {
  await connectDB(env.MONGODB_URI);

  await Project.syncIndexes();

  let created = 0;
  let updated = 0;

  for (const data of seedProjects) {
    const result = await Project.updateOne(
      { slug: data.slug },
      { $set: data },
      {
        upsert: true,
        runValidators: true,
      },
    );
    if (result.upsertedCount > 0) created++;
    else if (result.modifiedCount > 0) updated++;
  }

  const total = await Project.countDocuments();
  console.log(`🌱 Seed done: ${created} created, ${updated} updated, ${total} projects in total`);
}

seed()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());