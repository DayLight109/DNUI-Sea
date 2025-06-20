<template>
  <div class="notification-container">
    <transition-group name="notification-list" tag="div" class="notification-list">
      <div 
        v-for="notification in visibleNotifications" 
        :key="notification.id"
        :class="['notification-item', notification.type]"
      >
        <div class="notification-icon">
          <i :class="getNotificationIcon(notification.type)"></i>
        </div>
        <div class="notification-content">
          <div class="notification-header">
            <h3 class="notification-title">{{ notification.title }}</h3>
            <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
          </div>
          <p class="notification-message">{{ notification.message }}</p>
          <div class="notification-actions" v-if="notification.actions && notification.actions.length">
            <button 
              v-for="(action, index) in notification.actions" 
              :key="index"
              @click="handleAction(notification, action)"
              class="action-btn"
            >
              {{ action.label }}
            </button>
          </div>
        </div>
        <button class="close-btn" @click="dismissNotification(notification.id)">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </transition-group>
    
    <div class="notification-toggle" @click="toggleNotificationPanel">
      <div class="notification-badge" v-if="unreadCount > 0">{{ unreadCount }}</div>
      <i class="fas fa-bell"></i>
    </div>
    
    <transition name="panel-slide">
      <div class="notification-panel" v-if="isPanelOpen">
        <div class="panel-header">
          <h2>系统通知</h2>
          <div class="panel-controls">
            <button class="control-btn" @click="markAllAsRead" title="全部标为已读">
              <i class="fas fa-check-double"></i>
            </button>
            <button class="control-btn" @click="toggleNotificationPanel" title="关闭面板">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div class="panel-content">
          <div class="empty-state" v-if="notifications.length === 0">
            <i class="fas fa-bell-slash"></i>
            <p>暂无通知</p>
          </div>
          
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            :class="['panel-notification-item', notification.type, { 'unread': !notification.read }]"
            @click="viewNotificationDetails(notification)"
          >
            <div class="notification-icon">
              <i :class="getNotificationIcon(notification.type)"></i>
            </div>
            <div class="notification-content">
              <div class="notification-header">
                <h3 class="notification-title">{{ notification.title }}</h3>
                <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
              </div>
              <p class="notification-message">{{ notification.message }}</p>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'SystemNotification',
  setup() {
    const router = useRouter();
    const notifications = ref([]);
    const isPanelOpen = ref(false);
    
    // 模拟服务
    const fetchNotifications = () => {
      // 在实际项目中，从API获取通知
      return [
        {
          id: 1,
          type: 'warning',
          title: 'B区域密度异常',
          message: 'B区域海冰密度在过去24小时内下降了5%，超过预警阈值',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30分钟前
          read: false,
          actions: [
            { label: '查看详情', action: 'view', data: { region: 'B' } }
          ]
        },
        {
          id: 2,
          type: 'info',
          title: '系统更新完成',
          message: '海冰监测系统已更新到v1.2.5版本，新增预测模型和地图功能',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
          read: true
        },
        {
          id: 3,
          type: 'error',
          title: 'C区域监测站离线',
          message: 'C区域3号监测站已离线，请检查设备连接',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1天前
          read: false,
          actions: [
            { label: '查看监测站', action: 'monitor', data: { station: 'C3' } }
          ]
        },
        {
          id: 4,
          type: 'success',
          title: '数据同步成功',
          message: '今日监测数据已成功同步至云端数据库',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5小时前
          read: true
        }
      ];
    };
    
    // 计算未读通知数量
    const unreadCount = computed(() => {
      return notifications.value.filter(n => !n.read).length;
    });
    
    // 计算可见通知（浮动提示）
    const visibleNotifications = computed(() => {
      return notifications.value
        .filter(n => !n.read && !n.dismissed)
        .slice(0, 3); // 最多显示3条浮动通知
    });
    
    // 根据通知类型获取图标
    const getNotificationIcon = (type) => {
      switch (type) {
        case 'warning': return 'fas fa-exclamation-triangle';
        case 'error': return 'fas fa-times-circle';
        case 'success': return 'fas fa-check-circle';
        case 'info': 
        default: return 'fas fa-info-circle';
      }
    };
    
    // 格式化时间显示
    const formatTime = (timestamp) => {
      const now = new Date();
      const time = new Date(timestamp);
      const diffMinutes = Math.floor((now - time) / (1000 * 60));
      
      if (diffMinutes < 1) return '刚刚';
      if (diffMinutes < 60) return `${diffMinutes}分钟前`;
      
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours}小时前`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 30) return `${diffDays}天前`;
      
      // 超过30天就显示具体日期
      return time.toLocaleDateString();
    };
    
    // 切换通知面板
    const toggleNotificationPanel = () => {
      isPanelOpen.value = !isPanelOpen.value;
    };
    
    // 查看通知详情
    const viewNotificationDetails = (notification) => {
      // 标记为已读
      const index = notifications.value.findIndex(n => n.id === notification.id);
      if (index !== -1) {
        notifications.value[index].read = true;
      }
      
      // 如果有操作，执行第一个操作
      if (notification.actions && notification.actions.length > 0) {
        handleAction(notification, notification.actions[0]);
      }
    };
    
    // 处理通知操作
    const handleAction = (notification, action) => {
      // 标记通知为已读
      const index = notifications.value.findIndex(n => n.id === notification.id);
      if (index !== -1) {
        notifications.value[index].read = true;
      }
      
      // 根据操作类型执行不同行为
      switch (action.action) {
        case 'view':
          router.push({
            path: '/mainboard/data',
            query: { region: action.data.region }
          });
          break;
        case 'monitor':
          router.push({
            path: '/mainboard/monitor',
            query: { station: action.data.station }
          });
          break;
        default:
          console.log('执行操作:', action);
      }
      
      // 关闭通知面板
      isPanelOpen.value = false;
    };
    
    // 关闭单个通知
    const dismissNotification = (id) => {
      const index = notifications.value.findIndex(n => n.id === id);
      if (index !== -1) {
        notifications.value[index].dismissed = true;
      }
    };
    
    // 标记所有通知为已读
    const markAllAsRead = () => {
      notifications.value = notifications.value.map(notification => ({
        ...notification,
        read: true
      }));
    };
    
    // 检查新通知（模拟轮询）
    let pollingInterval;
    const checkNewNotifications = () => {
      // 在实际项目中，这里应该调用API检查新通知
      console.log('检查新通知...');
      
      // 模拟随机添加新通知
      if (Math.random() < 0.2) { // 20%的概率添加新通知
        const notificationTypes = ['info', 'warning', 'error', 'success'];
        const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        
        const newNotification = {
          id: Date.now(),
          type,
          title: `测试通知 - ${type.toUpperCase()}`,
          message: `这是一条测试${type}通知，生成于${new Date().toLocaleTimeString()}`,
          timestamp: new Date(),
          read: false
        };
        
        notifications.value = [newNotification, ...notifications.value];
      }
    };
    
    // 组件挂载时获取通知
    onMounted(() => {
      notifications.value = fetchNotifications();
      
      // 设置通知检查轮询（实际应用中可以考虑使用WebSocket）
      pollingInterval = setInterval(checkNewNotifications, 60000); // 每分钟检查一次
    });
    
    // 组件卸载时清理资源
    onUnmounted(() => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    });
    
    return {
      notifications,
      visibleNotifications,
      unreadCount,
      isPanelOpen,
      getNotificationIcon,
      formatTime,
      toggleNotificationPanel,
      viewNotificationDetails,
      dismissNotification,
      handleAction,
      markAllAsRead
    };
  }
};
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none; /* 允许点击通知下方的元素 */
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 350px;
  max-width: 90vw;
}

.notification-item {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 12px;
  animation: slideIn 0.3s ease-out;
  border-left: 4px solid #bbdefb;
  pointer-events: auto; /* 使通知可点击 */
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  max-height: 300px;
  transition: all 0.3s ease-out;
}

.notification-item.info {
  border-left-color: #64b5f6;
}

.notification-item.warning {
  border-left-color: #ffb74d;
}

.notification-item.error {
  border-left-color: #ff8a65;
}

.notification-item.success {
  border-left-color: #81c784;
}

.notification-icon {
  font-size: 24px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-item.info .notification-icon {
  color: #64b5f6;
}

.notification-item.warning .notification-icon {
  color: #ffb74d;
}

.notification-item.error .notification-icon {
  color: #ff8a65;
}

.notification-item.success .notification-icon {
  color: #81c784;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.notification-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.notification-time {
  font-size: 12px;
  color: #90a4ae;
}

.notification-message {
  margin: 0;
  font-size: 14px;
  color: #455a64;
  line-height: 1.4;
}

.notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 4px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  color: #455a64;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e0e0e0;
}

.close-btn {
  background: transparent;
  border: none;
  color: #90a4ae;
  cursor: pointer;
  padding: 2px;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 20px;
  height: 20px;
}

.close-btn:hover {
  color: #455a64;
  background: #f5f5f5;
}

.notification-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #377dff, #5472d3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(55, 125, 255, 0.4);
  z-index: 1001;
  pointer-events: auto;
  transition: all 0.3s;
}

.notification-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(55, 125, 255, 0.5);
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff5252;
  color: white;
  font-size: 12px;
  font-weight: bold;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.notification-panel {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 350px;
  max-width: 90vw;
  max-height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 1001;
  pointer-events: auto;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5f5f5;
}

.panel-header h2 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.panel-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #455a64;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #e0e0e0;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  max-height: 450px;
}

.panel-notification-item {
  padding: 16px;
  display: flex;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.panel-notification-item:hover {
  background: #f9f9f9;
}

.panel-notification-item.unread {
  background: #f0f8ff;
}

.panel-notification-item.unread::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

.panel-notification-item.info.unread::before {
  background: #64b5f6;
}

.panel-notification-item.warning.unread::before {
  background: #ffb74d;
}

.panel-notification-item.error.unread::before {
  background: #ff8a65;
}

.panel-notification-item.success.unread::before {
  background: #81c784;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #90a4ae;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

/* 动画效果 */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.notification-list-enter-active {
  animation: slideIn 0.3s ease-out;
}

.notification-list-leave-active {
  animation: slideOut 0.3s ease-in;
  position: absolute;
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.3s, opacity 0.3s;
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style> 