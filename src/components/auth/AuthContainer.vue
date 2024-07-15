<template>
  <div class="auth-container">
    <LoginForm v-if="isLogin" @switch-mode="toggleAuthMode" />
    <RegisterForm v-else @switch-mode="toggleAuthMode" />
  </div>
</template>

<script setup>
import {ref} from 'vue';
import LoginForm from './LoginForm.vue';
import RegisterForm from './RegisterForm.vue';

const isLogin = ref(true);

const toggleAuthMode = () => {
  isLogin.value = !isLogin.value;
};
</script>