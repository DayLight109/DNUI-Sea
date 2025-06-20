// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

// 导入组件
import OceanLogin from '../components/OceanLogin.vue';
import Register from '../components/Register.vue';
import Mainboard from '../components/Mainboard.vue';
import Analysis from '../components/Analysis.vue';
import DataEntry from '../components/DataEntry.vue';
import Overview from '../components/Overview.vue';
import Reports from '../components/Reports.vue';
import Monitor from '../components/Monitor.vue';  // 添加实时监测组件的导入 //25.1.14
import DBMN from '../components/DBMN.vue';
import IcePrediction from '../components/IcePrediction.vue';  // 新增预测组件
import ArcticMap from '../components/ArcticMap.vue';  // 新增地图组件

const routes = [
  {
    path: '/',
    name: 'Login',
    component: OceanLogin,
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guest: true }
  },
  {
    path: '/mainboard',
    name: 'Mainboard',
    component: Mainboard,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/mainboard/overview'
      },
      {
        path: 'overview',
        name: 'Overview',
        component: Overview
      },
      {
        path: 'monitor',  // 添加实时监测路由//25.1.14
        name: 'Monitor',
        component: Monitor
      },
      {
        path: 'data',
        name: 'Data',
        component: DBMN
      },
      {
        path: 'analysis',
        name: 'Analysis',
        component: Analysis
      },
      {
        path: 'data-entry',
        name: 'DataEntry',
        component: DataEntry
      },
      {
        path: 'reports',
        name: 'Reports',
        component: Reports
      },
      {
        path: 'prediction',  // 新增预测路由
        name: 'Prediction',
        component: IcePrediction
      },
      {
        path: 'map',  // 新增地图路由
        name: 'ArcticMap',
        component: ArcticMap
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  // 已登录用户访问登录/注册页面，重定向到主页
  if (token && to.meta.guest) {
    return next('/mainboard');
  }
  
  // 未登录用户访问需要认证的页面，重定向到登录页
  if (!token && to.meta.requiresAuth) {
    return next({
      path: '/',
      query: { redirect: to.fullPath }
    });
  }
  
  next();
});

export default router;