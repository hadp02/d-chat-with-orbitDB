import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import ipfsService from '../services/ipfsService'
import orbitDBService from '../services/orbitdbService'

export const useChatStore = defineStore('chat', () => {
    const dbAddress = ref('/orbitdb/zdpuApB2Tnkz9y28HBmeMgqYHBKKxGVPVH8cKRDYpmLGoQHqm')
    const status = ref('Initializing...')
    const error = ref('')
    const messages = ref([])
    const currentDb = ref(null)
    const userDb = ref(null)
    const lastLoadedTimestamp = ref(null)

    const isInitialized = computed(() => currentDb.value !== null)
    let messageListener = null
    let pollingInterval = null

    const startPolling = () => {
        if (!pollingInterval) {
            pollingInterval = setInterval(async () => {
                await refreshMessages()
            }, 5000) // Poll every 5 seconds
        }
    }

    const stopPolling = () => {
        if (pollingInterval) {
            clearInterval(pollingInterval)
            pollingInterval = null
        }
    }


    async function initOrbitDB() {
        try {
            status.value = 'Initializing IPFS...'
            const orbitdb = await ipfsService.initOrbitDB()
            orbitDBService.setOrbitDB(orbitdb)
            await connectToUserDb()
            await connectToMainDb()
            status.value = 'OrbitDB initialized and Connected to Default dbAddress. You can create a new DB or connect to an existing one.'
        } catch (err) {
            handleError('Error during initialization:', err)
        }
    }

    async function connectToUserDb() {
        try {
            userDb.value = await orbitDBService.openDatabase('user-db')
            console.log('Connected to user database')
        } catch (err) {
            handleError('Error connecting to user database:', err)
        }
    }

    async function connectToMainDb() {
        try {
            currentDb.value = await orbitDBService.connectToDatabase(dbAddress.value)
            currentDb.value.events.on("update", async entry => {
                await refreshMessages()
                console.log("Event catch success")
            })
            startPolling()
            await refreshMessages()
        } catch (err) {
            handleError('Error connecting to main database:', err)
        }
    }

    async function createNewDb() {
        try {
            status.value = 'Creating new database...'
            const newDbName = 'db-' + Date.now()
            currentDb.value = await orbitDBService.openDatabase(newDbName)
            dbAddress.value = currentDb.value.address.toString()
            status.value = 'New database created and connected'
            await refreshMessages()
        } catch (err) {
            handleError('Error creating new database:', err)
        }
    }

    async function connectToDb(address) {
        if (!address) {
            error.value = 'Please enter a database address'
            return
        }
        try {
            status.value = 'Connecting to database...'
            currentDb.value = await orbitDBService.connectToDatabase(address)
            dbAddress.value = address
            status.value = 'Connected to database'
            console.log('Connected to database:', currentDb.value.address.toString())
            await refreshMessages()
        } catch (err) {
            handleError('Error connecting to database:', err)
        }
    }



    async function loadMoreMessages() {
        if (!currentDb.value) return

        try {
            const olderMessages = await orbitDBService.loadMessagesBeforeTimestamp(currentDb.value, lastLoadedTimestamp.value)
            if (olderMessages.length > 0) {
                messages.value = [...olderMessages, ...messages.value]
                lastLoadedTimestamp.value = olderMessages[0].timestamp
            }
        } catch (err) {
            handleError('Error loading more messages:', err)
        }
    }

    async function refreshMessages() {
        try {
            const fetchedMessages = await orbitDBService.loadMessages(currentDb.value)
            // Only update if there are new messages
            if (fetchedMessages.length > messages.value.length) {
                messages.value = fetchedMessages
            }
        } catch (err) {
            handleError('Error loading messages:', err)
            messages.value = []
        }
    }

    function cleanup() {
        stopPolling()
    }

    async function sendNewMessage(user, content) {
        if (!content.trim()) return
        try {
            status.value = 'Sending message...'
            await orbitDBService.sendMessage(currentDb.value, user, content)
            await refreshMessages()
            status.value = 'Message sent'
        } catch (err) {
            handleError('Error sending message:', err)
        }
    }

    function handleError(message, err) {
        console.error(message, err)
        error.value = `${message} ${err.message}`
        status.value = 'Error occurred'
    }

    return {
        dbAddress,
        status,
        error,
        messages,
        currentDb,
        userDb,
        isInitialized,
        initOrbitDB,
        createNewDb,
        connectToDb,
        refreshMessages,
        sendNewMessage,
        loadMoreMessages,
        startPolling,
        stopPolling,
        cleanup
    }
})