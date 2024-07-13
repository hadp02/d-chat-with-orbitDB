<template>
  <div class="chat-container">
    <ChatBox />
    <MessageInput />
  </div>
</template>

<script setup>
import ChatBox from './ChatBox.vue'
import MessageInput from './MessageInput.vue'
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>