import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '../stores/userStore'
import { useChatStore } from '../stores/chatStore'

export function useAppSetup() {
    const userStore = useUserStore()
    const chatStore = useChatStore()

    const isProfileModalOpen = ref(false)
    const isChangePasswordModalOpen = ref(false)
    const isSidebarOpen = ref(false)
    const windowWidth = ref(window.innerWidth)

    const isLoggedIn = computed(() => !!userStore.currentUsername)
    const isMobile = computed(() => windowWidth.value < 768)

    const toggleSidebar = () => {
        isSidebarOpen.value = !isSidebarOpen.value
    }

    const closeSidebar = () => {
        isSidebarOpen.value = false
    }

    const onAuthSuccess = () => {
        console.log('Authentication successful')
    }

    const handleResize = () => {
        windowWidth.value = window.innerWidth
        if (isMobile.value) {
            isSidebarOpen.value = false
        }
    }

    const handleMouseMove = (event) => {
        if (!isMobile.value && isLoggedIn.value && !isSidebarOpen.value) {
            isSidebarOpen.value = event.clientX < 50
        }
    }


    const openProfileModal = () => {
        isProfileModalOpen.value = true
    }

    const openChangePasswordModal = () => {
        isChangePasswordModalOpen.value = true
    }

    onMounted(async () => {
        await chatStore.initOrbitDB()
        chatStore.startPolling()
        userStore.setUserDb(chatStore.userDb)
        window.addEventListener('resize', handleResize)
        handleResize() // Call once to set initial state
    })

    onUnmounted(() => {
        window.removeEventListener('resize', handleResize)
        chatStore.cleanup()
    })

    return {
        isProfileModalOpen,
        isChangePasswordModalOpen,
        isSidebarOpen,
        isLoggedIn,
        isMobile,
        toggleSidebar,
        closeSidebar,
        onAuthSuccess,
        handleMouseMove,
        chatStore,
        openProfileModal,
        openChangePasswordModal,
    }
}