<template>
  <header class="chat-header">
    <h2>{{ chatStore.currentDb ? chatStore.currentDb.address : 'No database connected' }}</h2>
    <p>{{ chatStore.status }}</p>
  </header>
</template>

<script setup>
import { useChatStore } from '../../stores/chatStore';

const chatStore = useChatStore();
</script>

<style scoped>
.chat-header {
  padding: 1rem;
  background-color: var(--header-background);
  color: var(--header-text);
  border-bottom: 1px solid var(--border-color);
}

h2 {
  margin: 0;
  font-size: 1.2rem;
}

p {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  opacity: 0.8;
}
</style>