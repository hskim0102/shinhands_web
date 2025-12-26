// API 서비스 - 데이터베이스와 통신하는 함수들
import { neon } from '@neondatabase/serverless';

// 데이터베이스 연결 (오류 시 폴백 처리)
let sql;
let connectionError = null;

// 하드코딩된 데이터베이스 URL (임시)
const HARDCODED_DB_URL = 'postgresql://neondb_owner:npg_hQmoG50OIaNf@ep-plain-feather-ahu9a07b-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

try {
  console.log('🔍 데이터베이스 연결 설정 확인:');
  console.log('- import.meta.env:', import.meta.env);
  console.log('- VITE_DATABASE_URL:', import.meta.env.VITE_DATABASE_URL);
  
  // 환경 변수 또는 하드코딩된 URL 사용
  const databaseUrl = import.meta.env.VITE_DATABASE_URL || HARDCODED_DB_URL;
  
  console.log('- 최종 사용할 URL 길이:', databaseUrl?.length || 0);
  console.log('- URL 호스트 부분:', databaseUrl?.split('@')[1]?.split('/')[0] || 'unknown');
  
  console.log('🔗 Neon 연결 초기화 중...');
  sql = neon(databaseUrl);
  console.log('✅ 데이터베이스 연결 초기화 성공');
} catch (error) {
  console.warn('⚠️ 데이터베이스 연결 초기화 실패, 폴백 모드로 전환:', error.message);
  console.error('상세 오류:', error);
  connectionError = error.message;
  sql = null;
}

// 폴백 데이터
const fallbackTeamData = [
  {
    id: 1,
    name: "김진성",
    role: "팀장",
    mbti: "ENFP",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kim&backgroundColor=b6e3f4",
    description: "누구 밥 사줄까?.",
    tags: "#큰형님,#소확행",
    stats: [90, 80, 80, 95, 75, 95]
  },
  {
    id: 2,
    name: "김윤성",
    role: "PM",
    mbti: "ISTJ",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka3&backgroundColor=b6e3f4",
    description: "New ITSM 구축.",
    tags: "#PM",
    stats: [70, 88, 70, 92, 75, 85]
  }
];

const fallbackPosts = [
  {
    id: 1,
    title: "팀 프로젝트 킥오프 미팅",
    content: "새로운 프로젝트를 시작합니다! 모든 팀원들의 적극적인 참여 부탁드립니다.",
    author: "김진성",
    date: "2024-12-26",
    category: "notice"
  }
];

