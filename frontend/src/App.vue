<script setup>
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import AppHeader from './components/AppHeader.vue'
import { computed } from 'vue'

const auth = useAuthStore()
const route = useRoute()

// Full-screen routes don't need container padding or header
const isFullScreen = computed(() => route.name === 'character')
</script>

<template>
  <div class="min-h-screen bg-void font-sans">
    <AppHeader v-if="auth.isAuthenticated && !isFullScreen" />
    <main :class="isFullScreen ? '' : 'container mx-auto py-6'">
      <RouterView />
    </main>
  </div>
</template>
