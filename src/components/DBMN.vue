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
import apiClient from '../services/api';
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
          search: searchQuery.value,
          sortKey: sortKey.value,
          sortOrder: sortOrder.value
        };

        console.log('获取数据参数:', params);

        const response = await dataService.fetchData(params);
        console.log('获取数据响应:', response);

        if (response && response.data) {
          data.value = response.data;
          totalPages.value = response.pagination.pages;
          total.value = response.pagination.total;
          console.log('更新后的数据:', data.value);
        } else {
          console.error('获取数据响应格式错误:', response);
          error.value = '获取数据失败：响应格式错误';
        }
      } catch (err) {
        console.error('获取数据失败，详细错误:', err);
        error.value = err.response?.data?.message || err.message || '获取数据失败';
        // 如果是数据库连接错误，显示更友好的提示
        if (err.message.includes('buffering timed out')) {
          error.value = '数据库连接超时，请检查数据库服务是否正常运行';
        }
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

        console.log('准备保存的数据:', formData);

        let response;
        if (editingItem.value) {
          response = await dataService.updateData(editingItem.value.id, formData);
        } else {
          response = await dataService.createData(formData);
        }

        console.log('保存响应:', response);

        if (response && response.success) {
          // 关闭对话框
          closeEditDialog();
          
          // 重新获取数据列表
          await fetchDataList();
          
          // 显示成功提示
          alert(editingItem.value ? '更新成功' : '添加成功');
        } else {
          throw new Error(response?.message || '保存失败');
        }
      } catch (err) {
        console.error('保存数据失败，详细错误:', err);
        error.value = err.response?.data?.message || err.message || '保存数据失败';
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

        const response = await dataService.deleteData(item.id);
        
        if (response && response.success) {
          await fetchDataList();
          alert('删除成功');
        } else {
          throw new Error(response?.message || '删除失败');
        }
      } catch (err) {
        error.value = err.response?.data?.message || err.message || '删除数据失败';
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

        // 创建FormData用于文件上传
        const formData = new FormData();
        formData.append('file', selectedFile.value);

        // 直接使用FormData发送到后端处理
        try {
          const response = await apiClient.post('/ice-data/import', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          if (response.data && response.data.success) {
            await fetchDataList();
            closeImportDialog();
            alert('数据导入成功!');
          } else {
            throw new Error(response.data.message || '导入失败');
          }
        } catch (error) {
          // 如果后端导入接口不可用，则使用前端解析作为备选方案
          console.warn('后端导入接口不可用，尝试使用前端解析:', error);
          
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const workbook = XLSX.read(e.target.result, { type: 'array' });
              const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
              const jsonData = XLSX.utils.sheet_to_json(firstSheet, { 
                defval: '', // 空单元格默认值
                header: 'A' // 使用字母作为未命名的列标题
              });
              
              // 确认数据是否有效
              if (!jsonData || jsonData.length === 0) {
                throw new Error('文件中未找到有效数据');
              }
              
              // 自动检测列名映射
              const firstRow = jsonData[0];
              const columnMap = {
                region: null,
                density: null,
                temperature: null,
                thickness: null,
                collector: null
              };
              
              // 尝试检测中英文列名
              const possibleColumnNames = {
                region: ['region', '监测区域', '区域', 'area', 'zone'],
                density: ['density', '密度', 'icedensity'],
                temperature: ['temperature', '温度', 'temp'],
                thickness: ['thickness', '厚度', 'icethickness'],
                collector: ['collector', '采集人员', 'person', '负责人']
              };
              
              // 查找匹配的列
              for (const field in possibleColumnNames) {
                for (const key in firstRow) {
                  const cellValue = String(firstRow[key]).toLowerCase();
                  if (possibleColumnNames[field].some(name => 
                    cellValue.includes(name.toLowerCase()))) {
                    columnMap[field] = key;
                    break;
                  }
                }
              }
              
              // 检查是否所有必要列都找到了
              const missingColumns = Object.entries(columnMap)
                .filter(([_, value]) => value === null)
                .map(([key, _]) => key);
                
              if (missingColumns.length > 0) {
                throw new Error(`无法识别以下列: ${missingColumns.join(', ')}。请确保Excel文件包含必要的列名。`);
              }
              
              // 转换数据格式
              const formattedData = [];
              const startIndex = 1; // 从第二行开始（跳过表头）
              
              for (let i = startIndex; i < jsonData.length; i++) {
                const row = jsonData[i];
                
                const item = {
                  region: String(row[columnMap.region] || 'A').toUpperCase(),
                  density: Number(row[columnMap.density]) || 0,
                  temperature: Number(row[columnMap.temperature]) || 0,
                  thickness: Number(row[columnMap.thickness]) || 0,
                  collector: String(row[columnMap.collector] || ''),
                  timestamp: new Date()
                };
                
                // 验证数据
                let isValid = true;
                let errorMsg = '';
                
                if (!['A', 'B', 'C'].includes(item.region)) {
                  errorMsg = `第${i + 1}行数据: 监测区域必须是A、B或C`;
                  isValid = false;
                } else if (item.density <= 0) {
                  errorMsg = `第${i + 1}行数据: 密度必须大于0`;
                  isValid = false;
                } else if (item.thickness <= 0) {
                  errorMsg = `第${i + 1}行数据: 厚度必须大于0`;
                  isValid = false;
                } else if (!item.collector) {
                  errorMsg = `第${i + 1}行数据: 采集人员不能为空`;
                  isValid = false;
                }
                
                if (!isValid) {
                  error.value = errorMsg;
                  loading.value = false;
                  return;
                }
                
                formattedData.push(item);
              }
              
              if (formattedData.length === 0) {
                throw new Error('未找到有效数据记录');
              }
              
              // 批量保存数据
              await dataService.importData(formattedData);
              
              // 刷新数据列表并关闭导入对话框
              await fetchDataList();
              closeImportDialog();
              alert(`成功导入${formattedData.length}条数据记录!`);
            } catch (error) {
              error.value = error.message || '文件格式错误';
              console.error('解析文件错误:', error);
            } finally {
              loading.value = false;
            }
          };
          
          reader.onerror = () => {
            error.value = '读取文件失败';
            loading.value = false;
          };
          
          reader.readAsArrayBuffer(selectedFile.value);
        }
      } catch (err) {
        error.value = err.message || '导入数据失败';
        console.error('导入数据失败:', err);
        loading.value = false;
      }
    };

    // 导出数据
    const exportData = () => {
      try {
        if (data.value.length === 0) {
          alert('没有可导出的数据');
          return;
        }
        
        loading.value = true;
        
        // 格式化数据为Excel友好的格式
        const exportData = data.value.map(item => ({
          '时间': new Date(item.timestamp).toLocaleString(),
          '监测区域': item.region,
          '密度(kg/m³)': item.density,
          '温度(°C)': item.temperature,
          '厚度(m)': item.thickness,
          '采集人员': item.collector
        }));
        
        const exportWorkbook = XLSX.utils.book_new();
        const exportSheet = XLSX.utils.json_to_sheet(exportData);
        
        // 设置列宽
        const colWidths = [
          { wch: 20 }, // 时间
          { wch: 10 }, // 区域
          { wch: 12 }, // 密度
          { wch: 10 }, // 温度
          { wch: 10 }, // 厚度
          { wch: 15 }  // 采集人员
        ];
        exportSheet['!cols'] = colWidths;
        
        XLSX.utils.book_append_sheet(exportWorkbook, exportSheet, '海冰数据');
        
        // 获取当前日期作为文件名一部分
        const date = new Date();
        const dateStr = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
        const fileName = `海冰密度数据_${dateStr}.xlsx`;
        
        XLSX.writeFile(exportWorkbook, fileName);
        loading.value = false;
      } catch (error) {
        console.error('导出数据失败:', error);
        error.value = '导出数据失败';
        loading.value = false;
      }
    };

    // 表单验证
    const validateForm = () => {
      if (!editForm.value.region) {
        error.value = '请选择监测区域';
        return false;
      }
      if (!editForm.value.density || editForm.value.density <= 0) {
        error.value = '请输入有效的密度值';
        return false;
      }
      if (!editForm.value.temperature) {
        error.value = '请输入温度值';
        return false;
      }
      if (!editForm.value.thickness || editForm.value.thickness <= 0) {
        error.value = '请输入有效的厚度值';
        return false;
      }
      if (!editForm.value.collector) {
        error.value = '请输入采集人员';
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
      error.value = null;
    };

    const editItem = (item) => {
      editingItem.value = item;
      editForm.value = { ...item };
      showEdit.value = true;
    };

    // 文件处理相关方法
    const showImportDialog = () => {
      selectedFile.value = null;
      showImport.value = true;
      error.value = null;
    };

    const closeImportDialog = () => {
      showImport.value = false;
      selectedFile.value = null;
      error.value = null;
      isDragging.value = false;
    };

    const triggerFileInput = () => {
      fileInput.value.click();
    };

    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file) {
        validateAndSetFile(file);
      }
    };

    const handleFileDrop = (event) => {
      isDragging.value = false;
      const file = event.dataTransfer.files[0];
      if (file) {
        validateAndSetFile(file);
      }
    };

    const validateAndSetFile = (file) => {
      // 检查文件类型
      const validTypes = ['.csv', '.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
      const fileType = file.type || '.' + file.name.split('.').pop();
      
      if (!validTypes.some(type => fileType.includes(type))) {
        error.value = '只支持.csv或.xlsx格式文件';
        return;
      }
      
      // 检查文件大小 (限制为5MB)
      if (file.size > 5 * 1024 * 1024) {
        error.value = '文件大小不能超过5MB';
        return;
      }
      
      selectedFile.value = file;
      error.value = null;
    };

    const removeSelectedFile = () => {
      selectedFile.value = null;
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    const closeEditDialog = () => {
      showEdit.value = false;
      editingItem.value = null;
      error.value = null;
    };

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
      // 数据状态
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
      
      // 列表与分页相关
      columns: [
        { key: 'timestamp', title: '时间' },
        { key: 'region', title: '监测区域' },
        { key: 'density', title: '密度 (kg/m³)' },
        { key: 'temperature', title: '温度 (°C)' },
        { key: 'thickness', title: '厚度 (m)' },
        { key: 'collector', title: '采集人员' }
      ],
      displayedData: computed(() => {
        return data.value;
      }),
      formatDate: (date) => {
        return new Date(date).toLocaleString();
      },
      changePage: (page) => {
        currentPage.value = page;
        fetchDataList();
      },
      sort: (key) => {
        if (sortKey.value === key) {
          sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
        } else {
          sortKey.value = key;
          sortOrder.value = 'asc';
        }
        fetchDataList();
      },
      
      // 搜索与筛选
      handleSearch: fetchDataList,
      applyFilters: fetchDataList,
      
      // 数据操作
      saveData,
      deleteItem,
      showAddDialog,
      editItem,
      
      // 导入导出
      showImportDialog,
      closeImportDialog,
      triggerFileInput,
      handleFileSelect,
      handleFileDrop,
      removeSelectedFile,
      confirmImport,
      exportData,
      
      // 表单操作
      closeEditDialog
    };
  }
};
</script>

