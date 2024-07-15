<template>
  <div class="chat-messages-wrapper">
    <div class="chat-messages" ref="chatBoxRef" @scroll="handleScrollEvent">
      <div class="messages-container">
        <TransitionGroup name="message">
          <MessageItem
              v-for="message in chatStore.messages"
              :key="message.timestamp"
              :message="message"
          />
        </TransitionGroup>
      </div>
    </div>
    <transition name="fade">
      <div
          v-if="showScrollButton"
          @click="handleNewMessagesClick"
          class="new-messages-indicator"
      >
        <span class="new-messages-text">New Messages</span>
        <i class="fas fa-chevron-down"></i>
      </div>
    </transition>
  </div>
</template>

<script setup>
import {ref, onMounted, watch, computed, onUpdated} from 'vue'
import { useChatStore } from '../../stores/chatStore'
import { useUserStore } from '../../stores/userStore'
import MessageItem from './MessageItem.vue'
import { useScroll } from '../../composables/useScroll'

const chatStore = useChatStore()
const userStore = useUserStore()
const chatBoxRef = ref(null)

const {
  isScrolledToBottom,
  showScrollButton,
  isLoadingMore,
  scrollToBottom,
  handleScroll
} = useScroll(chatBoxRef, chatStore.loadMoreMessages)

const handleNewMessagesClick = () => {
  scrollToBottom(true)
}

onMounted(() => {
  scrollToBottom()
})

const handleScrollEvent = () => {
  handleScroll()
}

// Watch for new messages
watch(() => chatStore.messages, (newMessages, oldMessages) => {
  if (newMessages.length > oldMessages.length) {
    const lastMessage = newMessages[newMessages.length - 1]
    if (lastMessage.user === userStore.currentUsername || isScrolledToBottom.value) {
      scrollToBottom()
    } else {
      showScrollButton.value = true
    }
  }
}, { deep: true })

// Ensure scroll to bottom when component updates
onUpdated(() => {
  if (isScrolledToBottom.value) {
    scrollToBottom()
  }
})
</script>

<style scoped>
.chat-messages-wrapper {
  position: relative;
  height: 80%;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
}

.messages-container {
  display: flex;
  flex-direction: column;
}

.new-messages-indicator {
  position: absolute; /* Changed from fixed to absolute */
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--primary-color);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 10;
}

.new-messages-indicator:hover {
  background-color: var(--primary-color-dark);
}

.new-messages-text {
  margin-right: 8px;
  font-weight: bold;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>