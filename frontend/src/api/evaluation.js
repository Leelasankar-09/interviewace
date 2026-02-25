// src/api/evaluation.js
import api from './client';

export const submitEvaluation = (data) => api.post('/evaluation/submit', data);
export const getEvaluationHistory = () => api.get('/evaluation/history');
export const getEvaluationReport = (id) => api.get(`/evaluation/report/${id}`);
export const submitVoiceAnswer = (formData) => api.post('/evaluation/voice', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
