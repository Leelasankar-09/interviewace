// src/api/dashboard.js
import api from './client';

export const getDashboardStats = () => api.get('/dashboard/stats');
export const getReadinessScore = () => api.get('/dashboard/readiness');
export const getActivityHeatmap = () => api.get('/dashboard/activity');
export const getRecentSessions = () => api.get('/dashboard/recent');
export const getLeaderboard = (params) => api.get('/dashboard/leaderboard', { params });
export const getUserBadges = () => api.get('/dashboard/badges');
