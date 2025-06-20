<!-- 海冰预测组件 -->
<template>
  <div class="ice-prediction">
    <div class="prediction-header">
      <h2 class="title">海冰变化趋势预测</h2>
      <div class="control-panel">
        <div class="select-group">
          <label>预测区域</label>
          <select v-model="selectedRegion">
            <option value="A">A区域</option>
            <option value="B">B区域</option>
            <option value="C">C区域</option>
            <option value="all">全部区域</option>
          </select>
        </div>
        
        <div class="select-group">
          <label>预测时长</label>
          <select v-model="predictionPeriod">
            <option value="week">一周</option>
            <option value="month">一个月</option>
            <option value="quarter">三个月</option>
            <option value="year">一年</option>
          </select>
        </div>
        
        <button @click="generatePrediction" class="predict-btn" :disabled="loading">
          <i class="fas fa-chart-line"></i>
          生成预测
        </button>
      </div>
    </div>
    
    <div class="content-container">
      <div class="chart-container" ref="chartContainer">
        <div v-if="loading" class="loading-overlay">
          <div class="spinner"></div>
          <p>正在计算预测结果...</p>
        </div>
        
        <!-- 图表将在这里渲染 -->
        <div ref="chart" class="chart"></div>
      </div>
      
      <div class="prediction-metrics">
        <div class="metric-card">
          <div class="metric-icon">
            <i class="fas fa-tachometer-alt"></i>
          </div>
          <div class="metric-content">
            <h3>海冰密度趋势</h3>
            <div class="metric-value" :class="getDensityTrendClass()">
              {{ densityTrend }}
              <i :class="getDensityTrendIcon()"></i>
            </div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon">
            <i class="fas fa-ruler-vertical"></i>
          </div>
          <div class="metric-content">
            <h3>海冰厚度趋势</h3>
            <div class="metric-value" :class="getThicknessTrendClass()">
              {{ thicknessTrend }}
              <i :class="getThicknessTrendIcon()"></i>
            </div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon">
            <i class="fas fa-temperature-low"></i>
          </div>
          <div class="metric-content">
            <h3>温度影响系数</h3>
            <div class="metric-value">
              {{ temperatureCoefficient }}
            </div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-icon">
            <i class="fas fa-percent"></i>
          </div>
          <div class="metric-content">
            <h3>预测准确率</h3>
            <div class="metric-value accuracy">
              {{ predictionAccuracy }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="prediction-notes">
        <h3>预测说明</h3>
        <div class="notes-content">
          <p>{{ predictionNotes }}</p>
          <div v-if="recommendations.length > 0" class="recommendations">
            <h4>建议参考：</h4>
            <ul>
              <li v-for="(rec, index) in recommendations" :key="index">
                {{ rec }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import { predictionService } from '../services/predictionService';

export default {
  name: 'IcePrediction',
  setup() {
    // 状态变量
    const selectedRegion = ref('all');
    const predictionPeriod = ref('month');
    const loading = ref(false);
    const chartInstance = ref(null);
    const chart = ref(null);
    const chartContainer = ref(null);
    
    // 预测结果数据
    const densityTrend = ref('稳定');
    const thicknessTrend = ref('稳定');
    const temperatureCoefficient = ref('0.75');
    const predictionAccuracy = ref('89%');
    const predictionNotes = ref('基于历史数据分析，当前海冰状态相对稳定，短期内不会有显著变化。');
    const recommendations = ref([]);
    
    // 生成预测
    const generatePrediction = async () => {
      try {
        loading.value = true;
        
        // 调用预测服务API
        const result = await predictionService.getPrediction({
          region: selectedRegion.value,
          period: predictionPeriod.value
        });
        
        // 更新预测结果
        updatePredictionResults(result);
        
        // 重新渲染图表
        renderChart(result.chartData);
        
      } catch (error) {
        console.error('生成预测失败:', error);
        alert('生成预测失败，请稍后重试');
      } finally {
        loading.value = false;
      }
    };
    
    // 更新预测结果
    const updatePredictionResults = (result) => {
      densityTrend.value = result.densityTrend || '稳定';
      thicknessTrend.value = result.thicknessTrend || '稳定';
      temperatureCoefficient.value = result.temperatureCoefficient || '0.75';
      predictionAccuracy.value = result.accuracy || '89%';
      predictionNotes.value = result.notes || '基于历史数据分析，当前海冰状态相对稳定，短期内不会有显著变化。';
      recommendations.value = result.recommendations || [];
    };
    
    // 渲染图表
    const renderChart = (chartData) => {
      if (!chartInstance.value) {
        chartInstance.value = echarts.init(chart.value);
      }
      
      // 模拟数据，实际应用中应该使用API返回的数据
      const data = chartData || generateMockChartData();
      
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['密度', '厚度', '温度'],
          textStyle: {
            color: '#90caf9'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.dates,
          axisLine: {
            lineStyle: {
              color: '#5472d3'
            }
          },
          axisLabel: {
            color: '#90caf9'
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '密度 (kg/m³)',
            min: 0,
            max: 1000,
            axisLine: {
              lineStyle: {
                color: '#5472d3'
              }
            },
            axisLabel: {
              color: '#90caf9'
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(84, 114, 211, 0.1)'
              }
            }
          },
          {
            type: 'value',
            name: '厚度/温度',
            min: -30,
            max: 10,
            axisLine: {
              lineStyle: {
                color: '#5472d3'
              }
            },
            axisLabel: {
              color: '#90caf9'
            },
            splitLine: {
              show: false
            }
          }
        ],
        series: [
          {
            name: '密度',
            type: 'line',
            data: data.density,
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: '#64b5f6'
            },
            lineStyle: {
              width: 3,
              shadowColor: 'rgba(100, 181, 246, 0.5)',
              shadowBlur: 10
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(100, 181, 246, 0.5)' },
                { offset: 1, color: 'rgba(100, 181, 246, 0.1)' }
              ])
            }
          },
          {
            name: '厚度',
            type: 'line',
            yAxisIndex: 1,
            data: data.thickness,
            smooth: true,
            symbol: 'rect',
            symbolSize: 8,
            itemStyle: {
              color: '#81c784'
            },
            lineStyle: {
              width: 3
            }
          },
          {
            name: '温度',
            type: 'line',
            yAxisIndex: 1,
            data: data.temperature,
            smooth: true,
            symbol: 'triangle',
            symbolSize: 8,
            itemStyle: {
              color: '#ff8a65'
            },
            lineStyle: {
              width: 3,
              type: 'dashed'
            }
          }
        ]
      };
      
      chartInstance.value.setOption(option);
    };
    
    // 生成模拟图表数据
    const generateMockChartData = () => {
      const dates = [];
      const density = [];
      const thickness = [];
      const temperature = [];
      
      const today = new Date();
      const period = predictionPeriod.value;
      let days = 30; // 默认一个月
      
      switch (period) {
        case 'week':
          days = 7;
          break;
        case 'quarter':
          days = 90;
          break;
        case 'year':
          days = 365;
          break;
      }
      
      // 生成足够的数据点
      let baseValue = 800; // 基础密度值
      let thicknessBase = 1.5; // 基础厚度
      let tempBase = -5; // 基础温度
      
      // 添加一些历史数据点
      for (let i = -10; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        
        dates.push(date.toLocaleDateString());
        
        // 模拟数据波动，往回的是历史数据，往前的是预测
        const isHistory = i < 0;
        const fluctuation = isHistory ? 0 : 0.2; // 预测会有更大的波动
        
        // 给不同的区域设置不同的基础值
        let regionFactor = 1;
        if (selectedRegion.value === 'A') regionFactor = 1.1;
        if (selectedRegion.value === 'B') regionFactor = 0.9;
        if (selectedRegion.value === 'C') regionFactor = 1;
        
        const trend = i / 100; // 增加轻微的趋势
        const random = Math.random() * 30 - 15; // 增加随机性
        
        // 不同的季节有不同的趋势
        const seasonal = Math.sin(i / 30 * Math.PI) * 20;
        
        density.push((baseValue - trend * 50 + random + seasonal) * regionFactor);
        thickness.push((thicknessBase - trend * 0.2 + Math.random() * 0.2 - 0.1) * regionFactor);
        temperature.push(tempBase + trend * 2 + Math.random() * 1 - 0.5);
      }
      
      return { dates, density, thickness, temperature };
    };
    
    // 根据趋势确定颜色类
    const getDensityTrendClass = () => {
      if (densityTrend.value.includes('下降')) return 'negative';
      if (densityTrend.value.includes('上升')) return 'positive';
      return 'neutral';
    };
    
    const getThicknessTrendClass = () => {
      if (thicknessTrend.value.includes('减小')) return 'negative';
      if (thicknessTrend.value.includes('增加')) return 'positive';
      return 'neutral';
    };
    
    // 获取趋势的图标
    const getDensityTrendIcon = () => {
      if (densityTrend.value.includes('下降')) return 'fas fa-arrow-down';
      if (densityTrend.value.includes('上升')) return 'fas fa-arrow-up';
      return 'fas fa-equals';
    };
    
    const getThicknessTrendIcon = () => {
      if (thicknessTrend.value.includes('减小')) return 'fas fa-arrow-down';
      if (thicknessTrend.value.includes('增加')) return 'fas fa-arrow-up';
      return 'fas fa-equals';
    };
    
    // 监听窗口大小改变，调整图表大小
    const handleResize = () => {
      if (chartInstance.value) {
        chartInstance.value.resize();
      }
    };
    
    // 监听区域和时间段的改变
    watch([selectedRegion, predictionPeriod], () => {
      if (chartInstance.value) {
        renderChart();
      }
    });
    
    // 组件挂载后初始化图表
    onMounted(() => {
      // 初始化图表
      renderChart();
      
      // 监听窗口大小变化
      window.addEventListener('resize', handleResize);
      
      // 根据选择的区域和时间段加载初始数据
      generatePrediction();
    });
    
    return {
      selectedRegion,
      predictionPeriod,
      loading,
      chart,
      chartContainer,
      
      densityTrend,
      thicknessTrend,
      temperatureCoefficient,
      predictionAccuracy,
      predictionNotes,
      recommendations,
      
      generatePrediction,
      getDensityTrendClass,
      getThicknessTrendClass,
      getDensityTrendIcon,
      getThicknessTrendIcon
    };
  }
};
</script>

