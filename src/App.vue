<template>
  <!-- 渲染路由匹配的组件 -->
  <router-view></router-view>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isLoggedIn: false,  // 控制登录状态
    };
  },
  methods: {
    login() {
      this.isLoggedIn = true;
    },
    logout() {
      this.isLoggedIn = false;
    },
  },
};
</script>
