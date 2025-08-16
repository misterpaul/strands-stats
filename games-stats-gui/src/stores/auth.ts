import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface UserProfile {
  name: string
  email: string
  picture: string
}

export const useAuthStore = defineStore('auth', () => {
  // Attempt to load user profile from sessionStorage on initialization
  const storedProfile = sessionStorage.getItem('userProfile')
  const userProfile = ref<UserProfile | null>(storedProfile ? JSON.parse(storedProfile) : null)
  const isLoggedIn = ref<boolean>(!!userProfile.value)

  function login(profile: UserProfile) {
    userProfile.value = profile
    isLoggedIn.value = true
    // Persist the user profile to sessionStorage
    sessionStorage.setItem('userProfile', JSON.stringify(profile))
  }

  function logout() {
    userProfile.value = null
    isLoggedIn.value = false
    // Remove the user profile from sessionStorage
    sessionStorage.removeItem('userProfile')
  }

  return { isLoggedIn, userProfile, login, logout }
})

