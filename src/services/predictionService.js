import apiClient from './api';

// 预测服务
export const predictionService = {
  // 获取海冰预测数据
  getPrediction: async (params) => {
    try {
      // 实际项目中应该调用后端API
      // const response = await apiClient.get('/prediction', { params });
      // return response.data;
      
      // 目前使用模拟数据
      await new Promise(resolve => setTimeout(resolve, 1500)); // 模拟API延迟
      
      // 根据区域和时间段生成不同的预测结果
      const { region, period } = params;
      
      // 不同区域的趋势
      let densityTrend, thicknessTrend, notes, recommendations;
      let accuracy = "89%";
      let temperatureCoefficient = "0.75";
      
      // 基于区域的预测
      switch (region) {
        case 'A':
          densityTrend = period === 'year' ? "逐渐下降" : "稳定";
          thicknessTrend = period === 'year' ? "缓慢减小" : "微小波动";
          temperatureCoefficient = "0.82";
          accuracy = "91%";
          notes = "A区域位于北极中心位置，海冰状态较为稳定，但长期来看有减小趋势";
          recommendations = [
            "建议增加A区域监测频率",
            "关注气温变化与海冰密度的相关性",
            "比对历史同期数据分析季节性变化"
          ];
          break;
        case 'B':
          densityTrend = "缓慢下降";
          thicknessTrend = "明显减小";
          temperatureCoefficient = "0.68";
          accuracy = "87%";
          notes = "B区域靠近暖流影响区，海冰密度和厚度均呈下降趋势，需重点关注";
          recommendations = [
            "增设B区域边缘监测点",
            "监控水下暖流活动",
            "评估气候变化对该区域的特殊影响"
          ];
          break;
        case 'C':
          densityTrend = period === 'week' ? "稳定" : "波动上升";
          thicknessTrend = "略有增加";
          temperatureCoefficient = "0.77";
          accuracy = "88%";
          notes = "C区域受季节性寒流影响，短期内海冰厚度有增加趋势";
          recommendations = [
            "跟踪C区域温度异常波动",
            "分析海冰结构变化特征",
            "建立C区域专项预警机制"
          ];
          break;
        default: // 全部区域
          densityTrend = "整体下降";
          thicknessTrend = "缓慢减小";
          temperatureCoefficient = "0.75";
          accuracy = "85%";
          notes = "综合分析显示，北极海冰整体呈减少趋势，其中B区域变化最为明显";
          recommendations = [
            "加强多区域协同监测",
            "整合卫星和实地数据进行综合分析",
            "建立跨区域变化模型"
          ];
      }
      
      // 基于预测周期的调整
      if (period === 'year') {
        accuracy = (parseFloat(accuracy) - 5) + "%"; // 长期预测准确率降低
        notes += "。长期预测受气候变化等因素影响较大，准确率相对较低。";
      } else if (period === 'week') {
        accuracy = (parseFloat(accuracy) + 3) + "%"; // 短期预测准确率提高
        notes += "。短期预测相对稳定，可信度较高。";
      }
      
      // 生成预测结果
      return {
        densityTrend,
        thicknessTrend,
        temperatureCoefficient,
        accuracy,
        notes,
        recommendations,
        chartData: null // 实际应用中这里应返回API的图表数据
      };
    } catch (error) {
      console.error('获取预测数据失败:', error);
      throw error;
    }
  }
}; 