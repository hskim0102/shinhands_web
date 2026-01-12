
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_hQmoG50OIaNf@ep-plain-feather-ahu9a07b-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

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
