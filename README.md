# 그룹SI팀 Awesome - 팀원 소개 앱

React + Vite + PostgreSQL로 구축된 팀원 소개, 능력치 시각화 및 게시판 애플리케이션입니다.

## 주요 기능

### 팀원 관리
- 팀원 프로필 카드 뷰
- 육각형 레이더 차트로 능력치 시각화
- 실시간 검색 및 필터링
- 팀원 정보 편집 기능

### 게시판
- 카테고리별 게시글 관리
- 게시글 작성, 수정, 삭제
- 조회수 추적
- 반응형 디자인

### 데이터베이스 연동
- PostgreSQL 데이터베이스 연동
- 실시간 데이터 동기화
- 트랜잭션 기반 안전한 데이터 처리

## 데이터베이스 설정

### 1. 환경 변수 설정
`.env` 파일을 생성하고 데이터베이스 연결 정보를 설정하세요:

```bash
# Database Configuration
DATABASE_URL=your_postgresql_connection_string
VITE_DATABASE_URL=your_postgresql_connection_string
```

### 2. 데이터베이스 스키마 생성
```bash
# PostgreSQL에 연결
psql $DATABASE_URL

# 스키마 및 초기 데이터 생성
\i database/schema.sql
\i database/seed.sql
```

### 3. 연결 테스트
```bash
node database/test-connection.js
```

## 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 설정파일 구조

### 팀 설정 (`src/config/teamConfig.json`)
```json
{
  "teamInfo": {
    "name": "팀 이름",
    "description": "팀 설명",
    "subtitle": "부제목"
  },
  "statLabels": ["리더십", "소통력", "기술력", "창의력", "신뢰도", "열정"]
}
```

## 데이터베이스 구조

### 주요 테이블
- `team_members` - 팀 멤버 기본 정보
- `member_stats` - 팀 멤버별 능력치
- `stat_categories` - 능력치 카테고리
- `posts` - 게시글
- `board_categories` - 게시판 카테고리

자세한 데이터베이스 구조는 `database/README.md`를 참조하세요.

## 사용법

1. 데이터베이스 설정 완료 후 애플리케이션 실행
2. 팀 멤버 탭에서 팀원 정보 확인
3. 게시판 탭에서 팀 소통
4. 검색창으로 이름, 역할, MBTI 검색
5. "설정 리로드" 버튼으로 데이터 새로고침

## 기술 스택

- **Frontend**: React 18, Vite, Tailwind CSS
- **Database**: PostgreSQL, Neon Serverless
- **Icons**: Lucide React
- **State Management**: React Hooks

## 보안 고려사항

- 환경 변수를 통한 데이터베이스 연결 정보 관리
- SQL 인젝션 방지를 위한 파라미터화된 쿼리 사용
- 클라이언트 사이드 데이터베이스 연결 (개발용, 프로덕션에서는 백엔드 API 권장)

## 배포

프로덕션 환경에서는 보안을 위해 백엔드 API 서버를 통해 데이터베이스에 접근하는 것을 권장합니다.

---

## React + Vite Template Info

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.