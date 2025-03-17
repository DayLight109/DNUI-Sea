import { createApp } from 'vue';
import App from './App.vue';  // 引入主应用组件
import router from './router'; // 引入路由配置
import '@fortawesome/fontawesome-free/css/all.min.css'

// 创建Vue应用实例
const app = createApp(App);

// 使用路由插件
app.use(router);

// 将应用挂载到DOM元素
app.mount('#app');
