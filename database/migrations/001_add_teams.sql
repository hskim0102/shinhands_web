-- 팀 테이블 생성
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#8b5cf6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 팀 멤버 테이블에 team_id 컬럼 추가
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS team_id VARCHAR(50) REFERENCES teams(id) ON DELETE SET NULL;

-- 팀 테이블에 업데이트 트리거 추가
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);

-- 기본 팀 데이터 삽입
INSERT INTO teams (id, name, description, color) VALUES
('dx-headquarters', 'DX본부', 'DX본부 전체 조직', '#8b5cf6'),
('dx-promotion', 'DX추진팀', 'DX 전략 기획 및 추진', '#06b6d4'),
('financial-dx', '금융DX팀', '금융 서비스 디지털 혁신', '#10b981'),
('mobile-dx', '모바일DX팀', '모바일 플랫폼 개발 및 운영', '#f59e0b'),
('global-dx', '글로벌DX팀', '글로벌 디지털 서비스 확장', '#ef4444')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    color = EXCLUDED.color,
    updated_at = CURRENT_TIMESTAMP;