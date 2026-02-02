// API 서비스 - 백엔드 서버와 통신하는 함수들

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
    try {
      const response = await fetch('/api/team-members');
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('팀 멤버 조회 실패, 폴백 데이터 사용:', error);
      return fallbackTeamData;
    }
  },

  // 로그인 (사번, 비밀번호 확인)
  async login(empId, password) {
    try {
      const response = await fetch('/api/team-members/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empId, password }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          console.warn('❌ 로그인 실패: 사번 또는 비밀번호 불일치');
          return null;
        }
        throw new Error('Login failed');
      }
      const data = await response.json();
      console.log(`✅ 로그인 성공: ${data.name} (ID: ${data.id})`);
      return data;
    } catch (error) {
      console.error('❌ 로그인 요청 중 오류:', error);
      throw error;
    }
  },

  // 특정 팀 멤버 조회
  async getById(id) {
    try {
      const response = await fetch(`/api/team-members/${id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('팀 멤버 조회 실패:', error);
      return fallbackTeamData.find(m => m.id === id);
    }
  },

  // 새 팀 멤버 추가
  async create(memberData) {
    try {
      const response = await fetch('/api/team-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });
      if (!response.ok) throw new Error('Create failed');
      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('팀 멤버 생성 실패:', error);
      throw error;
    }
  },

  // 팀 멤버 업데이트
  async update(id, memberData) {
    try {
      const response = await fetch(`/api/team-members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });
      if (!response.ok) throw new Error('Update failed');
      return id;
    } catch (error) {
      console.error('팀 멤버 업데이트 실패:', error);
      throw error;
    }
  },

  // 팀 멤버 삭제
  async delete(id) {
    try {
      const response = await fetch(`/api/team-members/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
      return true;
    } catch (error) {
      console.error('팀 멤버 삭제 실패:', error);
      throw error;
    }
  },

  // 순서 업데이트
  async updateOrder(items) {
    try {
      const response = await fetch('/api/team-members/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (!response.ok) throw new Error('Update order failed');
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
    try {
      const response = await fetch('/api/posts');
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('게시글 조회 실패, 폴백 데이터 사용:', error);
      return fallbackPosts;
    }
  },

  // 특정 게시글 조회
  async getPostById(id) {
    try {
      const response = await fetch(`/api/posts/${id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      return fallbackPosts.find(p => p.id === id);
    }
  },

  // 새 게시글 추가
  async createPost(postData) {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      if (!response.ok) throw new Error('Create post failed');
      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('게시글 생성 실패:', error);
      throw error;
    }
  },

  // 게시글 업데이트
  async updatePost(id, postData) {
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      if (!response.ok) throw new Error('Update post failed');
      return id;
    } catch (error) {
      console.error('게시글 업데이트 실패:', error);
      throw error;
    }
  },

  // 게시글 삭제
  async deletePost(id) {
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete post failed');
      return true;
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      throw error;
    }
  },

  // 게시판 카테고리 조회
  async getCategories() {
    try {
      const response = await fetch('/api/board-categories');
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
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
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('댓글 조회 실패:', error);
      return fallbackComments.filter(c => c.post_id === postId);
    }
  },

  // 댓글 추가
  async addComment(commentData) {
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData),
      });
      if (!response.ok) throw new Error('Add comment failed');
      return await response.json();
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
    try {
      const response = await fetch('/api/stats-categories');
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
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
    try {
      const response = await fetch('/api/teams');
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
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
    try {
      const response = await fetch(`/api/teams/${teamId}/members`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
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
    try {
      const response = await fetch('/api/kpis');
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('KPI 조회 실패:', error);
      return [];
    }
  },

  // KPI 생성
  async create(kpiData) {
    try {
      const response = await fetch('/api/kpis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kpiData),
      });
      if (!response.ok) throw new Error('Create KPI failed');
      return await response.json();
    } catch (error) {
      console.error('KPI 생성 실패:', error);
      throw error;
    }
  },

  // KPI 수정
  async update(id, kpiData) {
    try {
      const response = await fetch(`/api/kpis/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kpiData),
      });
      if (!response.ok) throw new Error('Update KPI failed');
      return await response.json();
    } catch (error) {
      console.error('KPI 수정 실패:', error);
      throw error;
    }
  },

  // KPI 삭제
  async delete(id) {
    try {
      const response = await fetch(`/api/kpis/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete KPI failed');
      return true;
    } catch (error) {
      console.error('KPI 삭제 실패:', error);
      throw error;
    }
  }
};