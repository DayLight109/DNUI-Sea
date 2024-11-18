<template>
    <div class="data-entry-container">
      <h2>
        <i class="fa fa-plus-circle"></i> 数据录入
      </h2>
      <p class="description">
        在此页面，您可以输入新的海冰密度数据，包含温度、冰层厚度等信息。
      </p>
  
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="date">日期</label>
          <input type="date" id="date" v-model="date" required />
        </div>
  
        <div class="form-group">
          <label for="temperature">温度 (°C)</label>
          <input type="number" id="temperature" v-model="temperature" required placeholder="请输入温度" />
        </div>
  
        <div class="form-group">
          <label for="thickness">冰层厚度 (m)</label>
          <input type="number" id="thickness" v-model="thickness" required placeholder="请输入冰层厚度" />
        </div>
  
        <div class="form-group">
          <label for="location">位置</label>
          <input type="text" id="location" v-model="location" required placeholder="请输入位置" />
        </div>
  
        <button type="submit" class="submit-btn">提交数据</button>
      </form>
  
      <!-- 提交成功提示 -->
      <div v-if="submitSuccess" class="success-message">
        <p>数据已成功提交！</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        date: "",
        temperature: "",
        thickness: "",
        location: "",
        submitSuccess: false,
      };
    },
    methods: {
      handleSubmit() {
        // 提交数据后处理逻辑（例如：发送给后台）
        const data = {
          date: this.date,
          temperature: this.temperature,
          thickness: this.thickness,
          location: this.location,
        };
  
        // 假设提交成功
        console.log("提交的数据：", data);
        this.submitSuccess = true;
  
        // 清空表单
        this.date = "";
        this.temperature = "";
        this.thickness = "";
        this.location = "";
      },
    },
  };
  </script>
  
  <style scoped>
  /* 样式设置 */
  .data-entry-container {
    padding: 20px;
    background-color: #e1f5fe;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    font-size: 28px;
    color: #00796b;
    margin-bottom: 20px;
  }
  
  .description {
    font-size: 18px;
    color: #333;
    margin-bottom: 30px;
    line-height: 1.6;
  }
  
  form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  label {
    font-size: 16px;
    color: #00796b;
  }
  
  input {
    padding: 10px;
    font-size: 14px;
    border: 1px solid #00796b;
    border-radius: 5px;
    outline: none;
  }
  
  input:focus {
    border-color: #004d40;
  }
  
  button.submit-btn {
    padding: 12px 20px;
    font-size: 16px;
    color: white;
    background-color: #00796b;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }
  
  button.submit-btn:hover {
    background-color: #004d40;
    transform: translateY(-2px);
  }
  
  .success-message {
    margin-top: 20px;
    padding: 10px;
    background-color: #388e3c;
    color: white;
    border-radius: 5px;
    font-size: 16px;
  }
  </style>
  