// src/components/Mainboard.vue
<template>
  <div class="mainboard">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="title">北极海冰密度信息管理与分析系统</div>
      <div class="user-info">
        <span class="welcome">欢迎,{{ username }}</span>
        <button class="logout-btn" @click="handleLogout">登出</button>
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
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'Mainboard',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const username = ref('');

    const menuItems = [
      { name: '系统概览', path: 'overview', icon: 'fas fa-chart-line' },
      { name: '实时监测', path: 'monitor', icon: 'fas fa-satellite' },
      { name: '数据管理', path: 'data', icon: 'fas fa-database' },
      { name: '密度分析', path: 'density', icon: 'fas fa-chart-pie' },
      { name: '温度分析', path: 'temperature', icon: 'fas fa-temperature-high' },
      { name: '设备管理', path: 'devices', icon: 'fas fa-server' },
      { name: '预警管理', path: 'alerts', icon: 'fas fa-bell', badge: '2' },
      { name: '报表中心', path: 'reports', icon: 'fas fa-file-alt' }
    ];

    const isActive = (path) => {
      return route.path.includes(path);
    };

    const navigateTo = (path) => {
      router.push(`/mainboard/${path}`);
    };

    const handleLogout = async () => {
      try {
        if (!confirm('确定要退出登录吗？')) return;
        localStorage.clear();
        await router.push('/');
      } catch (error) {
        console.error('登出失败:', error);
        alert('登出失败，请重试');
      }
    };

    onMounted(() => {
      if (route.path === '/mainboard') {
        navigateTo('overview');
      }
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      username.value = userInfo.username || '未知用户';
    });

    return {
      username,
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
  background-color: #f5f5f5;
  position: relative;
}

/* 顶部导航栏 */
.header {
  height: 60px;
  background: linear-gradient(135deg, #006064 0%, #00838f 100%);
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1000;
}

.title {
  color: white;
  font-size: 20px;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.5px;
  position: relative;
  padding-left: 15px;
}

.title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 70%;
  background-color: #4fc3f7;
  border-radius: 2px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  backdrop-filter: blur(10px);
}

.welcome {
  color: #e0e0e0;
  font-size: 14px;
  font-weight: 500;
}

.logout-btn {
  background-color: #d32f2f;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.logout-btn:hover {
  background-color: #c62828;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(211, 47, 47, 0.4);
}

.logout-btn:active {
  transform: translateY(1px);
}

/* 主容器 */
.main-container {
  flex: 1;
  display: flex;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
}

/* 侧边栏 */
.sidebar {
  width: 220px;
  background: linear-gradient(180deg, #004d56 0%, #003c44 100%);
  padding: 16px 0;
  position: relative;
  transition: all 0.3s ease;
}

.status {
  color: #e0e0e0;
  font-size: 13px;
  padding: 12px 16px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: #4caf50;
  border-radius: 50%;
  box-shadow: 0 0 10px #4caf50;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.menu-list {
  list-style: none;
  padding: 8px 0;
}

.menu-item {
  padding: 12px 16px;
  color: #e0e0e0;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 4px 8px;
  border-radius: 6px;
}

.menu-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-content i {
  width: 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.menu-item:hover i {
  transform: scale(1.2);
  color: #2196f3;
}

.menu-item.active {
  background: linear-gradient(90deg, rgba(33, 150, 243, 0.15) 0%, rgba(33, 150, 243, 0.05) 100%);
  border-left: 3px solid #2196f3;
}

.badge {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  min-width: 24px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(244, 67, 54, 0.3);
  transition: all 0.3s ease;
}

.menu-item:hover .badge {
  transform: scale(1.1) translateX(-2px);
}

/* 内容区域 */
.content {
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
  overflow-y: auto;
  position: relative;
}

.content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(33, 150, 243, 0.2), transparent);
}

/* 动画效果增强 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #888 0%, #666 100%);
  border-radius: 4px;
  border: 2px solid #f1f1f1;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #666 0%, #444 100%);
}

/* 响应式优化 */
@media (max-width: 768px) {
  .sidebar {
    width: 180px;
  }
  
  .menu-item {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .content {
    padding: 15px;
  }
}
</style>