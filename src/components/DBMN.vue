// src/components/DataManagement.vue
<template>
  <div class="data-management">
    <!-- 顶部操作栏 -->
    <div class="operation-bar">
      <div class="search-section">
        <div class="search-input">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="搜索数据..."
            @input="handleSearch"
          >
        </div>
        <div class="filter-section">
          <select v-model="timeFilter" class="filter-select">
            <option value="">时间范围</option>
            <option value="today">今天</option>
            <option value="week">最近7天</option>
            <option value="month">最近30天</option>
            <option value="custom">自定义</option>
          </select>
          <select v-model="regionFilter" class="filter-select">
            <option value="">监测区域</option>
            <option value="A">A区域</option>
            <option value="B">B区域</option>
            <option value="C">C区域</option>
          </select>
          <button @click="applyFilters" class="filter-btn">
            应用筛选
          </button>
        </div>
      </div>
      <div class="action-section">
        <button class="action-btn import" @click="showImportDialog">
          <i class="fas fa-file-import"></i>
          导入数据
        </button>
        <button class="action-btn export" @click="exportData">
          <i class="fas fa-file-export"></i>
          导出数据
        </button>
        <button class="action-btn add" @click="showAddDialog">
          <i class="fas fa-plus"></i>
          添加记录
        </button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key" @click="sort(column.key)">
              {{ column.title }}
              <i v-if="sortKey === column.key" 
                 :class="['fas', sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down']">
              </i>
            </th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in displayedData" :key="item.id">
            <td>{{ formatDate(item.timestamp) }}</td>
            <td>{{ item.region }}</td>
            <td>{{ item.density }}</td>
            <td>{{ item.temperature }}</td>
            <td>{{ item.thickness }}</td>
            <td>{{ item.collector }}</td>
            <td class="actions">
              <button class="icon-btn edit" @click="editItem(item)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="icon-btn delete" @click="deleteItem(item)">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页控件 -->
    <div class="pagination">
      <button 
        :disabled="currentPage === 1" 
        @click="changePage(currentPage - 1)"
        class="page-btn"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      <span class="page-info">
        第 {{ currentPage }} 页，共 {{ totalPages }} 页
      </span>
      <button 
        :disabled="currentPage === totalPages" 
        @click="changePage(currentPage + 1)"
        class="page-btn"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- 导入数据对话框 -->
    <div v-if="showImport" class="dialog-overlay">
      <div class="dialog">
        <div class="dialog-header">
          <h3>导入数据</h3>
          <button class="close-btn" @click="closeImportDialog">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="dialog-content">
          <div class="upload-area" 
               @dragover.prevent 
               @drop.prevent="handleFileDrop"
               :class="{ dragging: isDragging }"
               @dragenter="isDragging = true"
               @dragleave="isDragging = false"
          >
            <i class="fas fa-cloud-upload-alt"></i>
            <p>拖拽文件到此处或点击上传</p>
            <input 
              type="file" 
              ref="fileInput" 
              @change="handleFileSelect" 
              accept=".csv,.xlsx"
              style="display: none"
            >
            <button class="upload-btn" @click="triggerFileInput">
              选择文件
            </button>
          </div>
          <div v-if="selectedFile" class="selected-file">
            <i class="fas fa-file"></i>
            <span>{{ selectedFile.name }}</span>
            <button class="remove-file" @click="removeSelectedFile">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="closeImportDialog">取消</button>
          <button 
            class="confirm-btn" 
            @click="confirmImport"
            :disabled="!selectedFile"
          >
            确认导入
          </button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑数据对话框 -->
    <div v-if="showEdit" class="dialog-overlay">
      <div class="dialog">
        <div class="dialog-header">
          <h3>{{ editingItem ? '编辑数据' : '添加数据' }}</h3>
          <button class="close-btn" @click="closeEditDialog">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="dialog-content">
          <div class="form-group">
            <label>监测区域</label>
            <select v-model="editForm.region">
              <option value="A">A区域</option>
              <option value="B">B区域</option>
              <option value="C">C区域</option>
            </select>
          </div>
          <div class="form-group">
            <label>密度 (kg/m³)</label>
            <input type="number" v-model="editForm.density">
          </div>
          <div class="form-group">
            <label>温度 (°C)</label>
            <input type="number" v-model="editForm.temperature">
          </div>
          <div class="form-group">
            <label>厚度 (m)</label>
            <input type="number" v-model="editForm.thickness">
          </div>
          <div class="form-group">
            <label>采集人员</label>
            <input type="text" v-model="editForm.collector">
          </div>
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="closeEditDialog">取消</button>
          <button class="confirm-btn" @click="saveData">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { dataService } from '../services/api';
import * as XLSX from 'xlsx';

