<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h2>Change Password</h2>
      <form @submit.prevent="changePassword">
        <div class="form-group">
          <label for="oldPassword">Old Password</label>
          <input id="oldPassword" v-model="oldPassword" type="password" required />
        </div>
        <div class="form-group">
          <label for="newPassword">New Password</label>
          <input id="newPassword" v-model="newPassword" type="password" required />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm New Password</label>
          <input id="confirmPassword" v-model="confirmPassword" type="password" required />
        </div>
        <div class="button-group">
          <button type="submit">Change Password</button>
          <button type="button" @click="$emit('close')">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/userStore'

const emit = defineEmits(['close'])
const userStore = useUserStore()

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    alert('New passwords do not match')
    return
  }

  try {
    await userStore.changePassword(oldPassword.value, newPassword.value)
    alert('Password changed successfully')
    emit('close')
  } catch (error) {
    alert('Failed to change password: ' + error.message)
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
  background-color: var(--white);
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
  z-index: 1001;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.button-group {
  display: flex;
  justify-content: space-between;
}

button {
  padding: 10px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: var(--primary-dark);
}

button[type="button"] {
  background-color: var(--gray);
}

button[type="button"]:hover {
  background-color: var(--dark-gray);
}
</style>