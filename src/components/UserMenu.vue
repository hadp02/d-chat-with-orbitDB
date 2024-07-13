<template>
  <div class="user-menu">
    <div class="user-info" @click="toggleDropdown">
      <img :src="userStore.userProfile.avatar" alt="User Avatar" class="avatar" />
      <span>{{ userStore.userProfile.username }}</span>
      <i class="fas fa-chevron-down"></i>
    </div>
    <div v-if="isDropdownOpen" class="dropdown">
      <ul>
        <li @click="openChangePasswordModal">Change Password</li>
        <li @click="userStore.logout">Logout</li>
      </ul>
    </div>
    <ChangePasswordModal v-if="isChangePasswordModalOpen" @close="closeChangePasswordModal" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/userStore'
import ChangePasswordModal from './ChangePasswordModal.vue'

const userStore = useUserStore()
const isDropdownOpen = ref(false)
const isChangePasswordModalOpen = ref(false)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const openChangePasswordModal = () => {
  isChangePasswordModalOpen.value = true
  isDropdownOpen.value = false
}

const closeChangePasswordModal = () => {
  isChangePasswordModalOpen.value = false
}
</script>

<style scoped>
.user-menu {
  position: relative;
  padding: 10px;
  background-color: var(--primary-dark);
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dropdown ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.dropdown li {
  padding: 10px;
  cursor: pointer;
}

.dropdown li:hover {
  background-color: var(--light-gray);
}
</style>