export default {
  name: 'DataManagement',
  setup() {
    // 状态数据
    const searchQuery = ref('');
    const timeFilter = ref('');
    const regionFilter = ref('');
    const currentPage = ref(1);
    const pageSize = ref(10);
    const sortKey = ref('timestamp');
    const sortOrder = ref('desc');
    const showImport = ref(false);
    const showEdit = ref(false);
    const isDragging = ref(false);
    const selectedFile = ref(null);
    const editingItem = ref(null);
    const fileInput = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const data = ref([]);
    const totalPages = ref(0);
    const total = ref(0);

    // 编辑表单数据
    const editForm = ref({
      region: '',
      density: null,
      temperature: null,
      thickness: null,
      collector: ''
    });

    // 获取数据列表
    const fetchDataList = async () => {
      try {
        loading.value = true;
        error.value = null;
        
        const params = {
          page: currentPage.value,
          limit: pageSize.value,
          region: regionFilter.value,
          timeRange: timeFilter.value,
          search: searchQuery.value
        };

        const response = await dataService.fetchData(params);
        data.value = response.data;
        totalPages.value = response.pagination.pages;
        total.value = response.pagination.total;
      } catch (err) {
        error.value = '获取数据失败';
        console.error('获取数据失败:', err);
      } finally {
        loading.value = false;
      }
    };

    // 保存数据
    const saveData = async () => {
      try {
        if (!validateForm()) return;
        
        loading.value = true;
        error.value = null;

        const formData = {
          ...editForm.value,
          timestamp: new Date()
        };

        if (editingItem.value) {
          await dataService.updateData(editingItem.value._id, formData);
        } else {
          await dataService.createData(formData);
        }

        await fetchDataList();
        closeEditDialog();
      } catch (err) {
        error.value = '保存数据失败';
        console.error('保存数据失败:', err);
      } finally {
        loading.value = false;
      }
    };

    // 删除数据
    const deleteItem = async (item) => {
      if (!confirm('确定要删除这条记录吗？')) return;

      try {
        loading.value = true;
        error.value = null;

        await dataService.deleteData(item._id);
        await fetchDataList();
      } catch (err) {
        error.value = '删除数据失败';
        console.error('删除数据失败:', err);
      } finally {
        loading.value = false;
      }
    };

    // 导入数据
    const confirmImport = async () => {
      if (!selectedFile.value) return;

      try {
        loading.value = true;
        error.value = null;

        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const workbook = XLSX.read(e.target.result, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            // 转换数据格式
            const formattedData = jsonData.map(row => ({
              region: row.region || '',
              density: Number(row.density) || 0,
              temperature: Number(row.temperature) || 0,
              thickness: Number(row.thickness) || 0,
              collector: row.collector || '',
              timestamp: new Date()
            }));

            await dataService.importData(formattedData);
            await fetchDataList();
            closeImportDialog();
          } catch (error) {
            throw new Error('文件格式错误');
          }
        };
        reader.readAsArrayBuffer(selectedFile.value);
      } catch (err) {
        error.value = '导入数据失败';
        console.error('导入数据失败:', err);
      } finally {
        loading.value = false;
      }
    };

    // 导出数据
    const exportData = () => {
      try {
        const exportWorkbook = XLSX.utils.book_new();
        const exportSheet = XLSX.utils.json_to_sheet(data.value.map(item => ({
          时间: new Date(item.timestamp).toLocaleString(),
          监测区域: item.region,
          密度: item.density,
          温度: item.temperature,
          厚度: item.thickness,
          采集人员: item.collector
        })));
        
        XLSX.utils.book_append_sheet(exportWorkbook, exportSheet, 'Data');
        XLSX.writeFile(exportWorkbook, '海冰密度数据.xlsx');
      } catch (error) {
        console.error('Export error:', error);
      }
    };

    // 表单验证
    const validateForm = () => {
      if (!editForm.value.region || !editForm.value.density || 
          !editForm.value.temperature || !editForm.value.thickness || 
          !editForm.value.collector) {
        error.value = '请填写所有必填字段';
        return false;
      }
      return true;
    };

    // 编辑相关方法
    const showAddDialog = () => {
      editingItem.value = null;
      editForm.value = {
        region: 'A',
        density: null,
        temperature: null,
        thickness: null,
        collector: ''
      };
      showEdit.value = true;
    };

    const editItem = (item) => {
      editingItem.value = item;
      editForm.value = { ...item };
      showEdit.value = true;
    };

    // 其他方法保持不变...
    
    // 监听筛选条件变化
    watch([searchQuery, timeFilter, regionFilter], () => {
      currentPage.value = 1;
      fetchDataList();
    });

    // 初始化
    onMounted(() => {
      fetchDataList();
    });

    return {
      // ... 原有的返回值 ...
      data,
      loading,
      error,
      total,
      totalPages,
      currentPage,
      pageSize,
      searchQuery,
      timeFilter,
      regionFilter,
      showImport,
      showEdit,
      isDragging,
      selectedFile,
      editingItem,
      editForm,
      fileInput,
      handleSearch: fetchDataList,
      applyFilters: fetchDataList,
      saveData,
      deleteItem,
      showAddDialog,
      editItem,
      confirmImport,
      exportData,
      // ... 其他方法 ...
    };
  }
};
</script>

