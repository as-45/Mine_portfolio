import { afterAll, afterEach, beforeAll } from '@jest/globals';
import os from 'node:os';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongo: MongoMemoryServer | undefined;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  // Jest's sandbox can't run the driver's dynamic import('os'), so we pass `os` in directly.
  // Without this, the driver sends an empty handshake and MongoDB 8 rejects the connection.
  await mongoose.connect(mongo.getUri(), { runtimeAdapters: { os } });
  await mongoose.connection.syncIndexes();
}, 120_000);

afterEach(async () => {
  const db = mongoose.connection.db;
  if (!db) return; // database never started: don't hide the real error with a second one

  const collections = await db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});