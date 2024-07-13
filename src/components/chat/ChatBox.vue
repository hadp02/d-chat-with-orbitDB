<template>
  <div class="chat-box" ref="chatBoxRef" @scroll="handleScroll">
    <div class="messages" ref="messagesContainer">
      <MessageItem
          v-for="message in chatStore.messages"
          :key="message.timestamp"
          :message="message"
      />
    </div>
    <button
        v-if="showScrollButton"
        @click="scrollToBottom"
        class="scroll-to-bottom-button"
    >
      New Messages
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useChatStore } from '../../stores/chatStore'
import MessageItem from './MessageItem.vue'

const chatStore = useChatStore()
const messagesContainer = ref(null)
const chatBoxRef = ref(null)
const showScrollButton = ref(false)
const isScrolledToBottom = ref(true)

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    showScrollButton.value = false
    isScrolledToBottom.value = true
  }
}

const handleScroll = () => {
  if (chatBoxRef.value) {
    const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.value
    isScrolledToBottom.value = scrollHeight - scrollTop - clientHeight < 1
    showScrollButton.value = !isScrolledToBottom.value
  }
}

onMounted(() => {
  scrollToBottom()
})

watch(() => chatStore.messages, (newMessages, oldMessages) => {
  if (newMessages.length > oldMessages.length) {
    nextTick(() => {
      if (isScrolledToBottom.value) {
        scrollToBottom()
      } else {
        showScrollButton.value = true
      }
    })
  }
}, { deep: true })
</script>

<style scoped>
.chat-box {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: var(--white);
  position: relative;
}

.messages {
  display: flex;
  flex-direction: column;
}

.scroll-to-bottom-button {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.scroll-to-bottom-button:hover {
  opacity: 1;
}
</style>