//Overview.vue
<template>
  <div class="overview-container">
    <!-- 顶部标题区域 -->
    <div class="title-section">
      <div class="main-title">
        <h2><i class="fas fa-chart-line title-icon"></i> 北极海冰监测概览</h2>
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
          <span class="status-tag warning" v-if="temperatureStatus === 'warning'">警告</span>
          <span class="status-tag normal" v-else>正常</span>
        </div>
        <h3>平均温度</h3>
        <div class="value-container">
          <span class="value">-15.2</span>
          <span class="unit">°C</span>
        </div>
        <div class="trend warning">
          <i class="fas fa-arrow-up"></i>
          <span>2.5% 较上月</span>
        </div>
        <div class="metric-chart">
          <div class="sparkline" ref="tempSparkline"></div>
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
        <div class="trend down">
          <i class="fas fa-arrow-down"></i>
          <span>1.8% 较上月</span>
        </div>
        <div class="metric-chart">
          <div class="sparkline" ref="areaSparkline"></div>
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
        <div class="trend up">
          <i class="fas fa-arrow-up"></i>
          <span>1.2% 较上月</span>
        </div>
        <div class="metric-chart">
          <div class="sparkline" ref="thicknessSparkline"></div>
        </div>
      </div>
      
      <!-- 密度卡片 -->
      <div class="metric-card">
        <div class="card-header">
          <i class="fas fa-tint"></i>
          <span class="status-tag normal">正常</span>
        </div>
        <h3>平均密度</h3>
        <div class="value-container">
          <span class="value">917</span>
          <span class="unit">kg/m³</span>
        </div>
        <div class="trend stable">
          <i class="fas fa-equals"></i>
          <span>0.3% 较上月</span>
        </div>
        <div class="metric-chart">
          <div class="sparkline" ref="densitySparkline"></div>
        </div>
      </div>
    </div>

    <!-- 监测视图控制区 -->
    <div class="monitor-section">
      <div class="section-header">
        <h3><i class="fas fa-satellite-dish"></i> 实时监测</h3>
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
      <div class="monitor-content">
        <div class="map-container" v-if="currentView === '3d' || currentView === 'satellite'">
          <div class="loading-overlay" v-if="isLoading">
            <div class="spinner"></div>
            <p>加载中...</p>
          </div>
          <div class="map" ref="mapRef"></div>
          <div class="map-legend">
            <div class="legend-item">
              <span class="color-box" style="background: #0077be;"></span>
              <span>深海区域</span>
            </div>
            <div class="legend-item">
              <span class="color-box" style="background: #ffffff;"></span>
              <span>海冰覆盖</span>
            </div>
            <div class="legend-item">
              <span class="color-box" style="background: #90caf9;"></span>
              <span>浅水区域</span>
            </div>
            <div class="legend-item">
              <span class="color-box" style="background: #b3e5fc;"></span>
              <span>低厚度区</span>
            </div>
          </div>
        </div>
        
        <div class="temperature-map" v-else-if="currentView === 'temperature'">
          <div class="heatmap" ref="heatmapRef"></div>
          <div class="temperature-legend">
            <div class="legend-gradient"></div>
            <div class="legend-labels">
              <span>-40°C</span>
              <span>-30°C</span>
              <span>-20°C</span>
              <span>-10°C</span>
              <span>0°C</span>
            </div>
          </div>
        </div>
        
        <div class="monitoring-stats">
          <div class="stat-item">
            <span class="stat-label">监测点数量</span>
            <span class="stat-value">24</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">数据更新频率</span>
            <span class="stat-value">30分钟</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">最近异常</span>
            <span class="stat-value warning">2处</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">信号强度</span>
            <span class="stat-value">
              <div class="signal-strength">
                <span class="bar active"></span>
                <span class="bar active"></span>
                <span class="bar active"></span>
                <span class="bar"></span>
              </div>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史趋势分析 -->
    <div class="trend-section">
      <div class="section-header">
        <h3><i class="fas fa-history"></i> 历史趋势分析</h3>
        <div class="controls">
          <div class="metric-selector">
            <span>指标:</span>
            <select v-model="selectedMetric" class="period-select">
              <option value="temperature">温度</option>
              <option value="area">面积</option>
              <option value="thickness">厚度</option>
              <option value="density">密度</option>
            </select>
          </div>
          <select v-model="selectedPeriod" class="period-select">
            <option v-for="period in timePeriods" 
                    :key="period.value" 
                    :value="period.value">
              {{ period.label }}
            </option>
          </select>
          <div class="action-buttons">
            <button class="action-btn primary" @click="viewReport">
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

      <div class="trend-content">
        <div class="chart-container" ref="chartRef">
          <!-- 图表将在这里渲染 -->
        </div>
        
        <div class="trend-stats">
          <div class="stat-box">
            <h4>变化趋势</h4>
            <div class="trend-value" :class="trendDirection">
              <i :class="trendDirection === 'up' ? 'fas fa-arrow-up' : trendDirection === 'down' ? 'fas fa-arrow-down' : 'fas fa-equals'"></i>
              <span>{{ trendData.changePct }}%</span>
            </div>
            <p>{{ trendData.description }}</p>
          </div>
          
          <div class="stat-box">
            <h4>季节性分析</h4>
            <div class="seasonal-chart" ref="seasonalChart"></div>
          </div>
          
          <div class="stat-box">
            <h4>预测结果</h4>
            <div class="prediction">
              <div class="prediction-range">
                <span class="min">{{ trendData.prediction.min }}</span>
                <div class="range-bar">
                  <div class="range-fill" :style="{ width: trendData.prediction.confidence + '%' }"></div>
                </div>
                <span class="max">{{ trendData.prediction.max }}</span>
              </div>
              <div class="confidence">
                置信度: {{ trendData.prediction.confidence }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import * as echarts from 'echarts';
import { format } from 'date-fns';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default {
  name: 'Overview',
  setup() {
    // 基础状态
    const currentView = ref('3d');
    const selectedPeriod = ref('30');
    const selectedMetric = ref('temperature');
    const isLoading = ref(true);
    const trendDirection = ref('up'); // 'up', 'down', 'stable'
    
    // 引用元素
    const chartRef = ref(null);
    const mapRef = ref(null);
    const heatmapRef = ref(null);
    const seasonalChart = ref(null);
    const tempSparkline = ref(null);
    const areaSparkline = ref(null);
    const thicknessSparkline = ref(null);
    const densitySparkline = ref(null);
    
    // 图表实例
    let chart = null;
    let map = null;
    let heatmap = null;
    let seasonalChartInstance = null;
    let sparklines = {};
    
    // 模拟数据
    const lastUpdateTime = ref(format(new Date(), 'yyyy-MM-dd HH:mm:ss'));
    const temperatureStatus = ref('warning');
    
    // 趋势数据
    const trendData = ref({
      changePct: '4.2',
      description: '北极海冰平均温度在过去30天内呈上升趋势，主要受北极涛动影响，需持续监测。',
      prediction: {
        min: '-18°C',
        max: '-12°C',
        confidence: 85
      }
    });

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

    // Three.js 相关变量
    let scene, camera, renderer, controls;
    let iceModel, waterMesh;
    let animationFrameId;
    // 定义onWindowResize为组件级别的变量
    let onWindowResize = null;
    
    // 初始化3D场景
    const init3DScene = () => {
      if (!mapRef.value) return;
      
      // 创建场景
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a1128);
      
      // 创建相机
      camera = new THREE.PerspectiveCamera(
        75,
        mapRef.value.clientWidth / mapRef.value.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 5, 10);
      
      // 创建渲染器
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(mapRef.value.clientWidth, mapRef.value.clientHeight);
      renderer.shadowMap.enabled = true;
      mapRef.value.appendChild(renderer.domElement);
      
      // 添加控制器
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      
      // 窗口大小变化时调整
      onWindowResize = () => {
        if (camera && renderer && mapRef.value) {
          camera.aspect = mapRef.value.clientWidth / mapRef.value.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(mapRef.value.clientWidth, mapRef.value.clientHeight);
        }
      };
      
      window.addEventListener('resize', onWindowResize);
      
      // 添加灯光
      const ambientLight = new THREE.AmbientLight(0x404040, 1);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 10, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);
      
      // 创建北极海洋
      const waterGeometry = new THREE.CylinderGeometry(8, 8, 0.2, 64);
      const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x0077be,
        transparent: true,
        opacity: 0.8,
        roughness: 0.1,
        metalness: 0.1
      });
      waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
      waterMesh.position.y = -0.1;
      waterMesh.receiveShadow = true;
      scene.add(waterMesh);
      
      // 创建北极海冰
      createIceModel();
      
      // 添加北极点标记
      const northPoleGeometry = new THREE.ConeGeometry(0.2, 0.8, 32);
      const northPoleMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
      const northPole = new THREE.Mesh(northPoleGeometry, northPoleMaterial);
      northPole.position.set(0, 0.4, 0);
      northPole.castShadow = true;
      scene.add(northPole);
      
      // 添加监测站点
      addMonitoringStations();
      
      // 添加坐标轴辅助
      const axesHelper = new THREE.AxesHelper(5);
      scene.add(axesHelper);
      
      // 开始动画
      animate();
      
      // 完成加载
      setTimeout(() => {
        isLoading.value = false;
      }, 1000);
    };
    
    // 创建海冰模型
    const createIceModel = () => {
      // 使用噪声函数创建不规则的海冰表面
      const iceGeometry = new THREE.BufferGeometry();
      const vertices = [];
      const colors = [];
      
      // 创建冰面顶点
      const size = 16;
      const segments = 128; // 增加分辨率
      const step = size / segments;
      
      // 使用Perlin噪声创建更真实的地形
      const createNoise = (x, y, scale = 1) => {
        // 简化的Perlin噪声模拟
        return Math.sin(x * 0.1 * scale) * Math.cos(y * 0.1 * scale) * 0.5 +
               Math.sin(x * 0.2 * scale + 0.5) * Math.cos(y * 0.3 * scale) * 0.3;
      };
      
      for (let i = 0; i <= segments; i++) {
        for (let j = 0; j <= segments; j++) {
          const x = (i * step) - (size / 2);
          const z = (j * step) - (size / 2);
          
          // 使用距离创建圆形海冰区域
          const distance = Math.sqrt(x * x + z * z);
          let y = 0;
          
          if (distance < 7.8) { // 略微增大半径
            // 使用多层次噪声函数模拟海冰高度
            const noise1 = createNoise(x, z, 1);
            const noise2 = createNoise(x, z, 2) * 0.5;
            const noise3 = createNoise(x, z, 4) * 0.25;
            
            // 组合噪声，创建更自然的地形
            const combinedNoise = noise1 + noise2 + noise3;
            
            // 边缘渐变
            const edgeFactor = Math.max(0, 1 - (distance / 7.8));
            const heightFactor = Math.pow(edgeFactor, 1.5); // 使边缘更平滑
            
            // 最终高度计算
            y = Math.max(0, combinedNoise * 0.4 + 0.2) * heightFactor;
            
            // 添加裂缝效果
            if (Math.random() > 0.97) {
              y *= 0.2; // 有3%的概率创建低洼区域（裂缝）
            }
            
            // 添加顶点
            vertices.push(x, y, z);
            
            // 根据高度和位置添加颜色变化
            const r = 0.9 + (y * 0.3) - (distance / 30);
            const g = 0.95 + (y * 0.2) - (distance / 40);
            const b = 1.0;
            colors.push(r, g, b);
          }
        }
      }
      
      // 创建面索引
      const indices = [];
      const width = segments + 1;
      
      for (let i = 0; i < segments; i++) {
        for (let j = 0; j < segments; j++) {
          const a = i * width + j;
          const b = i * width + j + 1;
          const c = (i + 1) * width + j + 1;
          const d = (i + 1) * width + j;
          
          // 检查顶点是否存在
          if (vertices[a * 3] !== undefined && 
              vertices[b * 3] !== undefined && 
              vertices[c * 3] !== undefined) {
            indices.push(a, b, c);
          }
          
          if (vertices[a * 3] !== undefined && 
              vertices[c * 3] !== undefined && 
              vertices[d * 3] !== undefined) {
            indices.push(a, c, d);
          }
        }
      }
      
      // 设置几何体属性
      iceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      iceGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      iceGeometry.setIndex(indices);
      iceGeometry.computeVertexNormals();
      
      // 创建材质和网格
      const iceMaterial = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.7,
        metalness: 0.1,
        flatShading: false // 使用平滑着色
      });
      
      iceModel = new THREE.Mesh(iceGeometry, iceMaterial);
      iceModel.castShadow = true;
      iceModel.receiveShadow = true;
      scene.add(iceModel);
      
      // 添加海冰反射效果
      const reflectionGeometry = new THREE.CircleGeometry(7.8, 64);
      const reflectionMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15,
        roughness: 0.1,
        metalness: 0.8
      });
      const reflection = new THREE.Mesh(reflectionGeometry, reflectionMaterial);
      reflection.rotation.x = -Math.PI / 2;
      reflection.position.y = -0.05;
      scene.add(reflection);
    };
    
    // 添加监测站点
    const addMonitoringStations = () => {
      const stationPositions = [
        { x: 2, z: 3, color: 0x64b5f6, status: 'normal', id: 'MS-01', data: { density: 915, temperature: -12.5, thickness: 2.1 } },
        { x: -3, z: 1, color: 0x64b5f6, status: 'normal', id: 'MS-02', data: { density: 908, temperature: -15.2, thickness: 1.8 } },
        { x: 0, z: 4, color: 0xff8a65, status: 'warning', id: 'MS-03', data: { density: 892, temperature: -10.1, thickness: 1.5 } },
        { x: -2, z: -2, color: 0x64b5f6, status: 'normal', id: 'MS-04', data: { density: 921, temperature: -17.8, thickness: 2.4 } },
        { x: 3, z: -1, color: 0x64b5f6, status: 'normal', id: 'MS-05', data: { density: 905, temperature: -14.3, thickness: 1.9 } },
        { x: -4, z: -3, color: 0xff5252, status: 'critical', id: 'MS-06', data: { density: 875, temperature: -8.2, thickness: 1.2 } }
      ];
      
      // 创建监测站点组
      const stationsGroup = new THREE.Group();
      scene.add(stationsGroup);
      
      // 用于射线检测的对象
      const clickableObjects = [];
      
      stationPositions.forEach(station => {
        // 创建监测站基座
        const baseGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x37474f });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        
        // 创建监测站天线
        const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8);
        const antennaMaterial = new THREE.MeshStandardMaterial({ color: 0x9e9e9e });
        const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna.position.y = 0.25;
        
        // 创建信号指示灯
        const indicatorGeometry = new THREE.SphereGeometry(0.06, 16, 16);
        const indicatorColor = station.status === 'normal' ? 0x4caf50 : 
                               station.status === 'warning' ? 0xff9800 : 0xff5252;
        const indicatorMaterial = new THREE.MeshStandardMaterial({ 
          color: indicatorColor,
          emissive: indicatorColor,
          emissiveIntensity: 0.5
        });
        const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
        indicator.position.y = 0.45;
        
        // 创建站点ID标签
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 64;
        context.fillStyle = '#ffffff';
        context.font = 'Bold 24px Arial';
        context.fillText(station.id, 10, 40);
        
        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.SpriteMaterial({ 
          map: texture,
          transparent: true
        });
        const label = new THREE.Sprite(labelMaterial);
        label.position.y = 0.7;
        label.position.z = 0.2;
        label.scale.set(0.5, 0.25, 1);
        
        // 创建站点组
        const stationGroup = new THREE.Group();
        stationGroup.add(base);
        stationGroup.add(antenna);
        stationGroup.add(indicator);
        stationGroup.add(label);
        
        // 保存站点数据
        stationGroup.userData = {
          id: station.id,
          status: station.status,
          data: station.data
        };
        
        // 放置在海冰上
        const distance = Math.sqrt(station.x * station.x + station.z * station.z);
        const heightFactor = 1 - (distance / 7.8);
        const y = Math.max(0.1, 0.3 * heightFactor);
        stationGroup.position.set(station.x, y, station.z);
        
        // 添加到场景和可点击对象
        stationsGroup.add(stationGroup);
        clickableObjects.push(stationGroup);
        
        // 添加脉冲效果
        if (station.status !== 'normal') {
          const pulseGeometry = new THREE.RingGeometry(0.1, 0.2, 32);
          const pulseColor = station.status === 'warning' ? 0xff9800 : 0xff5252;
          const pulseMaterial = new THREE.MeshBasicMaterial({
            color: pulseColor,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
          });
          
          const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
          pulse.rotation.x = -Math.PI / 2;
          pulse.position.y = 0.01;
          stationGroup.add(pulse);
          
          // 动画脉冲
          const animatePulse = () => {
            pulse.scale.x += 0.02;
            pulse.scale.y += 0.02;
            pulse.material.opacity -= 0.01;
            
            if (pulse.material.opacity <= 0) {
              pulse.scale.set(1, 1, 1);
              pulse.material.opacity = 0.7;
            }
          };
          
          pulseAnimations.push(animatePulse);
        }
      });
      
      // 添加射线检测
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      
      // 鼠标移动事件
      mapRef.value.addEventListener('mousemove', (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(clickableObjects);
        
        if (intersects.length > 0) {
          mapRef.value.style.cursor = 'pointer';
        } else {
          mapRef.value.style.cursor = 'default';
        }
      });
      
      // 鼠标点击事件
      mapRef.value.addEventListener('click', (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(clickableObjects);
        
        if (intersects.length > 0) {
          const station = intersects[0].object.parent;
          showStationInfo(station.userData);
        }
      });
    };
    
    // 显示监测站信息
    const showStationInfo = (stationData) => {
      console.log('显示监测站信息:', stationData);
      // 这里可以添加显示监测站详细信息的代码
      // 例如弹出一个信息面板
    };
    
    // 脉冲动画数组
    const pulseAnimations = [];
    
    // 动画循环
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      if (controls) controls.update();
      
      // 添加水面波动效果
      if (waterMesh) {
        waterMesh.rotation.y += 0.001;
      }
      
      // 执行所有脉冲动画
      pulseAnimations.forEach(animation => animation());
      
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };
    
    // 切换视图模式
    const switchView = (viewId) => {
      currentView.value = viewId;
      isLoading.value = true;
      
      setTimeout(() => {
        if (viewId === '3d') {
          init3DScene();
        } else if (viewId === 'temperature') {
          initHeatmap();
        } else if (viewId === 'satellite') {
          initSatelliteView();
        }
      }, 100);
    };
    
    // 查看详细报告
    const viewReport = () => {
      console.log('查看详细报告', selectedMetric.value, selectedPeriod.value);
      // 这里可以添加跳转到报告页面的逻辑
      // 例如使用路由导航到报告页面
    };
    
    // 导出数据
    const exportData = () => {
      console.log('导出数据', selectedMetric.value, selectedPeriod.value);
      // 这里可以添加导出数据的逻辑
    };
    
    // 设置预警
    const setAlert = () => {
      console.log('设置预警', selectedMetric.value);
      // 这里可以添加设置预警的逻辑
    };
    
    // 初始化热力图
    const initHeatmap = () => {
      // 这里实现热力图的逻辑
      isLoading.value = false;
    };
    
    // 初始化卫星视图
    const initSatelliteView = () => {
      // 这里实现卫星视图的逻辑
      isLoading.value = false;
    };
    
    // 初始化迷你图表
    const initSparklines = () => {
      // 温度迷你图表
      if (tempSparkline.value) {
        const tempChart = echarts.init(tempSparkline.value);
        tempChart.setOption({
          animation: false,
          grid: { left: 0, right: 0, top: 0, bottom: 0 },
          xAxis: { show: false, type: 'category', data: Array(30).fill(0).map((_, i) => i) },
          yAxis: { show: false, type: 'value' },
          series: [{
            type: 'line',
            data: Array(30).fill(0).map(() => Math.random() * 10 - 20),
            showSymbol: false,
            lineStyle: { color: '#ff8a65', width: 2 },
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255, 138, 101, 0.5)' },
              { offset: 1, color: 'rgba(255, 138, 101, 0.1)' }
            ]) }
          }]
        });
      }
      
      // 面积迷你图表
      if (areaSparkline.value) {
        const areaChart = echarts.init(areaSparkline.value);
        areaChart.setOption({
          animation: false,
          grid: { left: 0, right: 0, top: 0, bottom: 0 },
          xAxis: { show: false, type: 'category', data: Array(30).fill(0).map((_, i) => i) },
          yAxis: { show: false, type: 'value' },
          series: [{
            type: 'line',
            data: Array(30).fill(0).map(() => Math.random() * 2 + 13),
            showSymbol: false,
            lineStyle: { color: '#81c784', width: 2 },
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(129, 199, 132, 0.5)' },
              { offset: 1, color: 'rgba(129, 199, 132, 0.1)' }
            ]) }
          }]
        });
      }
      
      // 厚度迷你图表
      if (thicknessSparkline.value) {
        const thicknessChart = echarts.init(thicknessSparkline.value);
        thicknessChart.setOption({
          animation: false,
          grid: { left: 0, right: 0, top: 0, bottom: 0 },
          xAxis: { show: false, type: 'category', data: Array(30).fill(0).map((_, i) => i) },
          yAxis: { show: false, type: 'value' },
          series: [{
            type: 'line',
            data: Array(30).fill(0).map(() => Math.random() * 0.5 + 2),
            showSymbol: false,
            lineStyle: { color: '#64b5f6', width: 2 },
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(100, 181, 246, 0.5)' },
              { offset: 1, color: 'rgba(100, 181, 246, 0.1)' }
            ]) }
          }]
        });
      }
      
      // 密度迷你图表
      if (densitySparkline.value) {
        const densityChart = echarts.init(densitySparkline.value);
        densityChart.setOption({
          animation: false,
          grid: { left: 0, right: 0, top: 0, bottom: 0 },
          xAxis: { show: false, type: 'category', data: Array(30).fill(0).map((_, i) => i) },
          yAxis: { show: false, type: 'value' },
          series: [{
            type: 'line',
            data: Array(30).fill(0).map(() => Math.random() * 10 + 910),
            showSymbol: false,
            lineStyle: { color: '#9575cd', width: 2 },
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(149, 117, 205, 0.5)' },
              { offset: 1, color: 'rgba(149, 117, 205, 0.1)' }
            ]) }
          }]
        });
      }
    };
    
    // 生命周期钩子
    onMounted(() => {
      initSparklines();
      init3DScene();
    });
    
    onBeforeUnmount(() => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // 清理Three.js资源
      if (scene) {
        scene.traverse((object) => {
          if (object.geometry) {
            object.geometry.dispose();
          }
          
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
      
      if (renderer) {
        renderer.dispose();
      }
      
      window.removeEventListener('resize', onWindowResize);
    });
    
    return {
      // 状态数据
      currentView,
      selectedPeriod,
      selectedMetric,
      lastUpdateTime,
      temperatureStatus,
      isLoading,
      trendDirection,
      trendData,
      
      // 引用元素
      chartRef,
      mapRef,
      heatmapRef,
      seasonalChart,
      tempSparkline,
      areaSparkline,
      thicknessSparkline,
      densitySparkline,
      
      // 常量
      viewModes,
      timePeriods,
      
      // 方法
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
  background-color: #eef5f9;
  background-image: linear-gradient(120deg, #eef5f9 0%, #e3f2fd 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* 顶部冰层效果装饰元素 */
.overview-container::before {
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
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  color: #0077be;
  font-size: 26px;
}

.update-info {
  font-size: 14px;
  color: #666;
  background: rgba(255, 255, 255, 0.5);
  padding: 4px 12px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.description {
  color: #666;
  font-size: 16px;
  line-height: 1.6;
  max-width: 800px;
}

/* 指标卡片样式 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(161, 196, 253, 0.1);
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.metric-card.warning {
  background: linear-gradient(45deg, rgba(255, 247, 230, 0.6), rgba(255, 247, 230, 0.2));
  border-color: rgba(212, 107, 8, 0.2);
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

.warning .card-header i {
  color: #d46b08;
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
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.trend.up {
  color: #f5222d;
}

.trend.down {
  color: #52c41a;
}

.trend.stable {
  color: #1890ff;
}

.trend.warning {
  color: #fa8c16;
}

.trend i {
  margin-right: 6px;
}

.metric-chart {
  height: 40px;
  width: 100%;
}

.sparkline {
  width: 100%;
  height: 100%;
}

/* 监测区域样式 */
.monitor-section, .trend-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(161, 196, 253, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-header h3 {
  font-size: 20px;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-header h3 i {
  color: #0077be;
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

.monitor-content {
  position: relative;
}

.map-container {
  height: 400px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(161, 196, 253, 0.2);
}

.map {
  width: 100%;
  height: 100%;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid rgba(0, 109, 117, 0.1);
  border-top-color: #006d75;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.map-legend {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 5;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}

.legend-item:last-child {
  margin-bottom: 0;
}

.color-box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-right: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.temperature-map {
  height: 400px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(161, 196, 253, 0.2);
}

.heatmap {
  width: 100%;
  height: 100%;
  position: relative;
}

.temperature-legend {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 5;
}

.legend-gradient {
  height: 10px;
  width: 150px;
  margin-bottom: 6px;
  border-radius: 2px;
  background: linear-gradient(to right, #313695, #4575b4, #74add1, #abd9e9, #e0f3f8, #ffffbf, #fee090, #fdae61, #f46d43, #d73027, #a50026);
}

.legend-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #666;
}

.monitoring-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.stat-item {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid rgba(161, 196, 253, 0.1);
}

.stat-label {
  display: block;
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

.stat-value.warning {
  color: #fa8c16;
}

.signal-strength {
  display: flex;
  justify-content: center;
  gap: 3px;
  margin-top: 4px;
}

.bar {
  width: 6px;
  height: 12px;
  background: #d9d9d9;
  border-radius: 1px;
}

.bar.active {
  background: #52c41a;
}

.bar:nth-child(1) {
  height: 6px;
}

.bar:nth-child(2) {
  height: 12px;
}

.bar:nth-child(3) {
  height: 18px;
}

.bar:nth-child(4) {
  height: 24px;
}

/* 图表区域 */
.trend-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.chart-container {
  height: 400px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(161, 196, 253, 0.1);
}

.trend-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-box {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(161, 196, 253, 0.1);
  height: calc(33.333% - 10.667px);
}

.stat-box h4 {
  font-size: 16px;
  color: #666;
  margin-bottom: 12px;
  font-weight: 500;
}

.trend-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.trend-value.up {
  color: #f5222d;
}

.trend-value.down {
  color: #52c41a;
}

.trend-value.stable {
  color: #1890ff;
}

.seasonal-chart {
  height: 80px;
  width: 100%;
}

.prediction {
  margin-top: 12px;
}

.prediction-range {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.min, .max {
  font-size: 14px;
  color: #666;
  width: 80px;
}

.min {
  text-align: left;
}

.max {
  text-align: right;
}

.range-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.range-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(to right, #91cc75, #fac858);
  border-radius: 4px;
}

.confidence {
  text-align: center;
  font-size: 12px;
  color: #666;
}

/* 控制栏样式 */
.controls {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.metric-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.period-select {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  min-width: 120px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-left: auto;
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

.action-btn.primary {
  background: #006d75;
  color: white;
  border-color: #006d75;
}

.action-btn.primary:hover {
  background: #00565e;
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
@media (max-width: 1200px) {
  .trend-content {
    grid-template-columns: 1fr;
  }
  
  .trend-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    height: auto;
  }
  
  .stat-box {
    height: auto;
  }
}

@media (max-width: 768px) {
  .overview-container {
    padding: 16px;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .controls {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
  
  .action-buttons {
    margin-left: 0;
    justify-content: space-between;
    width: 100%;
  }
  
  .trend-stats {
    grid-template-columns: 1fr;
  }
}
</style>