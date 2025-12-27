const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 데이터베이스 연결 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 데이터베이스 마이그레이션을 시작합니다...');
    
    // 마이그레이션 파일 읽기
    const migrationPath = path.join(__dirname, 'migrations', '001_add_teams.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // 트랜잭션 시작
    await client.query('BEGIN');
    
    console.log('📝 팀 테이블 생성 중...');
    await client.query(migrationSQL);
    
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
    console.error('❌ 마이그레이션 실행 중 오류가 발생했습니다:', error);
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
    const teamMembers = JSON.parse(fs.readFileSync(teamMembersPath, 'utf8'));
    
    await client.query('BEGIN');
    
    for (const member of teamMembers) {
      if (member.team) {
        await client.query(
          'UPDATE team_members SET team_id = $1 WHERE name = $2',
          [member.team, member.name]
        );
        console.log(`  ✓ ${member.name} → ${member.team}`);
      }
    }
    
    await client.query('COMMIT');
    console.log('✅ 멤버 팀 정보 업데이트 완료!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 멤버 업데이트 중 오류가 발생했습니다:', error);
    throw error;
  } finally {
    client.release();
  }
}

// 메인 실행
async function main() {
  try {
    await runMigration();
    await updateExistingMembers();
    
    console.log('\n🎉 모든 마이그레이션이 완료되었습니다!');
    process.exit(0);
  } catch (error) {
    console.error('💥 마이그레이션 실패:', error);
    process.exit(1);
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main();
}

module.exports = { runMigration, updateExistingMembers };