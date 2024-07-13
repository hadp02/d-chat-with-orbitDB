import { ref, watch } from 'vue'
import { useChatStore } from '../stores/chatStore'

export function useChat() {
    const chatStore = useChatStore()
    const newMessage = ref('')
    const chatError = ref('')

    watch(() => chatStore.currentDb, async (newDb) => {
        if (newDb) {
            await chatStore.loadMessages()
        }
    })

    const sendMessage = async (user) => {
        if (!newMessage.value.trim()) return
        try {
            await chatStore.sendMessage(user, newMessage.value)
            newMessage.value = ''
            chatError.value = ''
        } catch (err) {
            console.error('Error sending message:', err)
            chatError.value = 'Error sending message: ' + err.message
        }
    }

    return {
        newMessage,
        chatError,
        sendMessage
    }
}