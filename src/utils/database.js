// 데이터베이스 연결 및 쿼리 유틸리티
// 실제 프로덕션에서는 서버 사이드에서만 사용해야 합니다.

// 팀 멤버 관련 쿼리
export const teamMemberQueries = {
  // 모든 팀 멤버 조회 (능력치 포함)
  getAllMembers: `
    SELECT 
      tm.id,
      tm.name,
      tm.role,
      tm.mbti,
      tm.image_url as image,
      tm.description,
      tm.tags,
      tm.created_at,
      tm.updated_at,
      COALESCE(
        json_agg(
          json_build_object(
            'category', sc.name,
            'display_name', sc.display_name,
            'value', ms.value
          ) ORDER BY sc.sort_order
        ) FILTER (WHERE ms.id IS NOT NULL),
        '[]'::json
      ) as stats
    FROM team_members tm
    LEFT JOIN member_stats ms ON tm.id = ms.member_id
    LEFT JOIN stat_categories sc ON ms.stat_category_id = sc.id
    WHERE tm.id IS NOT NULL
    GROUP BY tm.id, tm.name, tm.role, tm.mbti, tm.image_url, tm.description, tm.tags, tm.created_at, tm.updated_at
    ORDER BY tm.id;
  `,

  // 특정 팀 멤버 조회
  getMemberById: `
    SELECT 
      tm.id,
      tm.name,
      tm.role,
      tm.mbti,
      tm.image_url as image,
      tm.description,
      tm.tags,
      tm.created_at,
      tm.updated_at,
      COALESCE(
        json_agg(
          json_build_object(
            'category', sc.name,
            'display_name', sc.display_name,
            'value', ms.value
          ) ORDER BY sc.sort_order
        ) FILTER (WHERE ms.id IS NOT NULL),
        '[]'::json
      ) as stats
    FROM team_members tm
    LEFT JOIN member_stats ms ON tm.id = ms.member_id
    LEFT JOIN stat_categories sc ON ms.stat_category_id = sc.id
    WHERE tm.id = $1
    GROUP BY tm.id, tm.name, tm.role, tm.mbti, tm.image_url, tm.description, tm.tags, tm.created_at, tm.updated_at;
  `,

  // 새 팀 멤버 추가
  insertMember: `
    INSERT INTO team_members (name, role, mbti, image_url, description, tags)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id;
  `,

  // 팀 멤버 정보 업데이트
  updateMember: `
    UPDATE team_members 
    SET name = $2, role = $3, mbti = $4, image_url = $5, description = $6, tags = $7, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id;
  `,

  // 팀 멤버 삭제
  deleteMember: `
    DELETE FROM team_members WHERE id = $1;
  `
};

// 능력치 관련 쿼리
export const statsQueries = {
  // 능력치 카테고리 조회
  getStatCategories: `
    SELECT id, name, display_name, description, sort_order
    FROM stat_categories
    ORDER BY sort_order;
  `,

  // 멤버 능력치 업데이트/삽입
  upsertMemberStat: `
    INSERT INTO member_stats (member_id, stat_category_id, value)
    VALUES ($1, $2, $3)
    ON CONFLICT (member_id, stat_category_id)
    DO UPDATE SET value = $3, updated_at = CURRENT_TIMESTAMP;
  `,

  // 멤버의 모든 능력치 조회
  getMemberStats: `
    SELECT 
      ms.value,
      sc.name as category,
      sc.display_name,
      sc.sort_order
    FROM member_stats ms
    JOIN stat_categories sc ON ms.stat_category_id = sc.id
    WHERE ms.member_id = $1
    ORDER BY sc.sort_order;
  `
};

// 게시판 관련 쿼리
export const boardQueries = {
  // 모든 게시글 조회
  getAllPosts: `
    SELECT 
      p.id,
      p.title,
      p.content,
      p.author_id,
      p.author_name,
      p.view_count,
      p.is_pinned,
      p.created_at,
      p.updated_at,
      bc.name as category,
      bc.display_name as category_display,
      bc.color as category_color
    FROM posts p
    JOIN board_categories bc ON p.category_id = bc.id
    WHERE p.is_deleted = FALSE
    ORDER BY p.is_pinned DESC, p.created_at DESC;
  `,

  // 특정 게시글 조회
  getPostById: `
    SELECT 
      p.id,
      p.title,
      p.content,
      p.author_id,
      p.author_name,
      p.view_count,
      p.is_pinned,
      p.created_at,
      p.updated_at,
      bc.name as category,
      bc.display_name as category_display,
      bc.color as category_color
    FROM posts p
    JOIN board_categories bc ON p.category_id = bc.id
    WHERE p.id = $1 AND p.is_deleted = FALSE;
  `,

  // 새 게시글 추가
  insertPost: `
    INSERT INTO posts (title, content, author_id, author_name, category_id)
    VALUES ($1, $2, $3, $4, (SELECT id FROM board_categories WHERE name = $5))
    RETURNING id;
  `,

  // 게시글 업데이트
  updatePost: `
    UPDATE posts 
    SET title = $2, content = $3, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND is_deleted = FALSE
    RETURNING id;
  `,

  // 게시글 삭제 (소프트 삭제)
  deletePost: `
    UPDATE posts 
    SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1;
  `,

  // 조회수 증가
  incrementViewCount: `
    UPDATE posts 
    SET view_count = view_count + 1
    WHERE id = $1;
  `,

  // 게시판 카테고리 조회
  getBoardCategories: `
    SELECT id, name, display_name, description, color
    FROM board_categories
    ORDER BY id;
  `
};

// 유틸리티 함수들
export const dbUtils = {
  // 배열을 stats 형태로 변환 (기존 JSON 데이터와 호환성을 위해)
  convertStatsArrayToObject: (statsArray, categories) => {
    return statsArray.map((value, index) => ({
      category: categories[index]?.name || `stat_${index}`,
      display_name: categories[index]?.display_name || `능력치 ${index + 1}`,
      value: value
    }));
  },

  // stats 객체를 배열로 변환
  convertStatsObjectToArray: (statsObject) => {
    return statsObject.map(stat => stat.value);
  },

  // 날짜 포맷팅
  formatDate: (dateString) => {
    return new Date(dateString).toISOString().split('T')[0];
  }
};

// 데이터베이스 연결 설정 (실제 사용시에는 서버 사이드에서만)
export const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};