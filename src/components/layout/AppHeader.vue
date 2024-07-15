<template>
  <header class="app-header">
    <div class="header-left">
      <button v-if="isLoggedIn" @click="toggleSidebar" class="toggle-sidebar-btn">
        ☰
      </button>
      <h1>OrbitDB Chat App</h1>
    </div>
    <p>Status: {{ chatStore.status }}</p>
  </header>
</template>

<script setup>
import { useUserStore } from '../../stores/userStore'
import { useChatStore } from '../../stores/chatStore'
import {computed} from "vue";

const props = defineProps(['toggleSidebar'])
const userStore = useUserStore()
const chatStore = useChatStore()

const isLoggedIn = computed(() => !!userStore.currentUsername)
</script>