const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('🚀 인증 컬럼 추가 마이그레이션 시작...');

        await client.query('BEGIN');

        // 1. emp_id 컬럼 추가 (사번)
        console.log('📝 emp_id 컬럼 추가 중...');
        await client.query(`
      ALTER TABLE team_members 
      ADD COLUMN IF NOT EXISTS emp_id VARCHAR(50);
    `);

        // 2. password 컬럼 추가 (비밀번호)
        console.log('📝 password 컬럼 추가 중...');
        await client.query(`
      ALTER TABLE team_members 
      ADD COLUMN IF NOT EXISTS password VARCHAR(255);
    `);

        // 3. 기존 데이터 초기화
        console.log('🔄 기존 멤버 데이터 초기화 중...');
        // emp_id가 없는 경우 id값으로 설정, password가 없는 경우 '1234'로 설정
        await client.query(`
      UPDATE team_members 
      SET 
        emp_id = id::text, 
        password = '1234' 
      WHERE emp_id IS NULL OR password IS NULL;
    `);

        // 4. emp_id 유니크 제약조건 추가 (데이터 채운 후)
        console.log('🔒 emp_id 유니크 제약조건 추가 중...');
        // 기존에 제약조건이 없을 때만 추가
        await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'team_members_emp_id_key'
        ) THEN
          ALTER TABLE team_members ADD CONSTRAINT team_members_emp_id_key UNIQUE (emp_id);
        END IF;
      END
      $$;
    `);

        await client.query('COMMIT');
        console.log('✅ 마이그레이션 완료!');

        // 결과 확인
        const res = await client.query('SELECT name, emp_id, password FROM team_members LIMIT 5');
        console.log('\n확인된 데이터 샘플:');
        console.table(res.rows);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ 마이그레이션 실패:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