// 팀 멤버 API
export const teamMemberAPI = {
  // 모든 팀 멤버 조회
  async getAll() {
    console.log('🔍 팀 멤버 데이터 조회 시작...');
    
    if (!sql) {
      console.warn('❌ 데이터베이스 연결 없음, 폴백 데이터 사용');
      console.warn('연결 오류:', connectionError);
      return fallbackTeamData;
    }

    try {
      console.log('📡 데이터베이스에서 팀 멤버 조회 중...');
      const result = await sql`
        SELECT 
          tm.id,
          tm.name,
          tm.role,
          tm.mbti,
          tm.image_url as image,
          tm.description,
          tm.tags,
          COALESCE(
            array_agg(ms.value ORDER BY sc.sort_order) FILTER (WHERE ms.id IS NOT NULL),
            ARRAY[]::integer[]
          ) as stats
        FROM team_members tm
        LEFT JOIN member_stats ms ON tm.id = ms.member_id
        LEFT JOIN stat_categories sc ON ms.stat_category_id = sc.id
        GROUP BY tm.id, tm.name, tm.role, tm.mbti, tm.image_url, tm.description, tm.tags
        ORDER BY tm.id
      `;
      console.log(`✅ 데이터베이스에서 ${result.length}명의 팀 멤버 조회 성공`);
      return result;
    } catch (error) {
      console.error('❌ 팀 멤버 조회 실패, 폴백 데이터 사용:', error.message);
      console.error('오류 상세:', error);
      return fallbackTeamData;
    }
  },

  // 특정 팀 멤버 조회
  async getById(id) {
    if (!sql) {
      return fallbackTeamData.find(m => m.id === id);
    }

    try {
      const result = await sql`
        SELECT 
          tm.id,
          tm.name,
          tm.role,
          tm.mbti,
          tm.image_url as image,
          tm.description,
          tm.tags,
          COALESCE(
            array_agg(ms.value ORDER BY sc.sort_order) FILTER (WHERE ms.id IS NOT NULL),
            ARRAY[]::integer[]
          ) as stats
        FROM team_members tm
        LEFT JOIN member_stats ms ON tm.id = ms.member_id
        LEFT JOIN stat_categories sc ON ms.stat_category_id = sc.id
        WHERE tm.id = ${id}
        GROUP BY tm.id, tm.name, tm.role, tm.mbti, tm.image_url, tm.description, tm.tags
      `;
      return result[0];
    } catch (error) {
      console.error('팀 멤버 조회 실패:', error);
      return fallbackTeamData.find(m => m.id === id);
    }
  },

  // 새 팀 멤버 추가
  async create(memberData) {
    if (!sql) {
      console.warn('데이터베이스 연결 없음, 생성 불가');
      throw new Error('데이터베이스 연결이 필요합니다');
    }

    try {
      // 팀 멤버 추가
      const memberResult = await sql`
        INSERT INTO team_members (name, role, mbti, image_url, description, tags)
        VALUES (${memberData.name}, ${memberData.role}, ${memberData.mbti}, ${memberData.image}, ${memberData.description}, ${memberData.tags})
        RETURNING id
      `;

      const memberId = memberResult[0].id;

      // 능력치 추가
      if (memberData.stats && memberData.stats.length > 0) {
        for (let i = 0; i < memberData.stats.length; i++) {
          await sql`
            INSERT INTO member_stats (member_id, stat_category_id, value)
            VALUES (${memberId}, ${i + 1}, ${memberData.stats[i]})
          `;
        }
      }

      return memberId;
    } catch (error) {
      console.error('팀 멤버 생성 실패:', error);
      throw error;
    }
  },

  // 팀 멤버 업데이트
  async update(id, memberData) {
    if (!sql) {
      console.warn('데이터베이스 연결 없음, 업데이트 불가');
      throw new Error('데이터베이스 연결이 필요합니다');
    }

    try {
      // 팀 멤버 정보 업데이트
      await sql`
        UPDATE team_members 
        SET name = ${memberData.name}, role = ${memberData.role}, mbti = ${memberData.mbti}, 
            image_url = ${memberData.image}, description = ${memberData.description}, 
            tags = ${memberData.tags}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;

      // 능력치 업데이트
      if (memberData.stats && memberData.stats.length > 0) {
        for (let i = 0; i < memberData.stats.length; i++) {
          await sql`
            INSERT INTO member_stats (member_id, stat_category_id, value)
            VALUES (${id}, ${i + 1}, ${memberData.stats[i]})
            ON CONFLICT (member_id, stat_category_id)
            DO UPDATE SET value = ${memberData.stats[i]}, updated_at = CURRENT_TIMESTAMP
          `;
        }
      }

      return id;
    } catch (error) {
      console.error('팀 멤버 업데이트 실패:', error);
      throw error;
    }
  },

  // 팀 멤버 삭제
  async delete(id) {
    if (!sql) {
      console.warn('데이터베이스 연결 없음, 삭제 불가');
      throw new Error('데이터베이스 연결이 필요합니다');
    }

    try {
      await sql`DELETE FROM team_members WHERE id = ${id}`;
      return true;
    } catch (error) {
      console.error('팀 멤버 삭제 실패:', error);
      throw error;
    }
  }
};

// 게시판 API
export const boardAPI = {
  // 모든 게시글 조회
  async getAllPosts() {
    if (!sql) {
      console.warn('데이터베이스 연결 없음, 폴백 데이터 사용');
      return fallbackPosts;
    }

    try {
      const result = await sql`
        SELECT 
          p.id,
          p.title,
          p.content,
          p.author_id,
          p.author_name as author,
          p.view_count,
          p.is_pinned,
          p.created_at::date::text as date,
          p.updated_at,
          bc.name as category
        FROM posts p
        JOIN board_categories bc ON p.category_id = bc.id
        WHERE p.is_deleted = FALSE
        ORDER BY p.is_pinned DESC, p.created_at DESC
      `;
      return result;
    } catch (error) {
      console.error('게시글 조회 실패, 폴백 데이터 사용:', error);
      return fallbackPosts;
    }
  },

  // 특정 게시글 조회
  async getPostById(id) {
    if (!sql) {
      return fallbackPosts.find(p => p.id === id);
    }

    try {
      // 조회수 증가
      await sql`UPDATE posts SET view_count = view_count + 1 WHERE id = ${id}`;
      
      // 게시글 조회
      const result = await sql`
        SELECT 
          p.id,
          p.title,
          p.content,
          p.author_id,
          p.author_name as author,
          p.view_count,
          p.is_pinned,
          p.created_at::date::text as date,
          p.updated_at,
          bc.name as category
        FROM posts p
        JOIN board_categories bc ON p.category_id = bc.id
        WHERE p.id = ${id} AND p.is_deleted = FALSE
      `;
      
      return result[0];
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      return fallbackPosts.find(p => p.id === id);
    }
  },

  // 새 게시글 추가
  async createPost(postData) {
    if (!sql) {
      console.warn('데이터베이스 연결 없음, 생성 불가');
      throw new Error('데이터베이스 연결이 필요합니다');
    }

    try {
      const result = await sql`
        INSERT INTO posts (title, content, author_id, author_name, category_id)
        VALUES (${postData.title}, ${postData.content}, ${postData.author_id || null}, ${postData.author}, 
                (SELECT id FROM board_categories WHERE name = ${postData.category}))
        RETURNING id
      `;
      
      return result[0].id;
    } catch (error) {
      console.error('게시글 생성 실패:', error);
      throw error;
    }
  },

  // 게시글 업데이트
  async updatePost(id, postData) {
    if (!sql) {
      console.warn('데이터베이스 연결 없음, 업데이트 불가');
      throw new Error('데이터베이스 연결이 필요합니다');
    }

    try {
      await sql`
        UPDATE posts 
        SET title = ${postData.title}, content = ${postData.content}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND is_deleted = FALSE
      `;
      
      return id;
    } catch (error) {
      console.error('게시글 업데이트 실패:', error);
      throw error;
    }
  },

  // 게시글 삭제
  async deletePost(id) {
    if (!sql) {
      console.warn('데이터베이스 연결 없음, 삭제 불가');
      throw new Error('데이터베이스 연결이 필요합니다');
    }

    try {
      await sql`
        UPDATE posts 
        SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;
      
      return true;
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      throw error;
    }
  },

  // 게시판 카테고리 조회
  async getCategories() {
    if (!sql) {
      return [
        { name: 'notice', display_name: '공지사항' },
        { name: 'development', display_name: '개발' },
        { name: 'event', display_name: '이벤트' },
        { name: 'free', display_name: '자유' }
      ];
    }

    try {
      const result = await sql`
        SELECT name, display_name, description, color
        FROM board_categories
        ORDER BY id
      `;
      return result;
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
      return [
        { name: 'notice', display_name: '공지사항' },
        { name: 'development', display_name: '개발' },
        { name: 'event', display_name: '이벤트' },
        { name: 'free', display_name: '자유' }
      ];
    }
  }
};

// 능력치 카테고리 API
export const statsAPI = {
  // 능력치 카테고리 조회
  async getCategories() {
    if (!sql) {
      return [
        { name: 'leadership', display_name: '리더십' },
        { name: 'communication', display_name: '소통력' },
        { name: 'technical', display_name: '기술력' },
        { name: 'creativity', display_name: '창의력' },
        { name: 'reliability', display_name: '신뢰도' },
        { name: 'passion', display_name: '열정' }
      ];
    }

    try {
      const result = await sql`
        SELECT name, display_name, description, sort_order
        FROM stat_categories
        ORDER BY sort_order
      `;
      return result;
    } catch (error) {
      console.error('능력치 카테고리 조회 실패:', error);
      return [
        { name: 'leadership', display_name: '리더십' },
        { name: 'communication', display_name: '소통력' },
        { name: 'technical', display_name: '기술력' },
        { name: 'creativity', display_name: '창의력' },
        { name: 'reliability', display_name: '신뢰도' },
        { name: 'passion', display_name: '열정' }
      ];
    }
  }
};