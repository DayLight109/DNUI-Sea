<template>
  <div class="ocean-register">
    <!-- 冰川动画背景 -->
    <div class="glacier-container">
      <div class="ice-float ice1"></div>
      <div class="ice-float ice2"></div>
      <div class="ice-float ice3"></div>
      <div class="ice-float ice4"></div>
      <div class="snowfall"></div>
    </div>

    <!-- 主要内容 -->
    <div class="register-container">
      <div class="register-header">
        <i class="fas fa-snowflake header-icon pulse"></i>
        <h1 class="title">北极海冰监测系统</h1>
        <p class="subtitle">Arctic Sea Ice Monitoring System</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="input-group">
          <label for="username">
            <i class="fas fa-user"></i>
            <span>用户名</span>
          </label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            required 
            placeholder="请输入用户名"
            autocomplete="username"
          />
        </div>

        <div class="input-group">
          <label for="password">
            <i class="fas fa-lock"></i>
            <span>密码</span>
          </label>
          <div class="password-input">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="password" 
              required 
              placeholder="请输入密码"
            />
            <button 
              type="button" 
              class="toggle-password"
              @click="togglePassword"
              :title="showPassword ? '隐藏密码' : '显示密码'"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="input-group">
          <label for="confirmPassword">
            <i class="fas fa-lock"></i>
            <span>确认密码</span>
          </label>
          <div class="password-input">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="confirmPassword" 
              v-model="confirmPassword" 
              required 
              placeholder="请确认密码"
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="register-btn" :disabled="isLoading">
            <i class="fas fa-spinner fa-spin" v-if="isLoading"></i>
            <span>{{ isLoading ? '注册中...' : '注册账号' }}</span>
          </button>
          <button type="button" class="login-btn" @click="goToLogin">
            <i class="fas fa-arrow-left"></i>
            <span>返回登录</span>
          </button>
        </div>
      </form>

      <!-- 错误提示 -->
      <transition name="fade">
        <div class="error-message" v-if="errorMessage">
          <i class="fas fa-exclamation-circle"></i>
          {{ errorMessage }}
        </div>
      </transition>
    </div>

    <div class="footer">
      <p>
        <i class="far fa-copyright"></i> 2024 Arctic Sea Ice Monitoring System
        <span class="footer-icons">
          ❄️ <i class="fas fa-laptop-code"></i> 🧊
        </span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OceanRegister',
  data() {
    return {
      username: "",
      password: "",
      confirmPassword: "",
      errorMessage: "",
      isLoading: false,
      showPassword: false
    };
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    async handleRegister() {
      if (this.isLoading) return;

      // 表单验证
      if (this.password.length < 6) {
        this.errorMessage = "密码长度不能少于6位！";
        return;
      }

      if (this.password !== this.confirmPassword) {
        this.errorMessage = "两次输入的密码不一致！";
        return;
      }

      this.isLoading = true;
      this.errorMessage = "";

      try {
        const response = await fetch("http://localhost:3000/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: this.username,
            password: this.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // 注册成功后自动登录
          await this.autoLogin();
        } else {
          throw new Error(data.message || "注册失败");
        }
      } catch (error) {
        this.errorMessage = error.message || "服务器连接失败，请稍后重试";
        console.error("注册失败:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async autoLogin() {
      try {
        const response = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: this.username,
            password: this.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("token", data.token);
          this.$router.push('/mainboard');
        } else {
          throw new Error("自动登录失败，请手动登录");
        }
      } catch (error) {
        this.$router.push('/login');
      }
    },
    goToLogin() {
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.ocean-register {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: linear-gradient(135deg, #0d1b2a, #1b263b, #2c5c8c);
  overflow: hidden;
}

/* 冰川动画 */
.glacier-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.ice-float {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  filter: blur(3px);
  opacity: 0.6;
}

.ice1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -120px;
  animation: float 15s ease-in-out infinite;
}

.ice2 {
  width: 200px;
  height: 200px;
  bottom: -80px;
  right: -80px;
  animation: float 12s ease-in-out infinite reverse;
}

.ice3 {
  width: 150px;
  height: 150px;
  top: 30%;
  right: -40px;
  animation: float 18s ease-in-out infinite;
}

.ice4 {
  width: 180px;
  height: 180px;
  bottom: 20%;
  left: -60px;
  animation: float 20s ease-in-out infinite reverse;
}

.snowfall {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 10% 10%, rgba(255, 255, 255, 0.8) 2px, transparent 2px),
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.7) 1px, transparent 1px),
    radial-gradient(circle at 30% 10%, rgba(255, 255, 255, 0.6) 3px, transparent 3px),
    radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.7) 2px, transparent 2px),
    radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.8) 1px, transparent 1px),
    radial-gradient(circle at 60% 40%, rgba(255, 255, 255, 0.6) 2px, transparent 2px),
    radial-gradient(circle at 70% 10%, rgba(255, 255, 255, 0.7) 3px, transparent 3px),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.8) 1px, transparent 1px),
    radial-gradient(circle at 90% 30%, rgba(255, 255, 255, 0.7) 2px, transparent 2px);
  animation: snowfall 20s linear infinite;
}

