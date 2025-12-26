// 데이터베이스 설정 스크립트
// Node.js 환경에서 실행: node database/setup-database.js

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
  const databaseUrl = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ 데이터베이스 URL이 설정되지 않았습니다.');
    console.log('💡 .env 파일에 DATABASE_URL 또는 VITE_DATABASE_URL을 설정해주세요.');
    process.exit(1);
  }

  console.log('🔄 데이터베이스 설정을 시작합니다...');
  console.log(`📡 연결 대상: ${databaseUrl.split('@')[1]?.split('/')[0] || 'Unknown'}`);

  const sql = neon(databaseUrl);

  try {
    // 스키마 파일 읽기
    console.log('📋 스키마 파일을 읽는 중...');
    const schemaPath = join(__dirname, 'schema-simple.sql');
    const schemaSQL = readFileSync(schemaPath, 'utf8');

    console.log('🔨 스키마를 실행합니다...');
    console.log('스키마 내용 길이:', schemaSQL.length);
    console.log('스키마 내용 미리보기:', schemaSQL.substring(0, 200));
    
    // 스키마를 개별 명령으로 분할하여 실행
    const schemaCommands = schemaSQL
      .replace(/--.*$/gm, '') // 주석 제거
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 10); // 너무 짧은 명령 제거

    console.log(`📊 ${schemaCommands.length}개의 스키마 명령을 실행합니다...`);
    
    for (let i = 0; i < schemaCommands.length; i++) {
      const command = schemaCommands[i];
      if (command.trim()) {
        try {
          console.log(`실행 중 ${i + 1}: ${command.substring(0, 50)}...`);
          // 각 명령을 개별적으로 실행
          await sql.query(command);
          console.log(`✅ 스키마 명령 ${i + 1}/${schemaCommands.length} 완료`);
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log(`⚠️  스키마 명령 ${i + 1}/${schemaCommands.length} 이미 존재함 (건너뜀)`);
          } else {
            console.error(`❌ 스키마 명령 ${i + 1} 실패:`, error.message);
            console.error('실패한 명령:', command);
          }
        }
      }
    }

    // 시드 파일 읽기
    console.log('🌱 시드 데이터 파일을 읽는 중...');
    const seedPath = join(__dirname, 'seed.sql');
    const seedSQL = readFileSync(seedPath, 'utf8');

    console.log('🌱 시드 데이터를 실행합니다...');
    console.log('시드 내용 길이:', seedSQL.length);
    
    // 시드 데이터를 개별 명령으로 분할하여 실행
    const seedCommands = seedSQL
      .replace(/--.*$/gm, '') // 주석 제거
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 10); // 너무 짧은 명령 제거

    console.log(`🌱 ${seedCommands.length}개의 시드 명령을 실행합니다...`);

    for (let i = 0; i < seedCommands.length; i++) {
      const command = seedCommands[i];
      if (command.trim()) {
        try {
          console.log(`실행 중 ${i + 1}: ${command.substring(0, 50)}...`);
          await sql.query(command);
          console.log(`✅ 시드 명령 ${i + 1}/${seedCommands.length} 완료`);
        } catch (error) {
          if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
            console.log(`⚠️  시드 명령 ${i + 1}/${seedCommands.length} 이미 존재함 (건너뜀)`);
          } else {
            console.error(`❌ 시드 명령 ${i + 1} 실패:`, error.message);
            console.error('실패한 명령:', command.substring(0, 200));
          }
        }
      }
    }

    // 설정 완료 확인
    console.log('\n🔍 설정 결과를 확인합니다...');
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('📋 생성된 테이블:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    const memberCount = await sql`SELECT COUNT(*) as count FROM team_members`;
    const postCount = await sql`SELECT COUNT(*) as count FROM posts WHERE is_deleted = FALSE`;
    const statCount = await sql`SELECT COUNT(*) as count FROM stat_categories`;

    console.log('\n📊 데이터 현황:');
    console.log(`  - 팀 멤버: ${memberCount[0].count}명`);
    console.log(`  - 게시글: ${postCount[0].count}개`);
    console.log(`  - 능력치 카테고리: ${statCount[0].count}개`);

    console.log('\n🎉 데이터베이스 설정이 완료되었습니다!');
    console.log('💡 이제 "npm run dev"로 애플리케이션을 실행할 수 있습니다.');

  } catch (error) {
    console.error('❌ 데이터베이스 설정 실패:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 해결 방법:');
      console.log('  1. 인터넷 연결 확인');
      console.log('  2. 데이터베이스 URL 확인');
      console.log('  3. 방화벽 설정 확인');
    } else if (error.message.includes('authentication')) {
      console.log('\n💡 해결 방법:');
      console.log('  1. 데이터베이스 사용자명/비밀번호 확인');
      console.log('  2. 데이터베이스 접근 권한 확인');
    }
    
    process.exit(1);
  }
}

// 스크립트 실행
setupDatabase();