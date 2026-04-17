<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const showMenu = ref(false)

function logout() {
  auth.logout()
  router.push('/login')
}

async function deleteAccount() {
  if (!confirm('Удалить аккаунт и всех персонажей? Это необратимо!')) return
  try {
    await auth.deleteAccount()
    router.push('/login')
  } catch (e) {
    alert(e.message)
  }
}
</script>

<template>
  <header class="bg-night border-b-2 border-toxic-muted px-2 py-2">
    <div class="flex items-center justify-between gap-2">
      <router-link to="/" class="flex items-center gap-1.5 text-lg font-bold text-bone hover:text-toxic transition min-w-0">
        <span class="font-display tracking-wider truncate">STILL BREATHING</span>
      </router-link>
      
      <div class="flex items-center gap-2 flex-none relative">
        <span class="text-bone-dim flex items-center gap-1">
          <span class="i-ph-user-circle icon-sm text-bone-muted"></span>
          <span class="truncate max-w-20">{{ auth.nickname }}</span>
        </span>
        <button @click="showMenu = !showMenu" class="text-bone-muted hover:text-toxic flex items-center transition-colors">
          <span class="i-tabler-dots-vertical icon-sm"></span>
        </button>
        
        <!-- Dropdown menu -->
        <div v-if="showMenu" class="absolute right-0 top-full mt-1 bg-night border-2 border-toxic-muted rounded-lg py-1 min-w-36 z-50 shadow-lg" @click="showMenu = false">
          <button @click="logout" class="w-full px-3 py-2 text-left text-bone-dim hover:text-bone hover:bg-dark flex items-center gap-2 transition-colors">
            <span class="i-tabler-logout icon-sm"></span>
            Выйти
          </button>
          <button @click="deleteAccount" class="w-full px-3 py-2 text-left text-blood/70 hover:text-blood hover:bg-dark flex items-center gap-2 transition-colors">
            <span class="i-tabler-trash icon-sm"></span>
            Удалить аккаунт
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
