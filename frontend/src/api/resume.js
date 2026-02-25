// src/api/resume.js
import api from './client';

export const scanResume = (formData) => api.post('/resume/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const getResumeHistory = () => api.get('/resume/history');
export const getATSScore = (resumeText, jobDesc) => api.post('/resume/score', { resumeText, jobDesc });
