import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 设置超时时间为10秒
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dataService = {
  // 获取数据列表
  fetchData: async (params) => {
    try {
      console.log('API: 获取数据请求参数:', params);
      const response = await apiClient.get('/ice-data', { params });
      console.log('API: 获取数据响应:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: 获取数据失败:', error);
      throw error;
    }
  },

  // 创建新记录
  createData: async (data) => {
    try {
      console.log('API: 创建数据请求:', data);
      const response = await apiClient.post('/ice-data', data);
      console.log('API: 创建数据响应:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: 创建数据失败:', error);
      throw error;
    }
  },

  // 更新记录
  updateData: async (id, data) => {
    try {
      console.log('API: 更新数据请求:', { id, data });
      const response = await apiClient.put(`/ice-data/${id}`, data);
      console.log('API: 更新数据响应:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: 更新数据失败:', error);
      throw error;
    }
  },

  // 删除记录
  deleteData: async (id) => {
    try {
      console.log('API: 删除数据请求:', id);
      const response = await apiClient.delete(`/ice-data/${id}`);
      console.log('API: 删除数据响应:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: 删除数据失败:', error);
      throw error;
    }
  },

  // 批量导入数据
  importData: async (data) => {
    try {
      // 检查数据是否为数组且不为空
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('没有有效的数据可以导入');
      }
      
      // 分批处理大量数据，每批最多100条
      const batchSize = 100;
      if (data.length > batchSize) {
        const batches = [];
        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize);
          batches.push(batch);
        }
        
        // 按顺序处理每一批
        let results = [];
        for (const batch of batches) {
          const response = await apiClient.post('/ice-data/batch', { data: batch });
          results = [...results, ...(response.data.data || [])];
        }
        return { status: 'success', data: results };
      } else {
        // 数据量较小，直接处理
        const response = await apiClient.post('/ice-data/batch', { data });
        return response.data;
      }
    } catch (error) {
      console.error('导入数据失败:', error);
      throw error;
    }
  }
};

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加认证token
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
  response => response,
  error => {
    console.error('API请求错误:', error);
    if (error.code === 'ECONNABORTED') {
      error.message = '请求超时，请检查网络连接';
    } else if (error.response) {
      // 服务器返回错误状态码
      error.message = error.response.data?.message || `服务器错误 (${error.response.status})`;
    } else if (error.request) {
      // 请求发送失败
      error.message = '无法连接到服务器，请检查网络连接';
    }
    return Promise.reject(error);
  }
);

export default apiClient;