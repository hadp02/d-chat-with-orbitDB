<template>
  <div class="app-container">
    <header>
      <div class="header-left">
        <button v-if="isLoggedIn" @click="toggleSidebar" class="toggle-sidebar-btn">
          ☰
        </button>
        <h1>OrbitDB Chat App</h1>
      </div>
      <p>Status: {{ chatStore.status }}</p>
    </header>

    <main>
      <template v-if="isLoggedIn">
        <Sidebar :isOpen="isSidebarOpen" @close="closeSidebar" />
        <ChatContainer />
      </template>
      <AuthForm v-else @auth-success="onAuthSuccess" />
    </main>

    <footer>
      <ErrorDisplay :error="chatStore.error" />
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from './stores/userStore'
import { useChatStore } from './stores/chatStore'
import AuthForm from './components/auth/AuthForm.vue'
import ChatContainer from './components/chat/ChatContainer.vue'
import ErrorDisplay from './components/common/ErrorDisplay.vue'
import Sidebar from './components/Sidebar.vue'

const chatStore = useChatStore()
const userStore = useUserStore()

const isLoggedIn = computed(() => !!userStore.currentUsername)
const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const onAuthSuccess = () => {
  // This function will be called when authentication is successful
  console.log('Authentication successful')
}

onMounted(async () => {
  await chatStore.initOrbitDB()
  userStore.setUserDb(chatStore.userDb)
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

header {
  background-color: var(--primary-color);
  color: var(--white);
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.toggle-sidebar-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  margin-right: 15px;
  color: var(--white);
}

h1 {
  margin: 0;
  font-size: 1.5em;
}

.main-content {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
  position: relative;
}

main {
  flex-grow: 1;
  overflow-y: auto;
}

footer {
  background-color: var(--light-gray);
  padding: 10px;
  text-align: center;
}
</style>