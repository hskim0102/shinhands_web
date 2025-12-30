# API 문서

이 문서는 프로젝트에서 사용 가능한 API 서비스들을 설명합니다. 해당 서비스들은 `src/services/api.js`에 정의되어 있으며, Neon PostgreSQL 데이터베이스와의 통신을 담당하고 데이터베이스를 사용할 수 없을 경우 폴백(Fallback) 데이터를 제공합니다.

## 1. 팀 멤버 API (`teamMemberAPI`)

팀 멤버의 개인 정보, 능력치, 역할을 포함한 모든 데이터를 관리합니다.

| 메서드 | 설명 | 파라미터 | 반환값 |
| :--- | :--- | :--- | :--- |
| `getAll()` | 모든 팀 멤버와 그들의 능력치를 조회합니다. | 없음 | `Promise<Array<Member>>` |
| `getById(id)` | 특정 ID를 가진 팀 멤버를 조회합니다. | `id` (Number) | `Promise<Member>` |
| `create(memberData)` | 새로운 팀 멤버를 생성합니다. | `memberData` (Object) | `Promise<Number>` (생성된 멤버 ID) |
| `update(id, memberData)`| 기존 팀 멤버 정보를 수정합니다. | `id` (Number), `memberData` (Object)| `Promise<Number>` (수정된 멤버 ID)|
| `delete(id)` | 팀 멤버를 삭제합니다. | `id` (Number) | `Promise<Boolean>` |

### 멤버 데이터 구조
```json
{
  "name": "String (이름)",
  "role": "String (역할)",
  "team": "String (팀 ID)",
  "mbti": "String (MBTI)",
  "image": "String (이미지 URL)",
  "description": "String (소개)",
  "tags": "String (쉼표로 구분된 태그)",
  "stats": "Array<Number> (능력치 배열)"
}
```

---

## 2. 게시판 API (`boardAPI`)

게시글의 작성, 조회, 수정, 삭제를 포함한 게시판 기능을 관리합니다.

| 메서드 | 설명 | 파라미터 | 반환값 |
| :--- | :--- | :--- | :--- |
| `getAllPosts()` | 삭제되지 않은 모든 게시글을 조회합니다. | 없음 | `Promise<Array<Post>>` |
| `getPostById(id)` | 특정 게시글을 조회하고 조회수를 증가시킵니다.| `id` (Number) | `Promise<Post>` |
| `createPost(postData)` | 새로운 게시글을 작성합니다. | `postData` (Object) | `Promise<Number>` (생성된 게시글 ID) |
| `updatePost(id, postData)`| 기존 게시글을 수정합니다. | `id` (Number), `postData` (Object) | `Promise<Number>` (수정된 게시글 ID)|
| `deletePost(id)` | 게시글을 소프트 삭제(Soft Delete) 합니다. | `id` (Number) | `Promise<Boolean>` |
| `getCategories()` | 게시판 카테고리 목록을 조회합니다. | 없음 | `Promise<Array<Category>>` |

### 게시글 데이터 구조
```json
{
  "title": "String (제목)",
  "content": "String (내용)",
  "author": "String (작성자)",
  "category": "String (카테고리)"
}
```

---

## 3. 능력치 API (`statsAPI`)

멤버의 육각형 차트에 사용되는 능력치 카테고리를 관리합니다.

| 메서드 | 설명 | 파라미터 | 반환값 |
| :--- | :--- | :--- | :--- |
| `getCategories()` | 능력치 카테고리 정의를 조회합니다. | 없음 | `Promise<Array<StatCategory>>` |

---

## 4. 팀 API (`teamAPI`)

팀 구성을 관리합니다.

| 메서드 | 설명 | 파라미터 | 반환값 |
| :--- | :--- | :--- | :--- |
| `getAll()` | 정의된 모든 팀 목록을 조회합니다. | 없음 | `Promise<Array<Team>>` |
| `getMembers(teamId)` | 특정 팀에 소속된 모든 멤버를 조회합니다.| `teamId` (String) | `Promise<Array<Member>>` |

### 팀 데이터 구조
```json
{
  "id": "String (팀 ID)",
  "name": "String (팀 이름)",
  "description": "String (설명)",
  "color": "String (색상 Hex 코드)"
}
```
