
import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dataService = {
  // 获取数据列表
  fetchData: async (params) => {
    const response = await apiClient.get('/ice-data', { params });
    return {
      data: response.data.data,
      pagination: response.data.pagination
    };
  },

  // 创建新记录
  createData: async (data) => {
    const response = await apiClient.post('/ice-data', data);
    return response.data;
  },

  // 更新记录
  updateData: async (id, data) => {
    const response = await apiClient.put(`/ice-data/${id}`, data);
    return response.data;
  },

  // 删除记录
  deleteData: async (id) => {
    const response = await apiClient.delete(`/ice-data/${id}`);
    return response.data;
  },

  // 批量导入数据
  importData: async (data) => {
    const response = await apiClient.post('/ice-data/batch', { data });
    return response.data;
  }
};

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data.message || '操作失败';
      // 这里可以集成你的提示组件
      console.error(message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;