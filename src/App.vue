<template>
  <div class="app-container" @mousemove="handleMouseMove">
    <AppHeader :toggleSidebar="toggleSidebar" />
    <main class="app-main">
      <Sidebar
          v-if="isLoggedIn"
          :isOpen="isSidebarOpen"
          @close="closeSidebar"
          @open-profile-modal="openProfileModal"
          @open-change-password-modal="openChangePasswordModal"
      />
      <div class="content-area" :class="{ 'sidebar-open': isSidebarOpen && isLoggedIn }">
        <template v-if="isLoggedIn">
          <ChatContainer />
        </template>
        <AuthForm v-else @auth-success="onAuthSuccess" />
      </div>
    </main>
    <AppFooter />
    <ProfileModal v-if="isProfileModalOpen" @close="isProfileModalOpen = false" />
    <ChangePasswordModal v-if="isChangePasswordModalOpen" @close="isChangePasswordModalOpen = false" />
  </div>
</template>

<script setup>
import { useAppSetup } from './composables/useAppSetup'
import Sidebar from './components/layout/Sidebar.vue'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import AuthForm from './components/auth/AuthContainer.vue'
import ChatContainer from './components/chat/ChatContainer.vue'
import ProfileModal from './components/modals/ProfileModal.vue'
import ChangePasswordModal from './components/modals/ChangePasswordModal.vue'

const {
  isProfileModalOpen,
  isChangePasswordModalOpen,
  isSidebarOpen,
  isLoggedIn,
  toggleSidebar,
  closeSidebar,
  onAuthSuccess,
  handleMouseMove,
  chatStore,
  openProfileModal,
  openChangePasswordModal
} = useAppSetup()
</script>

<style src="./assets/App.css"></style>