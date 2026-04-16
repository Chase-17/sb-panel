<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const nickname = ref('')
const step = ref('nickname') // nickname, registering, authenticating
const error = ref('')
const loading = ref(false)

const nicknameValid = computed(() => {
  const n = nickname.value.trim()
  return n.length >= 2 && n.length <= 20
})

async function handleSubmit() {
  if (!nicknameValid.value) return
  
  error.value = ''
  loading.value = true
  
  try {
    const { exists } = await auth.checkNickname(nickname.value)
    
    if (exists) {
      step.value = 'authenticating'
      await auth.login(nickname.value)
    } else {
      step.value = 'registering'
      await auth.register(nickname.value)
    }
    
    router.push('/')
  } catch (e) {
    error.value = e.message
    step.value = 'nickname'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="card w-full max-w-md">
      <div class="text-center mb-8">
        <div class="text-6xl mb-4">🧟</div>
        <h1 class="text-3xl font-bold text-bone">Still Breathing</h1>
        <p class="text-bone/60 mt-2">AFMBE Character Panel</p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Nickname input -->
        <div v-if="step === 'nickname'">
          <label class="block text-bone/80 mb-2">Твой ник</label>
          <input
            v-model="nickname"
            type="text"
            placeholder="Введи ник..."
            class="input-field text-lg"
            :disabled="loading"
            autofocus
          />
          <p class="text-bone/40 text-sm mt-2">
            2-20 символов. Если ник новый — зарегистрируешься автоматически.
          </p>
        </div>
        
        <!-- WebAuthn prompts -->
        <div v-else-if="step === 'registering'" class="text-center py-8">
          <div class="text-5xl mb-4">👆</div>
          <p class="text-bone text-lg">Приложи палец для регистрации</p>
          <p class="text-bone/60 text-sm mt-2">Или используй Face ID / ключ безопасности</p>
        </div>
        
        <div v-else-if="step === 'authenticating'" class="text-center py-8">
          <div class="text-5xl mb-4">👆</div>
          <p class="text-bone text-lg">Приложи палец для входа</p>
        </div>
        
        <!-- Error message -->
        <div v-if="error" class="bg-blood/20 border border-blood/50 rounded-lg p-3 text-bone">
          {{ error }}
        </div>
        
        <!-- Submit button -->
        <button
          v-if="step === 'nickname'"
          type="submit"
          class="btn-primary w-full py-3 text-lg"
          :disabled="!nicknameValid || loading"
        >
          <span v-if="loading">Загрузка...</span>
          <span v-else>Войти</span>
        </button>
      </form>
      
      <p class="text-center text-bone/40 text-sm mt-8">
        Вход по отпечатку пальца или Face ID.<br>
        Никаких паролей, просто палец 👆
      </p>
    </div>
  </div>
</template>
