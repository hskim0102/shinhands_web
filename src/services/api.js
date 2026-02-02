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

const fallbackComments = [
  {
    id: 1,
    post_id: 1,
    author_name: "김윤성",
    content: "모두 화이팅입니다!",
    created_at: "2024-12-26 10:00:00"
  },
  {
    id: 2,
    post_id: 1,
    author_name: "이수민",
    content: "기대되네요 ^^",
    created_at: "2024-12-26 10:05:00"
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
          tm.emp_id,
          tm.name,
          tm.role,
          tm.team_id as team,
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
        GROUP BY tm.id, tm.name, tm.role, tm.team_id, tm.mbti, tm.image_url, tm.description, tm.tags, tm.emp_id
        ORDER BY COALESCE(tm.display_order, tm.id) ASC
      `;
      console.log(`✅ 데이터베이스에서 ${result.length}명의 팀 멤버 조회 성공`);
      return result;
    } catch (error) {
      console.error('❌ 팀 멤버 조회 실패, 폴백 데이터 사용:', error.message);
      console.error('오류 상세:', error);
      return fallbackTeamData;
    }
  },

  // 로그인 (사번, 비밀번호 확인)
  async login(empId, password) {
    if (!sql) {
      console.warn('❌ 데이터베이스 연결 없음, 로그인 불가 (폴백 데이터 사용 안 함)');
      throw new Error('데이터베이스 연결이 필요합니다');
    }

    try {
      // emp_id와 password가 일치하는 멤버 조회
      const result = await sql`
        SELECT id, name, emp_id, role, team_id, image_url, description
        FROM team_members 
        WHERE emp_id = ${empId} AND password = ${password}
      `;

      if (result.length > 0) {
        console.log(`✅ 로그인 성공: ${result[0].name} (ID: ${result[0].id})`);
        return result[0];
      } else {
        console.warn('❌ 로그인 실패: 사번 또는 비밀번호 불일치');
        return null;
      }
    } catch (error) {
      console.error('❌ 로그인 쿼리 실행 중 오류:', error);
      throw error;
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
          tm.emp_id,
          tm.name,
          tm.role,
          tm.team_id as team,
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
        GROUP BY tm.id, tm.name, tm.role, tm.team_id, tm.mbti, tm.image_url, tm.description, tm.tags, tm.emp_id
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
        INSERT INTO team_members (name, role, team_id, mbti, image_url, description, tags, emp_id, password)
        VALUES (${memberData.name}, ${memberData.role}, ${memberData.team || null}, ${memberData.mbti}, ${memberData.image}, ${memberData.description}, ${memberData.tags}, ${memberData.emp_id || null}, ${memberData.password || '0000'})
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
        SET name = ${memberData.name}, role = ${memberData.role}, team_id = ${memberData.team || null}, 
            mbti = ${memberData.mbti}, image_url = ${memberData.image}, description = ${memberData.description}, 
            tags = ${memberData.tags}, emp_id = ${memberData.emp_id || null}, password = COALESCE(NULLIF(${memberData.password}, ''), password), updated_at = CURRENT_TIMESTAMP
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
  },

  // 순서 업데이트
  async updateOrder(items) {
    if (!sql) {
      console.warn('데이터베이스 연결 없음, 순서 업데이트 불가');
      return;
    }

    try {
      // 트랜잭션 처럼 동작하도록 Promise.all 사용 (단, 중간 실패시 롤백은 안됨)
      // Neon은 다중 쿼리 트랜잭션을 지원하지만, 간단하게 개별 업데이트로 처리
      // 성능을 위해 pg의 unnest 같은 기능을 쓰면 좋지만, 여기선 단순하게 반복문 사용
      // 또는 CASE WHEN 구문으로 한 번에 업데이트 가능

      // CASE WHEN 구문 생성
      // UPDATE team_members SET display_order = CASE id WHEN 1 THEN 10 WHEN 2 THEN 20 ... END WHERE id IN (1, 2, ...)

      const ids = items.map(item => item.id);

      // 반복문으로 처리 (간단하고 안전함)
      // 실제로는 대량 데이터일 경우 비효율적이나 팀 멤버 수가 적으므로 무방
      const queries = items.map((item, index) => {
        return sql`UPDATE team_members SET display_order = ${index} WHERE id = ${item.id}`;
      });

      await Promise.all(queries);

      return true;
    } catch (error) {
      console.error('순서 업데이트 실패:', error);
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
  },

  // 댓글 조회
  async getComments(postId) {
    if (!sql) {
      return fallbackComments.filter(c => c.post_id === postId);
    }

    try {
      const result = await sql`
        SELECT id, post_id, author_name, content, created_at::text
        FROM comments
        WHERE post_id = ${postId}
        ORDER BY created_at ASC
      `;
      return result;
    } catch (error) {
      console.error('댓글 조회 실패:', error);
      // 테이블이 없을 수도 있으므로 조용히 실패하거나 폴백 반환
      return fallbackComments.filter(c => c.post_id === postId);
    }
  },

  // 댓글 추가
  async addComment(commentData) {
    if (!sql) {
      // 폴백 모드에서는 메모리에 추가 (새로고침하면 사라짐)
      const newComment = {
        id: Date.now(),
        post_id: commentData.postId,
        author_name: commentData.authorName,
        content: commentData.content,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      fallbackComments.push(newComment);
      return newComment;
    }

    try {   
      const result = await sql`
        INSERT INTO comments (post_id, author_name, content)
        VALUES (${commentData.postId}, ${commentData.authorName}, ${commentData.content})
        RETURNING id, post_id, author_name, content, created_at::text
      `;
      return result[0];
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      throw error;
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

// 팀 API
export const teamAPI = {
  // 모든 팀 조회
  async getAll() {
    if (!sql) {
      return [
        { id: 'dx-headquarters', name: 'DX본부', description: 'DX본부 전체 조직', color: '#8b5cf6' },
        { id: 'dx-promotion', name: 'DX추진팀', description: 'DX 전략 기획 및 추진', color: '#06b6d4' },
        { id: 'financial-dx', name: '금융DX팀', description: '금융 서비스 디지털 혁신', color: '#10b981' },
        { id: 'mobile-dx', name: '모바일DX팀', description: '모바일 플랫폼 개발 및 운영', color: '#f59e0b' },
        { id: 'global-dx', name: '글로벌DX팀', description: '글로벌 디지털 서비스 확장', color: '#ef4444' }
      ];
    }

    try {
      const result = await sql`
        SELECT id, name, description, color, created_at, updated_at
        FROM teams
        ORDER BY id
      `;
      return result;
    } catch (error) {
      console.error('팀 조회 실패:', error);
      return [
        { id: 'dx-headquarters', name: 'DX본부', description: 'DX본부 전체 조직', color: '#8b5cf6' },
        { id: 'dx-promotion', name: 'DX추진팀', description: 'DX 전략 기획 및 추진', color: '#06b6d4' },
        { id: 'financial-dx', name: '금융DX팀', description: '금융 서비스 디지털 혁신', color: '#10b981' },
        { id: 'mobile-dx', name: '모바일DX팀', description: '모바일 플랫폼 개발 및 운영', color: '#f59e0b' },
        { id: 'global-dx', name: '글로벌DX팀', description: '글로벌 디지털 서비스 확장', color: '#ef4444' }
      ];
    }
  },

  // 특정 팀의 멤버 조회
  async getMembers(teamId) {
    if (!sql) {
      return fallbackTeamData.filter(m => m.team === teamId);
    }

    try {
      const result = await sql`
        SELECT 
          tm.id,
          tm.emp_id,
          tm.name,
          tm.role,
          tm.team_id as team,
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
        WHERE tm.team_id = ${teamId}
        GROUP BY tm.id, tm.name, tm.role, tm.team_id, tm.mbti, tm.image_url, tm.description, tm.tags, tm.emp_id
        ORDER BY COALESCE(tm.display_order, tm.id) ASC
      `;
      return result;
    } catch (error) {
      console.error('팀 멤버 조회 실패:', error);
      return [];
    }
  }
};

// KPI API
export const kpiAPI = {
  // 모든 KPI 조회
  async getAll() {
    if (!sql) {
      console.warn('데이터베이스 연결 없음, 빈 배열 반환');
      return [];
    }

    try {
      const result = await sql`
        SELECT * FROM kpis ORDER BY id ASC
      `;
      return result;
    } catch (error) {
      console.error('KPI 조회 실패:', error);
      return [];
    }
  },

  // KPI 생성
  async create(kpiData) {
    if (!sql) throw new Error('데이터베이스 연결 필요');

    try {
      const result = await sql`
        INSERT INTO kpis (
          category, initiative, weight, indicator_item, indicator_weight, unit, target_2025, remarks,
          target_s, target_a, target_b_plus, target_b, target_b_minus, target_c, target_d, current_achievement
        ) VALUES (
          ${kpiData.category}, ${kpiData.initiative}, ${kpiData.weight}, 
          ${kpiData.indicator_item}, ${kpiData.indicator_weight}, ${kpiData.unit}, 
          ${kpiData.target_2025}, ${kpiData.remarks},
          ${kpiData.target_s || ''}, ${kpiData.target_a || ''}, ${kpiData.target_b_plus || ''}, 
          ${kpiData.target_b || ''}, ${kpiData.target_b_minus || ''}, ${kpiData.target_c || ''}, ${kpiData.target_d || ''},
          ${kpiData.current_achievement || ''}
        )
        RETURNING *
      `;
      return result[0];
    } catch (error) {
      console.error('KPI 생성 실패:', error);
      throw error;
    }
  },

  // KPI 수정
  async update(id, kpiData) {
    if (!sql) throw new Error('데이터베이스 연결 필요');

    try {
      const result = await sql`
        UPDATE kpis SET
          category = ${kpiData.category},
          initiative = ${kpiData.initiative},
          weight = ${kpiData.weight},
          indicator_item = ${kpiData.indicator_item},
          indicator_weight = ${kpiData.indicator_weight},
          unit = ${kpiData.unit},
          target_2025 = ${kpiData.target_2025},
          remarks = ${kpiData.remarks},
          target_s = ${kpiData.target_s || ''},
          target_a = ${kpiData.target_a || ''},
          target_b_plus = ${kpiData.target_b_plus || ''},
          target_b = ${kpiData.target_b || ''},
          target_b_minus = ${kpiData.target_b_minus || ''},
          target_c = ${kpiData.target_c || ''},
          target_d = ${kpiData.target_d || ''},
          current_achievement = ${kpiData.current_achievement || ''},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0];
    } catch (error) {
      console.error('KPI 수정 실패:', error);
      throw error;
    }
  },

  // KPI 삭제
  async delete(id) {
    if (!sql) throw new Error('데이터베이스 연결 필요');

    try {
      await sql`DELETE FROM kpis WHERE id = ${id}`;
      return true;
    } catch (error) {
      console.error('KPI 삭제 실패:', error);
      throw error;
    }
  }
};