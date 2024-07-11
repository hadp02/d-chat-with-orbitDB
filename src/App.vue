<script setup>
import bcrypt from 'bcryptjs'
import { ref, onMounted, onUnmounted } from 'vue'
import { startOrbitDB } from './services/ipfsService'
import { openDatabase, connectToDatabase } from './services/orbitdbService'

const dbAddress = ref('/orbitdb/zdpuAyAuYSr7cGCRDHGDdMysss4Dzf4NVczTZZcw9jDNFyiue')
const error = ref('')
const status = ref('Initializing...')
const orbitdb = ref(null)
const currentDb = ref(null)
const messages = ref([])
const newMessage = ref('')
const pollingInterval = ref(null)
const username = ref('')
const password = ref('')
const currentUser = ref(null)
const userDb = ref(null)
const saltRounds = 10

onMounted(async () => {
  try {
    status.value = 'Initializing IPFS...'
    orbitdb.value = await startOrbitDB()
    await connectToUserDb()
    currentDb.value = await connectToDatabase(orbitdb.value, dbAddress.value)
    await loadMessages()
    setupMessageListeners()
    status.value = 'OrbitDB initialized and Connected to Default dbAddress. You can create a new DB or connect to an existing one.'
  } catch (err) {
    console.error('Error:', err)
    error.value = err.message
    status.value = 'Error occurred during initialization'
  }
})

const createNewDb = async () => {
  try {
    status.value = 'Creating new database...'
    const newDbName = 'db-' + Date.now()
    currentDb.value = await openDatabase(orbitdb.value, newDbName)
    dbAddress.value = currentDb.value.address.toString()
    status.value = 'New database created and connected'
    await loadMessages()
    setupMessageListeners()
  } catch (err) {
    console.error('Error creating new database:', err)
    error.value = 'Error creating new database: ' + err.message
    status.value = 'Error occurred'
  }
}

const connectToDb = async () => {
  if (!dbAddress.value) {
    error.value = 'Please enter a database address'
    return
  }
  try {
    status.value = 'Connecting to database...'
    currentDb.value = await connectToDatabase(orbitdb.value, dbAddress.value)
    status.value = 'Connected to database'
    console.log('Connected to database:', currentDb.value.address.toString())
    await loadMessages()  // Load messages after connecting
    setupMessageListeners()
  } catch (err) {
    console.error('Error connecting to database:', err)
    error.value = 'Error connecting to database: ' + err.message
    status.value = 'Error occurred'
  }
}

const loadMessages = async () => {
  try {
    const allMessages = await currentDb.value.all()
    messages.value = Object.entries(allMessages)
        .map(([key, value]) => {
          let parsedValue = value || {};
          let user = 'Unknown';
          let content = '';
          try {
            if (typeof parsedValue.value === 'string') {
              const innerValue = JSON.parse(parsedValue.value);
              if (innerValue && typeof innerValue === 'object') {
                user = innerValue.user || 'Unknown';
                content = innerValue.content || '';
              } else {
                content = parsedValue.value;
              }
            } else {
              content = parsedValue.value || '';
            }
          } catch (e) {
            console.error('Error parsing message:', e);
            content = parsedValue.value || '';
          }
          return {
            key,
            user,
            content,
            timestamp: parsedValue.key || key,
            hash: parsedValue.hash || ''
          };
        })
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  } catch (err) {
    console.error('Error loading messages:', err)
    error.value = 'Error loading messages: ' + err.message
    messages.value = []
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) return
  try {
    status.value = 'Sending message...'
    const timestamp = new Date().toISOString()
    const messageData = {
      user: currentUser.value || 'Anonymous',
      content: newMessage.value
    }
    await currentDb.value.put(timestamp, JSON.stringify(messageData))
    newMessage.value = ''
    await loadMessages()
    status.value = 'Message sent'
  } catch (err) {
    console.error('Error sending message:', err)
    error.value = 'Error sending message: ' + err.message
    status.value = 'Error occurred'
  }
}

