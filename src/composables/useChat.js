import {onUnmounted, ref, watch} from 'vue'
import { useChatStore } from '../stores/chatStore'

export function useChat() {
    const chatStore = useChatStore()
    const newMessage = ref('')
    const chatError = ref('')

    watch(() => chatStore.currentDb, async (newDb) => {
        if (newDb) {
            await chatStore.refreshMessages()
            chatStore.startPolling()
        } else {
            chatStore.stopPolling()
        }
    })

    const sendMessage = async (user) => {
        if (!newMessage.value.trim()) return
        try {
            await chatStore.sendMessage(user, newMessage.value)
            newMessage.value = ''
            chatError.value = ''
        } catch (err) {
            chatError.value = 'Error sending message: ' + err.message
        }
    }

    const loadMoreMessages = async () => {
        try {
            await chatStore.loadMoreMessages()
        } catch (err) {
            chatError.value = 'Error loading messages: ' + err.message
        }
    }

    onUnmounted(() => {
        chatStore.cleanup()
    })
    return {
        newMessage,
        chatError,
        sendMessage,
        loadMoreMessages
    }
}