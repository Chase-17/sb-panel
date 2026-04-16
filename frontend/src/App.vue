<script setup>
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'
import AppHeader from './components/AppHeader.vue'

const auth = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
    <AppHeader v-if="auth.isAuthenticated" />
    <main class="container mx-auto px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
