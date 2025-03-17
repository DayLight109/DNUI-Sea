<template>
  <div class="arctic-data-container">
    <header class="system-header">
      <h1>
        <i class="fas fa-snowflake"></i> 北极海冰密度信息管理与分析系统
      </h1>
      <div class="system-info">
        <span><i class="fas fa-map-marker-alt"></i> 观测站：北极科考站</span>
        <span><i class="fas fa-clock"></i> 当前时间：{{ currentTime }}</span>
      </div>
    </header>

    <div class="data-entry-section">
      <h2>
        <i class="fas fa-database"></i> 海冰数据录入
      </h2>
      <p class="description">
        请输入海冰观测数据，包括密度、温度、厚度等关键指标。所有数据将用于北极海冰变化研究与分析。
      </p>

      <form @submit.prevent="handleSubmit" class="data-form">
        <div class="form-grid">
          <!-- 基础信息 -->
          <div class="form-section">
            <h3><i class="fas fa-info-circle"></i> 基础信息</h3>
            <div class="form-group">
              <label for="date">观测日期</label>
              <input 
                type="datetime-local" 
                id="date" 
                v-model="formData.date" 
                required 
              />
            </div>
            <div class="form-group">
              <label for="location">观测位置</label>
              <div class="location-input">
                <input 
                  type="text" 
                  id="location" 
                  v-model="formData.location" 
                  required 
                  placeholder="经纬度坐标" 
                />
                <button type="button" class="gps-btn" @click="getGPSLocation">
                  <i class="fas fa-crosshairs"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- 物理参数 -->
          <div class="form-section">
            <h3><i class="fas fa-thermometer-half"></i> 物理参数</h3>
            <div class="form-group">
              <label for="temperature">温度 (°C)</label>
              <input 
                type="number" 
                id="temperature" 
                v-model="formData.temperature" 
                step="0.1" 
                required 
                placeholder="-30.0 ~ 0.0" 
              />
            </div>
            <div class="form-group">
              <label for="thickness">冰层厚度 (m)</label>
              <input 
                type="number" 
                id="thickness" 
                v-model="formData.thickness" 
                step="0.01" 
                required 
                placeholder="0.00 ~ 5.00" 
              />
            </div>
            <div class="form-group">
              <label for="density">冰层密度 (kg/m³)</label>
              <input 
                type="number" 
                id="density" 
                v-model="formData.density" 
                step="0.1" 
                required 
                placeholder="850 ~ 920" 
              />
            </div>
          </div>

          <!-- 环境参数 -->
          <div class="form-section">
            <h3><i class="fas fa-wind"></i> 环境参数</h3>
            <div class="form-group">
              <label for="windSpeed">风速 (m/s)</label>
              <input 
                type="number" 
                id="windSpeed" 
                v-model="formData.windSpeed" 
                step="0.1" 
                required 
                placeholder="0.0 ~ 50.0" 
              />
            </div>
            <div class="form-group">
              <label for="salinity">盐度 (‰)</label>
              <input 
                type="number" 
                id="salinity" 
                v-model="formData.salinity" 
                step="0.1" 
                required 
                placeholder="0.0 ~ 35.0" 
              />
            </div>
            <div class="form-group">
              <label for="snowCover">积雪厚度 (cm)</label>
              <input 
                type="number" 
                id="snowCover" 
                v-model="formData.snowCover" 
                step="0.1" 
                required 
                placeholder="0.0 ~ 100.0" 
              />
            </div>
          </div>
        </div>

        <!-- 备注信息 -->
        <div class="form-section full-width">
          <h3><i class="fas fa-comment-alt"></i> 补充信息</h3>
          <div class="form-group">
            <label for="notes">观测备注</label>
            <textarea 
              id="notes" 
              v-model="formData.notes" 
              rows="3" 
              placeholder="请输入任何相关的观测记录、异常现象等..."
            ></textarea>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <button type="button" class="reset-btn" @click="resetForm">
            <i class="fas fa-undo"></i> 重置
          </button>
          <button type="submit" class="submit-btn">
            <i class="fas fa-save"></i> 提交数据
          </button>
        </div>
      </form>

      <!-- 提示消息 -->
      <transition name="fade">
        <div v-if="notification.show" :class="['notification', notification.type]">
          <i :class="notification.icon"></i>
          <p>{{ notification.message }}</p>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const currentTime = ref('')
const formData = ref({
  date: '',
  location: '',
  temperature: '',
  thickness: '',
  density: '',
  windSpeed: '',
  salinity: '',
  snowCover: '',
  notes: ''
})
const notification = ref({
  show: false,
  type: '',
  message: '',
  icon: ''
})

// 更新时间显示
const updateCurrentTime = () => {
  currentTime.value = new Date().toLocaleString()
}

// GPS定位
const getGPSLocation = () => {
  showNotification('info', '正在获取GPS坐标...', 'fas fa-spinner fa-spin')
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        formData.value.location = `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`
        showNotification('success', 'GPS坐标获取成功！', 'fas fa-check-circle')
      },
      (error) => {
        console.error('GPS获取失败:', error)
        showNotification('error', 'GPS坐标获取失败', 'fas fa-exclamation-circle')
      }
    )
  } else {
    showNotification('error', '浏览器不支持GPS定位', 'fas fa-exclamation-circle')
  }
}

