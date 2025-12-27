const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 데이터베이스 연결 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  const client = await pool.connect();
  try {
    console.log('🔍 데이터베이스 연결 테스트 중...');
    const result = await client.query('SELECT NOW()');
    console.log('✅ 데이터베이스 연결 성공:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
    return false;
  } finally {
    client.release();
  }
}

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 데이터베이스 마이그레이션을 시작합니다...');
    
    // 트랜잭션 시작
    await client.query('BEGIN');
    
    console.log('📝 팀 테이블 생성 중...');
    
    // 0. 업데이트 함수 생성 (존재하지 않는 경우)
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);
    console.log('✓ 업데이트 함수 생성 완료');
    
    // 1. 팀 테이블 생성
    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          color VARCHAR(7) DEFAULT '#8b5cf6',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ 팀 테이블 생성 완료');
    
    // 2. 팀 멤버 테이블에 team_id 컬럼 추가
    await client.query(`
      ALTER TABLE team_members 
      ADD COLUMN IF NOT EXISTS team_id VARCHAR(50) REFERENCES teams(id) ON DELETE SET NULL
    `);
    console.log('✓ team_id 컬럼 추가 완료');
    
    // 3. 기본 팀 데이터 삽입
    await client.query(`
      INSERT INTO teams (id, name, description, color) VALUES
      ('dx-headquarters', 'DX본부', 'DX본부 전체 조직', '#8b5cf6'),
      ('dx-promotion', 'DX추진팀', 'DX 전략 기획 및 추진', '#06b6d4'),
      ('financial-dx', '금융DX팀', '금융 서비스 디지털 혁신', '#10b981'),
      ('mobile-dx', '모바일DX팀', '모바일 플랫폼 개발 및 운영', '#f59e0b'),
      ('global-dx', '글로벌DX팀', '글로벌 디지털 서비스 확장', '#ef4444')
      ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          color = EXCLUDED.color,
          updated_at = CURRENT_TIMESTAMP
    `);
    console.log('✓ 기본 팀 데이터 삽입 완료');
    
    // 4. 트리거 생성
    await client.query(`
      DROP TRIGGER IF EXISTS update_teams_updated_at ON teams
    `);
    await client.query(`
      CREATE TRIGGER update_teams_updated_at
          BEFORE UPDATE ON teams
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('✓ 트리거 생성 완료');
    
    // 5. 인덱스 생성
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name)
    `);
    console.log('✓ 인덱스 생성 완료');
    
    console.log('✅ 마이그레이션이 성공적으로 완료되었습니다!');
    
    // 트랜잭션 커밋
    await client.query('COMMIT');
    
    // 현재 팀 목록 확인
    const teamsResult = await client.query('SELECT * FROM teams ORDER BY id');
    console.log('\n📋 생성된 팀 목록:');
    teamsResult.rows.forEach(team => {
      console.log(`  - ${team.name} (${team.id}): ${team.description}`);
    });
    
  } catch (error) {
    // 에러 발생 시 롤백
    await client.query('ROLLBACK');
    console.error('❌ 마이그레이션 실행 중 오류가 발생했습니다:', error.message);
    console.error('상세 오류:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function updateExistingMembers() {
  const client = await pool.connect();
  
  try {
    console.log('\n🔄 기존 멤버들의 팀 정보를 업데이트합니다...');
    
    // JSON 파일에서 팀 정보 읽기
    const teamMembersPath = path.join(__dirname, '..', 'src', 'data', 'teamMembers.json');
    
    if (!fs.existsSync(teamMembersPath)) {
      console.warn('⚠️ 팀 멤버 JSON 파일을 찾을 수 없습니다. 건너뜁니다.');
      return;
    }
    
    const teamMembers = JSON.parse(fs.readFileSync(teamMembersPath, 'utf8'));
    
    await client.query('BEGIN');
    
    let updateCount = 0;
    for (const member of teamMembers) {
      if (member.team && member.name) {
        try {
          const result = await client.query(
            'UPDATE team_members SET team_id = $1 WHERE name = $2',
            [member.team, member.name]
          );
          if (result.rowCount > 0) {
            console.log(`  ✓ ${member.name} → ${member.team}`);
            updateCount++;
          } else {
            console.log(`  ⚠️ ${member.name} - 데이터베이스에서 찾을 수 없음`);
          }
        } catch (error) {
          console.error(`  ❌ ${member.name} 업데이트 실패:`, error.message);
        }
      }
    }
    
    await client.query('COMMIT');
    console.log(`✅ ${updateCount}명의 멤버 팀 정보 업데이트 완료!`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 멤버 업데이트 중 오류가 발생했습니다:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// 메인 실행
async function main() {
  try {
    // 연결 테스트
    const connected = await testConnection();
    if (!connected) {
      throw new Error('데이터베이스 연결에 실패했습니다.');
    }
    
    await runMigration();
    await updateExistingMembers();
    
    console.log('\n🎉 모든 마이그레이션이 완료되었습니다!');
    process.exit(0);
  } catch (error) {
    console.error('💥 마이그레이션 실패:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main();
}

module.exports = { runMigration, updateExistingMembers, testConnection };