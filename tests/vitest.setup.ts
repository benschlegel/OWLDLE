import { afterAll, beforeAll, vitest } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';

// stubEnv needs to be here so env is stubbed in time for init code in databaseAccess.ts
const mongoInstance = await MongoMemoryServer.create();
const uri = mongoInstance.getUri();
vitest.stubEnv('MONGO_URI', uri);

beforeAll((a) => {
	console.log('stubbed env: ', uri);
});

afterAll(async () => {
	await mongoInstance.stop();
	vitest.unstubAllEnvs();
});
