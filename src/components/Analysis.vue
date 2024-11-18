<template>
    <div class="analysis-container">
      <h2>
        <i class="fa fa-chart-line"></i> 数据分析
      </h2>
      <p>
        <i class="fa fa-search"></i> 分析海冰密度数据中的趋势和模式。
      </p>
      <div class="charts">
        <div class="chart-item">
          <i class="fa fa-pie-chart"></i>
          <p>饼图分析</p>
        </div>
        <div class="chart-item">
          <i class="fa fa-bar-chart"></i>
          <p>柱状图分析</p>
        </div>
        <div class="chart-item">
          <i class="fa fa-line-chart"></i>
          <p>折线图分析</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "Analysis",
  };
  </script>
  
  <style scoped>
  .analysis-container {
    padding: 20px;
    background-color: #f5f5f5;
    border-radius: 10px;
  }
  
  h2 {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
    color: #005f73;
  }
  
  p {
    font-size: 16px;
    color: #333;
    margin-bottom: 20px;
  }
  
  .charts {
    display: flex;
    gap: 20px;
    justify-content: space-around;
  }
  
  .chart-item {
    text-align: center;
    padding: 20px;
    background-color: #009688;
    color: white;
    border-radius: 8px;
    width: 150px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .chart-item i {
    font-size: 36px;
    margin-bottom: 10px;
  }
  
  .chart-item p {
    font-size: 14px;
    font-weight: bold;
  }
  
  .chart-item:hover {
    background-color: #00796b;
    cursor: pointer;
    transform: translateY(-5px);
    transition: transform 0.2s, background-color 0.3s;
  }
  </style>
  