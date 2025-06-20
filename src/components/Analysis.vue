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
    background: rgba(25, 41, 88, 0.8);
    border-radius: 10px;
    border: 1px solid rgba(161, 196, 253, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    font-size: 24px;
    font-weight: 500;
    margin-bottom: 10px;
    color: #e3f2fd;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  p {
    font-size: 16px;
    color: #90caf9;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .charts {
    display: flex;
    gap: 20px;
    justify-content: space-around;
  }
  
  .chart-item {
    text-align: center;
    padding: 20px;
    background: rgba(84, 114, 211, 0.2);
    color: #e3f2fd;
    border-radius: 8px;
    width: 150px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(161, 196, 253, 0.3);
    transition: all 0.3s;
  }
  
  .chart-item i {
    font-size: 36px;
    margin-bottom: 10px;
    color: #a1c4fd;
  }
  
  .chart-item p {
    font-size: 14px;
    font-weight: 500;
    color: #e3f2fd;
    margin-bottom: 0;
    justify-content: center;
  }
  
  .chart-item:hover {
    background: rgba(84, 114, 211, 0.3);
    cursor: pointer;
    transform: translateY(-5px);
    border-color: rgba(161, 196, 253, 0.5);
  }
  </style>
  