<style scoped>
.data-management {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100%;
}

.operation-bar {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.search-section {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  flex: 1;
}

.search-input {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-input i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-input input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  transition: all 0.3s;
}

.search-input input:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.filter-section {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  min-width: 120px;
}

.filter-btn {
  padding: 8px 16px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.filter-btn:hover {
  background: #1565c0;
}

.action-section {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.3s;
}

.action-btn i {
  font-size: 16px;
}

.action-btn.import {
  background: #4caf50;
  color: white;
}

.action-btn.import:hover {
  background: #388e3c;
}

.action-btn.export {
  background: #ff9800;
  color: white;
}

.action-btn.export:hover {
  background: #f57c00;
}

.action-btn.add {
  background: #1976d2;
  color: white;
}

.action-btn.add:hover {
  background: #1565c0;
}

/* 数据表格样式 */
.data-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #f5f5f5;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
}

th:hover {
  background: #eeeeee;
}

th i {
  margin-left: 4px;
  font-size: 12px;
}

td {
  padding: 12px 16px;
  border-top: 1px solid #eee;
}

tr:hover {
  background: #f8f8f8;
}

.actions {
  white-space: nowrap;
}

.icon-btn {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
  transition: all 0.3s;
}

.icon-btn.edit {
  background: #2196f3;
  color: white;
}

.icon-btn.edit:hover {
  background: #1976d2;
}

.icon-btn.delete {
  background: #f44336;
  color: white;
}

.icon-btn.delete:hover {
  background: #d32f2f;
}

/* 分页控件样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:not(:disabled):hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.page-info {
  color: #666;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #f5f5f5;
}

.dialog-content {
  padding: 24px;
}

.dialog-footer {
  padding: 16px 24px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn,
.confirm-btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  border: 1px solid #ddd;
  background: white;
  color: #666;
}

.cancel-btn:hover {
  background: #f5f5f5;
}

.confirm-btn {
  border: none;
  background: #1976d2;
  color: white;
}

.confirm-btn:hover {
  background: #1565c0;
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 上传区域样式 */
.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area.dragging {
  border-color: #1976d2;
  background: rgba(25, 118, 210, 0.05);
}

.upload-area i {
  font-size: 48px;
  color: #1976d2;
  margin-bottom: 16px;
}

.upload-area p {
  color: #666;
  margin: 8px 0;
}

.upload-btn {
  display: inline-block;
  padding: 8px 16px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 16px;
  transition: background-color 0.3s;
}

.upload-btn:hover {
  background: #1565c0;
}

.selected-file {
  margin-top: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.selected-file i {
  color: #1976d2;
}

.remove-file {
  margin-left: auto;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.remove-file:hover {
  background: #eee;
}

/* 表单样式 */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .data-management {
    padding: 16px;
  }

  .operation-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-section {
    flex-direction: column;
  }

  .filter-section {
    flex-direction: column;
  }

  .action-section {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .data-table {
    margin-top: 16px;
  }

  th, td {
    padding: 8px;
  }

  .dialog {
    width: 95%;
    margin: 10px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .data-management {
    background-color: #121212;
  }

  .operation-bar,
  .data-table,
  .dialog {
    background: #383838;
  }

  .page-info {
    color: #999;
  }

  .upload-area {
    border-color: #444;
    background: #2d2d2d;
  }

  .upload-area.dragging {
    background: rgba(25, 118, 210, 0.1);
  }

  .upload-area p {
    color: #999;
  }

  .selected-file {
    background: #2d2d2d;
  }

  .remove-file {
    color: #999;
  }

  .remove-file:hover {
    background: #383838;
  }

  .form-group label {
    color: #fff;
  }

  /* 深色模式滚动条样式 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #1e1e1e;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: #666;
    border-radius: 4px;
    border: 2px solid #1e1e1e;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #888;
  }
}

/* 打印样式优化 */
@media print {
  .data-management {
    padding: 0;
    background: white;
  }

  .operation-bar,
  .pagination,
  .actions {
    display: none;
  }

  .data-table {
    box-shadow: none;
  }

  table {
    border: 1px solid #ddd;
  }

  th, td {
    border: 1px solid #ddd;
  }

  tr:hover {
    background: none;
  }

  .dialog-overlay {
    display: none;
  }
}
</style>