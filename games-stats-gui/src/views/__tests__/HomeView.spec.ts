import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import HomeView from '../HomeView.vue'
import { useAuthStore, type UserProfile } from '@/stores/auth'

// Mock the vue3-google-login component to prevent it from trying to
// contact Google's servers during our test.
const GoogleLogin = {
  template: '<div data-testid="google-login-mock"></div>'
}

describe('HomeView', () => {
  // Before each test, create a fresh Pinia instance. This ensures
  // that tests are isolated and don't share state.
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows the guest view for an unauthenticated user', () => {
    const wrapper = mount(HomeView, {
      global: {
        stubs: {
          GoogleLogin: GoogleLogin
        }
      }
    })

    // Check for the "Hello, Guest!" message
    expect(wrapper.text()).toContain('Hello, Guest!')

    // Check that our mocked Google Login button is present
    expect(wrapper.find('[data-testid="google-login-mock"]').exists()).toBe(true)
  })

  it('shows the authenticated view when a user is logged in', async () => {
    const authStore = useAuthStore()
    const mockUser: UserProfile = {
      name: 'Test User',
      email: 'test@example.com',
      picture: 'https://example.com/pic.jpg'
    }

    // Directly manipulate the store to simulate a logged-in state
    authStore.login(mockUser)

    const wrapper = mount(HomeView, {
      global: {
        stubs: {
          GoogleLogin: GoogleLogin
        }
      }
    })

    // Check for the personalized welcome message
    expect(wrapper.text()).toContain('Hello, Test User')

    // Check that the user's profile picture is rendered
    expect(wrapper.find('img.profile-pic').attributes('src')).toBe(mockUser.picture)
  })
})

