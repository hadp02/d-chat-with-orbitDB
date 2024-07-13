<template>
  <div class="auth-container">
    <div class="auth-form">
      <h2>{{ isLogin ? 'Login' : 'Register' }}</h2>
      <form @submit.prevent="handleSubmit">
        <input v-model="username" type="text" placeholder="Username" required>
        <input v-model="password" type="password" placeholder="Password" required>
        <button type="submit" :disabled="isLoading">
          {{ isLogin ? 'Login' : 'Register' }}
        </button>
      </form>
      <p v-if="error" class="error">{{ error }}</p>
      <p>
        {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
        <a href="#" @click.prevent="toggleAuthMode">
          {{ isLogin ? 'Register' : 'Login' }}
        </a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useUserStore } from '../../stores/userStore'

const emit = defineEmits(['auth-success'])

const userStore = useUserStore()
const isLogin = ref(true)
const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const toggleAuthMode = () => {
  isLogin.value = !isLogin.value
  username.value = ''
  password.value = ''
  error.value = ''
}

const handleSubmit = async () => {
  isLoading.value = true
  error.value = ''
  try {
    if (isLogin.value) {
      console.log('Attempting login with username:', username.value)
      await userStore.login(username.value, password.value)
      console.log('Login successful')
    } else {
      console.log('Attempting registration with username:', username.value)
      await userStore.register(username.value, password.value)
      console.log('Registration successful')
    }
    console.log('Current username after auth:', userStore.currentUsername)
    console.log('Current user profile after auth:', userStore.userProfile)

    emit('auth-success')
  } catch (err) {
    console.error('Auth error:', err)
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}

// Watch for changes in authentication state
watch(() => userStore.currentUsername, (newUsername) => {
  console.log('Auth state changed. Current username:', newUsername)
})
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: var(--light-gray);
}

.auth-form {
  background-color: var(--white);
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  margin-bottom: 20px;
  color: var(--primary-color);
}

form {
  display: flex;
  flex-direction: column;
}

input {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid var(--gray);
  border-radius: 4px;
}

button {
  padding: 10px;
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: var(--primary-dark);
}

button:disabled {
  background-color: var(--gray);
  cursor: not-allowed;
}

.error {
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