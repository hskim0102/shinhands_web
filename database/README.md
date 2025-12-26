# 데이터베이스 설정 가이드

## 개요
이 프로젝트는 PostgreSQL 데이터베이스를 사용하여 팀 멤버 정보, 능력치, 게시판 데이터를 저장합니다.

## 데이터베이스 구조

### 테이블 구조
1. **team_members** - 팀 멤버 기본 정보
2. **stat_categories** - 능력치 카테고리 (리더십, 소통력, 기술력 등)
3. **member_stats** - 팀 멤버별 능력치 점수
4. **board_categories** - 게시판 카테고리
5. **posts** - 게시글
6. **comments** - 댓글 (향후 확장용)

### 관계도
```
team_members (1) ←→ (N) member_stats (N) ←→ (1) stat_categories
team_members (1) ←→ (N) posts (N) ←→ (1) board_categories
posts (1) ←→ (N) comments
```

## 설정 방법

### 1. 환경 변수 설정
`.env` 파일에 데이터베이스 연결 정보가 설정되어 있는지 확인하세요.

```bash
DATABASE_URL=postgresql://username:password@host:port/database
```

### 2. 데이터베이스 스키마 생성
```bash
# PostgreSQL에 연결
psql $DATABASE_URL

# 스키마 실행
\i database/schema.sql
```

### 3. 초기 데이터 삽입
```bash
# 초기 데이터 삽입
\i database/seed.sql
```

### 4. 또는 한 번에 실행
```bash
# 스키마와 초기 데이터를 한 번에 실행
psql $DATABASE_URL -f database/schema.sql -f database/seed.sql
```

## 주요 쿼리 예제

### 팀 멤버와 능력치 조회
```sql
SELECT 
  tm.name,
  tm.role,
  json_agg(
    json_build_object(
      'category', sc.display_name,
      'value', ms.value
    ) ORDER BY sc.sort_order
  ) as stats
FROM team_members tm
LEFT JOIN member_stats ms ON tm.id = ms.member_id
LEFT JOIN stat_categories sc ON ms.stat_category_id = sc.id
WHERE tm.id = 1
GROUP BY tm.id, tm.name, tm.role;
```

### 게시글 목록 조회
```sql
SELECT 
  p.title,
  p.author_name,
  p.created_at,
  bc.display_name as category
FROM posts p
JOIN board_categories bc ON p.category_id = bc.id
WHERE p.is_deleted = FALSE
ORDER BY p.created_at DESC;
```

## 데이터 마이그레이션

### JSON에서 데이터베이스로 마이그레이션
기존 `teamMembers.json` 파일의 데이터는 `seed.sql`에 이미 포함되어 있습니다.

### 능력치 배열 형태 유지
기존 코드와의 호환성을 위해 `database.js`에서 변환 함수를 제공합니다:
- `convertStatsArrayToObject()` - 배열을 객체로 변환
- `convertStatsObjectToArray()` - 객체를 배열로 변환

## 백업 및 복원

### 백업
```bash
pg_dump $DATABASE_URL > backup.sql
```

### 복원
```bash
psql $DATABASE_URL < backup.sql
```

## 성능 최적화

### 인덱스
- `member_stats`의 `member_id`, `stat_category_id`에 인덱스 생성됨
- `posts`의 `category_id`, `author_id`, `created_at`에 인덱스 생성됨

### 쿼리 최적화
- JOIN을 사용하여 N+1 문제 방지
- JSON 집계 함수를 사용하여 능력치 데이터를 효율적으로 조회

## 보안 고려사항

1. **환경 변수**: 데이터베이스 연결 정보는 `.env` 파일에 저장
2. **SQL 인젝션 방지**: 모든 쿼리에서 파라미터화된 쿼리 사용
3. **접근 권한**: 데이터베이스 사용자 권한을 최소한으로 설정
4. **SSL 연결**: 프로덕션 환경에서는 SSL 연결 사용

## 문제 해결

### 연결 오류
- `.env` 파일의 데이터베이스 URL 확인
- 네트워크 연결 및 방화벽 설정 확인
- 데이터베이스 서버 상태 확인

### 권한 오류
- 데이터베이스 사용자 권한 확인
- 테이블 생성 권한 확인

### 데이터 타입 오류
- 능력치 값은 0-100 범위의 정수
- MBTI는 4자리 문자열
- 날짜는 ISO 8601 형식