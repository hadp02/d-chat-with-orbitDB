<template>
  <form @submit.prevent="handleSubmit" class="register-form">
    <h2>Register</h2>
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
    <BaseInput
        v-model="confirmPassword"
        label="Confirm Password"
        type="password"
        required
    />
    <BaseButton type="submit" :loading="isLoading">
      Register
    </BaseButton>
    <p class="switch-mode">
      Already have an account?
      <a href="#" @click.prevent="$emit('switch-mode')">Login</a>
    </p>
    <p v-if="error" class="error-message">{{ error }}</p>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuth } from '../../composables/useAuth';
import BaseInput from '../common/BaseInput.vue';
import BaseButton from '../common/BaseButton.vue';

const { register, error, isLoading } = useAuth();

const username = ref('');
const password = ref('');
const confirmPassword = ref('');

const localError = computed(() => {
  if (password.value !== confirmPassword.value) {
    return "Passwords don't match";
  }
  return null;
});

const handleSubmit = async () => {
  if (localError.value) {
    return;
  }
  await register(username.value, password.value);
};

defineEmits(['switch-mode']);
</script>

<style scoped>
.register-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.error-message {
  color: red;
  margin-top: 10px;
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

a {
  color: var(--primary-color);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>