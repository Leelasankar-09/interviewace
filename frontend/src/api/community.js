// src/api/community.js
import api from './client';

export const getPosts = (params) => api.get('/community/posts', { params });
export const getPostDetail = (id) => api.get(`/community/post/${id}`);
export const createPost = (data) => api.post('/community/posts', data);
export const addComment = (postId, comment) => api.post(`/community/post/${postId}/comments`, { text: comment });
export const votePost = (postId, type) => api.post(`/community/post/${postId}/vote`, { type });
export const getTrendingTopics = () => api.get('/community/trending');
export const shareExperience = (data) => api.post('/community/share', data);
