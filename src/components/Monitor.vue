<template>
  <div class="monitor-page">
    <!-- 顶部数据卡片 -->
    <div class="data-cards">
      <div v-for="card in dataCards" :key="card.title" class="card">
        <div class="card-icon" :style="{ backgroundColor: card.color }">
          <i :class="card.icon"></i>
        </div>
        <div class="card-content">
          <h3 class="card-title">{{ card.title }}</h3>
          <div class="card-value">{{ card.value }}</div>
          <div class="card-trend" :class="{ up: card.trend > 0, down: card.trend < 0 }">
            {{ Math.abs(card.trend) }}% 
            <i :class="card.trend > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- 实时监测图表区域 -->
    <div class="chart-container">
      <div class="chart-header">
        <h2>实时密度监测</h2>
        <div class="chart-actions">
          <select v-model="timeRange" class="time-select">
            <option value="1h">最近1小时</option>
            <option value="6h">最近6小时</option>
            <option value="24h">最近24小时</option>
            <option value="7d">最近7天</option>
          </select>
          <button class="refresh-btn" @click="refreshData">
            <i class="fas fa-sync-alt" :class="{ 'rotate': isRefreshing }"></i>
            刷新数据
          </button>
        </div>
      </div>
      <div class="chart-content">
        <div ref="densityChart" class="density-chart"></div>
      </div>
    </div>

    <!-- 实时告警列表 -->
    <div class="alert-container">
      <div class="alert-header">
        <h2>实时告警</h2>
        <span class="alert-badge">{{ alerts.length }}</span>
      </div>
      <div class="alert-list">
        <div v-for="alert in alerts" :key="alert.id" class="alert-item" :class="alert.level">
          <div class="alert-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="alert-info">
            <div class="alert-title">{{ alert.title }}</div>
            <div class="alert-time">{{ alert.time }}</div>
          </div>
          <div class="alert-actions">
            <button class="handle-btn" @click="handleAlert(alert.id)">处理</button>
            <button class="details-btn" @click="showDetails(alert.id)">详情</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';

export default {
  name: 'Monitor',
  setup() {
    const timeRange = ref('1h');
    const isRefreshing = ref(false);
    let densityChart = null;
    const densityChartRef = ref(null);

    const dataCards = ref([
      {
        title: '平均密度',
        value: '892.5 kg/m³',
        trend: 2.3,
        icon: 'fas fa-chart-line',
        color: '#1976d2'
      },
      {
        title: '覆盖面积',
        value: '12,459 km²',
        trend: -1.2,
        icon: 'fas fa-expand',
        color: '#388e3c'
      },
      {
        title: '监测点数',
        value: '284',
        trend: 5.7,
        icon: 'fas fa-satellite',
        color: '#e64a19'
      },
      {
        title: '数据采集率',
        value: '99.8%',
        trend: 0.5,
        icon: 'fas fa-tachometer-alt',
        color: '#7b1fa2'
      }
    ]);

    const alerts = ref([
      {
        id: 1,
        title: '监测点A1密度异常波动',
        time: '2分钟前',
        level: 'warning'
      },
      {
        id: 2,
        title: '区域B监测数据传输中断',
        time: '15分钟前',
        level: 'critical'
      },
      {
        id: 3,
        title: '监测点C4电量不足',
        time: '1小时前',
        level: 'info'
      }
    ]);

    const initChart = () => {
      if (!densityChartRef.value) return;
      
      densityChart = echarts.init(densityChartRef.value);
      const option = {
        title: {
          text: '海冰密度变化趋势',
          subtext: '实时数据',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['区域A', '区域B', '区域C'],
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '60px',
          top: '60px',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: generateTimeData()
        },
        yAxis: {
          type: 'value',
          name: '密度 (kg/m³)'
        },
        series: [
          {
            name: '区域A',
            type: 'line',
            smooth: true,
            data: generateRandomData()
          },
          {
            name: '区域B',
            type: 'line',
            smooth: true,
            data: generateRandomData()
          },
          {
            name: '区域C',
            type: 'line',
            smooth: true,
            data: generateRandomData()
          }
        ]
      };
      
      densityChart.setOption(option);
    };

    const generateRandomData = () => {
      return Array.from({ length: 24 }, () => Math.floor(850 + Math.random() * 100));
    };

    const generateTimeData = () => {
      const times = [];
      const now = new Date();
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now - i * 3600 * 1000);
        times.push(`${time.getHours()}:00`);
      }
      return times;
    };

    const refreshData = async () => {
      isRefreshing.value = true;
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (densityChart) {
          densityChart.setOption({
            series: [
              { data: generateRandomData() },
              { data: generateRandomData() },
              { data: generateRandomData() }
            ]
          });
        }
      } finally {
        isRefreshing.value = false;
      }
    };

    const handleAlert = (id) => {
      alerts.value = alerts.value.filter(alert => alert.id !== id);
    };

    const showDetails = (id) => {
      const alert = alerts.value.find(a => a.id === id);
      console.log('查看告警详情:', alert);
    };

    onMounted(async () => {
      await nextTick();
      initChart();
      const handleResize = () => densityChart?.resize();
      window.addEventListener('resize', handleResize);

      onUnmounted(() => {
        window.removeEventListener('resize', handleResize);
        if (densityChart) {
          densityChart.dispose();
          densityChart = null;
        }
      });
    });

    return {
      timeRange,
      isRefreshing,
      dataCards,
      alerts,
      densityChartRef,
      refreshData,
      handleAlert,
      showDetails
    };
  }
};
</script>

