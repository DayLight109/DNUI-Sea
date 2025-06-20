<template>
  <div class="arctic-map-container">
    <div class="map-header">
      <h2 class="title">北极海冰分布地图</h2>
      <div class="map-controls">
        <div class="control-group">
          <label>显示模式</label>
          <select v-model="displayMode">
            <option value="density">密度分布</option>
            <option value="thickness">厚度分布</option>
            <option value="temperature">温度分布</option>
          </select>
        </div>
        <div class="time-slider">
          <label>时间: {{ formatDate(currentDate) }}</label>
          <input type="range" v-model="timeSlider" min="0" max="100" step="1" @input="updateTimeSlider" />
          <div class="time-controls">
            <button @click="playTimeline" :class="{'active': isPlaying}">
              <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
            </button>
            <button @click="resetTimeline">
              <i class="fas fa-redo"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="map-content">
      <div class="map-container" ref="mapContainer">
        <!-- 加载指示器 -->
        <div v-if="loading" class="map-loading">
          <div class="loader"></div>
          <p>加载地图数据中...</p>
        </div>
        
        <!-- 地图将在这里渲染 -->
      </div>
      
      <div class="map-legend">
        <h3>{{ getLegendTitle() }}</h3>
        <div class="legend-gradient" :class="displayMode">
          <div class="legend-labels">
            <span>{{ getLegendMin() }}</span>
            <span>{{ getLegendMax() }}</span>
          </div>
        </div>
        <div class="map-markers">
          <div class="marker">
            <span class="marker-dot region-a"></span>
            <span>A区域</span>
          </div>
          <div class="marker">
            <span class="marker-dot region-b"></span>
            <span>B区域</span>
          </div>
          <div class="marker">
            <span class="marker-dot region-c"></span>
            <span>C区域</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="map-info-panel">
      <div class="info-card" v-if="selectedRegion">
        <div class="info-header">
          <h3>{{ selectedRegion.name }}</h3>
          <span class="close-btn" @click="closeInfoPanel">
            <i class="fas fa-times"></i>
          </span>
        </div>
        <div class="info-content">
          <div class="info-item">
            <span class="info-label">密度:</span>
            <span class="info-value">{{ selectedRegion.density }} kg/m³</span>
          </div>
          <div class="info-item">
            <span class="info-label">厚度:</span>
            <span class="info-value">{{ selectedRegion.thickness }} m</span>
          </div>
          <div class="info-item">
            <span class="info-label">温度:</span>
            <span class="info-value">{{ selectedRegion.temperature }}°C</span>
          </div>
          <div class="info-item">
            <span class="info-label">最近更新:</span>
            <span class="info-value">{{ formatDate(selectedRegion.updated) }}</span>
          </div>
        </div>
        <div class="info-actions">
          <button @click="viewRegionDetails">
            <i class="fas fa-chart-bar"></i>
            查看详情
          </button>
          <button @click="predictRegionTrend">
            <i class="fas fa-chart-line"></i>
            趋势预测
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default {
  name: 'ArcticMap',
  setup() {
    const router = useRouter();
    const mapContainer = ref(null);
    const map = ref(null);
    const loading = ref(true);
    const displayMode = ref('density');
    const timeSlider = ref(100); // 100表示当前时间
    const currentDate = ref(new Date());
    const isPlaying = ref(false);
    const playInterval = ref(null);
    const selectedRegion = ref(null);
    
    // 模拟的区域数据
    const regions = [
      {
        id: 'A',
        name: 'A区域',
        coordinates: [85, 0], // 纬度,经度
        density: 910,
        thickness: 1.8,
        temperature: -15,
        updated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2天前
      },
      {
        id: 'B',
        name: 'B区域',
        coordinates: [82, 90],
        density: 850,
        thickness: 1.2,
        temperature: -12,
        updated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1天前
      },
      {
        id: 'C',
        name: 'C区域',
        coordinates: [83, -90],
        density: 880,
        thickness: 1.5,
        temperature: -18,
        updated: new Date() // 今天
      }
    ];
    
    // 格式化日期
    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    // 根据显示模式获取图例标题
    const getLegendTitle = () => {
      switch (displayMode.value) {
        case 'density': return '海冰密度 (kg/m³)';
        case 'thickness': return '海冰厚度 (m)';
        case 'temperature': return '表面温度 (°C)';
        default: return '';
      }
    };
    
    // 获取图例最小值
    const getLegendMin = () => {
      switch (displayMode.value) {
        case 'density': return '700';
        case 'thickness': return '0.5';
        case 'temperature': return '-25';
        default: return '';
      }
    };
    
    // 获取图例最大值
    const getLegendMax = () => {
      switch (displayMode.value) {
        case 'density': return '950';
        case 'thickness': return '3.0';
        case 'temperature': return '-5';
        default: return '';
      }
    };
    
    // 更新时间滑块
    const updateTimeSlider = () => {
      // 计算日期：时间滑块范围是过去30天到今天
      const daysAgo = (100 - timeSlider.value) * 0.3; // 将0-100映射到0-30天
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      currentDate.value = date;
      
      // 更新地图数据
      updateMapData();
    };
    
    // 播放时间线
    const playTimeline = () => {
      if (isPlaying.value) {
        // 暂停播放
        clearInterval(playInterval.value);
        isPlaying.value = false;
      } else {
        // 开始播放
        isPlaying.value = true;
        // 如果已经到末尾，重置到开始
        if (timeSlider.value >= 100) {
          timeSlider.value = 0;
        }
        
        playInterval.value = setInterval(() => {
          timeSlider.value = Number(timeSlider.value) + 1;
          updateTimeSlider();
          
          // 到达末尾时停止
          if (timeSlider.value >= 100) {
            clearInterval(playInterval.value);
            isPlaying.value = false;
          }
        }, 300); // 每300毫秒更新一次
      }
    };
    
    // 重置时间线
    const resetTimeline = () => {
      clearInterval(playInterval.value);
      isPlaying.value = false;
      timeSlider.value = 100;
      currentDate.value = new Date();
      updateMapData();
    };
    
    // 关闭信息面板
    const closeInfoPanel = () => {
      selectedRegion.value = null;
    };
    
    // 查看区域详情
    const viewRegionDetails = () => {
      if (!selectedRegion.value) return;
      
      // 根据选中的区域导航到数据页面
      router.push({
        path: '/mainboard/data',
        query: { region: selectedRegion.value.id }
      });
    };
    
    // 查看区域趋势预测
    const predictRegionTrend = () => {
      if (!selectedRegion.value) return;
      
      // 导航到预测页面
      router.push({
        path: '/mainboard/prediction',
        query: { region: selectedRegion.value.id }
      });
    };
    
    // 初始化地图
    const initMap = () => {
      if (!mapContainer.value) return;
      
      // 创建地图实例，设置北极为中心
      map.value = L.map(mapContainer.value, {
        center: [90, 0],
        zoom: 3,
        maxBounds: [[-50, -180], [90, 180]],
        minZoom: 2,
        maxZoom: 7
      });
      
      // 添加底图 - 使用极地投影的地图服务
      // 这里使用一个基础的OpenStreetMap作为示例
      // 实际应用中应该使用专门的北极地图服务
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        subdomains: 'abc',
        noWrap: true
      }).addTo(map.value);
      
      // 添加区域标记
      regions.forEach(region => {
        const marker = L.circleMarker(region.coordinates, {
          radius: 8,
          fillColor: getRegionColor(region.id),
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(map.value);
        
        // 添加点击事件
        marker.on('click', () => {
          selectedRegion.value = region;
        });
        
        // 添加悬停效果
        marker.on('mouseover', () => {
          marker.setStyle({
            radius: 10,
            fillOpacity: 1
          });
        });
        
        marker.on('mouseout', () => {
          marker.setStyle({
            radius: 8,
            fillOpacity: 0.8
          });
        });
      });
      
      // 加载完成
      loading.value = false;
    };
    
    // 获取区域颜色
    const getRegionColor = (regionId) => {
      switch (regionId) {
        case 'A': return '#64b5f6'; // 蓝色
        case 'B': return '#ff8a65'; // 橙色
        case 'C': return '#81c784'; // 绿色
        default: return '#9575cd'; // 紫色
      }
    };
    
    // 更新地图数据
    const updateMapData = () => {
      if (!map.value) return;
      
      // 在实际应用中，这里应该根据当前日期和显示模式从API获取数据
      // 然后更新地图上的可视化效果
      
      // 这里仅作为演示，简单地更新一些文本信息
      console.log(`更新地图数据: 模式=${displayMode.value}, 日期=${formatDate(currentDate.value)}`);
    };
    
    // 组件挂载时初始化地图
    onMounted(() => {
      // 等待DOM渲染完成后初始化地图
      setTimeout(() => {
        initMap();
      }, 100);
    });
    
    // 组件卸载时清理资源
    onUnmounted(() => {
      if (map.value) {
        map.value.remove();
      }
      if (playInterval.value) {
        clearInterval(playInterval.value);
      }
    });
    
    return {
      mapContainer,
      loading,
      displayMode,
      timeSlider,
      currentDate,
      isPlaying,
      selectedRegion,
      
      formatDate,
      getLegendTitle,
      getLegendMin,
      getLegendMax,
      updateTimeSlider,
      playTimeline,
      resetTimeline,
      closeInfoPanel,
      viewRegionDetails,
      predictRegionTrend
    };
  }
};
</script>

