/**
 * sessionStore — persists interview sessions in localStorage,
 * syncs with backend when available.
 */

const KEY = 'ia_sessions';
const MAX_LOCAL = 100;

function loadLocal() {
    try {
        return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
        return [];
    }
}

function saveLocal(sessions) {
    try {
        localStorage.setItem(KEY, JSON.stringify(sessions.slice(0, MAX_LOCAL)));
    } catch { }
}

/**
 * Save a session object locally.
 * Pass the object returned from your evaluation/save call.
 */
export function saveSession(session) {
    const sessions = loadLocal();
    const entry = {
        id: session.session_id || session.id || `local_${Date.now()}`,
        session_type: session.session_type || 'voice',
        question_text: session.question_text || '',
        question_type: session.question_type || 'Behavioral',
        overall_score: session.overall_score ?? null,
        grade: session.grade ?? null,
        duration_secs: session.duration_secs || 0,
        word_count: session.word_count || 0,
        filler_count: session.filler_count || 0,
        vocal_filler_count: session.vocal_filler_count || 0,
        star_fulfilled: session.star_fulfilled || 0,
        dim_scores: session.dim_scores || {},
        minute_logs: session.minute_logs || [],
        created_at: new Date().toISOString(),
    };
    sessions.unshift(entry);
    saveLocal(sessions);
    return entry;
}

/**
 * Get all local sessions, filtered and sorted.
 */
export function getSessions({ type = null, limit = 50 } = {}) {
    let sessions = loadLocal();
    if (type) sessions = sessions.filter(s => s.session_type === type);
    return sessions.slice(0, limit);
}

/**
 * Get analytics computed locally.
 */
export function getLocalAnalytics() {
    const sessions = loadLocal();
    if (!sessions.length) return null;

    const scores = sessions.filter(s => s.overall_score != null).map(s => s.overall_score);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10 : 0;
    const bestScore = scores.length ? Math.max(...scores) : 0;

    // By type
    const byType = {};
    sessions.forEach(s => {
        byType[s.session_type] = (byType[s.session_type] || 0) + 1;
    });

    // Trend (last 30 days)
    const trendMap = {};
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 86400000;
    sessions.forEach(s => {
        const ts = new Date(s.created_at).getTime();
        if (ts < thirtyDaysAgo) return;
        const day = s.created_at.slice(0, 10);
        if (!trendMap[day]) trendMap[day] = { scores: [], count: 0 };
        if (s.overall_score != null) trendMap[day].scores.push(s.overall_score);
        trendMap[day].count++;
    });
    const trend = Object.entries(trendMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, { scores, count }]) => ({
            date,
            avg_score: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10 : 0,
            count,
        }));

    // Streak
    let streak = 0;
    const today = new Date().toISOString().slice(0, 10);
    for (let i = 0; i < 365; i++) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        const hasSession = sessions.some(s => s.created_at?.slice(0, 10) === d);
        if (hasSession) streak++;
        else if (i > 0) break;
    }

    // Dim averages (voice sessions)
    const voiceSessions = sessions.filter(s => s.session_type === 'voice' && s.dim_scores);
    const dimSums = {};
    voiceSessions.forEach(s => {
        Object.entries(s.dim_scores || {}).forEach(([k, v]) => {
            if (!dimSums[k]) dimSums[k] = [];
            dimSums[k].push(v);
        });
    });
    const dimAvgs = {};
    Object.entries(dimSums).forEach(([k, v]) => {
        dimAvgs[k] = Math.round(v.reduce((a, b) => a + b, 0) / v.length);
    });

    return {
        total_sessions: sessions.length,
        avg_score: avgScore,
        best_score: bestScore,
        by_type: byType,
        trend,
        dim_avgs: dimAvgs,
        streak_days: streak,
        total_filler_words: sessions.reduce((s, x) => s + (x.filler_count || 0), 0),
        total_vocal_fillers: sessions.reduce((s, x) => s + (x.vocal_filler_count || 0), 0),
    };
}

export function deleteSession(id) {
    const sessions = loadLocal().filter(s => s.id !== id);
    saveLocal(sessions);
}

export function clearAll() {
    localStorage.removeItem(KEY);
}
