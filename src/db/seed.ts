import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
}

const main = async () => {
    const client = postgres(process.env.DATABASE_URL!);
    const db = drizzle(client, { schema });

    console.log('Seeding mock users...');

    const mockUsers = [
        { email: 'alex.king@thelastempire.com' },
        { email: 'maria.queen@thelastempire.com' },
        { email: 'commander.z@empire.net' },
        { email: 'scout.y@empire.net' },
        { email: 'citizen.x@empire.net' },
    ];

    await db.insert(schema.users).values(mockUsers).onConflictDoNothing();

    console.log('Seed completed successfully!');
    await client.end();
    process.exit(0);
};

main().catch((err) => {
    console.error('Seed failed!');
    console.error(err);
    process.exit(1);
});
