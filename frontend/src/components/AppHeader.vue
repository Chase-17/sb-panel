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
  <header class="bg-night border-b-2 border-toxic-muted px-2 py-2">
    <div class="flex items-center justify-between gap-2">
      <router-link to="/" class="flex items-center gap-1.5 text-lg font-bold text-bone hover:text-toxic transition min-w-0">
        <!-- <span class="i-game-icons-zombie-hand icon text-toxic flex-none"></span> -->
        <span class="font-display tracking-wider truncate">STILL BREATHING</span>
      </router-link>
      
      <div class="flex items-center gap-2 flex-none">
        <span class="text-bone-dim flex items-center gap-1">
          <span class="i-ph-user-circle icon-sm text-bone-muted"></span>
          <span class="truncate max-w-20">{{ auth.nickname }}</span>
        </span>
        <button @click="logout" class="text-bone-muted hover:text-toxic flex items-center gap-1 transition-colors">
          <span class="i-tabler-logout icon-sm"></span>
          <span class="hidden sm:inline">Выйти</span>
        </button>
      </div>
    </div>
  </header>
</template>
