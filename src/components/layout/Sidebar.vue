<template>
  <aside :class="{ 'sidebar-open': isOpen }">
    <div class="sidebar-header">
      <h2>OrbitDB Chat</h2>
      <button @click="$emit('close')" class="control-btn close-btn">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div class="sidebar-content">
      <h3>Database Controls</h3>
      <DatabaseControls />
      <!-- Placeholder for future contact list -->
      <div class="placeholder-text">
        Contact list will be displayed here in future updates.
      </div>
    </div>

    <div class="user-menu">
      <button @click="toggleUserMenu" class="user-menu-button">
        <img :src="userAvatarUrl" alt="User Avatar" class="avatar" />
        <span>{{ userDisplayName }}</span>
        <i class="fas fa-chevron-down" :class="{ 'fa-chevron-up': isUserMenuOpen }"></i>
      </button>
      <transition name="fade">
        <div v-if="isUserMenuOpen" class="user-menu-dropdown">
          <ul>
            <li @click="openProfileModal">
              <i class="fas fa-user"></i> Manage Profile
            </li>
            <li @click="openChangePasswordModal">
              <i class="fas fa-key"></i> Change Password
            </li>
            <li @click="handleLogout">
              <i class="fas fa-sign-out-alt"></i> Logout
            </li>
          </ul>
        </div>
      </transition>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '../../stores/userStore';
import DatabaseControls from './DatabaseControls.vue';

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(['close', 'open-profile-modal', 'open-change-password-modal']);

const userStore = useUserStore();
const isUserMenuOpen = ref(false);

const userAvatarUrl = computed(() =>
    userStore.userProfile.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${userStore.currentUsername}`
);
const userDisplayName = computed(() => userStore.userProfile.name || userStore.currentUsername);

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const openProfileModal = () => {
  emit('open-profile-modal');
  isUserMenuOpen.value = false;
};

const openChangePasswordModal = () => {
  emit('open-change-password-modal');
  isUserMenuOpen.value = false;
};

const handleLogout = () => {
  userStore.logout();
  isUserMenuOpen.value = false;
  emit('close');
};
</script>

<style scoped>
aside {
  width: 280px;
  height: 100vh;
  background-color: var(--background-color);
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: -280px;
  transition: left 0.3s ease-in-out;
  z-index: 1000;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.sidebar-open {
  left: 0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: var(--primary-color);
  color: white;
}

.control-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
}

.sidebar-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
}

.placeholder-text {
  font-style: italic;
  color: var(--text-color-light);
  margin-top: 20px;
}

.user-menu {
  border-top: 1px solid var(--border-color);
  padding: 10px;
}

.user-menu-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-color);
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.user-menu-dropdown {
  margin-top: 10px;
}

.user-menu-dropdown ul {
  list-style-type: none;
  padding: 0;
}

.user-menu-dropdown li {
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.user-menu-dropdown li i {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.user-menu-dropdown li:hover {
  background-color: var(--hover-color);
}

@media (max-width: 768px) {
  aside {
    width: 100%;
    left: -100%;
  }

  .sidebar-open {
    left: 0;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

</style>