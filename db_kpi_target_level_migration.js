
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = 'postgresql://neondb_owner:npg_hQmoG50OIaNf@ep-plain-feather-ahu9a07b-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

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
