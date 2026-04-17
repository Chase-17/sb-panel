<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCharactersStore } from '../stores/characters'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const store = useCharactersStore()
const auth = useAuthStore()

const shared = ref(null)
const loading = ref(true)
const importing = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    const res = await auth.api(`/characters/shared/${route.params.code}`)
    if (res.ok) {
      shared.value = await res.json()
    } else {
      error.value = 'Ссылка не найдена или устарела'
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

async function handleImport() {
  importing.value = true
  try {
    const char = await store.importShared(route.params.code)
    if (char) {
      router.push(`/character/${char.id}`)
    }
  } catch (e) {
    error.value = e.message
  } finally {
    importing.value = false
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto mt-8">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-12 text-toxic flex items-center justify-center gap-2">
      <span class="i-tabler-loader-2 icon animate-spin"></span>
      Загрузка...
    </div>
    
    <!-- Error -->
    <div v-else-if="error" class="text-center py-12">
      <div class="i-tabler-link-off w-16 h-16 mx-auto mb-4 text-blood"></div>
      <p class="text-bone text-lg">{{ error }}</p>
      <router-link to="/" class="btn-primary mt-6 inline-flex items-center gap-2">
        <span class="i-tabler-arrow-left icon-sm"></span>
        На главную
      </router-link>
    </div>
    
    <!-- Shared character preview -->
    <div v-else-if="shared" class="bg-dark border-2 border-toxic-muted rounded-xl p-6">
      <div class="text-center mb-6">
        <div class="i-game-icons-person w-16 h-16 mx-auto mb-3 text-toxic"></div>
        <h1 class="font-display text-2xl text-toxic">{{ shared.name }}</h1>
        <p v-if="shared.created_by" class="text-bone-muted mt-1">
          от {{ shared.created_by }}
        </p>
      </div>
      
      <div class="flex flex-col gap-3">
        <button
          @click="handleImport"
          class="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
          :disabled="importing"
        >
          <span v-if="importing" class="i-tabler-loader-2 icon animate-spin"></span>
          <span v-else class="i-tabler-download icon"></span>
          {{ importing ? 'Импортирую...' : 'Импортировать себе' }}
        </button>
        <router-link to="/" class="w-full py-3 text-center text-bone-muted hover:text-bone transition-colors">
          Назад
        </router-link>
      </div>
    </div>
  </div>
</template>
