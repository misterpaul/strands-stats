import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore, type UserProfile } from '../auth'

describe('Auth Store', () => {
  // Before each test, create a fresh Pinia instance and clear sessionStorage.
  // This is crucial for ensuring tests are isolated and don't affect each other.
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
  })

  it('initializes with a logged-out state', () => {
    const authStore = useAuthStore()
    expect(authStore.isLoggedIn).toBe(false)
    expect(authStore.userProfile).toBe(null)
  })

  it('logs a user in, updates state, and persists to sessionStorage', () => {
    const authStore = useAuthStore()
    const mockUser: UserProfile = {
      name: 'Test User',
      email: 'test@example.com',
      picture: 'https://example.com/pic.jpg'
    }

    authStore.login(mockUser)

    // Check that the store's state is correct
    expect(authStore.isLoggedIn).toBe(true)
    expect(authStore.userProfile).toEqual(mockUser)

    // Check that the state was saved to sessionStorage
    const storedProfile = sessionStorage.getItem('userProfile')
    expect(storedProfile).not.toBe(null)
    expect(JSON.parse(storedProfile!)).toEqual(mockUser)
  })

  it('logs a user out, clears state, and removes from sessionStorage', () => {
    const authStore = useAuthStore()
    const mockUser: UserProfile = {
      name: 'Test User',
      email: 'test@example.com',
      picture: 'https://example.com/pic.jpg'
    }

    // Start in a logged-in state
    authStore.login(mockUser)
    expect(authStore.isLoggedIn).toBe(true)

    // Log the user out
    authStore.logout()

    expect(authStore.isLoggedIn).toBe(false)
    expect(authStore.userProfile).toBe(null)
    expect(sessionStorage.getItem('userProfile')).toBe(null)
  })
})

