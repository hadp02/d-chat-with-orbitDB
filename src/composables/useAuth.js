import { ref } from 'vue'
import { useUserStore } from '../stores/userStore'

export function useAuth() {
    const userStore = useUserStore()
    const error = ref('')
    const isLoading = ref(false)

    const login = async (username, password) => {
        isLoading.value = true
        error.value = ''
        try {
            await userStore.login(username, password)
        } catch (err) {
            error.value = err.message
        } finally {
            isLoading.value = false
        }
    }

    const register = async (username, password) => {
        isLoading.value = true
        error.value = ''
        try {
            await userStore.register(username, password)
        } catch (err) {
            error.value = err.message
        } finally {
            isLoading.value = false
        }
    }

    const logout = async () => {
        try {
            await userStore.logout()
        } catch (err) {
            error.value = err.message
        }
    }

    return {
        login,
        register,
        logout,
        error,
        isLoading
    }
}