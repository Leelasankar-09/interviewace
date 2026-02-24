export default function MockInterview() {
    return <div className="animate-fade" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>🎭 Mock Interview</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Simulate real 30-minute interviews with AI</p>
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}><div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div><h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Mock Interview — Coming in Sprint 5</h3><p style={{ color: 'var(--text-muted)' }}>AI interviewer with streaming responses and dynamic follow-ups</p></div>
    </div>;
}
