<template>
  <div class="message" :class="{ 'own-message': isOwnMessage }" @click="toggleTimestamp">
    <div class="avatar">
      <img :src="avatarUrl" :alt="displayName" />
    </div>
    <div class="message-bubble">
      <div class="username" v-if="!isOwnMessage">{{ displayName }}</div>
      <div class="message-content">{{ message.content }}</div>
      <div class="timestamp" v-if="showTimestamp">
        {{ formatDateTime(message.timestamp) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useUserStore } from '../../stores/userStore'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const userStore = useUserStore()
const isOwnMessage = computed(() => props.message.user === userStore.currentUsername)
const showTimestamp = ref(false)
const displayName = ref(props.message.user)
const avatarUrl = ref(`https://api.dicebear.com/6.x/initials/svg?seed=${props.message.user}`)

const toggleTimestamp = () => {
  showTimestamp.value = !showTimestamp.value
}

const formatDateTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  const userProfile = await userStore.getUserProfile(props.message.user)
  if (userProfile) {
    displayName.value = userProfile.name || props.message.user
    avatarUrl.value = `https://api.dicebear.com/6.x/initials/svg?seed=${displayName.value}`
  }
})
</script>


<style scoped>
.message {
  display: flex;
  margin-bottom: 10px;
  align-items: flex-start;
}

.own-message {
  flex-direction: row-reverse;
}

.avatar {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.own-message .avatar {
  margin-right: 0;
  margin-left: 10px;
}

.avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.message-bubble {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 18px;
  background-color: var(--light-gray);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.own-message .message-bubble {
  background-color: var(--primary-light);
  color: var(--white);
}

.username {
  font-weight: bold;
  font-size: 0.9em;
  margin-bottom: 5px;
  color: var(--primary-dark);
}

.message-content {
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.4;
}

.timestamp {
  font-size: 0.75em;
  color: var(--gray);
  margin-top: 5px;
}

.own-message .timestamp {
  color: var(--light-gray);
}
</style>