<style scoped>
.ice-prediction {
  padding: 24px;
  background: linear-gradient(135deg, rgba(13, 27, 42, 0.8), rgba(27, 38, 59, 0.9));
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(161, 196, 253, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.prediction-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
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

.control-panel {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.select-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.select-group label {
  font-size: 12px;
  color: #90caf9;
}

.select-group select {
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

.select-group select:focus {
  border-color: #5472d3;
  box-shadow: 0 0 0 2px rgba(84, 114, 211, 0.3);
}

.predict-btn {
  background: linear-gradient(45deg, #377dff, #5472d3);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  box-shadow: 0 4px 10px rgba(55, 125, 255, 0.2);
  margin-top: 22px;
}

.predict-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(55, 125, 255, 0.3);
}

.predict-btn:active {
  transform: translateY(1px);
}

.predict-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow: hidden;
}

.chart-container {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
  position: relative;
  min-height: 300px;
  border: 1px solid rgba(161, 196, 253, 0.1);
}

.chart {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(27, 38, 59, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 10px;
  backdrop-filter: blur(5px);
}

.spinner {
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

.loading-overlay p {
  color: #a1c4fd;
  font-size: 14px;
}

.prediction-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.metric-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid rgba(161, 196, 253, 0.1);
  transition: all 0.3s;
}

.metric-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  background: rgba(84, 114, 211, 0.2);
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #a1c4fd;
}

.metric-content {
  flex: 1;
}

.metric-content h3 {
  margin: 0 0 6px;
  font-size: 14px;
  color: #90caf9;
  font-weight: 500;
}

.metric-value {
  font-size: 18px;
  font-weight: 600;
  color: #e3f2fd;
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-value.positive {
  color: #81c784;
}

.metric-value.negative {
  color: #ff8a65;
}

.metric-value.neutral {
  color: #e3f2fd;
}

.metric-value.accuracy {
  color: #64b5f6;
}

.prediction-notes {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 16px;
  border: 1px solid rgba(161, 196, 253, 0.1);
}

.prediction-notes h3 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #90caf9;
  font-weight: 500;
}

.notes-content {
  color: #e3f2fd;
  font-size: 14px;
  line-height: 1.6;
}

.recommendations {
  margin-top: 16px;
}

.recommendations h4 {
  color: #a1c4fd;
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 500;
}

.recommendations ul {
  margin: 0;
  padding-left: 20px;
}

.recommendations li {
  margin-bottom: 6px;
  color: #bbdefb;
}

@media (max-width: 768px) {
  .prediction-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .control-panel {
    width: 100%;
    justify-content: space-between;
  }
  
  .prediction-metrics {
    grid-template-columns: 1fr;
  }
}
</style> 