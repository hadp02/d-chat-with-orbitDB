<template>
  <footer class="app-footer">
    <ErrorDisplay :error="chatStore.error" />
  </footer>
</template>

<script setup>
import { useChatStore } from '../../stores/chatStore'
import ErrorDisplay from '../common/ErrorDisplay.vue'

const chatStore = useChatStore()
</script>