@keyframes float {
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(20px) rotate(3deg); }
  100% { transform: translateY(0) rotate(0deg); }
}

@keyframes snowfall {
  from { transform: translateY(-100%); }
  to { transform: translateY(100%); }
}

.register-container {
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1);
  max-width: 420px;
  width: 90%;
  margin: 20px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: appear 0.6s ease-out;
}

/* 模拟冰面上的光影效果 */
.register-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  transform: rotate(30deg);
  pointer-events: none;
}

@keyframes appear {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.header-icon {
  font-size: 48px;
  color: #a1c4fd;
  display: block;
  margin-bottom: 10px;
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

.title {
  font-size: 24px;
  color: #ffffff;
  margin: 0 0 5px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.subtitle {
  font-size: 14px;
  color: #a1c4fd;
  margin: 0;
  letter-spacing: 1px;
}

.register-form {
  margin-top: 20px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  color: #e3f2fd;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-group label i {
  color: #a1c4fd;
}

.input-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid rgba(161, 196, 253, 0.4);
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s;
  box-sizing: border-box;
}

.input-group input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.input-group input:focus {
  outline: none;
  border-color: #a1c4fd;
  background-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 3px rgba(161, 196, 253, 0.2);
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #a1c4fd;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.toggle-password:hover {
  color: #ffffff;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.register-btn, .login-btn {
  flex: 1;
  padding: 12px 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.register-btn {
  background: linear-gradient(45deg, #377dff, #5472d3);
  color: white;
  box-shadow: 0 4px 15px rgba(55, 125, 255, 0.2);
}

.register-btn:hover {
  background: linear-gradient(45deg, #2e6adb, #4565c3);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(55, 125, 255, 0.3);
}

.login-btn {
  background: rgba(161, 196, 253, 0.1);
  color: #e3f2fd;
  border: 1px solid rgba(161, 196, 253, 0.3);
}

.login-btn:hover {
  background: rgba(161, 196, 253, 0.2);
  border-color: rgba(161, 196, 253, 0.5);
  transform: translateY(-2px);
}

.register-btn:active, .login-btn:active {
  transform: translateY(1px);
}

.register-btn:disabled, .login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background-color: rgba(244, 67, 54, 0.1);
  color: #ff8a80;
  padding: 12px 15px;
  border-radius: 8px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  border: 1px solid rgba(244, 67, 54, 0.2);
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

.error-message i {
  color: #ff8a80;
  font-size: 16px;
}

@keyframes shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.footer {
  position: fixed;
  bottom: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  width: 100%;
}

.footer-icons {
  margin-left: 10px;
}

/* 响应式适配 */
@media (max-width: 480px) {
  .register-container {
    padding: 30px 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .title {
    font-size: 22px;
  }
}
</style>