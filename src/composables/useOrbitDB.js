import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '../stores/userStore'
import { useChatStore } from '../stores/chatStore'

export function useOrbitDB() {
    const userStore = useUserStore()
    const chatStore = useChatStore()
    const isInitialized = ref(false)
    const error = ref('')
    const dbAddress = ref('')
    const status = ref('Initializing...')

    let messageListener = null

    const initOrbitDB = async () => {
        try {
            status.value = 'Initializing IPFS...'
            await chatStore.initOrbitDB()
            status.value = 'OrbitDB initialized. You can create a new DB or connect to an existing one.'
            isInitialized.value = true
            setupMessageListener()
        } catch (err) {
            error.value = 'Error initializing OrbitDB: ' + err.message
            status.value = 'Error occurred'
        }
    }

    const connectToDb = async (address) => {
        if (!address) {
            error.value = 'Please enter a database address'
            return
        }
        try {
            status.value = 'Connecting to database...'
            await chatStore.connectToDb(address)
            dbAddress.value = address
            status.value = 'Connected to database'
            setupMessageListener()
        } catch (err) {
            error.value = 'Error connecting to database: ' + err.message
            status.value = 'Error occurred'
        }
    }

    const createNewDb = async () => {
        try {
            status.value = 'Creating new database...'
            const newDbAddress = await chatStore.createNewDb()
            dbAddress.value = newDbAddress
            status.value = 'New database created and connected'
            setupMessageListener()
        } catch (err) {
            error.value = 'Error creating new database: ' + err.message
            status.value = 'Error occurred'
        }
    }

    const setupMessageListener = () => {
        if (messageListener) {
            chatStore.removeListener('update', messageListener)
        }
        messageListener = (entry) => {
            chatStore.addMessage(entry)
        }
        chatStore.on('update', messageListener)
    }

    const sendMessage = async (content) => {
        try {
            status.value = 'Sending message...'
            await chatStore.sendMessage(userStore.currentUsername, content)
            status.value = 'Message sent'
        } catch (err) {
            error.value = 'Error sending message: ' + err.message
            status.value = 'Error occurred'
        }
    }

    const loadMoreMessages = async () => {
        try {
            status.value = 'Loading more messages...'
            await chatStore.loadMoreMessages()
            status.value = 'Messages loaded'
        } catch (err) {
            error.value = 'Error loading more messages: ' + err.message
            status.value = 'Error occurred'
        }
    }

    watch(() => chatStore.currentDb, (newDb) => {
        if (newDb) {
            setupMessageListener()
        }
    })

    onMounted(async () => {
        if (userStore.isLoggedIn) {
            await initOrbitDB()
        }
    })

    onUnmounted(() => {
        if (messageListener) {
            chatStore.removeListener('update', messageListener)
        }
        if (isInitialized.value) {
            chatStore.stopOrbitDB()
        }
    })

    return {
        isInitialized,
        error,
        dbAddress,
        status,
        initOrbitDB,
        connectToDb,
        createNewDb,
        sendMessage,
        loadMoreMessages
    }
}