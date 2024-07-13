<template>
  <div class="message-input">
    <textarea
        v-model="message"
        @keyup.enter="sendMessage"
        placeholder="Type a message..."
        rows="3"
        class="input"
    ></textarea>
    <button @click="sendMessage" :disabled="!message.trim()" class="btn btn-primary">Send</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useChatStore } from '../../stores/chatStore'
import { useUserStore } from '../../stores/userStore'

const chatStore = useChatStore()
const userStore = useUserStore()
const message = ref('')

const sendMessage = () => {
  if (message.value.trim()) {
    chatStore.sendNewMessage(userStore.currentUsername, message.value)
    message.value = ''
  }
}
</script>

<style scoped>
.message-input {
  display: flex;
  padding: 10px;
  background-color: var(--light-gray);
  border-top: 1px solid var(--gray);
}

.message-input textarea {
  flex-grow: 1;
  margin-right: 10px;
  resize: none;
}

.message-input button {
  align-self: flex-end;
}
</style>