<style scoped>
.data-management {
  padding: 24px;
  background-color: #eef5f9;
  background-image: linear-gradient(120deg, #eef5f9 0%, #e3f2fd 100%);
  min-height: 100%;
  position: relative;
  overflow: hidden;
}

/* 冰层效果装饰元素 */
.data-management::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #a1c4fd, #c2e9fb);
  box-shadow: 0 0 15px rgba(161, 196, 253, 0.7);
  z-index: 1;
}

.operation-bar {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(55, 125, 255, 0.1);
  border: 1px solid rgba(161, 196, 253, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  transition: all 0.3s ease;
}

.operation-bar:hover {
  box-shadow: 0 6px 25px rgba(55, 125, 255, 0.15);
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
  color: #4a8cca;
}

.search-input input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #c2e9fb;
  border-radius: 8px;
  outline: none;
  transition: all 0.3s;
  background-color: rgba(255, 255, 255, 0.7);
  color: #2c3e50;
}

.search-input input:focus {
  border-color: #377dff;
  box-shadow: 0 0 0 3px rgba(55, 125, 255, 0.2);
  background-color: #fff;
}

.filter-section {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 10px 12px;
  border: 1px solid #c2e9fb;
  border-radius: 8px;
  outline: none;
  min-width: 120px;
  background-color: rgba(255, 255, 255, 0.7);
  color: #2c3e50;
  transition: all 0.3s;
  cursor: pointer;
}

