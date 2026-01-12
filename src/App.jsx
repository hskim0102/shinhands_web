import { useState, useMemo, useEffect } from 'react';
import { Search, X, Zap, MessageCircle, Brain, Sparkles, Hash, Menu, Users, FileText, Plus, Calendar, User, Edit3, Save, XCircle, Grid, Hexagon, Rocket, BarChart3, Smartphone, Globe2, Trash2, LogOut, Target } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import LoginPage from './LoginPage';
import KPIPage from './KPIPage';
import { getTeamConfig } from './utils/configLoader';
import { teamMemberAPI, boardAPI, statsAPI } from './services/api';

// 설정파일에서 데이터 로드
const teamConfig = getTeamConfig();
const STAT_LABELS = teamConfig.statLabels;

// 팀 아이콘 매핑
const TEAM_ICONS = {
  "dx-headquarters": Hexagon,
  "dx-promotion": Rocket,
  "financial-dx": BarChart3,
  "mobile-dx": Smartphone,
  "global-dx": Globe2,
};


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

// --- 컴포넌트: 정렬 가능한 카드 (Sortable Card) ---
const SortableMemberCard = ({ member, memberTeam, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        // 드래그가 아닐 때만 클릭 이벤트 발생
        if (!isDragging) {
          onClick(member);
        }
      }}
      className="group relative bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 hover:border-purple-500/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 cursor-grab active:cursor-grabbing overflow-hidden backdrop-blur-sm"
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
        <p className="text-sm text-slate-400 font-medium mb-2">{member.role}</p>

        {/* 팀 정보 표시 */}
        {memberTeam && (
          <div
            className="px-2 py-1 rounded-md text-xs font-medium mb-3"
            style={{
              backgroundColor: `${memberTeam.color}20`,
              color: memberTeam.color,
              border: `1px solid ${memberTeam.color}30`
            }}
          >
            {memberTeam.name}
          </div>
        )}

        <div className="w-full h-[1px] bg-white/10 my-3" />

        <p className="text-sm text-slate-300 text-center line-clamp-2 min-h-[2.5rem]">
          "{member.description}"
        </p>

        <div className="mt-4 flex gap-2 flex-wrap justify-center">
          {member.tags && member.tags.split(',').map((tag, i) => (
            <span key={i} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-md">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 메인 애플리케이션 ---
export default function App() {
  // 상태 관리
  const [teamData, setTeamData] = useState([]);
  const [posts, setPosts] = useState([]);
  const [statCategories, setStatCategories] = useState([]);
  const [boardCategories, setBoardCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [currentView, setCurrentView] = useState("team"); // "team" | "board"
  const [selectedTeam, setSelectedTeam] = useState("all"); // "all" | team id
  const [selectedPost, setSelectedPost] = useState(null);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [showNewMemberForm, setShowNewMemberForm] = useState(false);
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [editingMemberData, setEditingMemberData] = useState(null);

  // 인증 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // 초기 로딩 시 로그인 상태 확인
  useEffect(() => {
    const savedUser = localStorage.getItem('team_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // 로그인 핸들러
  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('team_user', JSON.stringify(user));
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      setCurrentUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem('team_user');
    }
  };

  // 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 병렬로 데이터 로드
      const [teamMembers, boardPosts, statCats, boardCats] = await Promise.all([
        teamMemberAPI.getAll(),
        boardAPI.getAllPosts(),
        statsAPI.getCategories(),
        boardAPI.getCategories()
      ]);

      setTeamData(teamMembers);
      setPosts(boardPosts);
      setStatCategories(statCats);
      setBoardCategories(boardCats);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      setError('데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 새 게시글 추가
  const addNewPost = async (postData) => {
    try {
      const newPostId = await boardAPI.createPost(postData);
      // 게시글 목록 새로고침
      const updatedPosts = await boardAPI.getAllPosts();
      setPosts(updatedPosts);
      setShowNewPostForm(false);
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      alert('게시글 작성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 새 멤버 추가
  const addNewMember = async (memberData) => {
    try {
      const newMemberId = await teamMemberAPI.create(memberData);
      // 팀 데이터 새로고침
      const updatedTeamData = await teamMemberAPI.getAll();
      setTeamData(updatedTeamData);
      setShowNewMemberForm(false);
      alert('새 멤버가 성공적으로 추가되었습니다!');
    } catch (error) {
      console.error('멤버 추가 실패:', error);
      alert('멤버 추가에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 검색 및 팀 필터링
  const filteredMembers = useMemo(() => {
    let filtered = teamData.filter(member =>
      member.name.includes(searchTerm) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.mbti.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedTeam !== "all") {
      filtered = filtered.filter(member => member.team === selectedTeam);
    }

    return filtered;
  }, [searchTerm, teamData, selectedTeam]);

  // 팀별 멤버 수 계산
  const teamMemberCounts = useMemo(() => {
    const counts = {};
    teamConfig.teams.forEach(team => {
      counts[team.id] = teamData.filter(member => member.team === team.id).length;
    });
    counts.all = teamData.length;
    return counts;
  }, [teamData]);

  // 모달에서 표시할 최신 멤버 데이터
  const currentMember = useMemo(() => {
    if (!selectedMember) return null;
    return teamData.find(m => m.id === selectedMember.id) || selectedMember;
  }, [selectedMember, teamData]);

  // 모달 열기
  const handleOpenModal = (member) => {
    setSelectedMember(member);
    setIsEditingMember(false);
    setEditingMemberData(null);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setSelectedMember(null);
    setIsEditingMember(false);
    setEditingMemberData(null);
  };

  // 편집 모드 시작
  const handleStartEdit = () => {
    setIsEditingMember(true);
    setEditingMemberData({
      ...currentMember,
      stats: [...currentMember.stats] // 배열 복사
    });
  };

  // 편집 취소
  const handleCancelEdit = () => {
    setIsEditingMember(false);
    setEditingMemberData(null);
  };

  // 능력치 값 변경
  const handleStatChange = (index, value) => {
    const numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    setEditingMemberData(prev => ({
      ...prev,
      stats: prev.stats.map((stat, i) => i === index ? numValue : stat)
    }));
  };

  // 기본 정보 변경 (이름, 이미지, 키워드, 소개 등)
  const handleFieldChange = (field, value) => {
    setEditingMemberData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 편집 저장
  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      await teamMemberAPI.update(editingMemberData.id, editingMemberData);

      // 팀 데이터 새로고침
      const updatedTeamData = await teamMemberAPI.getAll();
      setTeamData(updatedTeamData);

      // 현재 선택된 멤버 업데이트
      const updatedMember = updatedTeamData.find(m => m.id === editingMemberData.id);
      setSelectedMember(updatedMember);

      setIsEditingMember(false);
      setEditingMemberData(null);

      alert('멤버 정보가 성공적으로 업데이트되었습니다!');
    } catch (error) {
      console.error('능력치 업데이트 실패:', error);
      alert('멤버 정보 업데이트에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 멤버 삭제
  const handleDeleteMember = async () => {
    if (!window.confirm('정말 이 멤버를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      setLoading(true);
      await teamMemberAPI.delete(currentMember.id);

      // 팀 데이터 새로고침
      const updatedTeamData = await teamMemberAPI.getAll();
      setTeamData(updatedTeamData);

      handleCloseModal();
      alert('멤버가 삭제되었습니다.');
    } catch (error) {
      console.error('멤버 삭제 실패:', error);
      alert('멤버 삭제에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // --- 드래그 앤 드롭 핸들러 ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 움직여야 드래그 시작 (클릭과 구분)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      // 1. UI 즉시 업데이트 (Optimistic UI)
      setTeamData((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        // 2. 서버에 순서 저장 (비동기)
        teamMemberAPI.updateOrder(newOrder).catch(err => {
          console.error('순서 저장 실패:', err);
          // 에러 발생시 롤백하거나 사용자에게 알림? 
          // 여기선 간단히 로그만 출력
        });

        return newOrder;
      });
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-purple-500 selection:text-white pb-24 md:pb-20">
      {/* 배경 장식 (Gradients) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]"></div>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-slate-300">데이터를 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/80 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md mx-4 border border-red-500/20">
            <div className="text-center">
              <div className="text-red-400 mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-white mb-2">오류 발생</h3>
              <p className="text-slate-300 mb-4">{error}</p>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0f172a]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* 상단 로우: 로고, 설정 버튼, 검색 */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-tr from-purple-500 to-blue-500 p-2 rounded-lg">
                  <Sparkles size={24} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                  {teamConfig.teamInfo.name}
                </h1>
              </div>
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

            {/* 사용자 정보 및 로그아웃 */}
            <div className="flex items-center gap-3">
              {currentUser && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-white/5">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-700">
                    <img src={currentUser.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm text-slate-300 font-medium">{currentUser.name}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                title="로그아웃"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* 네비게이션 메뉴 (Desktop) */}
          <nav className="hidden md:flex justify-center">
            <div className="flex flex-wrap gap-2 bg-slate-800/50 rounded-xl p-3 border border-white/10">
              <button
                onClick={() => setCurrentView("team")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${currentView === "team"
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}

                style={{
                  backgroundColor: 'transparent',
                  borderColor: 'transparent'
                }}
              >
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  <span className="tracking-wide hidden sm:inline">팀 멤버</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentView("board")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${currentView === "board"
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}

                style={{
                  backgroundColor: 'transparent',
                  borderColor: 'transparent'
                }}

              >
                <div className="flex items-center gap-2">
                  <FileText size={18} />
                  <span className="tracking-wide hidden sm:inline">게시판</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentView("kpi")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${currentView === "kpi"
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}

                style={{
                  backgroundColor: 'transparent',
                  borderColor: 'transparent'
                }}

              >
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} />
                  <span className="tracking-wide hidden sm:inline">KPI</span>
                </div>
              </button>

              <button
                onClick={() => setShowNewMemberForm(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 text-slate-300 hover:text-white hover:bg-slate-700/50"

                style={{
                  backgroundColor: 'transparent',
                  borderColor: 'transparent'
                }}

              >
                <div className="flex items-center gap-2">
                  <Plus size={18} />
                  <span className="tracking-wide hidden sm:inline">멤버 추가</span>
                </div>
              </button>
            </div>
          </nav>

          {/* 팀 필터 메뉴 (팀 멤버 뷰일 때만 표시) */}
          {currentView === "team" && (
            <div className="flex justify-center mt-6">
              <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 bg-slate-800/50 rounded-xl p-3 border border-white/10 w-full md:w-auto scrollbar-hide">
                <button
                  onClick={() => setSelectedTeam("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${selectedTeam === "all"
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                    }`}
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: 'transparent'
                  }}
                >
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Grid size={18} />
                    <span className="inline">전체 ({teamMemberCounts.all})</span>
                  </div>
                </button>
                {teamConfig.teams.map((team) => {
                  const TeamIcon = TEAM_ICONS[team.id] || Users;
                  return (
                    <button
                      key={team.id}
                      onClick={() => setSelectedTeam(team.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${selectedTeam === team.id
                        ? "text-white shadow-lg"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                        }`}
                      style={{
                        backgroundColor: selectedTeam === team.id ? team.color : 'transparent',
                        borderColor: selectedTeam === team.id ? team.color : 'transparent'
                      }}
                    >
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <TeamIcon size={18} />
                        <span className="inline">{team.name} ({teamMemberCounts[team.id] || 0})</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-6 py-10">

        {currentView === "team" ? (
          <>
            {/* 인트로 텍스트 */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                {teamConfig.teamInfo.description}
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                {teamConfig.teamInfo.subtitle}
              </p>
            </div>

            {/* 팀 그리드 (Bento Grid Style) */}
            {/* 팀 그리드 (Bento Grid Style) - Drag and Drop 적용 */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <SortableContext
                  items={filteredMembers.map(m => m.id)}
                  strategy={rectSortingStrategy}
                >
                  {filteredMembers.map((member) => {
                    const memberTeam = teamConfig.teams.find(team => team.id === member.team);
                    return (
                      <SortableMemberCard
                        key={member.id}
                        member={member}
                        memberTeam={memberTeam}
                        onClick={handleOpenModal}
                      />
                    );
                  })}
                </SortableContext>
              </div>
            </DndContext>

            {filteredMembers.length === 0 && (
              <div className="text-center py-20">
                <p className="text-slate-500 text-lg">검색 결과가 없습니다 😢</p>
              </div>
            )}
          </>
        ) : currentView === "board" ? (
          <>
            {/* 게시판 헤더 */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">팀 게시판</h2>
                <p className="text-slate-400">팀원들과 소통하고 정보를 공유하세요</p>
              </div>
              <button
                onClick={() => setShowNewPostForm(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-black hover:bg-slate-200 font-bold rounded-full transition-all duration-300 shadow-lg shadow-white/10 active:scale-95"
              >
                <Plus size={20} className="text-black" />
                <span className="tracking-wide">새 글 작성</span>
              </button>
            </div>

            {/* 게시글 목록 */}
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 hover:border-purple-500/50 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-xs font-medium">
                        {post.category}
                      </span>
                      <span className="text-slate-400 text-sm flex items-center gap-1">
                        <User size={14} />
                        {post.author}
                      </span>
                    </div>
                    <span className="text-slate-500 text-sm flex items-center gap-1">
                      <Calendar size={14} />
                      {post.date}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{post.title}</h3>
                  <p className="text-slate-300 line-clamp-2">{post.content}</p>
                </div>
              ))}
            </div>

            {posts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-slate-500 text-lg">아직 게시글이 없습니다 📝</p>
              </div>
            )}
          </>
        ) : (
          <KPIPage />
        )}
      </main>

      {/* 모바일 하단 네비게이션 */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => setCurrentView("team")}
            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${currentView === "team" ? "text-purple-400" : "text-slate-400 hover:text-slate-200"}`}

            style={{
              backgroundColor: 'transparent',
              borderColor: 'transparent'
            }}

          >
            <Users size={22} className={currentView === "team" ? "fill-current opacity-20" : ""} />
            <span className="text-[10px] font-medium mt-1">팀 멤버</span>
          </button>

          <button
            onClick={() => setShowNewMemberForm(true)}
            className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-white transition-all duration-300 group"
            style={{
              backgroundColor: 'transparent',
              borderColor: 'transparent'
            }}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="bg-gradient-to-tr from-purple-500 to-blue-500 p-2 rounded-xl group-active:scale-95 transition-transform">
                <Plus size={20} className="text-white" />
              </div>
              <span className="text-[10px] font-medium mt-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">추가</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentView("board")}
            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${currentView === "board" ? "text-blue-400" : "text-slate-400 hover:text-slate-200"}`}

            style={{
              backgroundColor: 'transparent',
              borderColor: 'transparent'
            }}

          >
            <FileText size={22} className={currentView === "board" ? "fill-current opacity-20" : ""} />
            <span className="text-[10px] font-medium mt-1">게시판</span>
          </button>

          <button
            onClick={() => setCurrentView("kpi")}
            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${currentView === "kpi" ? "text-purple-400" : "text-slate-400 hover:text-slate-200"}`}

            style={{
              backgroundColor: 'transparent',
              borderColor: 'transparent'
            }}

          >
            <BarChart3 size={22} className={currentView === "kpi" ? "fill-current opacity-20" : ""} />
            <span className="text-[10px] font-medium mt-1">KPI</span>
          </button>
        </div>
      </nav>

      {/* 상세 모달 */}
      {currentMember && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center sm:p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={handleCloseModal}
          />

          <div className="relative w-full h-full md:h-auto md:max-w-4xl md:max-h-[95vh] bg-[#1e293b] md:rounded-3xl border-t md:border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-bottom md:zoom-in duration-300 flex flex-col">

            {/* 모달 헤더 */}
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">팀 멤버 정보</h2>
              <div className="flex items-center gap-2">
                {!isEditingMember ? (
                  <>
                    {currentUser?.name === currentMember?.name && (
                      <>
                        <button
                          onClick={handleDeleteMember}
                          className="flex items-center justify-center gap-2 h-10 px-5 !bg-red-500 hover:!bg-red-600 !text-white rounded-full text-sm font-bold transition-all duration-300 shadow-lg shadow-red-500/30 active:scale-95 mr-2"
                        >
                          <Trash2 size={18} />
                          <span className="hidden sm:inline">삭제</span>
                          <span className="inline sm:hidden">삭제</span>
                        </button>
                        <button
                          onClick={handleStartEdit}
                          className="flex items-center justify-center gap-2 h-10 px-5 !bg-[#8b5cf6] hover:!bg-violet-500 !text-white rounded-full text-sm font-bold transition-all duration-300 shadow-lg shadow-violet-500/30 active:scale-95"
                        >
                          <Edit3 size={18} />
                          <span className="hidden sm:inline">편집</span>
                          <span className="inline sm:hidden">편집</span>
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center justify-center gap-2 h-10 px-5 !bg-[#8b5cf6] hover:!bg-violet-500 !text-white rounded-full text-sm font-bold transition-all duration-300 shadow-lg shadow-violet-500/30 active:scale-95"
                    >
                      <Save size={18} />
                      <span>저장</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center justify-center gap-2 h-10 px-5 !bg-slate-600 hover:!bg-slate-500 !text-white rounded-full text-sm font-bold transition-all duration-300 shadow-md active:scale-95"
                    >
                      <XCircle size={18} />
                      <span>취소</span>
                    </button>
                  </div>
                )}
                <button
                  onClick={handleCloseModal}
                  className="flex items-center justify-center w-10 h-10 rounded-full !bg-[#8b5cf6] hover:!bg-violet-500 !text-white transition-all duration-300 shadow-lg hover:shadow-violet-500/30 hover:rotate-90"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* 모바일: 세로 레이아웃, 데스크톱: 가로 레이아웃
                전체 스크롤 적용을 위해 부모에 overflow-y-auto, 자식들은 높이 자동 */}
            <div className="flex-1 overflow-y-auto bg-[#0f172a]">

              <div className="flex flex-col md:flex-row border-b border-white/5">
                {/* [Left] 프로필 정보 */}
                <div className="w-full md:w-5/12 bg-gradient-to-br from-slate-800 to-slate-900 p-6 md:p-8 flex flex-col items-center justify-start border-b md:border-b-0 md:border-r border-white/5 relative shrink-0">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500" />

                  {/* 프로필 이미지 */}
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-slate-700/50 shadow-xl overflow-hidden mb-6 relative shrink-0">
                    <img
                      src={isEditingMember ? editingMemberData?.image || currentMember.image : currentMember.image}
                      alt={isEditingMember ? editingMemberData?.name || currentMember.name : currentMember.name}
                      className="w-full h-full object-cover bg-slate-800"
                    />
                  </div>

                  {/* 이름 & 역할 */}
                  <div className="text-center w-full mb-6">
                    {isEditingMember && editingMemberData ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">이름</label>
                          <input
                            type="text"
                            value={editingMemberData.name}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">역할</label>
                          <input
                            type="text"
                            value={editingMemberData.role}
                            onChange={(e) => handleFieldChange('role', e.target.value)}
                            className="w-full bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 text-blue-300 text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">사번</label>
                          <input
                            type="text"
                            value={editingMemberData.emp_id || ''}
                            onChange={(e) => handleFieldChange('emp_id', e.target.value)}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="사번 입력"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">비밀번호</label>
                          <input
                            type="text"
                            value={editingMemberData.password || ''}
                            onChange={(e) => handleFieldChange('password', e.target.value)}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="비밀번호 변경"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{currentMember.name}</h2>
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-semibold border border-blue-500/20 inline-block">
                          {currentMember.role}
                        </span>
                      </>
                    )}
                  </div>

                  {/* 상세 정보 (팀, MBTI, 키워드, 이미지URL) */}
                  <div className="w-full space-y-3">
                    {/* 팀 정보 */}
                    <div className="p-3 bg-white/5 rounded-xl flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-2 text-sm"><Users size={16} /> 소속팀</span>
                      {isEditingMember && editingMemberData ? (
                        <select
                          value={editingMemberData.team || ''}
                          onChange={(e) => handleFieldChange('team', e.target.value)}
                          className="bg-slate-700 border border-slate-500 rounded-md px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 max-w-[150px]"
                        >
                          <option value="">팀 선택</option>
                          {teamConfig.teams.map((team) => (
                            <option key={team.id} value={team.id}>{team.name}</option>
                          ))}
                        </select>
                      ) : (
                        (() => {
                          const memberTeam = teamConfig.teams.find(team => team.id === currentMember.team);
                          return memberTeam ? (
                            <span className="text-sm font-medium px-2 py-1 rounded-md" style={{ backgroundColor: `${memberTeam.color}20`, color: memberTeam.color }}>
                              {memberTeam.name}
                            </span>
                          ) : <span className="text-sm text-slate-500">미지정</span>;
                        })()
                      )}
                    </div>

                    {/* MBTI */}
                    <div className="p-3 bg-white/5 rounded-xl flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-2 text-sm"><Brain size={16} /> MBTI</span>
                      {isEditingMember && editingMemberData ? (
                        <select
                          value={editingMemberData.mbti}
                          onChange={(e) => handleFieldChange('mbti', e.target.value)}
                          className="bg-slate-700 border border-slate-500 rounded-md px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 max-w-[150px]"
                        >
                          <option value="">선택</option>
                          <optgroup label="분석가 (NT)">
                            <option value="INTJ">INTJ</option>
                            <option value="INTP">INTP</option>
                            <option value="ENTJ">ENTJ</option>
                            <option value="ENTP">ENTP</option>
                          </optgroup>
                          <optgroup label="외교관 (NF)">
                            <option value="INFJ">INFJ</option>
                            <option value="INFP">INFP</option>
                            <option value="ENFJ">ENFJ</option>
                            <option value="ENFP">ENFP</option>
                          </optgroup>
                          <optgroup label="관리자 (SJ)">
                            <option value="ISTJ">ISTJ</option>
                            <option value="ISFJ">ISFJ</option>
                            <option value="ESTJ">ESTJ</option>
                            <option value="ESFJ">ESFJ</option>
                          </optgroup>
                          <optgroup label="탐험가 (SP)">
                            <option value="ISTP">ISTP</option>
                            <option value="ISFP">ISFP</option>
                            <option value="ESTP">ESTP</option>
                            <option value="ESFP">ESFP</option>
                          </optgroup>
                        </select>
                      ) : (
                        <span className="font-mono font-bold text-purple-400">{currentMember.mbti}</span>
                      )}
                    </div>

                    {/* 키워드 */}
                    <div className="p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm"><Hash size={16} /> 키워드</div>
                      {isEditingMember && editingMemberData ? (
                        <input
                          type="text"
                          value={editingMemberData.tags}
                          onChange={(e) => handleFieldChange('tags', e.target.value)}
                          className="w-full bg-slate-600/50 border border-slate-500 rounded-md px-2 py-1 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                          placeholder="#키워드"
                        />
                      ) : (
                        <div className="text-sm text-slate-200 break-keep">{currentMember.tags}</div>
                      )}
                    </div>

                    {/* 이미지 URL 편집 (편집 모드일 때만) */}
                    {isEditingMember && editingMemberData && (
                      <div className="p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm">🖼️ 이미지 URL</div>
                        <input
                          type="url"
                          value={editingMemberData.image}
                          onChange={(e) => handleFieldChange('image', e.target.value)}
                          className="w-full bg-slate-600/50 border border-slate-500 rounded-md px-2 py-1 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                          placeholder="https://..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* [Right] 능력치 분석 (Stats) */}
                <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col justify-center bg-[#0f172a]">
                  <div className="flex items-center justify-center mb-6">
                    <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                      <Zap className="text-yellow-400" size={20} />
                      능력치 분석
                    </h3>
                  </div>

                  <div className="bg-slate-800/30 rounded-3xl p-6 border border-white/5 flex justify-center items-center shadow-inner">
                    <div className="w-full max-w-[320px] aspect-square relative">
                      {/* 차트 배경 장식 */}
                      <div className="absolute inset-0 bg-purple-500/5 blur-3xl rounded-full" />
                      <HexChart
                        stats={isEditingMember ? editingMemberData?.stats || currentMember.stats : currentMember.stats}
                        labels={STAT_LABELS}
                        color="#8b5cf6"
                      />
                    </div>
                  </div>

                  {/* 편집 모드일 때 슬라이더 표시 */}
                  {isEditingMember && editingMemberData && (
                    <div className="space-y-4 mt-6">
                      <h4 className="text-sm font-medium text-slate-300 mb-3">능력치 조정</h4>
                      {STAT_LABELS.map((label, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">{label}</span>
                            <span className="text-xs text-purple-300 font-mono">
                              {editingMemberData.stats[index]}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={editingMemberData.stats[index]}
                              onChange={(e) => handleStatChange(index, e.target.value)}
                              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                              style={{
                                background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${editingMemberData.stats[index]}%, #374151 ${editingMemberData.stats[index]}%, #374151 100%)`
                              }}
                            />
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={editingMemberData.stats[index]}
                              onChange={(e) => handleStatChange(index, e.target.value)}
                              className="w-16 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs text-white text-center focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* [Bottom] 한줄 소개 (Full Width) */}
              <div className="w-full p-6 md:p-8 bg-[#1e293b]/50">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2 mb-4">
                  <MessageCircle className="text-green-400" size={20} />
                  한줄 소개
                </h3>

                {isEditingMember && editingMemberData ? (
                  <textarea
                    value={editingMemberData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    rows={3}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-2xl px-5 py-4 text-slate-200 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="한줄 소개를 입력하세요"
                  />
                ) : (
                  <div className="relative">
                    <div className="absolute -top-3 -left-2 text-4xl text-slate-600 opacity-30 font-serif">"</div>
                    <p className="text-base md:text-lg text-slate-300 leading-relaxed pl-6 pr-4 py-2 italic font-medium">
                      {currentMember.description}
                    </p>
                    <div className="absolute -bottom-4 right-2 text-4xl text-slate-600 opacity-30 font-serif">"</div>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono">ID: {currentMember.id.toString().padStart(3, '0')}</span>
                  {currentMember.emp_id && (
                    <span className="font-mono text-slate-400">사번: {currentMember.emp_id}</span>
                  )}
                  <span className="flex items-center gap-1">
                    Team Awesome <Sparkles size={12} className="text-yellow-500" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 게시글 상세 모달 */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedPost(null)}
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#1e293b] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">

            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-20"
            >
              <X size={18} />
            </button>

            <div className="p-6 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-md text-sm font-medium">
                  {selectedPost.category}
                </span>
                <span className="text-slate-400 text-sm flex items-center gap-1">
                  <User size={14} />
                  {selectedPost.author}
                </span>
                <span className="text-slate-500 text-sm flex items-center gap-1">
                  <Calendar size={14} />
                  {selectedPost.date}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-6">{selectedPost.title}</h2>

              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedPost.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 새 글 작성 모달 */}
      {showNewPostForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowNewPostForm(false)}
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#1e293b] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">

            <button
              onClick={() => setShowNewPostForm(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-20"
            >
              <X size={18} />
            </button>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">새 글 작성</h2>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                addNewPost({
                  title: formData.get('title'),
                  content: formData.get('content'),
                  author: formData.get('author'),
                  category: formData.get('category')
                });
              }} className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">제목</label>
                  <input
                    name="title"
                    type="text"
                    required
                    className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="게시글 제목을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">작성자</label>
                  <input
                    name="author"
                    type="text"
                    required
                    className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="작성자 이름을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">카테고리</label>
                  <select
                    name="category"
                    required
                    className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  >
                    <option value="">카테고리 선택</option>
                    {boardCategories.map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.display_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">내용</label>
                  <textarea
                    name="content"
                    required
                    rows={8}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                    placeholder="게시글 내용을 입력하세요"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-3 px-6 rounded-xl transition-all duration-300 font-bold shadow-xl shadow-purple-500/25 border-2 border-purple-400 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-500/40 transform hover:scale-105"
                  >
                    게시글 작성
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewPostForm(false)}
                    className="px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-slate-700/25 border-2 border-slate-500 hover:border-slate-400 hover:shadow-xl hover:shadow-slate-600/40 transform hover:scale-105"
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 새 멤버 추가 모달 */}
      {showNewMemberForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowNewMemberForm(false)}
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#1e293b] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">

            <button
              onClick={() => setShowNewMemberForm(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-20"
            >
              <X size={18} />
            </button>

            <div className="p-6 overflow-y-auto max-h-[90vh]">
              <h2 className="text-2xl font-bold text-white mb-6">새 멤버 추가</h2>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);

                // 능력치 배열 생성
                const stats = [];
                for (let i = 0; i < STAT_LABELS.length; i++) {
                  stats.push(parseInt(formData.get(`stat_${i}`) || 50));
                }

                addNewMember({
                  name: formData.get('name'),
                  role: formData.get('role'),
                  team: formData.get('team'),
                  mbti: formData.get('mbti'),
                  image: formData.get('image') || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.get('name')}&backgroundColor=b6e3f4`,
                  description: formData.get('description'),
                  tags: formData.get('tags'),
                  tags: formData.get('tags'),
                  emp_id: formData.get('emp_id'),
                  password: formData.get('password'),
                  stats: stats
                });
              }} className="space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">이름 *</label>
                    <input
                      name="name"
                      type="text"
                      required
                      className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="멤버 이름을 입력하세요"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">역할 *</label>
                    <input
                      name="role"
                      type="text"
                      required
                      className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="예: 프로(수석), 팀장, PM 등"
                    />
                  </div>
                </div>



                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">사번</label>
                    <input
                      name="emp_id"
                      type="text"
                      className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="사번을 입력하세요 (선택)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">비밀번호</label>
                    <input
                      name="password"
                      type="text"
                      className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="비밀번호를 입력하세요 (기본값: 0000)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">소속팀 *</label>
                    <select
                      name="team"
                      required
                      className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    >
                      <option value="">팀 선택</option>
                      {teamConfig.teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">MBTI *</label>
                    <select
                      name="mbti"
                      required
                      className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    >
                      <option value="">MBTI 선택</option>
                      <optgroup label="분석가 (NT)">
                        <option value="INTJ">INTJ - 건축가</option>
                        <option value="INTP">INTP - 논리술사</option>
                        <option value="ENTJ">ENTJ - 통솔자</option>
                        <option value="ENTP">ENTP - 변론가</option>
                      </optgroup>
                      <optgroup label="외교관 (NF)">
                        <option value="INFJ">INFJ - 옹호자</option>
                        <option value="INFP">INFP - 중재자</option>
                        <option value="ENFJ">ENFJ - 선도자</option>
                        <option value="ENFP">ENFP - 활동가</option>
                      </optgroup>
                      <optgroup label="관리자 (SJ)">
                        <option value="ISTJ">ISTJ - 물류담당자</option>
                        <option value="ISFJ">ISFJ - 수호자</option>
                        <option value="ESTJ">ESTJ - 경영자</option>
                        <option value="ESFJ">ESFJ - 집정관</option>
                      </optgroup>
                      <optgroup label="탐험가 (SP)">
                        <option value="ISTP">ISTP - 만능재주꾼</option>
                        <option value="ISFP">ISFP - 모험가</option>
                        <option value="ESTP">ESTP - 사업가</option>
                        <option value="ESFP">ESFP - 연예인</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">프로필 이미지 URL</label>
                  <input
                    name="image"
                    type="url"
                    className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="이미지 URL (비워두면 자동 생성됩니다)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">한줄 소개 *</label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                    placeholder="멤버를 소개하는 한줄 설명을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">키워드/태그</label>
                  <input
                    name="tags"
                    type="text"
                    className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="예: #개발자, #리더, #커피중독 등"
                  />
                </div>

                {/* 능력치 설정 */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-4">능력치 설정</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {STAT_LABELS.map((label, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">{label}</span>
                          <span className="text-sm text-purple-300 font-mono" id={`stat_${index}_value`}>
                            50
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            name={`stat_${index}`}
                            min="0"
                            max="100"
                            defaultValue="50"
                            onChange={(e) => {
                              document.getElementById(`stat_${index}_value`).textContent = e.target.value;
                              e.target.style.background = `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${e.target.value}%, #374151 ${e.target.value}%, #374151 100%)`;
                            }}
                            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 50%, #374151 50%, #374151 100%)`
                            }}
                          />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            defaultValue="50"
                            onChange={(e) => {
                              const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                              e.target.value = value;
                              document.getElementById(`stat_${index}_value`).textContent = value;
                              const range = e.target.parentElement.querySelector('input[type="range"]');
                              range.value = value;
                              range.style.background = `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${value}%, #374151 ${value}%, #374151 100%)`;
                            }}
                            className="w-16 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs text-white text-center focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 px-6 rounded-xl transition-all duration-300 font-bold shadow-xl shadow-green-500/25 border-2 border-green-400 hover:border-green-300 hover:shadow-2xl hover:shadow-green-500/40 transform hover:scale-105"
                  >
                    멤버 추가
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewMemberForm(false)}
                    className="px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-slate-700/25 border-2 border-slate-500 hover:border-slate-400 hover:shadow-xl hover:shadow-slate-600/40 transform hover:scale-105"
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div >
      )
      }
    </div >
  );
}