// 表单验证
const validateForm = () => {
  const { temperature, thickness, density, windSpeed, salinity, snowCover } = formData.value

  if (temperature < -30 || temperature > 0) {
    showNotification('error', '温度必须在-30°C到0°C之间', 'fas fa-exclamation-circle')
    return false
  }
  if (thickness <= 0 || thickness > 5) {
    showNotification('error', '冰层厚度必须在0-5米之间', 'fas fa-exclamation-circle')
    return false
  }
  if (density < 850 || density > 920) {
    showNotification('error', '冰层密度必须在850-920 kg/m³之间', 'fas fa-exclamation-circle')
    return false
  }
  if (windSpeed < 0 || windSpeed > 50) {
    showNotification('error', '风速必须在0-50 m/s之间', 'fas fa-exclamation-circle')
    return false
  }
  if (salinity < 0 || salinity > 35) {
    showNotification('error', '盐度必须在0-35‰之间', 'fas fa-exclamation-circle')
    return false
  }
  if (snowCover < 0 || snowCover > 100) {
    showNotification('error', '积雪厚度必须在0-100厘米之间', 'fas fa-exclamation-circle')
    return false
  }

  return true
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return

  const token = localStorage.getItem('token')
  if (!token) {
    showNotification('error', '未登录或登录已过期', 'fas fa-exclamation-circle')
    return
  }

  try {
    await axios.post('http://localhost:3000/api/arctic-ice/data', formData.value, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    })
    
    showNotification('success', '数据提交成功！', 'fas fa-check-circle')
    resetForm()
  } catch (error) {
    console.error('提交失败:', error)
    let errorMessage = '数据提交失败'
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage = '登录已过期，请重新登录'
          break
        case 400:
          errorMessage = error.response.data.message || '数据格式错误'
          break
        default:
          errorMessage = '服务器错误，请稍后重试'
      }
    }
    
    showNotification('error', errorMessage, 'fas fa-exclamation-circle')
  }
}

// 重置表单
const resetForm = () => {
  for (let key in formData.value) {
    formData.value[key] = ''
  }
  showNotification('info', '表单已重置', 'fas fa-undo')
}

// 显示通知
const showNotification = (type, message, icon) => {
  notification.value = {
    show: true,
    type: `notification-${type}`,
    message,
    icon
  }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

// 生命周期钩子
onMounted(() => {
  updateCurrentTime()
  setInterval(updateCurrentTime, 1000)
})
</script>

<style scoped>
.arctic-data-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f8fa;
}

.system-header {
  background: linear-gradient(135deg, #0288d1 0%, #26c6da 100%);
  color: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.system-header h1 {
  font-size: 24px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.system-info {
  margin-top: 10px;
  display: flex;
  gap: 20px;
  font-size: 14px;
}

.data-entry-section {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.data-entry-section h2 {
  color: #0288d1;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.description {
  color: #546e7a;
  margin-bottom: 30px;
  line-height: 1.6;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}

.form-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.form-section h3 {
  color: #0288d1;
  font-size: 18px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.location-input {
  display: flex;
  gap: 10px;
}

.gps-btn {
  padding: 8px;
  background: #0288d1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #37474f;
  font-weight: 500;
}

input, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #cfd8dc;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

input:focus, textarea:focus {
  border-color: #0288d1;
  outline: none;
  box-shadow: 0 0 0 2px rgba(2, 136, 209, 0.1);
}

.form-actions {
  display: flex;
  gap: 20px;
  justify-content: flex-end;
  margin-top: 30px;
}

.submit-btn, .reset-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.submit-btn {
  background: #0288d1;
  color: white;
}

.reset-btn {
  background: #eceff1;
  color: #546e7a;
}

.submit-btn:hover {
  background: #0277bd;
  transform: translateY(-2px);
}

.reset-btn:hover {
  background: #cfd8dc;
  transform: translateY(-2px);
}

.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 25px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: slideIn 0.3s ease-out;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.notification-success {
  background: #43a047;
  color: white;
}

.notification-info {
  background: #0288d1;
  color: white;
}

.notification-error {
  background: #f44336;
  color: white;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

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

.full-width {
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .system-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .submit-btn, .reset-btn {
    width: 100%;
    justify-content: center;
  }
  
  .notification {
    width: 90%;
    left: 50%;
    transform: translateX(-50%);
    bottom: 20px;
    right: auto;
  }
}

/* 添加输入框悬浮效果 */
.gps-btn:hover {
  background: #0277bd;
  transform: translateY(-2px);
}

/* 禁用状态样式 */
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

/* 输入错误状态 */
input.error, textarea.error {
  border-color: #f44336;
  background-color: #fff8f8;
}

/* 添加必填字段标记 */
label.required::after {
  content: "*";
  color: #f44336;
  margin-left: 4px;
}
</style>