<template>
    <div class="reports-container">
      <h2>
        <i class="fa fa-file-text"></i> 报告生成
      </h2>
      <p class="description">
        在此页面，您可以生成并下载关于海冰密度的报告。请选择报告的类型和时间范围。
      </p>
  
      <form @submit.prevent="generateReport">
        <div class="form-group">
          <label for="reportType">报告类型</label>
          <select id="reportType" v-model="reportType" required>
            <option value="monthly">月度报告</option>
            <option value="quarterly">季度报告</option>
            <option value="annual">年度报告</option>
          </select>
        </div>
  
        <div class="form-group">
          <label for="startDate">开始日期</label>
          <input type="date" id="startDate" v-model="startDate" required />
        </div>
  
        <div class="form-group">
          <label for="endDate">结束日期</label>
          <input type="date" id="endDate" v-model="endDate" required />
        </div>
  
        <button type="submit" class="submit-btn">生成报告</button>
      </form>
  
      <!-- 生成报告后显示的下载链接 -->
      <div v-if="reportGenerated" class="success-message">
        <p>报告已生成！<a :href="reportLink" download>点击下载报告</a></p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        reportType: "monthly", // 默认报告类型为月度报告
        startDate: "",
        endDate: "",
        reportGenerated: false,
        reportLink: "", // 生成报告后的下载链接
      };
    },
    methods: {
      generateReport() {
        // 模拟生成报告的过程
        const reportData = {
          reportType: this.reportType,
          startDate: this.startDate,
          endDate: this.endDate,
        };
  
        console.log("生成的报告数据：", reportData);
  
        // 模拟报告内容（实际可以生成 PDF 或其他文件格式）
        const generatedReport = `报告类型：${this.reportType}\n开始日期：${this.startDate}\n结束日期：${this.endDate}\n海冰密度分析报告内容...`;
  
        // 创建一个 Blob 对象表示报告内容，并生成下载链接
        const blob = new Blob([generatedReport], { type: "text/plain" });
        this.reportLink = URL.createObjectURL(blob);
  
        // 设置报告生成状态为已生成
        this.reportGenerated = true;
      },
    },
  };
  </script>
  
  <style scoped>
  /* 样式设置 */
  .reports-container {
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
  
  select, input {
    padding: 10px;
    font-size: 14px;
    border: 1px solid #00796b;
    border-radius: 5px;
    outline: none;
  }
  
  select:focus, input:focus {
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
  
  .success-message a {
    color: white;
    text-decoration: underline;
    font-weight: bold;
  }
  </style>
  