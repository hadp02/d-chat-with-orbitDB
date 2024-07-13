import { defineStore } from 'pinia'
import { useOrbitDB } from '../composables/useOrbitDB'

export const useChatStore = defineStore('chat', () => {
    const {
        dbAddress,
        status,
        error,
        messages,
        currentDb,
        userDb,
        initOrbitDB,
        createNewDb,
        connectToDb,
        refreshMessages,
        sendNewMessage
    } = useOrbitDB()

    return {
        dbAddress,
        status,
        error,
        messages,
        currentDb,
        userDb,
        initOrbitDB,
        createNewDb,
        connectToDb,
        refreshMessages,
        sendNewMessage
    }
})