// 설정파일 로더 유틸리티

import teamConfig from '../config/teamConfig.json';
import teamMembersData from '../data/teamMembers.json';

// 팀 설정 정보 가져오기
export const getTeamConfig = () => {
  return teamConfig;
};

// 팀원 데이터 가져오기
export const getTeamMembers = () => {
  return teamMembersData;
};

// 랜덤 데이터 생성 (기존 로직을 설정파일 기반으로 변경)
export const generateTeamDataFromConfig = (memberCount = 28) => {
  const config = getTeamConfig();
  const { roles, mbtiTypes, defaultTags, avatarSeeds, defaultDescriptions } = config;
  
  return Array.from({ length: memberCount }, (_, i) => ({
    id: i + 1,
    name: `팀원 ${i + 1}`,
    role: roles[i % roles.length],
    mbti: mbtiTypes[i % mbtiTypes.length],
    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeeds[i % avatarSeeds.length]}&backgroundColor=b6e3f4`,
    description: defaultDescriptions[i % defaultDescriptions.length],
    tags: defaultTags[i % defaultTags.length],
    stats: [
      Math.floor(Math.random() * 60) + 40, // 40~100 사이 랜덤
      Math.floor(Math.random() * 60) + 40,
      Math.floor(Math.random() * 60) + 40,
      Math.floor(Math.random() * 60) + 40,
      Math.floor(Math.random() * 60) + 40,
      Math.floor(Math.random() * 60) + 40,
    ]
  }));
};

// 실제 팀원 데이터와 생성된 데이터 합치기
export const getInitialTeamData = () => {
  const realMembers = getTeamMembers();
  const generatedMembers = generateTeamDataFromConfig(28 - realMembers.length);
  
  // 실제 데이터가 있으면 우선 사용하고, 부족한 만큼 생성된 데이터로 채움
  return [...realMembers, ...generatedMembers];
};