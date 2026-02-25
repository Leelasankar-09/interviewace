// src/pages/dashboard/Tracker.jsx
import { useState, useEffect } from 'react';
import {
    FiPlus, FiMoreVertical, FiCalendar, FiMapPin,
    FiCheckCircle, FiXCircle, FiClock, FiTrash2
} from 'react-icons/fi';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { motion, Reorder } from 'framer-motion';

const COLUMNS = ['Applied', 'OA', 'Technical', 'HR', 'Offer', 'Rejected'];

export default function Tracker() {
    const [board, setBoard] = useState({});
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newApp, setNewApp] = useState({ company: '', role: '', current_status: 'Applied', notes: '' });

    useEffect(() => {
        fetchBoard();
    }, []);

    const fetchBoard = async () => {
        try {
            const res = await api.get('/tracker/board');
            setBoard(res.data);
        } catch (err) {
            toast.error("Failed to load tracker");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        try {
            await api.post('/tracker/application', newApp);
            toast.success("Application Tracked");
            setShowAdd(false);
            fetchBoard();
        } catch (err) {
            toast.error("Failed to add application");
        }
    };

    const updateStatus = async (appId, newStatus) => {
        try {
            await api.put(`/tracker/application/${appId}/status`, { status: newStatus });
            fetchBoard();
        } catch (err) {
            toast.error("Update failed");
        }
    };

    if (loading) return <div className="p-20 text-center">Loading Tracker...</div>;

    return (
        <div className="max-w-[1600px] mx-auto animate-fade pb-20">
            <div className="flex justify-between items-center mb-12">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold">Interview Tracker</h2>
                    <p className="text-text-secondary text-sm">Visualize your application pipeline and manage stages.</p>
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    className="btn btn-primary px-8 py-4 rounded-2xl shadow-glow"
                >
                    <FiPlus /> New Application
                </button>
            </div>

            {/* Kanban Board */}
            <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar min-h-[70vh]">
                {COLUMNS.map(col => (
                    <div key={col} className="w-[320px] shrink-0 space-y-4">
                        <div className="flex justify-between items-center px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                            <span className="text-xs font-black uppercase tracking-widest text-text-muted">{col}</span>
                            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                                {board[col]?.length || 0}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {board[col]?.map(app => (
                                <motion.div
                                    key={app.id}
                                    layoutId={app.id}
                                    className="bg-white/5 border border-white/5 p-5 rounded-2xl hover:bg-white/[0.08] transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-lg text-indigo-400">
                                            {app.company[0]}
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 text-text-muted hover:text-white"><FiMoreVertical /></button>
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-white mb-1">{app.company}</h4>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">{app.role}</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold">
                                            <FiCalendar /> {new Date(app.date_applied).toLocaleDateString()}
                                        </div>

                                        <div className="relative group/sel">
                                            <select
                                                value={app.current_status}
                                                onChange={(e) => updateStatus(app.id, e.target.value)}
                                                className="bg-transparent text-[10px] font-black uppercase text-indigo-400 outline-none cursor-pointer"
                                            >
                                                {COLUMNS.map(c => <option key={c} value={c} className="bg-bg-card">{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {(!board[col] || board[col].length === 0) && (
                                <div className="h-32 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center">
                                    <span className="text-[10px] uppercase font-bold text-text-muted/40 italic">No Applications</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                    <div className="bg-bg-card border border-white/10 rounded-[2.5rem] w-full max-w-lg p-10">
                        <h3 className="text-2xl font-bold mb-8">Add New Application</h3>
                        <div className="space-y-4">
                            <InputField
                                label="Company Name"
                                placeholder="Google, Meta, etc."
                                value={newApp.company}
                                onChange={(v) => setNewApp({ ...newApp, company: v })}
                            />
                            <InputField
                                label="Job Role"
                                placeholder="SDE-1, Product Designer"
                                value={newApp.role}
                                onChange={(v) => setNewApp({ ...newApp, role: v })}
                            />
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Current Stage</label>
                                <select
                                    value={newApp.current_status}
                                    onChange={(e) => setNewApp({ ...newApp, current_status: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm"
                                >
                                    {COLUMNS.map(c => <option key={c} value={c} className="bg-bg-card">{c}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setShowAdd(false)} className="flex-1 py-4 bg-white/5 rounded-xl font-bold text-sm">Cancel</button>
                                <button onClick={handleAdd} className="flex-1 btn btn-primary py-4 rounded-xl font-bold text-sm">Save Application</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function InputField({ label, placeholder, value, onChange }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">{label}</label>
            <input
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-indigo-500 outline-none"
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
            />
        </div>
    );
}
