<template>
  <div class="overview-container">
    <h2>
      <i class="fa fa-info-circle"></i> 概览
    </h2>
    <p class="overview-description">
      在这里，您可以查看关于北极海冰密度的一般信息，了解其变化趋势以及当前的监测数据。
    </p>
    
    <!-- 地球图组件 -->
    <EarthMap class="earth-map" />

    <div class="info-cards">
      <div class="info-card">
        <i class="fa fa-thermometer-half"></i>
        <h3>温度趋势</h3>
        <p>海冰的温度变化直接影响其密度，了解温度趋势对预测海冰的变化至关重要。</p>
      </div>
      <div class="info-card">
        <i class="fa fa-cloud-sun"></i>
        <h3>气候影响</h3>
        <p>气候变化对海冰密度有显著影响，研究气候模式有助于更好地理解冰层变化。</p>
      </div>
      <div class="info-card">
        <i class="fa fa-snowflake"></i>
        <h3>冰层厚度</h3>
        <p>冰层的厚度是判断海冰健康和稳定性的重要指标。</p>
      </div>
    </div>
    
    <div class="action-buttons">
      <button class="explore-btn">探索更多</button>
      <button class="learn-btn">了解详细信息</button>
    </div>
  </div>
</template>

<script>
import EarthMap from './EarthMap.vue';

export default {
  name: "Overview",
  components: {
    EarthMap,
  },
};
</script>

<style scoped>
/* 样式优化 */
.overview-container {
  padding: 20px;
  background-color: #e0f7fa;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

h2 {
  font-size: 28px;
  color: #00796b;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.overview-description {
  font-size: 18px;
  color: #333;
  margin-bottom: 30px;
  line-height: 1.6;
}

.earth-map {
  margin-bottom: 30px;
  width: 100%;
  max-width: 600px;
  height: 400px;
}

.info-cards {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 30px;
}

.info-card {
  background-color: #00796b;
  color: white;
  padding: 20px;
  border-radius: 10px;
  width: 220px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s, box-shadow 0.3s;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
}

.info-card i {
  font-size: 40px;
  margin-bottom: 10px;
}

.info-card h3 {
  font-size: 20px;
  margin-bottom: 10px;
}

.info-card p {
  font-size: 14px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.explore-btn, .learn-btn {
  padding: 12px 24px;
  font-size: 16px;
  color: white;
  background-color: #00796b;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s, transform 0.2s;
}

.explore-btn:hover, .learn-btn:hover {
  background-color: #004d40;
  transform: translateY(-2px);
}
</style>
