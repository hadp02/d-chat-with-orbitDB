import { ref, onUnmounted } from 'vue'
import { startOrbitDB } from '../services/ipfsService'
import { openDatabase, connectToDatabase, loadMessages, sendMessage } from '../services/orbitdbService'

export function useOrbitDB() {
    const orbitdb = ref(null)
    const currentDb = ref(null)
    const userDb = ref(null)
    const dbAddress = ref('/orbitdb/zdpuApB2Tnkz9y28HBmeMgqYHBKKxGVPVH8cKRDYpmLGoQHqm')
    const status = ref('Initializing...')
    const error = ref('')
    const messages = ref([])
    let pollingInterval = null

    const initOrbitDB = async () => {
        try {
            status.value = 'Initializing IPFS...'
            orbitdb.value = await startOrbitDB()
            await connectToUserDb()
            await connectToMainDb()
            status.value = 'OrbitDB initialized and Connected to Default dbAddress. You can create a new DB or connect to an existing one.'
        } catch (err) {
            handleError('Error during initialization:', err)
        }
    }

    const connectToUserDb = async () => {
        try {
            userDb.value = await openDatabase(orbitdb.value, 'user-db')
            console.log('Connected to user database')
        } catch (err) {
            handleError('Error connecting to user database:', err)
        }
    }

    const connectToMainDb = async () => {
        try {
            currentDb.value = await connectToDatabase(orbitdb.value, dbAddress.value)
            await refreshMessages()
            setupMessageListeners()
        } catch (err) {
            handleError('Error connecting to main database:', err)
        }
    }

    const createNewDb = async () => {
        try {
            status.value = 'Creating new database...'
            const newDbName = 'db-' + Date.now()
            currentDb.value = await openDatabase(orbitdb.value, newDbName)
            dbAddress.value = currentDb.value.address.toString()
            status.value = 'New database created and connected'
            await refreshMessages()
            setupMessageListeners()
        } catch (err) {
            handleError('Error creating new database:', err)
        }
    }

    const connectToDb = async (address) => {
        if (!address) {
            error.value = 'Please enter a database address'
            return
        }
        try {
            status.value = 'Connecting to database...'
            currentDb.value = await connectToDatabase(orbitdb.value, address)
            dbAddress.value = address
            status.value = 'Connected to database'
            console.log('Connected to database:', currentDb.value.address.toString())
            await refreshMessages()
            setupMessageListeners()
        } catch (err) {
            handleError('Error connecting to database:', err)
        }
    }

    const refreshMessages = async () => {
        try {
            messages.value = await loadMessages(currentDb.value)
        } catch (err) {
            handleError('Error loading messages:', err)
            messages.value = []
        }
    }

    const sendNewMessage = async (user, content) => {
        if (!content.trim()) return
        try {
            status.value = 'Sending message...'
            await sendMessage(currentDb.value, user, content)
            await refreshMessages()
            status.value = 'Message sent'
        } catch (err) {
            handleError('Error sending message:', err)
        }
    }

    const handleError = (message, err) => {
        console.error(message, err)
        error.value = `${message} ${err.message}`
        status.value = 'Error occurred'
    }

    const setupMessageListeners = () => {
        if (currentDb.value) {
            if (pollingInterval) {
                clearInterval(pollingInterval)
            }
            pollingInterval = setInterval(async () => {
                console.log('Checking for updates...')
                await refreshMessages()
            }, 2000)

            currentDb.value.events.removeAllListeners('update')
            currentDb.value.events.on('update', async () => {
                console.log('Database updated event triggered, reloading messages')
                await refreshMessages()
            })
        }
    }

    onUnmounted(() => {
        if (pollingInterval) {
            clearInterval(pollingInterval)
        }
        if (currentDb.value) {
            currentDb.value.events.removeAllListeners('update')
        }
    })

    return {
        orbitdb,
        currentDb,
        userDb,
        dbAddress,
        status,
        error,
        messages,
        initOrbitDB,
        createNewDb,
        connectToDb,
        refreshMessages,
        sendNewMessage
    }
}