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
    background: rgba(25, 41, 88, 0.8);
    border-radius: 10px;
    border: 1px solid rgba(161, 196, 253, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    font-size: 24px;
    font-weight: 500;
    color: #e3f2fd;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .description {
    font-size: 16px;
    color: #90caf9;
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
    color: #a1c4fd;
  }
  
  select, input {
    padding: 10px;
    font-size: 14px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(161, 196, 253, 0.3);
    border-radius: 6px;
    outline: none;
    color: #e3f2fd;
  }
  
  select:focus, input:focus {
    border-color: #64b5f6;
    box-shadow: 0 0 0 2px rgba(84, 114, 211, 0.2);
  }
  
  button.submit-btn {
    padding: 12px 20px;
    font-size: 16px;
    color: #e3f2fd;
    background: rgba(84, 114, 211, 0.2);
    border: 1px solid rgba(161, 196, 253, 0.3);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  button.submit-btn:hover {
    background: rgba(84, 114, 211, 0.3);
    transform: translateY(-2px);
    border-color: rgba(161, 196, 253, 0.5);
  }
  
  .success-message {
    margin-top: 20px;
    padding: 16px;
    background: rgba(84, 114, 211, 0.2);
    color: #e3f2fd;
    border-radius: 6px;
    font-size: 16px;
    border: 1px solid rgba(161, 196, 253, 0.3);
  }
  
  .success-message a {
    color: #64b5f6;
    text-decoration: underline;
    font-weight: 500;
    transition: color 0.3s;
  }
  
  .success-message a:hover {
    color: #90caf9;
  }
  </style>
  