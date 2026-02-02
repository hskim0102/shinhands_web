
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
        console.log('Starting KPI Current Achievement migration...');

        // Add column for current achievement
        await sql`
            ALTER TABLE kpis 
            ADD COLUMN IF NOT EXISTS current_achievement TEXT
        `;

        console.log('✅ Added current_achievement column to kpis table.');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

runMigration();