<style scoped>
.arctic-map-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, rgba(13, 27, 42, 0.8), rgba(27, 38, 59, 0.9));
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(161, 196, 253, 0.1);
  overflow: hidden;
}

.map-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.title {
  color: #e3f2fd;
  margin: 0;
  font-weight: 600;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.title::before {
  content: "";
  display: block;
  width: 4px;
  height: 20px;
  background: linear-gradient(180deg, #a1c4fd, #c2e9fb);
  border-radius: 2px;
}

.map-controls {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.control-group label,
.time-slider label {
  font-size: 12px;
  color: #90caf9;
}

.control-group select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(161, 196, 253, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: #e3f2fd;
  outline: none;
  min-width: 120px;
  cursor: pointer;
  transition: all 0.3s;
}

.control-group select:focus {
  border-color: #5472d3;
  box-shadow: 0 0 0 2px rgba(84, 114, 211, 0.3);
}

.time-slider {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 200px;
}

.time-slider input[type="range"] {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  background: linear-gradient(90deg, #5472d3, #a1c4fd);
  border-radius: 3px;
  outline: none;
  margin: 6px 0;
}

.time-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e3f2fd;
  cursor: pointer;
  border: 2px solid #5472d3;
}

.time-controls {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}

.time-controls button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(161, 196, 253, 0.3);
  color: #a1c4fd;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.time-controls button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #e3f2fd;
}

.time-controls button.active {
  background: rgba(84, 114, 211, 0.3);
  color: #e3f2fd;
  border-color: #5472d3;
}

.map-content {
  display: flex;
  gap: 20px;
  flex: 1;
  overflow: hidden;
}

.map-container {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  min-height: 400px;
  border: 1px solid rgba(161, 196, 253, 0.1);
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(27, 38, 59, 0.8);
  z-index: 1000;
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(161, 196, 253, 0.3);
  border-radius: 50%;
  border-top-color: #5472d3;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.map-legend {
  width: 250px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid rgba(161, 196, 253, 0.1);
}

.map-legend h3 {
  margin: 0;
  font-size: 14px;
  color: #90caf9;
  font-weight: 500;
}

.legend-gradient {
  height: 20px;
  border-radius: 4px;
  position: relative;
  margin: 8px 0;
}

.legend-gradient.density {
  background: linear-gradient(90deg, #d4e6f6, #64b5f6, #1976d2);
}

.legend-gradient.thickness {
  background: linear-gradient(90deg, #ffe0b2, #ffb74d, #e65100);
}

.legend-gradient.temperature {
  background: linear-gradient(90deg, #b3e5fc, #29b6f6, #0277bd);
}

.legend-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 12px;
  color: #bbdefb;
}

.map-markers {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.marker {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #e3f2fd;
}

.marker-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.region-a {
  background-color: #64b5f6;
}

.region-b {
  background-color: #ff8a65;
}

.region-c {
  background-color: #81c784;
}

.map-info-panel {
  margin-top: 20px;
}

.info-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(161, 196, 253, 0.2);
  transition: all 0.3s;
}

.info-header {
  background: rgba(84, 114, 211, 0.3);
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-header h3 {
  margin: 0;
  color: #e3f2fd;
  font-size: 16px;
  font-weight: 500;
}

.close-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  color: #a1c4fd;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e3f2fd;
}

.info-content {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #90caf9;
}

.info-value {
  font-size: 16px;
  color: #e3f2fd;
  font-weight: 500;
}

.info-actions {
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  border-top: 1px solid rgba(161, 196, 253, 0.1);
}

.info-actions button {
  flex: 1;
  padding: 8px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  background: rgba(84, 114, 211, 0.2);
  color: #a1c4fd;
  border: 1px solid rgba(161, 196, 253, 0.3);
}

.info-actions button:hover {
  background: rgba(84, 114, 211, 0.3);
  color: #e3f2fd;
}

.info-actions button:active {
  transform: translateY(1px);
}

@media (max-width: 768px) {
  .map-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .map-controls {
    width: 100%;
  }
  
  .map-content {
    flex-direction: column;
  }
  
  .map-container {
    height: 300px;
  }
  
  .map-legend {
    width: 100%;
  }
  
  .info-content {
    grid-template-columns: 1fr;
  }
}
</style> 