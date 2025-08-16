<script setup lang="ts">
import { GoogleLogin, type CredentialResponse } from 'vue3-google-login'
import { decodeCredential } from 'vue3-google-login'
import { useAuthStore, type UserProfile } from '@/stores/auth'

const authStore = useAuthStore()

const handleLoginSuccess = (response: CredentialResponse) => {
  const userData = decodeCredential(response.credential) as UserProfile
  console.log('Logged in user:', userData)
  authStore.login(userData)
}

const handleLoginError = () => {
  console.error('Login failed')
}

const handleLogout = () => {
  authStore.logout()
}
</script>

<template>
  <div>
    <div v-if="!authStore.isLoggedIn" class="login-container">
      <h1>Hello, Guest!</h1>
      <p>Please sign in to view your stats.</p>
      <GoogleLogin :callback="handleLoginSuccess" :error-callback="handleLoginError" />
    </div>
    <div v-else class="welcome-container">
      <img :src="authStore.userProfile?.picture" alt="User profile picture" class="profile-pic" />
      <h1>Hello, {{ authStore.userProfile?.name }}</h1>
      <p>Welcome to Strands Stats!</p>
      <button @click="handleLogout">Logout</button>
    </div>
  </div>
</template>

<style scoped>
.login-container, .welcome-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}
.profile-pic {
  border-radius: 50%;
  width: 60px;
  height: 60px;
  margin-bottom: 1rem;
}
</style>
