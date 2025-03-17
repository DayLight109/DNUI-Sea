//Overview.vue
<template>
  <div class="overview-container">
    <!-- 顶部标题区域 -->
    <div class="title-section">
      <div class="main-title">
        <h2>北极海冰监测概览</h2>
        <span class="update-info">最后更新: {{ lastUpdateTime }}</span>
      </div>
      <p class="description">实时监测北极海冰变化，提供温度、密度等关键指标的实时数据和趋势分析。</p>
    </div>

    <!-- 指标卡片网格 -->
    <div class="metrics-grid">
      <!-- 温度卡片 -->
      <div class="metric-card" :class="{ 'warning': temperatureStatus === 'warning' }">
        <div class="card-header">
          <i class="fas fa-temperature-high"></i>
          <span class="status-tag warning">警告</span>
        </div>
        <h3>平均温度</h3>
        <div class="value-container">
          <span class="value">-15.2</span>
          <span class="unit">°C</span>
        </div>
        <div class="trend">
          <i class="fas fa-arrow-up"></i>
          <span>2.5% 较上月</span>
        </div>
      </div>

      <!-- 面积卡片 -->
      <div class="metric-card">
        <div class="card-header">
          <i class="fas fa-expand-arrows-alt"></i>
          <span class="status-tag normal">正常</span>
        </div>
        <h3>冰层面积</h3>
        <div class="value-container">
          <span class="value">14.3</span>
          <span class="unit">百万平方公里</span>
        </div>
        <div class="trend">
          <i class="fas fa-arrow-down"></i>
          <span>1.8% 较上月</span>
        </div>
      </div>

      <!-- 厚度卡片 -->
      <div class="metric-card">
        <div class="card-header">
          <i class="fas fa-layer-group"></i>
          <span class="status-tag normal">正常</span>
        </div>
        <h3>平均厚度</h3>
        <div class="value-container">
          <span class="value">2.3</span>
          <span class="unit">米</span>
        </div>
        <div class="trend">
          <i class="fas fa-arrow-up"></i>
          <span>1.2% 较上月</span>
        </div>
      </div>
    </div>

    <!-- 监测视图控制区 -->
    <div class="monitor-section">
      <div class="section-header">
        <h3>实时监测</h3>
        <div class="view-controls">
          <button 
            v-for="view in viewModes"
            :key="view.id"
            class="control-btn"
            :class="{ active: currentView === view.id }"
            @click="switchView(view.id)"
          >
            <i :class="view.icon"></i>
            {{ view.name }}
          </button>
        </div>
      </div>
      
      <!-- 地图视图区域 -->
      <div class="map-container">
        <!-- 这里可以放置地图组件 -->
      </div>
    </div>

    <!-- 历史趋势分析 -->
    <div class="trend-section">
      <div class="section-header">
        <h3>历史趋势分析</h3>
        <div class="controls">
          <select v-model="selectedPeriod" class="period-select">
            <option v-for="period in timePeriods" 
                    :key="period.value" 
                    :value="period.value">
              {{ period.label }}
            </option>
          </select>
          <div class="action-buttons">
            <button class="action-btn" @click="viewReport">
              查看详细报告
              <span class="badge">2</span>
            </button>
            <button class="action-btn" @click="exportData">
              <i class="fas fa-download"></i>
              导出数据
            </button>
            <button class="action-btn" @click="setAlert">
              <i class="fas fa-bell"></i>
              设置预警
            </button>
          </div>
        </div>
      </div>

      <div class="chart-container" ref="chartRef">
        <!-- 图表将在这里渲染 -->
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import { format } from 'date-fns';

export default {
  name: 'Overview',
  setup() {
    const currentView = ref('3d');
    const selectedPeriod = ref('30');
    const chartRef = ref(null);
    let chart = null;
    
    const lastUpdateTime = ref(format(new Date(), 'yyyy-MM-dd HH:mm:ss'));
    const temperatureStatus = ref('warning');

    const viewModes = [
      { id: '3d', name: '3D视图', icon: 'fas fa-cube' },
      { id: 'satellite', name: '卫星图', icon: 'fas fa-satellite' },
      { id: 'temperature', name: '温度图', icon: 'fas fa-temperature-high' }
    ];

    const timePeriods = [
      { value: '7', label: '近7天' },
      { value: '30', label: '近30天' },
      { value: '90', label: '近90天' },
      { value: '365', label: '近1年' }
    ];

    const switchView = (viewId) => {
      currentView.value = viewId;
    };

    const initChart = () => {
      if (!chartRef.value) return;

      chart = echarts.init(chartRef.value);
      // 配置图表选项...
    };

    const viewReport = () => {
      console.log('查看报告');
    };

    const exportData = () => {
      console.log('导出数据');
    };

    const setAlert = () => {
      console.log('设置预警');
    };

    onMounted(() => {
      initChart();
      window.addEventListener('resize', () => chart?.resize());
    });

    onBeforeUnmount(() => {
      chart?.dispose();
    });

    return {
      currentView,
      selectedPeriod,
      chartRef,
      lastUpdateTime,
      temperatureStatus,
      viewModes,
      timePeriods,
      switchView,
      viewReport,
      exportData,
      setAlert
    };
  }
};
</script>

<style scoped>
.overview-container {
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.title-section {
  margin-bottom: 32px;
}

.main-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.main-title h2 {
  font-size: 28px;
  color: #1a1a1a;
  font-weight: 600;
}

.update-info {
  font-size: 14px;
  color: #666;
}

.description {
  color: #666;
  font-size: 16px;
  line-height: 1.6;
}

/* 指标卡片样式 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header i {
  font-size: 24px;
  color: #006d75;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.normal {
  background: #e6fffb;
  color: #006d75;
}

.status-tag.warning {
  background: #fff7e6;
  color: #d46b08;
}

.metric-card h3 {
  font-size: 16px;
  color: #666;
  margin-bottom: 12px;
}

.value-container {
  margin-bottom: 16px;
}

.value {
  font-size: 32px;
  font-weight: 600;
  color: #1a1a1a;
}

.unit {
  font-size: 14px;
  color: #666;
  margin-left: 4px;
}

.trend {
  font-size: 14px;
  color: #666;
}

.trend i {
  margin-right: 4px;
}

/* 监测区域样式 */
.monitor-section, .trend-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h3 {
  font-size: 20px;
  color: #1a1a1a;
}

.view-controls {
  display: flex;
  gap: 12px;
}

.control-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  background: white;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-btn:hover {
  border-color: #006d75;
  color: #006d75;
}

.control-btn.active {
  background: #006d75;
  color: white;
  border-color: #006d75;
}

.map-container {
  height: 400px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 16px;
}

/* 图表区域 */
.chart-container {
  height: 400px;
  margin-top: 24px;
}

/* 控制栏样式 */
.controls {
  display: flex;
  gap: 16px;
  align-items: center;
}

.period-select {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  min-width: 120px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  background: white;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.action-btn:hover {
  border-color: #006d75;
  color: #006d75;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f5222d;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .overview-container {
    padding: 16px;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-buttons {
    flex-wrap: wrap;
  }
}
</style>