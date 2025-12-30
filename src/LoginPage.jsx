import { useState } from 'react';
import { User, Lock, ArrowRight, Hexagon, Zap, Loader2 } from 'lucide-react';
import { teamMemberAPI } from './services/api';

const LoginPage = ({ onLogin }) => {
    const [empId, setEmpId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // API를 통해 로그인 시도
            const member = await teamMemberAPI.login(empId, password);

            if (member) {
                onLogin(member);
            } else {
                setError('사번 또는 비밀번호가 올바르지 않습니다.');
            }
        } catch (err) {
            console.error('로그인 에러:', err);
            setError('로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
            {/* 배경 장식 */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8 animate-in slide-in-from-bottom-5 duration-700 fade-in">
                    <div className="flex justify-center mb-4 relative group">
                        <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full group-hover:bg-purple-500/30 transition-all duration-500" />
                        <Hexagon size={64} className="text-purple-500 relative z-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" strokeWidth={1.5} />
                        <Zap size={24} className="text-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20" fill="currentColor" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        DX 본부 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Awesome</span>
                    </h1>
                    <p className="text-slate-400">팀 멤버 전용 공간입니다.</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-500 fade-in delay-150">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">사원 번호</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={empId}
                                    onChange={(e) => setEmpId(e.target.value)}
                                    placeholder="예: 12345"
                                    className="w-full bg-[#0b1121]/50 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">비밀번호</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="비밀번호를 입력하세요"
                                    className="w-full bg-[#0b1121]/50 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center animate-in shake duration-300">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    로그인 중...
                                </>
                            ) : (
                                <>
                                    로그인
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-slate-500">
                            초기 비밀번호는 <span className="font-mono text-slate-400">1234</span> 입니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
