import { useState } from 'react';
import { FiUpload, FiFile, FiCheckCircle, FiAlertCircle, FiDownload } from 'react-icons/fi';

const sampleResult = {
    ats_score: 74,
    sections: {
        summary: { score: 7, feedback: 'Good summary but lacks keywords. Add your tech stack explicitly.', rewrite: 'Results-driven Software Engineer with 2+ years building scalable React/Node.js applications...' },
        skills: { score: 8, feedback: 'Well-formatted skills section. Missing: Docker, CI/CD, AWS.', missing_keywords: ['Docker', 'Kubernetes', 'CI/CD', 'REST API', 'Agile'] },
        experience: { score: 6, feedback: 'Bullet points lack quantified impact. Add metrics!', improved_bullets: ['Reduced API response time by 40% by implementing Redis caching', 'Led team of 4 to deliver feature 2 weeks ahead of schedule'] },
        education: { score: 9, feedback: 'Great education section. Consider adding relevant coursework.' },
    },
    keyword_gaps: ['Docker', 'Kubernetes', 'REST API', 'Agile', 'Jest', 'TypeScript'],
    overall_suggestions: ['Add a "Projects" section with GitHub links', 'Use stronger action verbs (Led, Built, Optimized)', 'Keep resume to 1 page for < 5 years experience'],
};

export default function ResumeATS() {
    const [file, setFile] = useState(null);
    const [jobDesc, setJobDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [dragging, setDragging] = useState(false);

    const handleFile = (f) => { if (f) { setFile(f); setResult(null); } };
    const handleDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };
    const handleAnalyze = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 2500));
        setResult(sampleResult);
        setLoading(false);
    };

    const scoreColor = (score) => score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--error)';

    return (
        <div className="animate-fade" style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>📄 ATS Resume Scanner</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Upload your resume to get an ATS score, keyword analysis, and AI improvement suggestions</p>

            <div className="grid-2" style={{ alignItems: 'start' }}>
                {/* Upload Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="card"
                        onDragOver={e => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        style={{
                            border: `2px dashed ${dragging ? 'var(--accent)' : file ? 'var(--success)' : 'var(--border)'}`,
                            borderRadius: 'var(--radius)', cursor: 'pointer', textAlign: 'center',
                            padding: '3rem',
                            background: dragging ? 'rgba(99,102,241,0.05)' : file ? 'rgba(16,185,129,0.05)' : 'var(--bg-card)',
                            transition: 'all 0.25s',
                        }}
                        onClick={() => document.getElementById('resume-input').click()}>
                        <input id="resume-input" type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                        {file ? (
                            <>
                                <FiFile size={40} style={{ color: 'var(--success)', marginBottom: '0.75rem' }} />
                                <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{file.name}</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{(file.size / 1024).toFixed(1)} KB — Click to change</p>
                            </>
                        ) : (
                            <>
                                <FiUpload size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                                <p style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Drop your resume here</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>PDF or DOCX • Max 5MB</p>
                            </>
                        )}
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                            Job Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional — for keyword matching)</span>
                        </label>
                        <textarea className="input" rows={5} placeholder="Paste the job description here to get tailored keyword suggestions..."
                            value={jobDesc} onChange={e => setJobDesc(e.target.value)}
                            style={{ resize: 'vertical' }} />
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}
                        onClick={handleAnalyze} disabled={!file || loading}>
                        {loading ? <><span className="spinner" /> Analyzing...</> : '🔍 Analyze Resume'}
                    </button>

                    {/* Sample templates */}
                    <div className="card">
                        <p style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>📥 ATS-Friendly Templates</p>
                        {['Software Engineer', 'Data Scientist', 'Product Manager'].map(t => (
                            <div key={t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{t}</span>
                                <button className="btn btn-ghost" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem' }}>
                                    <FiDownload size={13} /> Download
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Results */}
                {result ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* ATS Score Ring */}
                        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
                                <svg width="120" height="120" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-hover)" strokeWidth="10" />
                                    <circle cx="60" cy="60" r="50" fill="none" stroke={scoreColor(result.ats_score)} strokeWidth="10"
                                        strokeDasharray={`${(result.ats_score / 100) * 314} 314`}
                                        strokeLinecap="round" transform="rotate(-90 60 60)" style={{ transition: 'all 1s ease' }} />
                                </svg>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: scoreColor(result.ats_score) }}>{result.ats_score}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ATS Score</div>
                                </div>
                            </div>
                            <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>
                                {result.ats_score >= 80 ? '🎉 Excellent!' : result.ats_score >= 60 ? '👍 Good, needs work' : '⚠️ Needs major improvement'}
                            </h3>
                        </div>

                        {/* Section Scores */}
                        <div className="card">
                            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Section Scores</h3>
                            {Object.entries(result.sections).map(([key, val]) => (
                                <div key={key} style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'capitalize' }}>{key}</span>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: scoreColor(val.score * 10) }}>{val.score}/10</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${val.score * 10}%`, background: scoreColor(val.score * 10) }} />
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{val.feedback}</p>
                                </div>
                            ))}
                        </div>

                        {/* Keyword Gaps */}
                        <div className="card">
                            <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>🔑 Missing Keywords</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {result.keyword_gaps.map(k => (
                                    <span key={k} className="badge badge-error" style={{ fontSize: '0.78rem' }}>
                                        <FiAlertCircle size={12} /> {k}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div className="card">
                            <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>💡 Suggestions</h3>
                            {result.overall_suggestions.map((s, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <FiCheckCircle style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                                    {s}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Upload a resume to see your ATS score and improvement suggestions</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
