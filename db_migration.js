
import { neon } from '@neondatabase/serverless';

import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('DATABASE_URL is not set in .env');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function runMigration() {
    try {
        console.log('Starting migration...');

        // Check if column exists
        const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'team_members' AND column_name = 'display_order'
    `;

        if (columns.length === 0) {
            console.log('Adding display_order column...');
            await sql`ALTER TABLE team_members ADD COLUMN display_order INTEGER`;

            console.log('Initializing display_order with id...');
            await sql`UPDATE team_members SET display_order = id WHERE display_order IS NULL`;

            console.log('Migration successful: Added display_order column.');
        } else {
            console.log('Column display_order already exists.');
        }

    } catch (error) {
        console.error('Migration failed:', error);
    }
}

runMigration();
