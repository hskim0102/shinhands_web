import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, AlertCircle, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { kpiAPI } from './services/api';

const KPIPage = () => {
    const [kpis, setKpis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

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

    return (
        <div className="space-y-6 animate-fadeIn pb-20">
            {/* 헤더 섹션 */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-2">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 flex items-center gap-3">
                        <Target className="text-purple-400" />
                        2025년 KPI 목표 관리
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
                                        <tr key={item.id} className="bg-slate-800/20 hover:bg-slate-700/30 transition-colors group">
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
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleOpenEdit(item)}
                                                        className="p-1.5 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 transition-colors"
                                                        title="수정"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
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