.filter-select:focus {
  border-color: #377dff;
  box-shadow: 0 0 0 3px rgba(55, 125, 255, 0.2);
  background-color: #fff;
}

.filter-btn {
  padding: 10px 16px;
  background: #377dff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  box-shadow: 0 2px 10px rgba(55, 125, 255, 0.2);
}

.filter-btn:hover {
  background: #2e6adb;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(55, 125, 255, 0.3);
}

.filter-btn:active {
  transform: translateY(1px);
}

.action-section {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.action-btn i {
  font-size: 16px;
}

.action-btn.import {
  background: #2ec4b6;
  color: white;
}

.action-btn.import:hover {
  background: #26a69a;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(46, 196, 182, 0.3);
}

.action-btn.export {
  background: #2196f3;
  color: white;
}

.action-btn.export:hover {
  background: #1976d2;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
}

.action-btn.add {
  background: #377dff;
  color: white;
}

.action-btn.add:hover {
  background: #2e6adb;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(55, 125, 255, 0.3);
}

.action-btn:active {
  transform: translateY(1px);
}

/* 数据表格样式 */
.data-table {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(55, 125, 255, 0.1);
  border: 1px solid rgba(161, 196, 253, 0.2);
  overflow: hidden;
  transition: all 0.3s ease;
}

.data-table:hover {
  box-shadow: 0 6px 25px rgba(55, 125, 255, 0.15);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: rgba(55, 125, 255, 0.05);
  padding: 14px 16px;
  text-align: left;
  font-weight: 600;
  color: #377dff;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
  border-bottom: 1px solid rgba(161, 196, 253, 0.3);
  position: relative;
}

th:hover {
  background: rgba(55, 125, 255, 0.1);
}

th i {
  margin-left: 4px;
  font-size: 12px;
}

th::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: #377dff;
  transition: width 0.3s;
}

