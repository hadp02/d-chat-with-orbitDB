<template>
  <div class="message-input">
    <textarea
        v-model="message"
        @keyup.enter.prevent="sendMessage"
        placeholder="Type a message..."
        rows="3"
        class="input"
    ></textarea>
    <BaseButton @click="sendMessage" :disabled="!message.trim()">
      Send
    </BaseButton>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useChatStore } from '../../stores/chatStore';
import { useUserStore } from '../../stores/userStore';
import BaseButton from '../common/BaseButton.vue';

const chatStore = useChatStore();
const userStore = useUserStore();
const message = ref('');

const sendMessage = () => {
  if (message.value.trim()) {
    chatStore.sendNewMessage(userStore.currentUsername, message.value);
    message.value = '';
  }
};
</script>

<style scoped>
.message-input {
  display: flex;
  padding: 1rem;
  background-color: var(--input-background);
  border-top: 1px solid var(--border-color);
}

.message-input textarea {
  flex-grow: 1;
  margin-right: 1rem;
  resize: none;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 0.5rem;
}

.message-input textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}
</style>