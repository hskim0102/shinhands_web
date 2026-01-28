import { useState, useEffect } from 'react';
import { Send, User, Clock, MessageSquare, Trash2 } from 'lucide-react';
import { boardAPI } from './services/api';

const CommentSection = ({ postId, currentUser }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // 댓글 불러오기
    useEffect(() => {
        loadComments();
    }, [postId]);

    const loadComments = async () => {
        try {
            setLoading(true);
            const data = await boardAPI.getComments(postId);
            setComments(data);
        } catch (error) {
            console.error("댓글 불러오기 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    // 댓글 작성
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        if (!currentUser) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            setSubmitting(true);
            const commentData = {
                postId,
                authorName: currentUser.name,
                content: newComment
            };

            const addedComment = await boardAPI.addComment(commentData);

            // 목록에 즉시 추가 (또는 다시 불러오기)
            setComments(prev => [...prev, addedComment]);
            setNewComment("");
        } catch (error) {
            console.error("댓글 작성 실패:", error);
            alert("댓글 작성에 실패했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <MessageSquare size={20} className="text-purple-400" />
                댓글 <span className="text-slate-400 text-sm font-normal">({comments.length})</span>
            </h3>

            {/* 댓글 목록 */}
            <div className="space-y-4 mb-8">
                {loading ? (
                    <div className="text-center py-4 text-slate-500">댓글을 불러오는 중...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-slate-400">아직 댓글이 없습니다. 첫 댓글을 남겨주세요!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                                        <User size={16} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-bold text-slate-200 block">{comment.author_name}</span>
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <Clock size={10} />
                                            {comment.created_at}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-slate-300 text-sm whitespace-pre-wrap pl-10">{comment.content}</p>
                        </div>
                    ))
                )}
            </div>

            {/* 댓글 작성 폼 */}
            <form onSubmit={handleSubmit} className="relative">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={currentUser ? "댓글을 입력하세요..." : "로그인이 필요합니다"}
                            disabled={!currentUser || submitting}
                            className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none h-24"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!currentUser || submitting || !newComment.trim()}
                        className="self-end p-3 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/20"
                    >
                        <Send size={20} />
                    </button>
                </div>
                {!currentUser && (
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px] rounded-xl flex items-center justify-center border border-white/5">
                        <span className="text-slate-300 text-sm font-medium">로그인 후 이용 가능합니다</span>
                    </div>
                )}
            </form>
        </div>
    );
};

export default CommentSection;
