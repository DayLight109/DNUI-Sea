import { createRouter, createWebHistory } from 'vue-router';
import OceanLogin from '../components/OceanLogin.vue'; // 登录页面组件
import Register from '../components/Register.vue'; // 注册页面组件
import Mainboard from '../components/Mainboard.vue'; // Mainboard 页面

const routes = [
  {
    path: '/',
    name: 'OceanLogin',
    component: OceanLogin,
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
  {
    path: '/mainboard',  // 添加 Mainboard 页面路由
    name: 'Mainboard',
    component: Mainboard,
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// 路由守卫，确保只有登录后才能访问 Mainboard 页面
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.name === 'Mainboard' && !token) {
    // 如果用户未登录且访问 Mainboard，重定向到登录页面
    next({ name: 'OceanLogin' });
  } else {
    next(); // 继续访问
  }
});

export default router;
