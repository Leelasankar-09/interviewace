/**
 * Centralized API service layer for InterviewAce.
 * All backend calls go through this file.
 */
import api from './axios';

// ── Analytics ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
    track: (eventType, page, feature, meta = {}) =>
        api.post('/analytics/event', { event_type: eventType, page, feature, meta }).catch(() => { }),

    dashboard: (days = 30) => api.get('/analytics/dashboard', { params: { days } }),
    platform: () => api.get('/analytics/platform'),
};

// Helper: auto-track page view on mount
export const trackPageView = (page, extra = {}) =>
    analyticsAPI.track('page_view', page, null, extra);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (data) => api.post('/auth/register', data),
    me: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

// ── Profile ──────────────────────────────────────────────────────────────────
export const profileAPI = {
    getMe: () => api.get('/profile/me'),
    updateMe: (data) => api.put('/profile/me', data),
    getPublic: (userId) => api.get(`/profile/${userId}`),
};

// ── Sessions / History ───────────────────────────────────────────────────────
export const sessionsAPI = {
    history: (params = {}) => api.get('/sessions/history', { params }),
    analytics: (userId, days = 30) =>
        api.get('/sessions/analytics', { params: { user_id: userId, days } }),
    streak: (userId) => api.get('/sessions/streak', { params: { user_id: userId } }),
    getSession: (sessionId) => api.get(`/sessions/${sessionId}`),
};

// ── Behavioral ───────────────────────────────────────────────────────────────
export const behavioralAPI = {
    questions: (role = 'Software Engineer', roundType = 'all') =>
        api.get('/behavioral/questions', { params: { role, round_type: roundType } }),
    evaluate: (question, answer, roundType = 'Behavioral') =>
        api.post('/behavioral/evaluate', { question, answer, round_type: roundType }),
    history: (page = 1, limit = 10) =>
        api.get('/behavioral/history', { params: { page, limit } }),
};

// ── DSA ──────────────────────────────────────────────────────────────────────
export const dsaAPI = {
    problems: (params = {}) => api.get('/dsa/problems', { params }),
    getProblem: (slug) => api.get(`/dsa/problems/${slug}`),
    submit: (data) => api.post('/dsa/submit', data),
    submissions: (page = 1, limit = 10) =>
        api.get('/dsa/submissions', { params: { page, limit } }),
    topics: () => api.get('/dsa/topics'),
};

// ── Mock Interview ────────────────────────────────────────────────────────────
export const mockAPI = {
    chat: (history, message, role = 'Software Engineer') =>
        api.post('/mock/chat', { history, message, role }, { responseType: 'stream' }),
    save: (data) => api.post('/mock/save', data),
    history: (page = 1, limit = 10) =>
        api.get('/mock/history', { params: { page, limit } }),
};

// ── Resume ATS ────────────────────────────────────────────────────────────────
export const resumeAPI = {
    analyze: (file, jobDescription = '') => {
        const form = new FormData();
        form.append('file', file);
        form.append('job_description', jobDescription);
        return api.post('/resume/analyze', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    history: (page = 1, limit = 10) =>
        api.get('/resume/history', { params: { page, limit } }),
    getAnalysis: (id) => api.get(`/resume/history/${id}`),
    templates: () => api.get('/resume/templates'),
};

// ── Leaderboard ───────────────────────────────────────────────────────────────
export const leaderboardAPI = {
    get: (params = {}) => api.get('/leaderboard', { params }),
    me: () => api.get('/leaderboard/me'),
    colleges: () => api.get('/leaderboard/colleges'),
};

// ── Questions ─────────────────────────────────────────────────────────────────
export const questionsAPI = {
    generate: (data) => api.post('/questions/generate', data),
    bank: () => api.get('/questions/bank'),
    topics: (type) => api.get('/questions/topics', { params: { type } }),
};

// ── Badges / Achievements ─────────────────────────────────────────────────────
export const badgesAPI = {
    me: () => api.get('/badges/me'),
    user: (userId) => api.get(`/badges/${userId}`),
};

// ── Evaluation ─────────────────────────────────────────────────────────────
export const evaluateAPI = {
    voice: (formData) => api.post('/evaluate/voice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    text: (data) => api.post('/evaluate/text', data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }),
    generateQuestion: (params) => api.post('/evaluate/generate-question', null, { params }),
};

// ── Password Reset ────────────────────────────────────────────────────────────
export const passwordAPI = {
    forgot: (email) => api.post('/auth/forgot-password', { email }),
    reset: (token, new_password) => api.post('/auth/reset-password', { token, new_password }),
    change: (current_password, new_password) => api.post('/auth/change-password', { current_password, new_password }),
};
