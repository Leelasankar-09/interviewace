// src/api/tracker.js
import api from './client';

export const getApplications = () => api.get('/tracker/applications');
export const addApplication = (data) => api.post('/tracker/applications', data);
export const updateAppStatus = (id, status) => api.patch(`/tracker/application/${id}`, { status });
export const deleteApplication = (id) => api.delete(`/tracker/application/${id}`);
export const getTrackerStats = () => api.get('/tracker/stats');
export const exportTrackerData = () => api.get('/tracker/export');
