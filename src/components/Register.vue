<template>
  <div class="register-container">
    <h1 class="title">用户注册</h1>
    <form @submit.prevent="handleRegister">
      <div class="input-group">
        <label for="username">用户名</label>
        <input
          type="text"
          id="username"
          v-model="username"
          required
          placeholder="请输入用户名"
        />
      </div>
      <div class="input-group">
        <label for="password">密码</label>
        <input
          type="password"
          id="password"
          v-model="password"
          required
          placeholder="请输入密码"
        />
      </div>
      <div class="input-group">
        <label for="confirmPassword">确认密码</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="confirmPassword"
          required
          placeholder="请确认密码"
        />
      </div>
      <button type="submit" class="register-btn">注册</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: "",
      password: "",
      confirmPassword: "",
      errorMessage: "",
    };
  },
  methods: {
    async handleRegister() {
      if (this.password !== this.confirmPassword) {
        this.errorMessage = "密码和确认密码不匹配！";
        return;
      }

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
          this.errorMessage = ""; // Clear any previous error message
          alert("注册成功！欢迎使用系统！");
          localStorage.setItem("token", data.token); // 存储返回的 token
          this.$router.push('/mainboard'); // 跳转到主页面
        } else {
          this.errorMessage = data.message || "注册失败，请稍后再试。";
        }
      } catch (error) {
        this.errorMessage = "服务器连接失败，请稍后重试。";
        console.error("注册失败:", error);
      }
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

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.register-container {
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

.register-btn {
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

.register-btn:hover {
  background-color: #005580;
}

.error-message {
  color: red;
  font-size: 14px;
  margin-top: 10px;
}
</style>
