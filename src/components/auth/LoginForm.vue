<template>
  <form @submit.prevent="handleSubmit" class="login-form">
    <h2>Login</h2>
    <BaseInput
        v-model="username"
        label="Username"
        type="text"
        required
    />
    <BaseInput
        v-model="password"
        label="Password"
        type="password"
        required
    />
    <BaseButton type="submit" :loading="isLoading">
      Login
    </BaseButton>
    <p class="switch-mode">
      Don't have an account?
      <a href="#" @click.prevent="$emit('switch-mode')">Register</a>
    </p>
    <p v-if="error" class="error-message">{{ error }}</p>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '../../composables/useAuth';
import BaseInput from '../common/BaseInput.vue';
import BaseButton from '../common/BaseButton.vue';

const { login, error, isLoading } = useAuth();

const username = ref('');
const password = ref('');

const handleSubmit = async () => {
  await login(username.value, password.value);
};

defineEmits(['switch-mode']);
</script>


<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

h2 {
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 20px;
}

.switch-mode {
  margin-top: 15px;
  text-align: center;
}

.error-message {
  color: red;
  margin-top: 10px;
}

a {
  color: var(--primary-color);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>