-- 능력치 카테고리 초기 데이터
INSERT INTO stat_categories (name, display_name, description, sort_order) VALUES
('leadership', '리더십', '팀을 이끄는 능력', 1),
('communication', '소통력', '의사소통 및 협업 능력', 2),
('technical', '기술력', '전문 기술 및 개발 능력', 3),
('creativity', '창의력', '창의적 사고 및 문제 해결 능력', 4),
('reliability', '신뢰도', '업무 신뢰성 및 책임감', 5),
('passion', '열정', '업무에 대한 열정 및 동기', 6);

-- 게시판 카테고리 초기 데이터
INSERT INTO board_categories (name, display_name, description, color) VALUES
('notice', '공지사항', '중요한 공지사항', '#ef4444'),
('development', '개발', '개발 관련 정보 및 토론', '#3b82f6'),
('event', '이벤트', '팀 이벤트 및 행사', '#10b981'),
('free', '자유', '자유로운 소통 공간', '#8b5cf6');

-- 기존 JSON 데이터를 기반으로 팀 멤버 데이터 삽입
INSERT INTO team_members (id, name, role, mbti, image_url, description, tags) VALUES
(1, '김진성', '팀장', 'ENFP', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kim&backgroundColor=b6e3f4', '누구 밥 사줄까?.', '#큰형님,#소확행'),
(2, '김윤성', 'PM', 'ISTJ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka3&backgroundColor=b6e3f4', 'New ITSM 구축.', '#PM'),
(3, '박진서', '프로(책임)', 'INTP', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zack&backgroundColor=b6e3f4', '업무와 삶의 균형을 추구합니다.', '#부자'),
(4, '이원재', '프로(책임)', 'ESFJ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4', '술이 좋다.', '#베트남 맨'),
(5, '정상민', 'PM', 'ENTJ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=b6e3f4', '안되는건 없다.', '#하하하'),
(6, '정우진', '프로(책임)', 'ENTJ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=James2&backgroundColor=b6e3f4', '형이 해결해줄께.', '#착한사람'),
(7, '정호열', '프로(책임)', 'ISTJ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=James3&backgroundColor=b6e3f4', '좋은게 좋은거임.', '#한국은행'),
(8, '조정량', 'PM(책임)', 'INTP', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam&backgroundColor=b6e3f4', '살아남는자가 강한 자다', '#승리자'),
(9, '황대영', 'PL', 'ESFJ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4', '화이팅', '#불만러'),
(10, '김지영', '프로(책임)', 'ENTJ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=b6e3f4', '신한DS 걷기왕 입니다.', '#걷기왕'),
(11, '배준곤', '부서장대우', 'ENFP', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zack&backgroundColor=b6e3f4', '새마을금고 프로젝트.', '#부서장대우'),
(12, '김영환', '프로(수석)', 'ISTJ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4', '저녁엔 술이지.', '#넷플릭스중독'),
(13, '김호섭', '프로(수석)', 'ENTJ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=b6e3f4', '응징보복, 걸리면 죽는다.', '#짬처리 전문, #쌈닭'),
(14, '박상환', '프로(수석)', 'ESFJ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi&backgroundColor=b6e3f4', '백년관 7층 근무.', '#헬창'),
(15, '이길호', '프로(수석)', 'ENTJ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=b6e3f4', '대직자는 조정량프로 입니다.', '#빠르게'),
(16, '이민호', '한국은행 공통 PL', 'ENFP', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam&backgroundColor=b6e3f4', '분위기 메이커', '#얼리어탭터'),
(17, '이영철', '프로(수석)', 'ENTJ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4', '모든 일은 다 한다.', '#갈매청년'),
(18, '이지현', '한국은행 특화 핵심', 'ENTJ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=b6e3f4', '멀리는 안간다.', '#고양이 집사'),
(19, '이호원', '투블럭', 'ESFJ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zack&backgroundColor=b6e3f4', '히틀러, 제5원소', '#고양이집사'),
(20, '장호영', '개발맨', 'ENTJ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4', '집 밖은 위험해', '#집돌이'),
(21, '정병우', '프로(수석)', 'ENTJ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=James2&backgroundColor=b6e3f4', '시켜만 주십시오.', '#AI 맨'),
(22, '조진우', '프로(수석)', 'ENTJ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=James6&backgroundColor=b6e3f4', '사람이 필요 합니다.', '#맛집탐험대'),
(23, '한재인', '프로(수석)', 'ENTJ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=b6e3f4', '화이팅.', '#진자한 사람'),
(24, '강지형', '프로(선임)', 'ENTJ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix9&backgroundColor=b6e3f4', '한국은행에 있습니다.', '#GPT사용자'),
(25, '김가은', '프로(선임)', 'ENTJ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix2&backgroundColor=b6e3f4', '점심 메뉴 고르는 것에 진심인 편.', '#맛집탐험대'),
(26, '이수지', '뭐든 열심히', 'ENFP', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix6&backgroundColor=b6e3f4', '뭐든지 맡겨주세요.', '#솔져'),
(27, '안보라미', 'Marketer', 'ENTJ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix1&backgroundColor=b6e3f4', '점심 메뉴 고르는 것에 진심인 편.', '#맛집탐험대'),
(28, 'TBD', 'TBD', 'ENTJ', 'https://api.dicebear.com/7.x/avataaars/svg?seed=James9&backgroundColor=b6e3f4', '채워주세요.', '#뽑아만 주세요.');

-- 시퀀스 재설정 (ID 충돌 방지)
SELECT setval('team_members_id_seq', (SELECT MAX(id) FROM team_members));

-- 팀 멤버별 능력치 데이터 삽입
-- 김진성 (id: 1) - [90, 80, 80, 95, 75, 95]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(1, 1, 90), (1, 2, 80), (1, 3, 80), (1, 4, 95), (1, 5, 75), (1, 6, 95);

-- 김윤성 (id: 2) - [70, 88, 70, 92, 75, 85]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(2, 1, 70), (2, 2, 88), (2, 3, 70), (2, 4, 92), (2, 5, 75), (2, 6, 85);

-- 박진서 (id: 3) - [80, 65, 98, 88, 78, 80]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(3, 1, 80), (3, 2, 65), (3, 3, 98), (3, 4, 88), (3, 5, 78), (3, 6, 80);

-- 이원재 (id: 4) - [95, 80, 70, 95, 82, 90]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(4, 1, 95), (4, 2, 80), (4, 3, 70), (4, 4, 95), (4, 5, 82), (4, 6, 90);

-- 정상민 (id: 5) - [85, 80, 90, 88, 90, 85]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(5, 1, 85), (5, 2, 80), (5, 3, 90), (5, 4, 88), (5, 5, 90), (5, 6, 85);

-- 정우진 (id: 6) - [80, 80, 70, 88, 88, 95]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(6, 1, 80), (6, 2, 80), (6, 3, 70), (6, 4, 88), (6, 5, 88), (6, 6, 95);

-- 정호열 (id: 7) - [89, 58, 94, 54, 41, 55]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(7, 1, 89), (7, 2, 58), (7, 3, 94), (7, 4, 54), (7, 5, 41), (7, 6, 55);

-- 조정량 (id: 8) - [58, 69, 67, 88, 13, 78]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(8, 1, 58), (8, 2, 69), (8, 3, 67), (8, 4, 88), (8, 5, 13), (8, 6, 78);

-- 황대영 (id: 9) - [82, 79, 52, 91, 51, 42]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(9, 1, 82), (9, 2, 79), (9, 3, 52), (9, 4, 91), (9, 5, 51), (9, 6, 42);

-- 김지영 (id: 10) - [48, 66, 70, 80, 65, 79]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(10, 1, 48), (10, 2, 66), (10, 3, 70), (10, 4, 80), (10, 5, 65), (10, 6, 79);

-- 배준곤 (id: 11) - [89, 97, 60, 69, 78, 74]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(11, 1, 89), (11, 2, 97), (11, 3, 60), (11, 4, 69), (11, 5, 78), (11, 6, 74);

-- 김영환 (id: 12) - [77, 87, 49, 64, 77, 90]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(12, 1, 77), (12, 2, 87), (12, 3, 49), (12, 4, 64), (12, 5, 77), (12, 6, 90);

-- 김호섭 (id: 13) - [75, 90, 82, 88, 78, 95]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(13, 1, 75), (13, 2, 90), (13, 3, 82), (13, 4, 88), (13, 5, 78), (13, 6, 95);

-- 박상환 (id: 14) - [85, 84, 99, 63, 47, 43]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(14, 1, 85), (14, 2, 84), (14, 3, 99), (14, 4, 63), (14, 5, 47), (14, 6, 43);

-- 이길호 (id: 15) - [75, 90, 82, 88, 78, 95]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(15, 1, 75), (15, 2, 90), (15, 3, 82), (15, 4, 88), (15, 5, 78), (15, 6, 95);

-- 이민호 (id: 16) - [96, 59, 17, 91, 52, 91]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(16, 1, 96), (16, 2, 59), (16, 3, 17), (16, 4, 91), (16, 5, 52), (16, 6, 91);

-- 이영철 (id: 17) - [75, 84, 69, 96, 75, 96]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(17, 1, 75), (17, 2, 84), (17, 3, 69), (17, 4, 96), (17, 5, 75), (17, 6, 96);

-- 이지현 (id: 18) - [75, 90, 82, 88, 78, 95]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(18, 1, 75), (18, 2, 90), (18, 3, 82), (18, 4, 88), (18, 5, 78), (18, 6, 95);

-- 이호원 (id: 19) - [54, 65, 94, 79, 55, 78]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(19, 1, 54), (19, 2, 65), (19, 3, 94), (19, 4, 79), (19, 5, 55), (19, 6, 78);

-- 장호영 (id: 20) - [87, 86, 74, 94, 49, 92]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(20, 1, 87), (20, 2, 86), (20, 3, 74), (20, 4, 94), (20, 5, 49), (20, 6, 92);

-- 정병우 (id: 21) - [75, 90, 82, 88, 78, 95]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(21, 1, 75), (21, 2, 90), (21, 3, 82), (21, 4, 88), (21, 5, 78), (21, 6, 95);

-- 조진우 (id: 22) - [75, 90, 82, 88, 78, 95]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(22, 1, 75), (22, 2, 90), (22, 3, 82), (22, 4, 88), (22, 5, 78), (22, 6, 95);

-- 한재인 (id: 23) - [75, 90, 82, 88, 78, 95]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(23, 1, 75), (23, 2, 90), (23, 3, 82), (23, 4, 88), (23, 5, 78), (23, 6, 95);

-- 강지형 (id: 24) - [75, 90, 82, 88, 78, 95]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(24, 1, 75), (24, 2, 90), (24, 3, 82), (24, 4, 88), (24, 5, 78), (24, 6, 95);

-- 김가은 (id: 25) - [75, 90, 82, 88, 78, 95]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(25, 1, 75), (25, 2, 90), (25, 3, 82), (25, 4, 88), (25, 5, 78), (25, 6, 95);

-- 이수지 (id: 26) - [73, 85, 56, 61, 92, 94]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(26, 1, 73), (26, 2, 85), (26, 3, 56), (26, 4, 61), (26, 5, 92), (26, 6, 94);

-- 안보라미 (id: 27) - [75, 90, 82, 88, 78, 95]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(27, 1, 75), (27, 2, 90), (27, 3, 82), (27, 4, 88), (27, 5, 78), (27, 6, 95);

-- TBD (id: 28) - [50, 50, 50, 50, 50, 50]
INSERT INTO member_stats (member_id, stat_category_id, value) VALUES
(28, 1, 50), (28, 2, 50), (28, 3, 50), (28, 4, 50), (28, 5, 50), (28, 6, 50);

-- 샘플 게시글 데이터
INSERT INTO posts (title, content, author_id, author_name, category_id) VALUES
('팀 프로젝트 킥오프 미팅', '새로운 프로젝트를 시작합니다! 모든 팀원들의 적극적인 참여 부탁드립니다.', 1, '김진성', 1),
('코드 리뷰 가이드라인', '효율적인 코드 리뷰를 위한 가이드라인을 공유합니다.', 3, '박진서', 2),
('팀 빌딩 이벤트 안내', '다음 주 금요일에 팀 빌딩 이벤트가 있습니다. 많은 참여 부탁드려요!', 5, '정상민', 3);