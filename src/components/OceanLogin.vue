<template>
  <div class="ocean-login">
    <div class="login-container">
      <h1 class="title">基于海洋的监测系统</h1>
      <form @submit.prevent="handleSubmit">
        <div class="input-group">
          <label for="username">用户名</label>
          <input type="text" id="username" v-model="username" required placeholder="请输入用户名" />
        </div>
        <div class="input-group">
          <label for="password">密码</label>
          <input type="password" id="password" v-model="password" required placeholder="请输入密码" />
        </div>
        <button type="submit" class="login-btn">登录</button>
        <button type="button" class="login-btn register-btn" @click="handleRegister">注册</button>
      </form>
    </div>
    <div class="footer">
      <p>Copyright © Rui 2024 🌊💻🎉</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: "",
      password: ""
    };
  },
  methods: {
    async handleSubmit() {
      try {
        const response = await fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: this.username,
            password: this.password
          })
        });

        if (!response.ok) {
          const data = await response.json();
          alert(data.message || "登录失败，请检查用户名或密码。");
          return;
        }

        const data = await response.json();
        alert("登录成功！");
        localStorage.setItem("token", data.token);
        this.$router.push('/mainboard');

      } catch (error) {
        alert("无法连接到服务器，请检查网络或稍后再试。");
        console.error("连接服务器失败:", error);
      }
    },
    handleRegister() {
      this.$router.push('/register');
    }
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.ocean-login {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: linear-gradient(135deg, #00aaff, #0099cc, #003366);
  background-size: 400% 400%;
  animation: oceanAnimation 10s ease-in-out infinite;
}

@keyframes oceanAnimation {
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
}

.login-container {
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: min(90%, 400px);
  text-align: center;
  transform: translateY(-50px);
  animation: slideUp 0.8s ease-out forwards;
}

@keyframes slideUp {
  to {
    transform: translateY(0);
  }
}

.title {
  color: #006994;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 30px;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-family: 'Arial', sans-serif;
}

.input-group {
  margin-bottom: 20px;
  text-align: left;
}

.input-group label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
}

.input-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}

.login-btn {
  width: 100%;
  padding: 10px;
  background-color: #006994;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-btn:hover {
  background-color: #005580;
}

.register-btn {
  margin-top: 10px;
}

.footer {
  position: absolute;
  bottom: 20px;
  text-align: center;
  color: #fff;
  font-size: 14px;
  font-family: 'Arial', sans-serif;
}
</style>
