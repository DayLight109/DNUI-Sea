# 北极海冰监测与分析系统 (SASI)

## 项目简介

北极海冰监测与分析系统(SASI)是一个用于监测、分析和预测北极海冰变化的综合平台。系统基于Vue.js和Electron开发，提供海冰密度监测、数据分析、趋势预测等功能。

## 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 启动Electron应用（开发模式）
npm run start:electron

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 打包应用

本项目使用Electron Forge进行打包，支持Windows、macOS和Linux平台。

```bash
# 打包应用
npm run package

# 创建安装包
npm run make

# 发布应用
npm run publish
```

## 功能模块

- 实时监测：显示北极海冰密度、覆盖面积等实时数据
- 数据分析：提供海冰数据的多维度分析功能
- 趋势预测：基于历史数据预测海冰变化趋势
- 报告生成：自动生成分析报告