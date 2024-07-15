<template>
  <div class="chat-container">
    <ChatHeader />
    <ChatMessages />
    <MessageInput />
  </div>
</template>

<script setup>
import ChatHeader from './ChatHeader.vue';
import ChatMessages from './ChatMessages.vue';
import MessageInput from './MessageInput.vue';
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--chat-background);
}
</style>