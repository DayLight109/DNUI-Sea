// src/components/Mainboard.vue
<template>
  <div class="mainboard">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="title">
        <i class="fas fa-snowflake ice-icon"></i>
        北极海冰密度信息管理与分析系统
      </div>
      <div class="user-info">
        <span class="welcome">欢迎, {{ username }}</span>
        <button class="logout-btn" @click="handleLogout">
          <i class="fas fa-sign-out-alt"></i>
          <span>登出</span>
        </button>
      </div>
    </header>

    <div class="main-container">
      <!-- 左侧菜单栏 -->
      <nav class="sidebar">
        <div class="status">
          <span class="status-dot"></span>
          系统运行正常
        </div>
        <ul class="menu-list">
          <li 
            v-for="item in menuItems" 
            :key="item.path"
            :class="['menu-item', { active: isActive(item.path) }]"
            @click="navigateTo(item.path)"
          >
            <div class="menu-content">
              <i :class="item.icon"></i>
              {{ item.name }}
            </div>
            <span v-if="item.badge" class="badge">{{ item.badge }}</span>
          </li>
        </ul>
        
        <div class="sidebar-footer">
          <div class="system-info">
            <div class="info-item">
              <i class="fas fa-server"></i>
              <span>系统版本: v1.2.5</span>
            </div>
            <div class="info-item">
              <i class="fas fa-clock"></i>
              <span>{{ currentTime }}</span>
            </div>
          </div>
        </div>
      </nav>

      <!-- 右侧内容区域 -->
      <main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    
    <!-- 雪花装饰 -->
    <div class="snowflakes" aria-hidden="true">
      <div class="snowflake">❄</div>
      <div class="snowflake">❅</div>
      <div class="snowflake">❆</div>
      <div class="snowflake">❄</div>
      <div class="snowflake">❅</div>
      <div class="snowflake">❆</div>
      <div class="snowflake">❄</div>
      <div class="snowflake">❅</div>
      <div class="snowflake">❆</div>
    </div>
    
    <!-- 系统通知组件 -->
    <SystemNotification />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import SystemNotification from './SystemNotification.vue';

export default {
  name: 'Mainboard',
  components: {
    SystemNotification
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const username = ref('');
    const currentTime = ref('');
    let clockTimer = null;

    const menuItems = [
      { name: '系统概览', path: 'overview', icon: 'fas fa-chart-line' },
      { name: '北极地图', path: 'map', icon: 'fas fa-map-marked-alt', badge: 'NEW' },
      { name: '实时监测', path: 'monitor', icon: 'fas fa-satellite-dish' },
      { name: '数据管理', path: 'data', icon: 'fas fa-database' },
      { name: '密度分析', path: 'analysis', icon: 'fas fa-chart-area' },
      { name: '趋势预测', path: 'prediction', icon: 'fas fa-chart-line', badge: 'NEW' },
      { name: '数据录入', path: 'data-entry', icon: 'fas fa-edit' },
      { name: '报表中心', path: 'reports', icon: 'fas fa-file-alt' }
    ];

    const isActive = (path) => {
      return route.path === `/mainboard/${path}`;
    };

    const navigateTo = (path) => {
      router.push(`/mainboard/${path}`);
    };

    const handleLogout = async () => {
      try {
        if (!confirm('确定要退出登录吗？')) return;
        localStorage.removeItem('token');
        await router.push('/');
      } catch (error) {
        console.error('登出失败:', error);
        alert('登出失败，请重试');
      }
    };
    
    const updateClock = () => {
      const now = new Date();
      const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false
      };
      currentTime.value = now.toLocaleString('zh-CN', options);
    };

    onMounted(() => {
      if (route.path === '/mainboard') {
        navigateTo('overview');
      }
      
      // 获取用户信息
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // 这里可以解析JWT或者直接使用本地存储的用户名
          username.value = localStorage.getItem('username') || '研究员';
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        username.value = '研究员';
      }
      
      // 启动时钟
      updateClock();
      clockTimer = setInterval(updateClock, 1000);
    });
    
    onUnmounted(() => {
      if (clockTimer) {
        clearInterval(clockTimer);
      }
    });

    return {
      username,
      currentTime,
      menuItems,
      isActive,
      navigateTo,
      handleLogout
    };
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.mainboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #eef5f9;
  background-image: linear-gradient(135deg, #eef5f9 0%, #e3f2fd 100%);
  position: relative;
  overflow: hidden;
}

