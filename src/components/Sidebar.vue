<template>
  <aside :class="{ 'sidebar-open': isOpen }">
    <div class="sidebar-header">
      <h2>Menu</h2>
      <button @click="$emit('close')" class="close-btn">&times;</button>
    </div>
    <nav>
      <ul>
        <li @click="setActiveSection('database')">
          <i class="fas fa-database"></i> Database
        </li>
        <!-- Thêm các mục menu khác nếu cần -->
      </ul>
    </nav>
    <div class="sidebar-content">
      <DatabaseControls v-if="activeSection === 'database'" />
      <!-- Thêm các component khác tương ứng với các mục menu -->
    </div>
    <div class="user-menu">
      <button @click="toggleUserMenu" class="user-menu-button">
        <img :src="userAvatarUrl" alt="User Avatar" class="avatar" />
        <span>{{ userDisplayName }}</span>
        <i class="fas fa-chevron-up" :class="{ 'fa-chevron-down': !isUserMenuOpen }"></i>
      </button>
      <div v-if="isUserMenuOpen" class="user-menu-dropdown">
        <ul>
          <li @click="openProfileModal">Manage Profile</li>
          <li @click="openChangePasswordModal">Change Password</li>
          <li @click="handleLogout">Logout</li>
        </ul>
      </div>
    </div>
  </aside>
  <ProfileModal v-if="isProfileModalOpen" @close="closeProfileModal" />
  <ChangePasswordModal v-if="isChangePasswordModalOpen" @close="closeChangePasswordModal" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/userStore'
import DatabaseControls from './chat/DatabaseControls.vue'
import ProfileModal from './ProfileModal.vue'
import ChangePasswordModal from './ChangePasswordModal.vue'

const props = defineProps(['isOpen'])
const emit = defineEmits(['close'])

const userStore = useUserStore()

const activeSection = ref('database')
const isUserMenuOpen = ref(false)
const isProfileModalOpen = ref(false)
const isChangePasswordModalOpen = ref(false)

const userAvatarUrl = computed(() => userStore.userProfile.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${userStore.currentUsername}`)
const userDisplayName = computed(() => userStore.userProfile.name || userStore.currentUsername)

const setActiveSection = (section) => {
  activeSection.value = section
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const openProfileModal = () => {
  isProfileModalOpen.value = true
  isUserMenuOpen.value = false
}

const closeProfileModal = () => {
  isProfileModalOpen.value = false
}

const openChangePasswordModal = () => {
  isChangePasswordModalOpen.value = true
  isUserMenuOpen.value = false
}

const closeChangePasswordModal = () => {
  isChangePasswordModalOpen.value = false
}

const handleLogout = () => {
  userStore.logout()
  emit('close')
}
</script>

<style scoped>
aside {
  width: 300px;
  background-color: var(--light-gray);
  height: 100%;
  position: absolute;
  top: 0;
  left: -300px;
  transition: left 0.3s ease-in-out;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.sidebar-content {
  flex-grow: 1;
  overflow-y: auto;
}

.user-menu {
  margin-top: auto;
  padding: 10px;
  position: relative;
}

.user-menu-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--white);
  background-color: var(--primary-dark);
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.user-menu-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background-color: var(--white);
  border: 1px solid var(--gray);
  border-radius: 4px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.user-menu-dropdown ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.user-menu-dropdown li {
  padding: 10px;
  cursor: pointer;
}

.user-menu-dropdown li:hover {
  background-color: var(--light-gray);
}
.sidebar-open {
  left: 0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: var(--primary-color);
  color: var(--white);
}

.close-btn {
  background: none;
  border: none;
  color: var(--white);
  font-size: 24px;
  cursor: pointer;
}

nav ul {
  list-style-type: none;
  padding: 0;
}

nav ul li {
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

nav ul li:hover {
  background-color: var(--primary-light);
  color: var(--white);
}

</style>