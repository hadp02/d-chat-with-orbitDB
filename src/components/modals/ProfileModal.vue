<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h2>Manage Profile</h2>
      <div class="avatar-section">
        <img :src="avatar" alt="User Avatar" class="avatar" />
      </div>
      <form @submit.prevent="updateProfile">
        <div class="form-group">
          <label for="name">Name</label>
          <input id="name" v-model="name" type="text" />
        </div>
        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" v-model="status">
            <option value="online">Online</option>
            <option value="away">Away</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        <div class="button-group">
          <button type="submit" class="btn btn-primary">Save Changes</button>
          <button type="button" @click="$emit('close')" class="btn btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../../stores/userStore'

const emit = defineEmits(['close'])
const userStore = useUserStore()

const name = ref('')
const status = ref('')
const avatar = computed(() => `https://api.dicebear.com/6.x/initials/svg?seed=${name.value || userStore.currentUsername}`)

onMounted(() => {
  name.value = userStore.userProfile.name || userStore.currentUsername
  status.value = userStore.userProfile.status
})

const updateProfile = async () => {
  try {
    const updatedProfile = {
      name: name.value || undefined,
      status: status.value || undefined,
    }
    await userStore.updateProfile(updatedProfile)
    emit('close')
  } catch (error) {
    console.error('Failed to update profile:', error)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  max-width: 90%;
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input, select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-secondary {
  background-color: #ccc;
  color: black;
}
</style>