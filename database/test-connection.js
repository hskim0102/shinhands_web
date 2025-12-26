// 데이터베이스 연결 테스트 스크립트
// Node.js 환경에서 실행: node database/test-connection.js

import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔄 데이터베이스 연결 시도 중...');
    await client.connect();
    console.log('✅ 데이터베이스 연결 성공!');

    // 기본 테이블 존재 확인
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('team_members', 'stat_categories', 'member_stats', 'board_categories', 'posts')
      ORDER BY table_name;
    `);

    console.log('\n📋 존재하는 테이블:');
    tableCheck.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // 팀 멤버 수 확인
    const memberCount = await client.query('SELECT COUNT(*) FROM team_members');
    console.log(`\n👥 팀 멤버 수: ${memberCount.rows[0].count}명`);

    // 능력치 카테고리 확인
    const statCategories = await client.query('SELECT display_name FROM stat_categories ORDER BY sort_order');
    console.log('\n📊 능력치 카테고리:');
    statCategories.rows.forEach(row => {
      console.log(`  - ${row.display_name}`);
    });

    // 게시글 수 확인
    const postCount = await client.query('SELECT COUNT(*) FROM posts WHERE is_deleted = FALSE');
    console.log(`\n📝 게시글 수: ${postCount.rows[0].count}개`);

    // 샘플 데이터 조회
    const sampleMember = await client.query(`
      SELECT 
        tm.name,
        tm.role,
        array_agg(ms.value ORDER BY sc.sort_order) as stats
      FROM team_members tm
      LEFT JOIN member_stats ms ON tm.id = ms.member_id
      LEFT JOIN stat_categories sc ON ms.stat_category_id = sc.id
      WHERE tm.id = 1
      GROUP BY tm.id, tm.name, tm.role
    `);

    if (sampleMember.rows.length > 0) {
      const member = sampleMember.rows[0];
      console.log(`\n🎯 샘플 데이터 (${member.name} - ${member.role}):`);
      console.log(`   능력치: [${member.stats.join(', ')}]`);
    }

    console.log('\n🎉 모든 테스트 통과!');

  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 해결 방법:');
      console.log('  1. .env 파일의 DATABASE_URL 확인');
      console.log('  2. 네트워크 연결 확인');
      console.log('  3. 데이터베이스 서버 상태 확인');
    } else if (error.code === '28P01') {
      console.log('\n💡 해결 방법:');
      console.log('  1. 데이터베이스 사용자명/비밀번호 확인');
      console.log('  2. 데이터베이스 접근 권한 확인');
    } else if (error.code === '42P01') {
      console.log('\n💡 해결 방법:');
      console.log('  1. database/schema.sql 실행하여 테이블 생성');
      console.log('  2. database/seed.sql 실행하여 초기 데이터 삽입');
    }
  } finally {
    await client.end();
  }
}

// 스크립트 실행
testConnection();