/* 顶部导航栏 */
.header {
  height: 64px;
  background: linear-gradient(135deg, #0d1b2a 0%, #1b263b 100%);
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1000;
  border-bottom: 1px solid rgba(161, 196, 253, 0.3);
}

.title {
  color: white;
  font-size: 20px;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.ice-icon {
  color: #a1c4fd;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.15);
}

.welcome {
  color: #e3f2fd;
  font-size: 14px;
  font-weight: 500;
}

.logout-btn {
  background-color: rgba(244, 67, 54, 0.1);
  color: #ff8a80;
  border: 1px solid rgba(244, 67, 54, 0.2);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.logout-btn:hover {
  background-color: rgba(244, 67, 54, 0.2);
  transform: translateY(-2px);
}

.logout-btn:active {
  transform: translateY(1px);
}

/* 主容器 */
.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 侧边栏 */
.sidebar {
  width: 240px;
  background: #1b263b;
  color: #e3f2fd;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 900;
  border-right: 1px solid rgba(161, 196, 253, 0.1);
}

.status {
  padding: 12px 20px;
  margin: 0 16px 20px;
  background: rgba(46, 196, 182, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #a1c4fd;
  border: 1px solid rgba(46, 196, 182, 0.2);
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #2ec4b6;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(46, 196, 182, 0.6);
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.menu-list {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
}

.menu-item {
  padding: 14px 20px;
  margin: 4px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s;
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
}

.menu-item:hover {
  background: rgba(161, 196, 253, 0.1);
  border-color: rgba(161, 196, 253, 0.2);
}

.menu-item.active {
  background: linear-gradient(90deg, rgba(55, 125, 255, 0.1), rgba(161, 196, 253, 0.2));
  border-color: rgba(161, 196, 253, 0.3);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.menu-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(180deg, #a1c4fd, #c2e9fb);
  border-radius: 0 2px 2px 0;
}

.menu-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.menu-item i {
  font-size: 16px;
  width: 20px;
  text-align: center;
  color: #a1c4fd;
  transition: all 0.3s;
}

.menu-item.active i {
  color: #ffffff;
}

.badge {
  background-color: #f44336;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.sidebar-footer {
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid rgba(161, 196, 253, 0.1);
}

.system-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #90caf9;
}

.info-item i {
  font-size: 14px;
  width: 16px;
  text-align: center;
  color: #a1c4fd;
}

/* 内容区域 */
.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  position: relative;
}

/* 动画效果 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 雪花装饰 */
.snowflakes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.snowflake {
  position: fixed;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1em;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  animation-name: snowfall;
  animation-duration: 10s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  user-select: none;
}

.snowflake:nth-child(1) {
  left: 10%;
  animation-delay: 0s;
  animation-duration: 15s;
  opacity: 0.6;
}

.snowflake:nth-child(2) {
  left: 20%;
  animation-delay: 1s;
  animation-duration: 12s;
  font-size: 1.5em;
}

.snowflake:nth-child(3) {
  left: 30%;
  animation-delay: 2s;
  animation-duration: 18s;
  opacity: 0.8;
}

.snowflake:nth-child(4) {
  left: 40%;
  animation-delay: 3s;
  animation-duration: 13s;
  font-size: 0.8em;
}

.snowflake:nth-child(5) {
  left: 50%;
  animation-delay: 4s;
  animation-duration: 16s;
  opacity: 0.7;
}

.snowflake:nth-child(6) {
  left: 60%;
  animation-delay: 5s;
  animation-duration: 14s;
  font-size: 1.2em;
}

.snowflake:nth-child(7) {
  left: 70%;
  animation-delay: 6s;
  animation-duration: 12s;
  opacity: 0.9;
}

.snowflake:nth-child(8) {
  left: 80%;
  animation-delay: 7s;
  animation-duration: 15s;
  font-size: 0.9em;
}

.snowflake:nth-child(9) {
  left: 90%;
  animation-delay: 8s;
  animation-duration: 17s;
  opacity: 0.5;
}

@keyframes snowfall {
  0% {
    transform: translateY(-100px) rotate(0deg);
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
  }
}

/* 媒体查询 - 响应式调整 */
@media (max-width: 768px) {
  .sidebar {
    width: 70px;
    padding: 15px 0;
  }
  
  .menu-item {
    padding: 14px 10px;
    margin: 4px 8px;
    justify-content: center;
  }
  
  .menu-content {
    justify-content: center;
  }
  
  .menu-content span, .status span, .welcome, .logout-btn span,
  .sidebar-footer, .title span {
    display: none;
  }
  
  .menu-item i {
    font-size: 18px;
    margin: 0;
  }
  
  .badge {
    position: absolute;
    top: 5px;
    right: 5px;
    min-width: 16px;
    height: 16px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
  }
  
  .user-info {
    padding: 8px;
  }
  
  .logout-btn {
    padding: 8px;
  }
  
  .status {
    justify-content: center;
    padding: 8px;
    margin: 0 8px 15px;
  }
  
  .content {
    padding: 15px;
  }
}
</style>