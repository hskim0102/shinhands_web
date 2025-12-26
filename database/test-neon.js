// Neon 데이터베이스 연결 테스트 스크립트
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

async function testNeonConnection() {
  const databaseUrl = process.env.VITE_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ 데이터베이스 URL이 설정되지 않았습니다.');
    return;
  }

  console.log('🔄 Neon 데이터베이스 연결 테스트 중...');
  console.log(`📡 연결 대상: ${databaseUrl.split('@')[1]?.split('/')[0] || 'Unknown'}`);

  try {
    const sql = neon(databaseUrl);
    
    // 기본 연결 테스트
    const result = await sql`SELECT 1 as test`;
    console.log('✅ 데이터베이스 연결 성공!');

    // 테이블 존재 확인
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('\n📋 존재하는 테이블:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    // 팀 멤버 수 확인
    const memberCount = await sql`SELECT COUNT(*) as count FROM team_members`;
    console.log(`\n👥 팀 멤버 수: ${memberCount[0].count}명`);

    // 첫 5명의 팀 멤버 조회
    const members = await sql`
      SELECT id, name, role 
      FROM team_members 
      ORDER BY id 
      LIMIT 5
    `;
    
    console.log('\n👤 팀 멤버 샘플:');
    members.forEach(member => {
      console.log(`  - ${member.id}: ${member.name} (${member.role})`);
    });

    // 능력치 데이터 확인
    const statsCount = await sql`SELECT COUNT(*) as count FROM member_stats`;
    console.log(`\n📊 능력치 데이터: ${statsCount[0].count}개`);

    // 게시글 수 확인
    const postCount = await sql`SELECT COUNT(*) as count FROM posts WHERE is_deleted = FALSE`;
    console.log(`📝 게시글 수: ${postCount[0].count}개`);

    console.log('\n🎉 모든 테스트 통과!');

  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 해결 방법:');
      console.log('  1. 인터넷 연결 확인');
      console.log('  2. 데이터베이스 URL 확인');
    } else if (error.message.includes('authentication')) {
      console.log('\n💡 해결 방법:');
      console.log('  1. 데이터베이스 사용자명/비밀번호 확인');
      console.log('  2. 데이터베이스 접근 권한 확인');
    }
  }
}

// 스크립트 실행
testNeonConnection();