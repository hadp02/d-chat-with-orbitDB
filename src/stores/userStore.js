import { defineStore } from 'pinia'
import userService from '../services/userService'

export const useUserStore = defineStore('user', {
    state: () => ({
        currentUsername: null,
        userProfile: {
            name: '',
            status: 'offline'
        },
        userDb: null,
    }),

    getters: {
        isLoggedIn: (state) => !!state.currentUsername
    },

    actions: {
        setUserDb(db) {
            this.userDb = db
        },

        async login(username, password) {
            try {
                console.log('Login attempt for username:', username)
                const user = await userService.loginUser(this.userDb, username, password)
                this.currentUsername = username
                this.userProfile = {
                    name: user.name || username,
                    status: user.status || 'online'
                }
                console.log('Login successful. Current username:', this.currentUsername)
                console.log('User profile after login:', this.userProfile)
            } catch (err) {
                console.error('Login error:', err)
                throw err
            }
        },

        async register(username, password) {
            try {
                console.log('Registration attempt for username:', username)
                const user = await userService.registerUser(this.userDb, username, password)
                this.currentUsername = username
                this.userProfile = {
                    name: user.name || username,
                    status: 'online'
                }
                console.log('Registration successful. Current username:', this.currentUsername)
                console.log('User profile after registration:', this.userProfile)
            } catch (err) {
                console.error('Registration error:', err)
                throw err
            }
        },

        logout() {
            this.currentUsername = null
            this.userProfile = {
                name: '',
                status: 'offline'
            }
            console.log('User logged out')
        },

        async updateProfile(updatedProfile) {
            try {
                console.log('Updating profile with:', updatedProfile)
                if (!this.currentUsername) {
                    throw new Error('No current user found')
                }
                const updated = await userService.updateUserProfile(this.userDb, this.currentUsername, updatedProfile)
                this.userProfile = {
                    ...this.userProfile,
                    ...updated
                }
                console.log('Profile updated successfully:', this.userProfile)
            } catch (err) {
                console.error('Error updating profile:', err)
                throw err
            }
        },

        async getUserProfile(username) {
            try {
                if (!this.userDb) {
                    throw new Error('UserDB not initialized')
                }
                const user = await this.userDb.get(username)
                if (user) {
                    return {
                        name: user.name || username,
                        avatar: user.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${username}`,
                        status: user.status || 'offline'
                    }
                }
                return null
            } catch (err) {
                console.error('Error fetching user profile:', err)
                return null
            }
        },

        async changePassword(oldPassword, newPassword) {
            try {
                if (!this.currentUsername) {
                    throw new Error('No current user found')
                }
                await userService.changeUserPassword(this.userDb, this.currentUsername, oldPassword, newPassword)
            } catch (err) {
                console.error('Error changing password:', err)
                throw err
            }
        }
    }
})