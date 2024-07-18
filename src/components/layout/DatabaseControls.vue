<template>
  <div class="database-controls">
    <h3>Database Controls</h3>
    <div class="input-group">
      <label for="dbAddress">Database Address</label>
      <textarea
          id="dbAddress"
          v-model="localDbAddress"
          placeholder="Enter database address or create a new one"
          rows="3"
          class="input"
      ></textarea>
    </div>
    <div class="button-group">
      <BaseButton @click="handleConnectToDb" :disabled="!localDbAddress">
        Connect to DB
      </BaseButton>
      <BaseButton @click="createNewDb">
        Create New DB
      </BaseButton>
    </div>
    <p class="connection-status">
      Connected to database: {{ dbAddress }}
    </p>
  </div>
</template>

<script setup>
import {computed, ref, watch} from 'vue';
import { useChatStore } from '../../stores/chatStore.js';
import BaseButton from '../common/BaseButton.vue';

const chatStore = useChatStore();

const localDbAddress = ref(chatStore.dbAddress);
const dbAddress = computed(() => chatStore.dbAddress);

watch(() => chatStore.dbAddress, (newValue) => {
  localDbAddress.value = newValue;
});

const handleConnectToDb = () => {
  chatStore.connectToDb(localDbAddress.value);
};

const createNewDb = () => {
  chatStore.createNewDb();
};
</script>

<style scoped>
.database-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

h3 {
  color: var(--primary-color);
  margin-bottom: 10px;
}

.input-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 5px;
}

textarea {
  resize: vertical;
}

.button-group {
  display: flex;
  gap: 10px;
}

.connection-status {
  margin-top: 10px;
  font-style: italic;
}
</style>