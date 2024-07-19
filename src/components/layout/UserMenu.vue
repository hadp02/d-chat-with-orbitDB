<template>
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
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '../../stores/userStore';

const emit = defineEmits(['open-profile-modal', 'open-change-password-modal', 'logout']);

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
  emit('logout');
  isUserMenuOpen.value = false;
};

</script>


<style scoped>
.user-menu {
  position: relative;
  padding: 10px;
  background-color: var(--primary-color-dark);
  color: white;
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
  border-radius: 0 0 4px 4px;
}

.dropdown ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.dropdown li {
  padding: 10px;
  cursor: pointer;
  color: var(--text-color);
  display: flex;
  align-items: center;
}

.dropdown li:hover {
  background-color: var(--hover-color);
}

.dropdown li i {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>