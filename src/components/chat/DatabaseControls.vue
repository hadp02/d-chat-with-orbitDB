<template>
  <div class="database-controls">
    <textarea
        v-model="localDbAddress"
        placeholder="Enter database address or create a new one"
        rows="3"
    ></textarea>
    <button @click="handleConnectToDb" :disabled="!localDbAddress">Connect to DB</button>
    <button @click="chatStore.createNewDb">Create New DB</button>
    <p>Connected to database: {{ chatStore.dbAddress }}</p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useChatStore } from '../../stores/chatStore'

const chatStore = useChatStore()

const localDbAddress = ref(chatStore.dbAddress)

watch(() => chatStore.dbAddress, (newValue) => {
  localDbAddress.value = newValue
})

const handleConnectToDb = () => {
  chatStore.connectToDb(localDbAddress.value)
}
</script>