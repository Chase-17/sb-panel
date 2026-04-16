<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="bg-ash/50 border-b border-bone/10 px-4 py-3">
    <div class="container mx-auto flex items-center justify-between">
      <router-link to="/" class="flex items-center gap-2 text-xl font-bold text-bone hover:text-blood transition">
        <span class="i-game-icons-zombie-hand icon-lg text-blood"></span>
        <span>Still Breathing</span>
      </router-link>
      
      <div class="flex items-center gap-4">
        <span class="text-bone/60 flex items-center gap-1.5">
          <span class="i-ph-user-circle icon text-bone/40"></span>
          {{ auth.nickname }}
        </span>
        <button @click="logout" class="btn-secondary text-sm flex items-center gap-1.5">
          <span class="i-tabler-logout icon-sm"></span>
          Выйти
        </button>
      </div>
    </div>
  </header>
</template>
