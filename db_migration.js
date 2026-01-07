
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_hQmoG50OIaNf@ep-plain-feather-ahu9a07b-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

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
