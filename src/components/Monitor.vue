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
        <div class="chart-tabs">
          <button 
            class="tab-btn active"
          >
            <i class="fas fa-globe-arctic"></i> 全球地图
          </button>
        </div>
        
        <div class="map-view">
          <div ref="densityMapRef" class="density-map" style="width: 100%; height: 400px; min-height: 400px;"></div>
          <div class="map-legend">
            <h4>密度分布 (kg/m³)</h4>
            <div class="legend-gradient">
              <div class="legend-labels">
                <span>700</span>
                <span>825</span>
                <span>950</span>
              </div>
            </div>
          </div>
        </div>
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
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

export default {
  name: 'Monitor',
  setup() {
    const timeRange = ref('1h');
    const isRefreshing = ref(false);
    
    // 地图相关变量
    let densityMap = null;
    const densityMapRef = ref(null);
    let mapLayers = [];

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

    // 增加监测站点数据
    const monitoringStations = ref([
      { id: 'MS-01', name: '监测站01', region: 'A', status: 'normal', density: 915, temperature: -12.5, thickness: 2.1, lastUpdate: new Date() },
      { id: 'MS-02', name: '监测站02', region: 'A', status: 'normal', density: 908, temperature: -15.2, thickness: 1.8, lastUpdate: new Date(Date.now() - 15 * 60000) },
      { id: 'MS-03', name: '监测站03', region: 'B', status: 'warning', density: 892, temperature: -10.1, thickness: 1.5, lastUpdate: new Date(Date.now() - 30 * 60000) },
      { id: 'MS-04', name: '监测站04', region: 'C', status: 'normal', density: 921, temperature: -17.8, thickness: 2.4, lastUpdate: new Date(Date.now() - 45 * 60000) },
      { id: 'MS-05', name: '监测站05', region: 'B', status: 'normal', density: 905, temperature: -14.3, thickness: 1.9, lastUpdate: new Date(Date.now() - 60 * 60000) },
      { id: 'MS-06', name: '监测站06', region: 'C', status: 'critical', density: 875, temperature: -8.2, thickness: 1.2, lastUpdate: new Date(Date.now() - 120 * 60000) }
    ]);

    // 选中的监测站
    const selectedStation = ref(null);
    
    // 选择的区域过滤器
    const regionFilter = ref('all');
    
    // 密度阈值设置
    const densityThresholds = ref({
      low: 850,
      normal: 900,
      high: 950
    });

    const refreshData = async () => {
      isRefreshing.value = true;
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 更新地图数据
        if (densityMap) {
          addMonitoringStationsToMap();
          addDensityHeatmap();
        }
        
        // 更新卡片数据
        dataCards.value[0].value = `${Math.floor(880 + Math.random() * 30)} kg/m³`;
        dataCards.value[0].trend = Number((Math.random() * 5 - 2.5).toFixed(1));
        
        // 模拟新的告警
        if (Math.random() > 0.7) {
          const alertTypes = [
            '密度异常波动',
            '温度急剧变化',
            '数据传输延迟',
            '信号强度下降'
          ];
          const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
          const alertRegion = ['A', 'B', 'C'][Math.floor(Math.random() * 3)];
          const alertId = alerts.value.length > 0 ? Math.max(...alerts.value.map(a => a.id)) + 1 : 1;
          
          alerts.value.unshift({
            id: alertId,
            title: `监测点${alertRegion}${Math.floor(Math.random() * 5) + 1}${alertType}`,
            time: '刚刚',
            level: Math.random() > 0.3 ? 'warning' : 'critical'
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
      // 这里可以添加显示告警详情的代码
    };
    
    // 过滤监测站
    const filteredStations = computed(() => {
      if (regionFilter.value === 'all') {
        return monitoringStations.value;
      } else {
        return monitoringStations.value.filter(station => station.region === regionFilter.value);
      }
    });
    
    // 格式化时间
    const formatTime = (date) => {
      if (!date) return '';
      const now = new Date();
      const diff = Math.floor((now - date) / 60000); // 分钟差
      
      if (diff < 1) return '刚刚';
      if (diff < 60) return `${diff}分钟前`;
      if (diff < 1440) return `${Math.floor(diff / 60)}小时前`;
      return `${Math.floor(diff / 1440)}天前`;
    };

    // 初始化地图
    const initMap = () => {
      if (!densityMapRef.value) return;
      
      // 如果已经初始化过地图，先销毁
      if (densityMap) {
        console.log('地图已初始化，先销毁');
        densityMap.remove();
        densityMap = null;
        mapLayers = [];
      }
      
      // 确保容器有足够的尺寸
      if (densityMapRef.value.clientWidth === 0 || densityMapRef.value.clientHeight === 0) {
        console.warn('地图容器尺寸为0，等待下一帧再初始化');
        // 延迟初始化，确保DOM已经渲染
        setTimeout(() => {
          initMap();
        }, 500);
        return;
      }
      
      try {
        console.log('初始化地图，容器尺寸:', densityMapRef.value.clientWidth, densityMapRef.value.clientHeight);
        // 初始化地图
        densityMap = L.map(densityMapRef.value, {
          center: [80, 0],  // 北极区域
          zoom: 3,
          minZoom: 2,
          maxZoom: 8
        });
        
        // 添加底图
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(densityMap);
        
        // 添加监测点数据
        addMonitoringStationsToMap();
        
        // 延迟添加热力图，确保地图已完全加载
        setTimeout(() => {
          addDensityHeatmap();
        }, 1000);
      } catch (error) {
        console.error('地图初始化失败:', error);
      }
    };
    
    // 添加监测站点到地图
    const addMonitoringStationsToMap = () => {
      // 清除现有图层
      if (mapLayers.length > 0) {
        mapLayers.forEach(layer => densityMap.removeLayer(layer));
        mapLayers = [];
      }
      
      // 添加监测站点
      monitoringStations.value.forEach(station => {
        // 模拟监测站点的位置数据
        const lat = 75 + Math.random() * 15;  // 北极区域大致在75-90纬度
        const lng = Math.random() * 360 - 180;  // 经度范围为-180到180
        
        // 根据状态设置不同颜色
        const markerColor = station.status === 'normal' ? '#4caf50' : 
                          station.status === 'warning' ? '#ff9800' : '#f44336';
        
        // 创建自定义图标
        const stationIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color:${markerColor};" class="marker-pin"></div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        });
        
        // 创建标记并添加到地图
        const marker = L.marker([lat, lng], { icon: stationIcon })
          .addTo(densityMap)
          .bindPopup(`
            <div class="station-popup">
              <h3>${station.name}</h3>
              <div class="station-info">
                <p><strong>密度:</strong> ${station.density} kg/m³</p>
                <p><strong>温度:</strong> ${station.temperature}°C</p>
                <p><strong>厚度:</strong> ${station.thickness} m</p>
                <p><strong>状态:</strong> ${station.status === 'normal' ? '正常' : 
                                       station.status === 'warning' ? '警告' : '危险'}</p>
              </div>
            </div>
          `);
        
        mapLayers.push(marker);
      });
    };
    
    // 添加密度热力图
    const addDensityHeatmap = () => {
      // 如果地图未初始化，则不添加热力图
      if (!densityMap) {
        console.warn('地图未初始化，无法添加热力图');
        return;
      }
      
      try {
        // 模拟密度数据点
        const heatData = [];
        
        // 生成北极区域的随机数据点
        for (let i = 0; i < 200; i++) {
          const lat = 75 + Math.random() * 15;
          const lng = Math.random() * 360 - 180;
          
          // 密度值，越靠近极点密度越高
          const intensity = Math.max(0.1, 1 - (90 - lat) / 15) * Math.random();
          heatData.push([lat, lng, intensity]);
        }
        
        // 创建热力图层
        if (typeof L.heatLayer === 'function') {
          // 确保地图已经完全初始化
          densityMap.invalidateSize();
          
          const heatLayer = L.heatLayer(heatData, {
            radius: 20,
            blur: 15,
            maxZoom: 10,
            minOpacity: 0.3,
            gradient: {
              0.1: '#74a9cf',
              0.3: '#3690c0',
              0.5: '#0570b0',
              0.7: '#045a8d',
              0.9: '#023858'
            }
          }).addTo(densityMap);
          
          mapLayers.push(heatLayer);
        } else {
          console.warn('L.heatLayer 不可用，可能需要导入 leaflet.heat 插件');
        }
      } catch (error) {
        console.error('创建热力图时出错:', error);
      }
    };

    onMounted(() => {
      // 使用nextTick确保DOM已经渲染完成
      nextTick(() => {
        console.log('DOM已渲染，初始化地图');
        initMap();
        
        // 手动触发一次刷新以加载初始数据
        setTimeout(() => {
          refreshData();
        }, 1000);
      });
      
      const handleResize = () => {
        if (densityMap) {
          console.log('窗口大小变化，重新调整地图大小');
          densityMap.invalidateSize();
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // 设置自动刷新
      const autoRefresh = setInterval(() => {
        if (!isRefreshing.value) {
          refreshData();
        }
      }, 60000); // 每分钟刷新一次

      onUnmounted(() => {
        window.removeEventListener('resize', handleResize);
        clearInterval(autoRefresh);
        if (densityMap) {
          densityMap.remove();
          densityMap = null;
        }
      });
    });

    return {
      timeRange,
      isRefreshing,
      dataCards,
      alerts,
      densityMapRef,
      refreshData,
      handleAlert,
      showDetails,
      monitoringStations,
      filteredStations,
      regionFilter,
      formatTime,
      selectedStation
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

.chart-content {
  position: relative;
  min-height: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.chart-tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 16px;
}

.tab-btn {
  padding: 8px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-btn.active {
  color: #1976d2;
  border-bottom-color: #1976d2;
}

.tab-btn i {
  font-size: 16px;
}

.chart-view, .map-view {
  width: 100%;
  height: 400px;
  position: relative;
  flex: 1;
}

.density-chart {
  height: 400px !important;
  width: 100% !important;
  background-color: transparent;
  min-height: 400px;
}

.density-map {
  height: 400px !important;
  width: 100% !important;
  border-radius: 8px;
  overflow: hidden;
  min-height: 400px;
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

.map-legend {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.map-legend h4 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #333;
}

.legend-gradient {
  width: 150px;
  height: 10px;
  background: linear-gradient(to right, #74a9cf, #3690c0, #0570b0, #045a8d, #023858);
  border-radius: 2px;
  margin-bottom: 4px;
}

.legend-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #666;
}

/* 自定义标记样式 */
.marker-pin {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}

.station-popup {
  padding: 5px;
}

.station-popup h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #333;
}

.station-info p {
  margin: 4px 0;
  font-size: 12px;
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
    height: 300px !important;
    min-height: 300px;
  }
  
  .density-map {
    height: 300px !important;
    min-height: 300px;
  }

  .chart-view, .map-view {
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

  .tab-btn {
    color: #aaa;
  }
  
  .tab-btn.active {
    color: #64b5f6;
    border-bottom-color: #64b5f6;
  }
  
  .map-legend {
    background: rgba(30, 30, 30, 0.9);
  }
  
  .map-legend h4 {
    color: #fff;
  }
  
  .legend-labels {
    color: #aaa;
  }
  
  .station-popup {
    background: #1e1e1e;
    color: #fff;
  }
  
  .station-popup h3 {
    color: #fff;
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