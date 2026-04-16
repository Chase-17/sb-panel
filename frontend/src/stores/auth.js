import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'

const API_URL = '/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('sb_token') || null)
  const nickname = ref(localStorage.getItem('sb_nickname') || null)
  
  const isAuthenticated = computed(() => !!token.value)
  
  function setAuth(newToken, newNickname) {
    token.value = newToken
    nickname.value = newNickname
    localStorage.setItem('sb_token', newToken)
    localStorage.setItem('sb_nickname', newNickname)
  }
  
  function clearAuth() {
    token.value = null
    nickname.value = null
    localStorage.removeItem('sb_token')
    localStorage.removeItem('sb_nickname')
  }
  
  async function checkNickname(nick) {
    const res = await fetch(`${API_URL}/auth/check-nickname`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: nick })
    })
    return res.json()
  }
  
  async function register(nick) {
    // 1. Begin registration
    const beginRes = await fetch(`${API_URL}/auth/register/begin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: nick })
    })
    
    if (!beginRes.ok) {
      const error = await beginRes.json()
      throw new Error(error.detail || 'Registration failed')
    }
    
    const { options } = await beginRes.json()
    
    // 2. Start WebAuthn registration (browser prompts for fingerprint)
    const credential = await startRegistration(JSON.parse(options))
    
    // 3. Complete registration
    const completeRes = await fetch(`${API_URL}/auth/register/complete?nickname=${nick}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    })
    
    if (!completeRes.ok) {
      const error = await completeRes.json()
      throw new Error(error.detail || 'Registration failed')
    }
    
    const data = await completeRes.json()
    setAuth(data.access_token, data.nickname)
    return data
  }
  
  async function login(nick) {
    // 1. Begin authentication
    const beginRes = await fetch(`${API_URL}/auth/login/begin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: nick })
    })
    
    if (!beginRes.ok) {
      const error = await beginRes.json()
      throw new Error(error.detail || 'Login failed')
    }
    
    const { options } = await beginRes.json()
    
    // 2. Start WebAuthn authentication
    const credential = await startAuthentication(JSON.parse(options))
    
    // 3. Complete authentication
    const completeRes = await fetch(`${API_URL}/auth/login/complete?nickname=${nick}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    })
    
    if (!completeRes.ok) {
      const error = await completeRes.json()
      throw new Error(error.detail || 'Login failed')
    }
    
    const data = await completeRes.json()
    setAuth(data.access_token, data.nickname)
    return data
  }
  
  function logout() {
    clearAuth()
  }
  
  // API helper with auth header
  async function api(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
    
    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
    }
    
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    })
    
    if (res.status === 401) {
      clearAuth()
      throw new Error('Session expired')
    }
    
    return res
  }
  
  return {
    token,
    nickname,
    isAuthenticated,
    checkNickname,
    register,
    login,
    logout,
    api,
  }
})