<style scoped>
.monitor-page {
  padding: 20px;
}

.data-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s;
}

.card:hover {
  transform: translateY(-2px);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.card-icon i {
  color: white;
  font-size: 24px;
}

.card-content {
  flex: 1;
}

.card-title {
  color: #666;
  font-size: 14px;
  margin-bottom: 4px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.card-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-trend.up {
  color: #4caf50;
}

.card-trend.down {
  color: #f44336;
}

.chart-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h2 {
  font-size: 18px;
  color: #333;
}

.chart-actions {
  display: flex;
  gap: 12px;
}

.time-select {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background: #1976d2;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.refresh-btn:hover {
  background: #1565c0;
}

.refresh-btn i.rotate {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.density-chart {
  height: 400px;
  width: 100%;
}

.alert-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.alert-header h2 {
  font-size: 18px;
  color: #333;
}

.alert-badge {
  background: #f44336;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 6px;
  background: #f5f5f5;
  transition: transform 0.3s;
}

.alert-item:hover {
  transform: translateX(4px);
}

.alert-item.warning {
  border-left: 4px solid #ff9800;
}

.alert-item.critical {
  border-left: 4px solid #f44336;
}

.alert-item.info {
  border-left: 4px solid #2196f3;
}

.alert-icon {
  margin-right: 16px;
}

.alert-icon i {
  font-size: 20px;
  color: #666;
}

.alert-info {
  flex: 1;
}

.alert-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.alert-time {
  font-size: 12px;
  color: #666;
}

.alert-actions {
  display: flex;
  gap: 8px;
}

.alert-actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.handle-btn {
  background: #1976d2;
  color: white;
}

.handle-btn:hover {
  background: #1565c0;
}

.details-btn {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd !important;
}

.details-btn:hover {
  background: #eeeeee;
}

@media (max-width: 768px) {
  .monitor-page {
    padding: 12px;
  }

  .data-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .card {
    padding: 16px;
  }

  .card-icon {
    width: 40px;
    height: 40px;
  }

  .card-icon i {
    font-size: 20px;
  }

  .card-value {
    font-size: 20px;
  }

  .chart-container {
    padding: 16px;
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .chart-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .time-select {
    flex: 1;
    min-width: 120px;
  }

  .density-chart {
    height: 300px;
  }

  .alert-item {
    padding: 12px;
  }

  .alert-actions {
    flex-direction: column;
  }

  .alert-actions button {
    width: 100%;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .monitor-page {
    background-color: #121212;
  }

  .card,
  .chart-container,
  .alert-container {
    background: #1e1e1e;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  }

  .card-title {
    color: #999;
  }

  .card-value {
    color: #fff;
  }

  .chart-header h2,
  .alert-header h2 {
    color: #fff;
  }

  .time-select {
    background: #2d2d2d;
    border-color: #444;
    color: #fff;
  }

  .alert-item {
    background: #2d2d2d;
  }

  .alert-title {
    color: #fff;
  }

  .alert-time {
    color: #999;
  }

  .details-btn {
    background: #2d2d2d;
    border-color: #444 !important;
    color: #fff;
  }

  .details-btn:hover {
    background: #383838;
  }

  /* 深色模式下的图表主题适配 */
  .density-chart {
    background: #1e1e1e;
  }

  /* 深色模式下滚动条样式 */
  ::-webkit-scrollbar-track {
    background: #1e1e1e;
  }

  ::-webkit-scrollbar-thumb {
    background: #666;
    border: 2px solid #1e1e1e;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #888;
  }
}
</style>