
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
        console.log('Starting KPI table migration...');

        // Create KPIs table
        await sql`
            CREATE TABLE IF NOT EXISTS kpis (
                id SERIAL PRIMARY KEY,
                category TEXT NOT NULL,
                initiative TEXT NOT NULL,
                weight TEXT,
                indicator_item TEXT,
                indicator_weight TEXT,
                unit TEXT,
                target_2025 TEXT,
                remarks TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;

        console.log('✅ kpis table created successfully.');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

runMigration();
