import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginUser, registerUser, updateUserProfile, changeUserPassword } from '../services/userService'
import {EventEmitter} from "events";

export const useUserStore = defineStore('user', () => {
    const currentUsername = ref(null)
    const userProfile = ref({
        name: '',
        status: 'offline'
    })
    const error = ref('')
    let userDb = null

    const setUserDb = (db) => {
        userDb = db
        console.log('UserDB set:', userDb)
    }
    const eventEmitter = new EventEmitter()


    const login = async (username, password) => {
        try {
            console.log('Login attempt for username:', username)
            const user = await loginUser(userDb, username, password)
            currentUsername.value = username
            userProfile.value = {
                name: user.name || username,
                status: user.status || 'online'
            }
            console.log('Login successful. Current username:', currentUsername.value)
            console.log('User profile after login:', userProfile.value)
        } catch (err) {
            console.error('Login error:', err)
            error.value = err.message
            throw err
        }
    }

    const register = async (username, password) => {
        try {
            console.log('Registration attempt for username:', username)
            const user = await registerUser(userDb, username, password)
            currentUsername.value = username
            userProfile.value = {
                name: user.name || username,
                status: 'online'
            }
            console.log('Registration successful. Current username:', currentUsername.value)
            console.log('User profile after registration:', userProfile.value)
        } catch (err) {
            console.error('Registration error:', err)
            error.value = err.message
            throw err
        }
    }

    const logout = () => {
        currentUsername.value = null
        userProfile.value = {
            name: '',
            status: 'offline'
        }
        console.log('User logged out')
    }

    const updateProfile = async (updatedProfile) => {
        try {
            console.log('Updating profile with:', updatedProfile)

            if (!currentUsername.value) {
                throw new Error('No current user found')
            }

            // Loại bỏ các trường có giá trị undefined
            const cleanProfile = Object.entries(updatedProfile).reduce((acc, [key, value]) => {
                if (value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {});

            const updated = await updateUserProfile(userDb, currentUsername.value, cleanProfile)
            userProfile.value = {
                ...userProfile.value,
                ...updated
            }
            console.log('Profile updated successfully:', userProfile.value)
        } catch (err) {
            console.error('Error updating profile:', err)
            error.value = err.message
            throw err
        }
    }

    const getUserProfile = async (username) => {
        try {
            if (!userDb) {
                throw new Error('UserDB not initialized')
            }
            const user = await userDb.get(username)
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
        eventEmitter.emit('profileUpdated', currentUsername.value, updated)
    }



    const changePassword = async (oldPassword, newPassword) => {
        try {
            if (!currentUsername.value) {
                throw new Error('No current user found')
            }
            await changeUserPassword(userDb, currentUsername.value, oldPassword, newPassword)
        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    return {
        currentUsername,
        userProfile,
        error,
        eventEmitter,
        setUserDb,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        getUserProfile
    }
})