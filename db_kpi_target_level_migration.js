
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
        console.log('Starting KPI Target Level migration...');

        // Add columns for target levels
        await sql`
            ALTER TABLE kpis 
            ADD COLUMN IF NOT EXISTS target_s TEXT,
            ADD COLUMN IF NOT EXISTS target_a TEXT,
            ADD COLUMN IF NOT EXISTS target_b_plus TEXT,
            ADD COLUMN IF NOT EXISTS target_b TEXT,
            ADD COLUMN IF NOT EXISTS target_b_minus TEXT,
            ADD COLUMN IF NOT EXISTS target_c TEXT,
            ADD COLUMN IF NOT EXISTS target_d TEXT
        `;

        console.log('✅ Added target level columns to kpis table.');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

runMigration();
