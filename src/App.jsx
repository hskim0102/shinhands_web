import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Zap, Coffee, MessageCircle, Brain, Moon, Sun, Sparkles, Hash, Edit2, Save } from 'lucide-react';

// --- 유틸리티 및 데이터 생성 (실제 사용 시 API나 DB로 교체 가능) ---

// 재미있는 능력치 항목들
const STAT_LABELS = [
  "드립력",   // Humor
  "커피수혈", // Coffee dependency
  "칼퇴본능", // Desire to leave on time
  "멘탈갑",   // Mental strength
  "알콜해독", // Alcohol tolerance
  "업무센스"  // Work sense
];

// 랜덤 데이터 생성기 (27명의 팀원 시뮬레이션)
const generateTeamData = () => {
  const roles = ["Frontend Dev", "Backend Dev", "Designer", "PM", "Marketer", "Data Analyst"];
  const images = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Zack",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam"
  ];

  return Array.from({ length: 28 }, (_, i) => ({
    id: i + 1,
    name: `팀원 ${i + 1}`,
    role: roles[i % roles.length],
    mbti: ["ENFP", "ISTJ", "INTP", "ESFJ", "ENTJ"][i % 5],
    image: images[i % images.length] + `&backgroundColor=b6e3f4`,
    description: i % 3 === 0 ? "코딩하다가 딴짓하는 게 취미입니다." : "점심 메뉴 고르는 것에 진심인 편.",
    tags: ["#맛집탐험대", "#헬창", "#고양이집사", "#넷플릭스중독"][i % 4],
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

// 로컬 스토리지 키
const STORAGE_KEY = 'groupsiteam-team-data';

// --- 컴포넌트: 육각형 레이더 차트 (SVG) ---
const HexChart = ({ stats, labels, color = "#8b5cf6" }) => {
  const size = 200;
  const center = size / 2;
  const radius = (size / 2) - 30; // 텍스트 공간 확보
  const maxStat = 100;

  // 각도 계산 함수
  const getPoint = (value, index, total) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const x = center + (radius * (value / maxStat)) * Math.cos(angle);
    const y = center + (radius * (value / maxStat)) * Math.sin(angle);
    return `${x},${y}`;
  };

  // 배경 가이드라인 (육각형)
  const guides = [20, 40, 60, 80, 100].map(level => {
    const points = stats.map((_, i) => getPoint(level, i, stats.length)).join(" ");
    return <polygon key={level} points={points} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
  });

  // 실제 데이터 영역
  const dataPoints = stats.map((val, i) => getPoint(val, i, stats.length)).join(" ");

  // 라벨 위치
  const labelElements = labels.map((label, i) => {
    const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
    const x = center + (radius + 20) * Math.cos(angle);
    const y = center + (radius + 20) * Math.sin(angle);
    return (
      <text
        key={i}
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="11"
        className="font-bold drop-shadow-md"
      >
        {label}
      </text>
    );
  });

  return (
    <div className="relative flex justify-center items-center">
      <svg width={size} height={size} className="overflow-visible">
        {guides}
        <polygon points={dataPoints} fill={color} fillOpacity="0.4" stroke={color} strokeWidth="2" />
        {/* 각 꼭지점 점 찍기 */}
        {stats.map((val, i) => {
           const [cx, cy] = getPoint(val, i, stats.length).split(",");
           return <circle key={i} cx={cx} cy={cy} r="3" fill="white" />;
        })}
        {labelElements}
      </svg>
    </div>
  );
};

// --- 메인 애플리케이션 ---
export default function App() {
  // 로컬 스토리지에서 데이터 로드 또는 초기 데이터 생성
  const [teamData, setTeamData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return generateTeamData();
      }
    }
    return generateTeamData();
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState(null);

  // 데이터 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teamData));
  }, [teamData]);

  // 검색 필터링
  const filteredMembers = useMemo(() => {
    return teamData.filter(member =>
      member.name.includes(searchTerm) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.mbti.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, teamData]);

  // 멤버 정보 업데이트 함수
  const updateMember = (memberId, updatedData) => {
    setTeamData(prevData =>
      prevData.map(member =>
        member.id === memberId
          ? { ...member, ...updatedData }
          : member
      )
    );
  };

  // 모달에서 표시할 최신 멤버 데이터
  const currentMember = useMemo(() => {
    if (!selectedMember) return null;
    return teamData.find(m => m.id === selectedMember.id) || selectedMember;
  }, [selectedMember, teamData]);

  // 모달 열기 시 편집 상태 초기화
  const handleOpenModal = (member) => {
    setSelectedMember(member);
    setIsEditing(false);
    setEditingData(null);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setSelectedMember(null);
    setIsEditing(false);
    setEditingData(null);
  };

  // 편집 모드 시작
  const handleStartEdit = () => {
    if (currentMember) {
      setIsEditing(true);
      setEditingData({
        name: currentMember.name,
        role: currentMember.role,
        mbti: currentMember.mbti,
        tags: currentMember.tags,
        description: currentMember.description,
        image: currentMember.image,
        stats: [...currentMember.stats]
      });
    }
  };

  // 편집 저장
  const handleSaveEdit = () => {
    if (currentMember && editingData) {
      updateMember(currentMember.id, editingData);
      setIsEditing(false);
      setEditingData(null);
    }
  };

  // 편집 취소
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingData(null);
  };

  // 필드 값 변경
  const handleFieldChange = (field, value) => {
    if (editingData) {
      setEditingData({ ...editingData, [field]: value });
    }
  };

  // 능력치 값 변경
  const handleStatChange = (index, value) => {
    if (editingData) {
      const newStats = [...editingData.stats];
      newStats[index] = Math.max(0, Math.min(100, parseInt(value) || 0));
      setEditingData({ ...editingData, stats: newStats });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-purple-500 selection:text-white pb-20">
      {/* 배경 장식 (Gradients) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]"></div>
      </div>

      {/* 헤더 */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0f172a]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-purple-500 to-blue-500 p-2 rounded-lg">
              <Sparkles size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              그룹SI팀 Awesome
            </h1>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="이름, 역할, MBTI로 검색해보세요..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-slate-500"
            />
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* 인트로 텍스트 */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            우리는 <span className="text-purple-400">27명</span>의<br className="md:hidden" /> 전사들 입니다.
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            서로의 능력치를 확인하고 더 가까워지세요! 카드를 클릭하면 상세 스탯을 볼 수 있습니다.
          </p>
        </div>

        {/* 팀 그리드 (Bento Grid Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => handleOpenModal(member)}
              className="group relative bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 hover:border-purple-500/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden backdrop-blur-sm"
            >
              {/* 카드 호버시 배경 효과 */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[2px]">
                    <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden">
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-slate-700 text-xs px-2 py-1 rounded-full border border-slate-600 font-mono text-purple-300">
                    {member.mbti}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                <p className="text-sm text-slate-400 font-medium mb-3">{member.role}</p>
                
                <div className="w-full h-[1px] bg-white/10 my-3" />

                <p className="text-sm text-slate-300 text-center line-clamp-2 min-h-[2.5rem]">
                  "{member.description}"
                </p>

                <div className="mt-4 flex gap-2 flex-wrap justify-center">
                   <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-md">
                     {member.tags}
                   </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">검색 결과가 없습니다 😢</p>
          </div>
        )}
      </main>

      {/* 상세 모달 */}
      {currentMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={handleCloseModal}
          />
          
          <div className="relative w-full max-w-4xl bg-[#1e293b] rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col md:flex-row">
            
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-20"
            >
              <X size={20} />
            </button>

            {/* 좌측: 프로필 정보 */}
            <div className="w-full md:w-2/5 bg-gradient-to-br from-slate-800 to-slate-900 p-8 flex flex-col items-center justify-center border-r border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500" />
              
              <div className="w-40 h-40 rounded-full border-4 border-slate-700/50 shadow-xl overflow-hidden mb-6 relative">
                 <img 
                   src={isEditing && editingData ? editingData.image : currentMember.image} 
                   alt={isEditing && editingData ? editingData.name : currentMember.name} 
                   className="w-full h-full object-cover bg-slate-800" 
                 />
              </div>

              {isEditing && editingData ? (
                <input
                  type="text"
                  value={editingData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="text-3xl font-bold text-white mb-2 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-center w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <h2 className="text-3xl font-bold text-white mb-2">{currentMember.name}</h2>
              )}

              {isEditing && editingData ? (
                <input
                  type="text"
                  value={editingData.role}
                  onChange={(e) => handleFieldChange('role', e.target.value)}
                  className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-semibold mb-6 border border-blue-500/20 w-full text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-semibold mb-6 border border-blue-500/20">
                  {currentMember.role}
                </span>
              )}

              <div className="w-full space-y-4">
                 <div className="p-3 bg-white/5 rounded-xl">
                    <span className="text-slate-400 flex items-center gap-2 mb-2"><Brain size={16}/> MBTI</span>
                    {isEditing && editingData ? (
                      <input
                        type="text"
                        value={editingData.mbti}
                        onChange={(e) => handleFieldChange('mbti', e.target.value.toUpperCase())}
                        maxLength={4}
                        className="w-full font-mono font-bold text-purple-400 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <span className="font-mono font-bold text-purple-400">{currentMember.mbti}</span>
                    )}
                 </div>
                 <div className="p-3 bg-white/5 rounded-xl">
                    <span className="text-slate-400 flex items-center gap-2 mb-2"><Hash size={16}/> 키워드</span>
                    {isEditing && editingData ? (
                      <input
                        type="text"
                        value={editingData.tags}
                        onChange={(e) => handleFieldChange('tags', e.target.value)}
                        className="w-full text-sm text-slate-200 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="#태그입력"
                      />
                    ) : (
                      <span className="text-sm text-slate-200">{currentMember.tags}</span>
                    )}
                 </div>
                 {isEditing && editingData && (
                   <div className="p-3 bg-white/5 rounded-xl">
                     <span className="text-slate-400 flex items-center gap-2 mb-2">사진 URL</span>
                     <input
                       type="text"
                       value={editingData.image}
                       onChange={(e) => handleFieldChange('image', e.target.value)}
                       className="w-full text-xs text-slate-200 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                       placeholder="이미지 URL 입력"
                     />
                   </div>
                 )}
              </div>
            </div>

            {/* 우측: 상세 스탯 & 소개 */}
            <div className="w-full md:w-3/5 p-8 bg-[#0f172a]">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                    <Zap className="text-yellow-400" size={20} />
                    능력치 분석
                  </h3>
                  {!isEditing ? (
                    <button
                      onClick={handleStartEdit}
                      className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm transition-colors border border-purple-500/30"
                    >
                      <Edit2 size={16} />
                      편집
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm transition-colors border border-green-500/30"
                      >
                        <Save size={16} />
                        저장
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 bg-slate-600/20 hover:bg-slate-600/30 text-slate-300 rounded-lg text-sm transition-colors border border-slate-500/30"
                      >
                        취소
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5">
                  <div className="flex justify-center mb-6">
                    <HexChart 
                      stats={isEditing && editingData ? editingData.stats : currentMember.stats} 
                      labels={STAT_LABELS} 
                      color="#8b5cf6"
                    />
                  </div>
                  
                  {/* 능력치 편집 UI */}
                  {isEditing && editingData && (
                    <div className="mt-6 space-y-4">
                      {STAT_LABELS.map((label, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-300">
                              {label}
                            </label>
                            <span className="text-sm font-bold text-purple-400 w-12 text-right">
                              {editingData.stats[index]}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={editingData.stats[index]}
                              onChange={(e) => handleStatChange(index, e.target.value)}
                              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={editingData.stats[index]}
                              onChange={(e) => handleStatChange(index, e.target.value)}
                              className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
                  <MessageCircle className="text-green-400" size={20} />
                  한줄 소개
                </h3>
                {isEditing && editingData ? (
                  <textarea
                    value={editingData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    rows={3}
                    className="w-full text-slate-300 leading-relaxed bg-slate-800/30 p-4 rounded-xl border border-white/5 italic focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="한줄 소개를 입력하세요..."
                  />
                ) : (
                  <p className="text-slate-300 leading-relaxed bg-slate-800/30 p-4 rounded-xl border border-white/5 italic">
                    "{currentMember.description}"
                  </p>
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-sm text-slate-500">
                <span>Employee ID: #{currentMember.id.toString().padStart(3, '0')}</span>
                <span className="flex items-center gap-1">
                  Team Awesome <Sparkles size={12} />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}