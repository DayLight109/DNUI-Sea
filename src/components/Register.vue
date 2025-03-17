<template>
  <div class="ocean-register">
    <!-- 波浪动画背景 -->
    <div class="waves-container">
      <div class="wave wave1"></div>
      <div class="wave wave2"></div>
      <div class="wave wave3"></div>
    </div>

    <!-- 主要内容 -->
    <div class="register-container">
      <div class="register-header">
        <i class="fas fa-user-plus header-icon"></i>
        <h1 class="title">用户注册</h1>
        <p class="subtitle">Ocean Monitoring System</p>
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
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <i class="fas fa-spinner fa-spin" v-if="isLoading"></i>
            <span>{{ isLoading ? '注册中...' : '注册账号' }}</span>
          </button>
          <button type="button" class="back-btn" @click="goToLogin">
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
        <i class="far fa-copyright"></i> 2024 Ocean Monitoring System
        <span class="footer-icons">
          🌊 <i class="fas fa-laptop-code"></i> 🎯
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
  background: linear-gradient(135deg, #006994, #0099cc, #00487C);
  overflow: hidden;
}

/* 波浪动画 */
.waves-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  overflow: hidden;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100%;
  background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg"><path fill="rgba(255,255,255,0.2)" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>');
  animation: wave 20s linear infinite;
}

.wave2 {
  animation: wave 15s linear infinite;
  opacity: 0.5;
}

.wave3 {
  animation: wave 10s linear infinite;
  opacity: 0.2;
}

@keyframes wave {
  0% { transform: translateX(0); }
  50% { transform: translateX(-50%); }
  100% { transform: translateX(-100%); }
}

.register-container {
  background-color: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: min(90%, 420px);
  transform: translateY(20px);
  opacity: 0;
  animation: slideUpFade 0.8s ease-out forwards;
}

@keyframes slideUpFade {
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.header-icon {
  font-size: 48px;
  color: #006994;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.title {
  color: #006994;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
  letter-spacing: 2px;
}

.subtitle {
  color: #666;
  font-size: 16px;
  letter-spacing: 1px;
}

.register-form {
  margin-top: 30px;
}

.input-group {
  margin-bottom: 24px;
}

.input-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #006994;
  font-size: 14px;
  margin-bottom: 8px;
}

.input-group label i {
  width: 20px;
}

.password-input {
  position: relative;
}

.input-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e1e1;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
}

.input-group input:focus {
  border-color: #006994;
  box-shadow: 0 0 0 3px rgba(0, 105, 148, 0.1);
  outline: none;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
}

.toggle-password:hover {
  color: #006994;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.submit-btn, .back-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.submit-btn {
  background-color: #006994;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background-color: #005580;
  transform: translateY(-2px);
}

.back-btn {
  background-color: #e1e1e1;
  color: #666;
}

.back-btn:hover {
  background-color: #d1d1d1;
  transform: translateY(-2px);
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  margin-top: 20px;
  padding: 12px;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.footer {
  position: absolute;
  bottom: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.footer-icons {
  margin-left: 10px;
  font-size: 16px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 480px) {
  .register-container {
    padding: 30px 20px;
  }

  .title {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
  }
}
</style>