import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, AlertCircle, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { kpiAPI } from './services/api';

const KPIPage = () => {
    const [kpis, setKpis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // 목표 수준 모달 상태
    const [showTargetModal, setShowTargetModal] = useState(false);
    const [targetFormData, setTargetFormData] = useState({
        target_s: '',
        target_a: '',
        target_b_plus: '',
        target_b: '',
        target_b_minus: '',
        target_c: '',
        target_d: '',
        current_achievement: ''
    });

    // 폼 상태
    const [formData, setFormData] = useState({
        category: '',
        initiative: '',
        weight: '',
        indicator_item: '',
        indicator_weight: '',
        unit: '',
        target_2025: '',
        remarks: ''
    });

    // 데이터 로드
    useEffect(() => {
        loadKpis();
    }, []);

    const loadKpis = async () => {
        try {
            setLoading(true);
            const data = await kpiAPI.getAll();
            setKpis(data);
        } catch (error) {
            console.error('KPI 로드 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    // 입력 핸들러
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 모달 열기 (추가)
    const handleOpenAdd = () => {
        setEditingItem(null);
        setFormData({
            category: '',
            initiative: '',
            weight: '',
            indicator_item: '',
            indicator_weight: '',
            unit: '',
            target_2025: '',
            remarks: ''
        });
        setShowModal(true);
    };

    // 모달 열기 (수정)
    const handleOpenEdit = (item) => {
        setEditingItem(item);
        setFormData({
            category: item.category,
            initiative: item.initiative,
            weight: item.weight,
            indicator_item: item.indicator_item,
            indicator_weight: item.indicator_weight,
            unit: item.unit,
            target_2025: item.target_2025,
            remarks: item.remarks
        });
        setShowModal(true);
    };

    // 저장 핸들러
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await kpiAPI.update(editingItem.id, formData);
                alert('성공적으로 수정되었습니다.');
            } else {
                await kpiAPI.create(formData);
                alert('새 KPI가 추가되었습니다.');
            }
            setShowModal(false);
            loadKpis();
        } catch (error) {
            console.error('저장 실패:', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    // 삭제 핸들러
    const handleDelete = async (id) => {
        if (window.confirm('정말 이 KPI 항목을 삭제하시겠습니까?')) {
            try {
                await kpiAPI.delete(id);
                loadKpis();
            } catch (error) {
                console.error('삭제 실패:', error);
                alert('삭제 중 오류가 발생했습니다.');
            }
        }
    };

    // 목표 수준 모달 열기 (행 클릭시)
    const handleRowClick = (item) => {
        setEditingItem(item);
        setTargetFormData({
            target_s: item.target_s || '',
            target_a: item.target_a || '',
            target_b_plus: item.target_b_plus || '',
            target_b: item.target_b || '',
            target_b_minus: item.target_b_minus || '',
            target_c: item.target_c || '',
            target_d: item.target_d || '',
            current_achievement: item.current_achievement || ''
        });
        setShowTargetModal(true);
    };

    // 목표 수준 저장 핸들러
    const handleTargetSave = async (e) => {
        e.preventDefault();
        if (!editingItem) return;

        try {
            // 기존 데이터에 목표 수준 데이터만 병합하여 업데이트
            const updatedData = {
                ...editingItem,
                ...targetFormData
            };

            await kpiAPI.update(editingItem.id, updatedData);
            alert('목표 수준이 저장되었습니다.');
            setShowTargetModal(false);
            loadKpis();
        } catch (error) {
            console.error('목표 수준 저장 실패:', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    const handleTargetChange = (e) => {
        const { name, value } = e.target;
        setTargetFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 게이지 바 컴포넌트
    const GaugeBar = ({ value }) => {
        const numericValue = parseFloat(value) || 0;

        // 게이지 전체 범위 설정을 테이블과 맞춤 (S가 왼쪽, D가 오른쪽)
        // S: 120% 이상 (왼쪽)
        // D: 90% 미만 (오른쪽)
        // 시각화 범위: 130%(MAX, Left) ~ 80%(MIN, Right)

        const minScale = 80;
        const maxScale = 130;
        const totalRange = maxScale - minScale;

        // 위치 계산 (Left=0%가 130, Right=100%가 80)
        let positionPercent = ((maxScale - numericValue) / totalRange) * 100;
        if (positionPercent < 0) positionPercent = 0; // 130보다 크면 맨 왼쪽
        if (positionPercent > 100) positionPercent = 100; // 80보다 작으면 맨 오른쪽

        return (
            <div className="mt-8 relative pt-6 pb-2 px-2">
                {/* 마커 (삼각형) */}
                <div
                    className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center transition-all duration-500 z-10"
                    style={{ left: `${positionPercent}%` }}
                >
                    <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]"></div>
                    <div className="bg-purple-900/90 text-purple-200 text-xs px-2 py-1 rounded mt-1 border border-purple-500/50 font-bold whitespace-nowrap shadow-lg backdrop-blur-sm">
                        달성률: {numericValue}%
                    </div>
                </div>

                {/* 게이지 바 배경 */}
                <div className="h-6 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner border border-white/10 relative">
                    {/* S (120% ~ 130%) */}
                    <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 w-[20%] border-r border-slate-900/50 relative group flex items-center justify-center" title="S (120% 이상)">
                        <span className="text-[10px] font-bold text-white drop-shadow-md">S</span>
                    </div>
                    {/* A (110% ~ 120%) */}
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 w-[20%] border-r border-slate-900/50 relative group flex items-center justify-center" title="A (110% ~ 119%)">
                        <span className="text-[10px] font-bold text-white drop-shadow-md">A</span>
                    </div>
                    {/* B+ (105% ~ 110%) */}
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 w-[10%] border-r border-slate-900/50 relative group flex items-center justify-center" title="B+ (105% ~ 109%)">
                        <span className="text-[10px] font-bold text-white drop-shadow-md">B+</span>
                    </div>
                    {/* B (100% ~ 105%) */}
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-600 w-[10%] border-r border-slate-900/50 relative group flex items-center justify-center" title="B (100% ~ 104%)">
                        <span className="text-[10px] font-bold text-white drop-shadow-md">B</span>
                    </div>
                    {/* B- (95% ~ 100%) */}
                    <div className="h-full bg-gradient-to-r from-lime-500 to-lime-600 w-[10%] border-r border-slate-900/50 relative group flex items-center justify-center" title="B- (95% ~ 99%)">
                        <span className="text-[10px] font-bold text-white drop-shadow-md">B-</span>
                    </div>
                    {/* C (90% ~ 95%) */}
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 w-[10%] border-r border-slate-900/50 relative group flex items-center justify-center" title="C (90% ~ 94%)">
                        <span className="text-[10px] font-bold text-white drop-shadow-md">C</span>
                    </div>
                    {/* D (90% 미만) -> 남은 20% */}
                    <div className="h-full bg-gradient-to-r from-red-500 to-red-600 w-[20%] relative group flex items-center justify-center" title="D (90% 미만)">
                        <span className="text-[10px] font-bold text-white drop-shadow-md">D</span>
                    </div>
                </div>

                {/* 눈금 표시 */}
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 px-1 font-mono">
                    <span>130%</span>
                    <span className="pl-4">120%</span>
                    <span className="pl-4">110%</span>
                    <span>105%</span>
                    <span>100%</span>
                    <span>95%</span>
                    <span>90%</span>
                    <span>80%</span>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-20">
            {/* 헤더 섹션 */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-2">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 flex items-center gap-3">
                        <Target className="text-purple-400" />
                        2026년 성과목표 정의서
                    </h2>
                    <p className="text-slate-400 mt-2">
                        팀의 핵심 성과 지표(KPI)와 달성 목표를 관리합니다.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={loadKpis}
                        className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-lg transition-colors"
                        title="새로고침"
                    >
                        <TrendingUp size={20} />
                    </button>
                    <button
                        onClick={handleOpenAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-lg transition-all shadow-lg active:scale-95"
                    >
                        <Plus size={18} />
                        KPI 추가
                    </button>
                </div>
            </div>

            {/* 테이블 컨테이너 */}
            <div className="bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-300">
                            <thead className="text-xs text-slate-200 uppercase bg-slate-900/50 sticky top-0 z-10">
                                <tr>
                                    <th scope="col" rowSpan="2" className="px-6 py-4 border-r border-white/10 text-center min-w-[100px]">
                                        구분
                                    </th>
                                    <th scope="col" rowSpan="2" className="px-6 py-4 border-r border-white/10 text-center min-w-[200px]">
                                        추진과제
                                    </th>
                                    <th scope="col" rowSpan="2" className="px-6 py-4 border-r border-white/10 text-center min-w-[80px]">
                                        평가비중
                                    </th>
                                    <th scope="col" colSpan="2" className="px-6 py-3 border-b border-r border-white/10 text-center">
                                        관리 지표
                                    </th>
                                    <th scope="col" rowSpan="2" className="px-6 py-4 border-r border-white/10 text-center min-w-[80px]">
                                        단위
                                    </th>
                                    <th scope="col" rowSpan="2" className="px-6 py-4 border-r border-white/10 text-center min-w-[100px]">
                                        25년 목표
                                    </th>
                                    <th scope="col" rowSpan="2" className="px-6 py-4 border-r border-white/10 text-center min-w-[150px]">
                                        비고
                                    </th>
                                    <th scope="col" rowSpan="2" className="px-6 py-4 text-center min-w-[100px]">
                                        관리
                                    </th>
                                </tr>
                                <tr>
                                    <th scope="col" className="px-6 py-3 border-r border-white/10 text-center min-w-[150px]">
                                        항목
                                    </th>
                                    <th scope="col" className="px-6 py-3 border-r border-white/10 text-center min-w-[80px]">
                                        가중치
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {kpis.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center text-slate-500">
                                            등록된 KPI가 없습니다. 우측 상단의 'KPI 추가' 버튼을 눌러 시작하세요!
                                        </td>
                                    </tr>
                                ) : (
                                    kpis.map((item) => (
                                        <tr
                                            key={item.id}
                                            onClick={() => handleRowClick(item)}
                                            className="bg-slate-800/20 hover:bg-slate-700/30 transition-colors group cursor-pointer"
                                        >
                                            <td className="px-6 py-4 font-medium text-white border-r border-white/5 text-center">
                                                {item.category}
                                            </td>
                                            <td className="px-6 py-4 border-r border-white/5">
                                                {item.initiative}
                                            </td>
                                            <td className="px-6 py-4 text-center border-r border-white/5">
                                                {item.weight}
                                            </td>
                                            <td className="px-6 py-4 border-r border-white/5">
                                                {item.indicator_item}
                                            </td>
                                            <td className="px-6 py-4 text-center border-r border-white/5">
                                                {item.indicator_weight}
                                            </td>
                                            <td className="px-6 py-4 text-center border-r border-white/5">
                                                {item.unit}
                                            </td>
                                            <td className="px-6 py-4 text-center border-r border-white/5 text-purple-400 font-bold">
                                                {item.target_2025}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 border-r border-white/5">
                                                {item.remarks}
                                            </td>
                                            <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenEdit(item);
                                                        }}
                                                        className="p-1.5 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 transition-colors"
                                                        title="수정"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(item.id);
                                                        }}
                                                        className="p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors"
                                                        title="삭제"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 하단 정보 */}
                <div className="px-6 py-4 bg-slate-900/30 border-t border-white/5 flex justify-between items-center text-xs text-slate-500">
                    <span>* 2025년도 경영전략 기준</span>
                    <span>Last updated: {new Date().toLocaleDateString()}</span>
                </div>
            </div>

            {/* 목표 수준 모달 (Target Level Popup) */}
            {showTargetModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowTargetModal(false)}
                    />
                    <div className="relative w-full max-w-7xl bg-[#1e293b] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center p-6 border-b border-white/10">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Target className="text-purple-400" />
                                목표 수준 설정
                            </h3>
                            <button
                                onClick={() => setShowTargetModal(false)}
                                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleTargetSave} className="p-6">
                            <div className="mb-6 flex flex-col gap-4">
                                <div className="flex items-center gap-4 text-slate-300 text-sm bg-slate-800/50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-purple-400">구분:</span>
                                        {editingItem?.category}
                                    </div>
                                    <div className="w-px h-4 bg-slate-600"></div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-purple-400">추진과제:</span>
                                        {editingItem?.initiative}
                                    </div>
                                    <div className="w-px h-4 bg-slate-600"></div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-purple-400">관리지표:</span>
                                        {editingItem?.indicator_item}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-lg border border-purple-500/20">
                                    <label className="text-sm font-bold text-white whitespace-nowrap">현재 달성률 (%):</label>
                                    <input
                                        type="number"
                                        name="current_achievement"
                                        value={targetFormData.current_achievement}
                                        onChange={handleTargetChange}
                                        className="bg-slate-900 border border-white/10 rounded px-3 py-1.5 text-white w-24 text-center focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                                        placeholder="0"
                                    />
                                    <span className="text-xs text-slate-400">* 값을 입력하면 아래 게이지 바에 표시됩니다.</span>
                                </div>
                            </div>

                            <div className="overflow-x-auto border border-white/10 rounded-lg">
                                <table className="w-full text-center border-collapse">
                                    <thead className="bg-slate-900/50 text-slate-200">
                                        <tr>
                                            <th colSpan="7" className="p-3 border-b border-white/10 font-bold">목표수준</th>
                                        </tr>
                                        <tr className="text-sm">
                                            <th className="p-3 border-r border-white/10 w-[14.28%]">S<br /><span className="text-xs text-slate-400">(120%)</span></th>
                                            <th className="p-3 border-r border-white/10 w-[14.28%]">A<br /><span className="text-xs text-slate-400">(110%)</span></th>
                                            <th className="p-3 border-r border-white/10 w-[14.28%]">B+<br /><span className="text-xs text-slate-400">(105%)</span></th>
                                            <th className="p-3 border-r border-white/10 w-[14.28%]">B<br /><span className="text-xs text-slate-400">(100%)</span></th>
                                            <th className="p-3 border-r border-white/10 w-[14.28%]">B-<br /><span className="text-xs text-slate-400">(95%)</span></th>
                                            <th className="p-3 border-r border-white/10 w-[14.28%]">C<br /><span className="text-xs text-slate-400">(90%)</span></th>
                                            <th className="p-3 w-[14.28%]">D<br /><span className="text-xs text-slate-400">(90%미만)</span></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border-r border-white/10 p-0">
                                                <textarea
                                                    name="target_s"
                                                    value={targetFormData.target_s}
                                                    onChange={handleTargetChange}
                                                    className="w-full h-48 bg-slate-800/30 p-3 text-sm text-white focus:bg-slate-800/80 focus:outline-none resize-none text-center align-middle"
                                                    placeholder="내용 입력"
                                                />
                                            </td>
                                            <td className="border-r border-white/10 p-0">
                                                <textarea
                                                    name="target_a"
                                                    value={targetFormData.target_a}
                                                    onChange={handleTargetChange}
                                                    className="w-full h-48 bg-slate-800/30 p-3 text-sm text-white focus:bg-slate-800/80 focus:outline-none resize-none text-center align-middle"
                                                    placeholder="내용 입력"
                                                />
                                            </td>
                                            <td className="border-r border-white/10 p-0">
                                                <textarea
                                                    name="target_b_plus"
                                                    value={targetFormData.target_b_plus}
                                                    onChange={handleTargetChange}
                                                    className="w-full h-48 bg-slate-800/30 p-3 text-sm text-white focus:bg-slate-800/80 focus:outline-none resize-none text-center align-middle"
                                                    placeholder="내용 입력"
                                                />
                                            </td>
                                            <td className="border-r border-white/10 p-0">
                                                <textarea
                                                    name="target_b"
                                                    value={targetFormData.target_b}
                                                    onChange={handleTargetChange}
                                                    className="w-full h-48 bg-slate-800/30 p-3 text-sm text-white focus:bg-slate-800/80 focus:outline-none resize-none text-center align-middle"
                                                    placeholder="내용 입력"
                                                />
                                            </td>
                                            <td className="border-r border-white/10 p-0">
                                                <textarea
                                                    name="target_b_minus"
                                                    value={targetFormData.target_b_minus}
                                                    onChange={handleTargetChange}
                                                    className="w-full h-48 bg-slate-800/30 p-3 text-sm text-white focus:bg-slate-800/80 focus:outline-none resize-none text-center align-middle"
                                                    placeholder="내용 입력"
                                                />
                                            </td>
                                            <td className="border-r border-white/10 p-0">
                                                <textarea
                                                    name="target_c"
                                                    value={targetFormData.target_c}
                                                    onChange={handleTargetChange}
                                                    className="w-full h-48 bg-slate-800/30 p-3 text-sm text-white focus:bg-slate-800/80 focus:outline-none resize-none text-center align-middle"
                                                    placeholder="내용 입력"
                                                />
                                            </td>
                                            <td className="p-0">
                                                <textarea
                                                    name="target_d"
                                                    value={targetFormData.target_d}
                                                    onChange={handleTargetChange}
                                                    className="w-full h-48 bg-slate-800/30 p-3 text-sm text-white focus:bg-slate-800/80 focus:outline-none resize-none text-center align-middle"
                                                    placeholder="내용 입력"
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* 게이지 바 */}
                            <GaugeBar value={targetFormData.current_achievement} />

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowTargetModal(false)}
                                    className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"

                                    style={{
                                        backgroundColor: 'transparent',
                                        borderColor: 'transparent'
                                    }}
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2"

                                    style={{
                                        backgroundColor: 'transparent',
                                        borderColor: 'transparent'
                                    }}
                                >
                                    <Save size={18} />
                                    저장
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 모달 (추가/수정) */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowModal(false)}
                    />
                    <div className="relative w-full max-w-2xl bg-[#1e293b] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center p-6 border-b border-white/10">
                            <h3 className="text-xl font-bold text-white">
                                {editingItem ? 'KPI 항목 수정' : '새 KPI 추가'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">구분</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="예: 재무, 고객"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">평가비중</label>
                                    <input
                                        type="text"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="예: 40%"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">추진과제</label>
                                <input
                                    type="text"
                                    name="initiative"
                                    value={formData.initiative}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="추진 과제명"
                                    required
                                />
                            </div>

                            <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5 space-y-4">
                                <h4 className="text-sm font-semibold text-purple-400">관리 지표</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">항목</label>
                                        <input
                                            type="text"
                                            name="indicator_item"
                                            value={formData.indicator_item}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="지표 항목"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">가중치</label>
                                        <input
                                            type="text"
                                            name="indicator_weight"
                                            value={formData.indicator_weight}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="예: 50%"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">단위</label>
                                    <input
                                        type="text"
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="%, Point 등"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">25년 목표</label>
                                    <input
                                        type="text"
                                        name="target_2025"
                                        value={formData.target_2025}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="목표값"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">비고</label>
                                <textarea
                                    name="remarks"
                                    value={formData.remarks}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    placeholder="추가 설명"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2"

                                    style={{
                                        backgroundColor: 'transparent',
                                        borderColor: 'transparent'
                                    }}
                                >
                                    <Save size={18} />
                                    저장하기
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"

                                    style={{
                                        backgroundColor: 'transparent',
                                        borderColor: 'transparent'
                                    }}
                                >
                                    취소
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KPIPage;
