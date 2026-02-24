import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiRefreshCw, FiArrowRight, FiCheckCircle, FiEdit3, FiZap, FiTarget, FiMessageSquare } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import { evaluateAPI } from '../api/services';

const SAMPLE_QUESTIONS = [
    { id: 't1', text: 'Tell me about a time you had to deal with a conflict in your team.', type: 'Behavioral' },
    { id: 't2', text: 'What is your approach to learning a new technology or framework?', type: 'Behavioral' },
    { id: 't3', text: 'Explain the difference between SQL and NoSQL databases.', type: 'Technical' },
    { id: 't4', text: 'How do you ensure your code is maintainable and scalable?', type: 'Technical' },
];

export default function TextEval() {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    // State
    const [question, setQuestion] = useState(SAMPLE_QUESTIONS[0]);
    const [answer, setAnswer] = useState('');
    const [status, setStatus] = useState('idle'); // idle, processing, done
    const [evaluation, setEvaluation] = useState(null);

    const handleSubmit = async () => {
        if (!answer.trim() || answer.trim().split(/\s+/).length < 20) {
            toast.warning("Please provide a more detailed answer (at least 20 words).");
            return;
        }

        setStatus('processing');
        try {
            const res = await evaluateAPI.text({
                question_text: question.text,
                answer_text: answer,
                question_type: question.type,
                user_id: user?.id || ''
            });

            if (res.data.success) {
                setEvaluation(res.data.evaluation);
                toast.success("Analysis complete!");
                setStatus('done');
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to process evaluation.");
            setStatus('idle');
        }
    };

    const nextQuestion = () => {
        const idx = SAMPLE_QUESTIONS.indexOf(question);
        setQuestion(SAMPLE_QUESTIONS[(idx + 1) % SAMPLE_QUESTIONS.length]);
        setAnswer('');
        setEvaluation(null);
        setStatus('idle');
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 min-h-[90vh]">
            <AnimatePresence mode="wait">
                {status !== 'done' ? (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        <div className="text-center space-y-4">
                            <span className="px-4 py-1.5 bg-warm-100 text-slate-600 text-xs font-bold rounded-full border border-warm-200 uppercase tracking-[0.2em]">
                                Text Evaluation Phase
                            </span>
                            <h2 className="text-4xl font-serif text-slate-900 max-w-2xl mx-auto leading-tight">
                                "{question.text}"
                            </h2>
                        </div>

                        <div className="bg-white p-8 rounded-[3rem] border-2 border-warm-200 shadow-2xl space-y-6">
                            <div className="flex justify-between items-center px-2">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <FiEdit3 /> Your Response
                                </label>
                                <span className={`text-xs font-bold ${answer.trim().split(/\s+/).length < 20 ? 'text-red-400' : 'text-emerald-500'}`}>
                                    {answer.trim() ? answer.trim().split(/\s+/).length : 0} / 20+ words
                                </span>
                            </div>

                            <textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Type your detailed response here... (e.g., using the STAR method)"
                                className="w-full min-h-[300px] p-8 bg-warm-50/50 border border-warm-100 rounded-[2rem] text-lg text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-terracotta/5 focus:border-terracotta/20 transition-all resize-none leading-relaxed"
                            />

                            <div className="flex flex-col md:flex-row gap-4 justify-between items-center pt-4">
                                <button
                                    onClick={nextQuestion}
                                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-colors"
                                >
                                    <FiRefreshCw /> Try Another Question
                                </button>

                                <button
                                    onClick={handleSubmit}
                                    disabled={status === 'processing'}
                                    className="flex items-center gap-3 px-12 py-5 bg-terracotta text-white rounded-2xl font-bold text-xl hover:bg-terracotta-800 shadow-xl shadow-terracotta/20 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0"
                                >
                                    {status === 'processing' ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Analysing...
                                        </>
                                    ) : (
                                        <>
                                            Submit for AI Review <FiSend />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto opacity-70">
                            {[
                                { icon: FiZap, title: "STAR Analysis", desc: "AI checks for Situation, Task, Action, and Result." },
                                { icon: FiTarget, title: "12 Dimension Scoring", desc: "Detailed breakdown across technical and soft skills." },
                                { icon: FiMessageSquare, title: "Deep Feedback", desc: "Constructive advice on how to improve your phrasing." },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="w-8 h-8 bg-warm-100 rounded-lg flex items-center justify-center text-terracotta shrink-0">
                                        <item.icon size={16} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-xs mb-0.5">{item.title}</h4>
                                        <p className="text-slate-400 text-[10px] leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full space-y-8"
                    >
                        <div className="bg-white p-12 rounded-[3.5rem] border border-warm-200 shadow-xl text-center space-y-8">
                            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                                <FiCheckCircle size={56} />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-4xl font-serif text-slate-900">Analysis Complete</h2>
                                <p className="text-slate-400 font-medium">Your response has been scored by Claude 3.5 Sonnet.</p>
                            </div>

                            <div className="flex justify-center items-center gap-16 py-8">
                                <div className="text-center">
                                    <div className="text-7xl font-serif text-terracotta font-black mb-1">{Math.round(evaluation.overall_score)}</div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Score</div>
                                </div>
                                <div className="h-20 w-px bg-warm-200"></div>
                                <div className="text-center">
                                    <div className="text-7xl font-serif text-slate-900 font-black mb-1">
                                        {evaluation.overall_score > 90 ? 'A+' : evaluation.overall_score > 80 ? 'A' : 'B'}
                                    </div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Grade</div>
                                </div>
                            </div>

                            <div className="bg-warm-50/50 p-6 rounded-3xl border border-warm-100 text-left">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">AI Executive Summary</p>
                                <p className="text-slate-700 leading-relaxed italic">
                                    "{evaluation.feedback.ai_summary}"
                                </p>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="px-10 py-5 bg-warm-100 text-slate-600 rounded-2xl font-bold hover:bg-warm-200 transition-all"
                                >
                                    Practice Another
                                </button>
                                <button
                                    className="px-12 py-5 bg-terracotta text-white rounded-2xl font-bold hover:bg-terracotta-800 shadow-lg shadow-terracotta/20 flex items-center justify-center gap-2 transition-all hover:scale-105"
                                    onClick={() => navigate(`/evaluation/${evaluation.session_id}`)}
                                >
                                    View Detailed 12-PT Report <FiArrowRight />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
