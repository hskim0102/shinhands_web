# 그룹SI팀 Awesome - 팀원 소개 앱

React + Vite로 구축된 팀원 소개 및 능력치 시각화 애플리케이션입니다.

## 주요 기능

- 팀원 프로필 카드 뷰
- 육각형 레이더 차트로 능력치 시각화
- 실시간 검색 및 필터링
- 팀원 정보 편집 기능
- 설정파일 기반 데이터 관리

## 설정파일 구조

### 팀 설정 (`src/config/teamConfig.json`)
```json
{
  "teamInfo": {
    "name": "팀 이름",
    "description": "팀 설명",
    "subtitle": "부제목"
  },
  "statLabels": ["능력치1", "능력치2", ...],
  "roles": ["역할1", "역할2", ...],
  "mbtiTypes": ["MBTI 타입들"],
  "defaultTags": ["기본 태그들"],
  "avatarSeeds": ["아바타 시드들"],
  "defaultDescriptions": ["기본 설명들"]
}
```

### 팀원 데이터 (`src/data/teamMembers.json`)
```json
[
  {
    "id": 1,
    "name": "이름",
    "role": "역할",
    "mbti": "MBTI",
    "image": "이미지 URL",
    "description": "소개",
    "tags": "태그",
    "stats": [능력치1, 능력치2, ...]
  }
]
```

## 사용법

1. 설정파일 수정 후 "설정 리로드" 버튼 클릭
2. 팀원 카드 클릭으로 상세 정보 확인
3. 편집 버튼으로 팀원 정보 수정 가능
4. 검색창으로 이름, 역할, MBTI 검색

## 개발 환경 설정

```bash
npm install
npm run dev
```

## 기술 스택

- React 18
- Vite
- Tailwind CSS
- Lucide React Icons

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