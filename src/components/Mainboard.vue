<template>
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>北极海冰密度信息管理与分析系统</h1>
        <button @click="logout" class="logout-btn">登出</button>
      </header>
  
      <div class="dashboard-content">
        <!-- 菜单栏 -->
        <aside class="sidebar">
          <ul>
            <li @click="currentView = 'overview'">概览</li>
            <li @click="currentView = 'data-entry'">数据录入</li>
            <li @click="currentView = 'analysis'">数据分析</li>
            <li @click="currentView = 'reports'">报告</li>
          </ul>
        </aside>
  
        <!-- 主内容区域 -->
        <main class="main-view">
          <transition name="fade" mode="out-in">
            <component :is="currentViewComponent" :key="currentView"></component>
          </transition>
        </main>
      </div>
    </div>
  </template>
  
  <script>
  import Overview from './Overview.vue';
  import DataEntry from './DataEntry.vue';
  import Analysis from './Analysis.vue';
  import Reports from './Reports.vue';
  
  export default {
    data() {
      return {
        currentView: 'overview', // 初始视图为“概览”
      };
    },
    computed: {
      currentViewComponent() {
        return {
          overview: Overview,
          'data-entry': DataEntry,
          analysis: Analysis,
          reports: Reports,
        }[this.currentView];
      },
    },
    methods: {
      logout() {
        this.$emit('logout'); // 登出操作
      },
    },
  };
  </script>
  
  <style scoped>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  .dashboard-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f0f8ff;
  }
  
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    background: linear-gradient(135deg, #0a9396, #005f73);
    color: #fff;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transition: background 0.5s ease;
  }
  
  .dashboard-header:hover {
    background: linear-gradient(135deg, #006f79, #004d5e);
  }
  
  .dashboard-header h1 {
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 2px;
  }
  
  .logout-btn {
    padding: 10px 20px;
    background-color: #d32f2f;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }
  
  .logout-btn:hover {
    background-color: #c62828;
    transform: scale(1.05);
  }
  
  .dashboard-content {
    display: flex;
    flex: 1;
    transition: transform 0.3s ease-in-out;
  }
  
  .sidebar {
    width: 250px;
    background-color: #003d4d;
    color: #fff;
    padding: 20px;
    box-shadow: 2px 0 15px rgba(0, 0, 0, 0.1);
    transition: width 0.3s ease, box-shadow 0.3s ease;
  }
  
  .sidebar:hover {
    width: 280px;
    box-shadow: 2px 0 25px rgba(0, 0, 0, 0.3);
  }
  
  .sidebar ul {
    list-style: none;
    padding: 0;
  }
  
  .sidebar li {
    padding: 12px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease, transform 0.2s ease;
    border-radius: 5px;
  }
  
  .sidebar li:hover {
    background-color: #007c89;
    transform: scale(1.05);
  }
  
  .main-view {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease;
  }
  
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
  </style>
  