const setupMessageListeners = () => {
  if (currentDb.value) {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
    }

    pollingInterval.value = setInterval(async () => {
      console.log('Checking for updates...')
      await loadMessages()
    }, 2000)

    currentDb.value.events.removeAllListeners('update')
    currentDb.value.events.on('update', async () => {
      console.log('Database updated event triggered, reloading messages')
      await loadMessages()
    })
  }
}

const connectToUserDb = async () => {
  try {
    userDb.value = await openDatabase(orbitdb.value, 'user-db')
    console.log('Connected to user database')
  } catch (err) {
    console.error('Error connecting to user database:', err)
    error.value = 'Error connecting to user database: ' + err.message
  }
}

const register = async () => {
  if (!username.value || !password.value) {
    error.value = 'Username and password are required'
    return
  }
  try {
    const existingUser = await userDb.value.get(username.value)
    if (existingUser) {
      error.value = 'Username already exists'
      return
    }
    const hashedPassword = await bcrypt.hash(password.value, saltRounds)
    await userDb.value.put(username.value, { password: hashedPassword })
    currentUser.value = username.value
    error.value = ''
    username.value = ''
    password.value = ''
  } catch (err) {
    console.error('Error registering user:', err)
    error.value = 'Error registering user: ' + err.message
  }
}

const login = async () => {
  if (!username.value || !password.value) {
    error.value = 'Username and password are required'
    return
  }
  try {
    const user = await userDb.value.get(username.value)
    if (!user) {
      error.value = 'Invalid username or password'
      return
    }
    const isMatch = await bcrypt.compare(password.value, user.password)
    if (!isMatch) {
      error.value = 'Invalid username or password'
      return
    }
    currentUser.value = username.value
    error.value = ''
    username.value = ''
    password.value = ''
  } catch (err) {
    console.error('Error logging in:', err)
    error.value = 'Error logging in: ' + err.message
  }
}

const logout = () => {
  currentUser.value = null
}



onUnmounted(() => {
  if (currentDb.value) {
    currentDb.value.events.removeAllListeners('update')
  }
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
  }
})
</script>

<template>
  <div>
    <h1>OrbitDB Chat App</h1>
    <p>Status: {{ status }}</p>

    <div v-if="!currentUser">
      <h2>Login or Register</h2>
      <input v-model="username" placeholder="Username">
      <input v-model="password" type="password" placeholder="Password">
      <button @click="login">Login</button>
      <button @click="register">Register</button>
    </div>

    <div v-else>
      <p>Logged in as: {{ currentUser }}</p>
      <button @click="logout">Logout</button>
    </div>

    <textarea
        v-model="dbAddress"
        placeholder="Enter database address or create a new one"
        rows="3"
        style="width: 100%; max-width: 600px;"
    ></textarea>
    <br>
    <button @click="connectToDb" :disabled="!dbAddress">Connect to DB</button>
    <button @click="createNewDb">Create New DB</button>
    <p v-if="error" style="color: red;">Error: {{ error }}</p>

    <div v-if="currentDb" class="chat-box">
      <div v-if="messages && messages.length > 0">
        <div v-for="message in messages" :key="message.timestamp" class="message">
          <span>{{ new Date(message.timestamp).toLocaleString() }} - {{ message.user || 'Unknown' }}: </span>
          {{ message.content }}
        </div>
      </div>
      <div v-else>No messages yet.</div>
    </div>

    <div v-if="currentDb && currentUser" class="input-area">
      <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message...">
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<style scoped>
div {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
}

textarea {
  margin-bottom: 10px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
}

.chat-box {
  height: 300px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
}

.message {
  margin-bottom: 5px;
}

.input-area {
  display: flex;
}

.input-area input {
  flex-grow: 1;
  margin-right: 10px;
}
</style>