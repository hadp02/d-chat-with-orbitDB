<template>
  <div class="user-info">
    <p>Logged in as: {{ userStore.currentUser }}</p>
    <button @click="userStore.logout">Logout</button>
  </div>
</template>

<script setup>
import { useUserStore } from '../../stores/userStore.js'

const userStore = useUserStore()
</script>