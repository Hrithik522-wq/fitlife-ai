const API_BASE = '/api';

export function getToken() {
  return localStorage.getItem('fitlife_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('fitlife_token', token);
  } else {
    localStorage.removeItem('fitlife_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    // If token invalid, optionally clear
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),

  // Sub-services
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    google: (data) => api.post('/auth/google', data),
    me: () => api.get('/auth/me'),
    updateProfile: (profile) => api.put('/auth/profile', profile),
    uploadAvatar: (formData) => api.post('/auth/avatar', formData),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (payload) => api.post('/auth/reset-password', payload),
    changePassword: (payload) => api.put('/auth/change-password', payload),
    deleteAccount: () => api.delete('/auth/account')
  },
  workouts: {
    getExercises: (params) => api.get(`/workouts/exercises${params ? '?' + new URLSearchParams(params) : ''}`),
    getSubstitutions: (id) => api.get(`/workouts/substitutions/${id}`),
    getRoutines: () => api.get('/workouts/routines'),
    createRoutine: (routine) => api.post('/workouts/routines', routine),
    deleteRoutine: (id) => api.delete(`/workouts/routines/${id}`),
    getLogs: () => api.get('/workouts/logs'),
    logWorkout: (workout) => api.post('/workouts/logs', workout),
    deleteLog: (id) => api.delete(`/workouts/logs/${id}`),
    getRecords: () => api.get('/workouts/records')
  },
  nutrition: {
    getFoods: (params) => api.get(`/nutrition/foods${params ? '?' + new URLSearchParams(params) : ''}`),
    createFood: (food) => api.post('/nutrition/foods', food),
    getMeals: (date) => api.get(`/nutrition/meals?date=${date || ''}`),
    logMeal: (meal) => api.post('/nutrition/meals', meal),
    deleteMeal: (id) => api.delete(`/nutrition/meals/${id}`),
    getWater: (date) => api.get(`/nutrition/water?date=${date || ''}`),
    updateWater: (amountMl, date) => api.post('/nutrition/water', { amountMl, date }),
    analyzeFood: (formDataOrBody) => api.post('/nutrition/ai-analyze', formDataOrBody),
    getRecommendations: () => api.get('/nutrition/recommendations')
  },
  progress: {
    getLogs: () => api.get('/progress'),
    logProgress: (data) => api.post('/progress', data),
    uploadPhoto: (formData) => api.post('/progress/photo', formData),
    deleteLog: (id) => api.delete(`/progress/${id}`),
    getComparison: () => api.get('/progress/comparison')
  },
  habits: {
    getHabits: (date) => api.get(`/habits?date=${date || ''}`),
    updateHabits: (data) => api.post('/habits', data),
    addCustom: (name, date) => api.post('/habits/custom', { name, date }),
    toggleHabit: (habitId, date) => api.post('/habits/toggle', { habitId, date })
  },
  challenges: {
    getAll: () => api.get('/challenges'),
    join: (id) => api.post(`/challenges/${id}/join`),
    getBadges: () => api.get('/challenges/badges'),
    getLeaderboard: () => api.get('/challenges/leaderboard')
  },
  social: {
    getPosts: () => api.get('/social/posts'),
    createPost: (formDataOrBody) => api.post('/social/posts', formDataOrBody),
    likePost: (id) => api.post(`/social/posts/${id}/like`),
    commentPost: (id, text) => api.post(`/social/posts/${id}/comment`, { text }),
    reportPost: (id, reason) => api.post(`/social/posts/${id}/report`, { reason }),
    getUserProfile: (id) => api.get(`/social/users/${id}`)
  },
  ai: {
    chat: (message, history) => api.post('/ai/chat', { message, history })
  },
  reports: {
    getAnalytics: () => api.get('/reports/analytics'),
    getNotifications: () => api.get('/reports/notifications'),
    markNotificationRead: (id) => api.post(`/reports/notifications/${id}/read`),
    markAllNotificationsRead: () => api.post('/reports/notifications/read-all'),
    exportDataUrl: '/api/reports/export'
  },
  admin: {
    getStats: () => api.get('/admin/stats'),
    getUsers: () => api.get('/admin/users'),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    addExercise: (exercise) => api.post('/admin/exercises', exercise),
    updateExercise: (id, exercise) => api.put(`/admin/exercises/${id}`, exercise),
    deleteExercise: (id) => api.delete(`/admin/exercises/${id}`),
    addFood: (food) => api.post('/admin/foods', food),
    updateFood: (id, food) => api.put(`/admin/foods/${id}`, food),
    deleteFood: (id) => api.delete(`/admin/foods/${id}`),
    getReports: () => api.get('/admin/reports'),
    resolveReport: (id, action) => api.post(`/admin/reports/${id}/action`, { action })
  }
};