th:hover::after {
  width: 100%;
}

td {
  padding: 14px 16px;
  border-top: 1px solid rgba(161, 196, 253, 0.15);
  color: #2c3e50;
  transition: all 0.2s;
}

tr:hover td {
  background: rgba(55, 125, 255, 0.05);
}

.actions {
  white-space: nowrap;
}

.icon-btn {
  padding: 8px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-left: 8px;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.icon-btn.edit {
  background: #2196f3;
  color: white;
}

.icon-btn.edit:hover {
  background: #1976d2;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(33, 150, 243, 0.3);
}

.icon-btn.delete {
  background: #f44336;
  color: white;
}

.icon-btn.delete:hover {
  background: #d32f2f;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(244, 67, 54, 0.3);
}

.icon-btn:active {
  transform: translateY(1px);
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
  border: 1px solid #c2e9fb;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s;
  color: #377dff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:not(:disabled):hover {
  background: rgba(55, 125, 255, 0.1);
  border-color: #377dff;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(55, 125, 255, 0.15);
}

.page-btn:active {
  transform: translateY(1px);
}

.page-info {
  color: #4a8cca;
  font-weight: 500;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(44, 62, 80, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
  border: 1px solid rgba(161, 196, 253, 0.2);
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.dialog-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(161, 196, 253, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(90deg, #e3f2fd, #bbdefb);
  border-radius: 12px 12px 0 0;
}

.dialog-header h3 {
  margin: 0;
  color: #377dff;
  font-weight: 600;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  color: #4a8cca;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(55, 125, 255, 0.1);
  color: #377dff;
  transform: rotate(90deg);
}

.dialog-content {
  padding: 24px;
}

.dialog-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(161, 196, 253, 0.3);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn,
.confirm-btn {
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.cancel-btn {
  border: 1px solid #c2e9fb;
  background: white;
  color: #4a8cca;
}

.cancel-btn:hover {
  background: #f5f9ff;
  border-color: #377dff;
  color: #377dff;
}

.confirm-btn {
  border: none;
  background: #377dff;
  color: white;
  box-shadow: 0 2px 10px rgba(55, 125, 255, 0.2);
}

.confirm-btn:hover {
  background: #2e6adb;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(55, 125, 255, 0.3);
}

.confirm-btn:active {
  transform: translateY(1px);
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 上传区域样式 */
.upload-area {
  border: 2px dashed #a1c4fd;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(161, 196, 253, 0.05);
}

.upload-area.dragging {
  border-color: #377dff;
  background: rgba(55, 125, 255, 0.08);
  transform: scale(1.02);
}

.upload-area i {
  font-size: 48px;
  color: #4a8cca;
  margin-bottom: 16px;
}

.upload-area p {
  color: #4a8cca;
  margin: 8px 0;
}

.upload-btn {
  display: inline-block;
  padding: 10px 20px;
  background: #377dff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.3s;
  font-weight: 500;
  box-shadow: 0 2px 10px rgba(55, 125, 255, 0.2);
}

.upload-btn:hover {
  background: #2e6adb;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(55, 125, 255, 0.3);
}

.upload-btn:active {
  transform: translateY(1px);
}

.selected-file {
  margin-top: 20px;
  padding: 14px;
  background: rgba(161, 196, 253, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(161, 196, 253, 0.3);
}

.selected-file i {
  color: #377dff;
  font-size: 18px;
}

.remove-file {
  margin-left: auto;
  background: none;
  border: none;
  color: #4a8cca;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-file:hover {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

/* 表单样式 */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #4a8cca;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #c2e9fb;
  border-radius: 8px;
  outline: none;
  transition: all 0.3s;
  background-color: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #377dff;
  box-shadow: 0 0 0 3px rgba(55, 125, 255, 0.2);
  background-color: #fff;
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
    padding: 12px 10px;
  }

  .dialog {
    width: 95%;
    margin: 10px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .data-management {
    background-color: #0d1b2a;
    background-image: linear-gradient(120deg, #0d1b2a 0%, #1b263b 100%);
  }

  .operation-bar,
  .data-table,
  .dialog {
    background: rgba(27, 38, 59, 0.8);
    border-color: rgba(65, 90, 219, 0.2);
  }

  .dialog-header {
    background: linear-gradient(90deg, #1b263b, #1d3557);
  }

  .search-input input,
  .filter-select,
  .form-group input,
  .form-group select {
    background-color: rgba(15, 23, 42, 0.7);
    color: #e3f2fd;
    border-color: #415ab3;
  }

  .search-input input:focus,
  .filter-select:focus,
  .form-group input:focus,
  .form-group select:focus {
    background-color: rgba(15, 23, 42, 0.95);
    border-color: #5472d3;
    box-shadow: 0 0 0 3px rgba(65, 90, 219, 0.3);
  }

  th {
    color: #90caf9;
    background: rgba(65, 90, 219, 0.1);
    border-bottom-color: rgba(65, 90, 219, 0.3);
  }

  th:hover {
    background: rgba(65, 90, 219, 0.2);
  }

  th::after {
    background: #5472d3;
  }

  td {
    border-top-color: rgba(65, 90, 219, 0.15);
    color: #e3f2fd;
  }

  tr:hover td {
    background: rgba(65, 90, 219, 0.1);
  }

  .page-info {
    color: #90caf9;
  }

  .page-btn {
    background: rgba(15, 23, 42, 0.7);
    border-color: #415ab3;
    color: #90caf9;
  }

  .page-btn:not(:disabled):hover {
    background: rgba(65, 90, 219, 0.2);
    border-color: #5472d3;
  }

  .upload-area {
    border-color: #415ab3;
    background: rgba(65, 90, 219, 0.05);
  }

  .upload-area.dragging {
    border-color: #5472d3;
    background: rgba(65, 90, 219, 0.1);
  }

  .upload-area i,
  .upload-area p,
  .form-group label {
    color: #90caf9;
  }

  .selected-file {
    background: rgba(65, 90, 219, 0.1);
    border-color: rgba(65, 90, 219, 0.3);
  }

  .selected-file i {
    color: #5472d3;
  }

  .cancel-btn {
    border-color: #415ab3;
    color: #90caf9;
  }

  .cancel-btn:hover {
    background: rgba(65, 90, 219, 0.1);
    border-color: #5472d3;
    color: #bbdefb;
  }

  /* 深色模式滚动条样式 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #1b263b;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: #415ab3;
    border-radius: 4px;
    border: 2px solid #1b263b;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #5472d3;
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
    border: 1px solid #ddd;
  }

  table {
    border: 1px solid #ddd;
  }

  th, td {
    border: 1px solid #ddd;
    padding: 10px;
  }

  th {
    background: #f0f8ff !important;
    color: #000 !important;
  }

  tr:hover {
    background: none;
  }

  .dialog-overlay {
    display: none;
  }
}

/* 添加冰雪特效动画 */
@keyframes snowfall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  20% {
    opacity: 0.2;
  }
  100% {
    transform: translateY(600px) rotate(360deg);
    opacity: 0;
  }
}

.data-management::after {
  content: "";
  position: absolute;
  top: -100px;
  left: 0;
  right: 0;
  height: 100px;
  background-image: 
    radial-gradient(circle at 10% 10%, rgba(255, 255, 255, 0.8) 2px, transparent 2px),
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.7) 1px, transparent 1px),
    radial-gradient(circle at 50% 40%, rgba(255, 255, 255, 0.6) 3px, transparent 3px),
    radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.7) 2px, transparent 2px),
    radial-gradient(circle at 90% 60%, rgba(255, 255, 255, 0.8) 1px, transparent 1px);
  animation: snowfall 15s linear infinite;
  pointer-events: none;
  z-index: 0;
}
</style>