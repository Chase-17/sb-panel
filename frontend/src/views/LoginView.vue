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

const isDev = import.meta.env.DEV

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

async function handleSimpleLogin() {
  if (!nicknameValid.value) return
  
  error.value = ''
  loading.value = true
  
  try {
    await auth.simpleLogin(nickname.value)
    router.push('/')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-void">
    <div class="bg-dark border-2 border-toxic-muted rounded-lg p-6 w-full max-w-md mx-4 shadow-[0_0_40px_rgba(57,255,20,0.1)]">
      <div class="text-center mb-8">
        <div class="i-game-icons-zombie-hand w-20 h-20 mx-auto mb-4 text-toxic"></div>
        <h1 class="font-display text-3xl text-toxic tracking-wider">STILL BREATHING</h1>
        <p class="text-bone-muted mt-2 tracking-wide">AFMBE Character Panel</p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Nickname input -->
        <div v-if="step === 'nickname'">
          <label class="block text-bone-dim mb-2 uppercase text-sm tracking-wide">Твой ник</label>
          <input
            v-model="nickname"
            type="text"
            placeholder="Введи ник..."
            class="input-field text-lg"
            :disabled="loading"
            autofocus
          />
          <p class="text-bone-muted text-sm mt-2">
            2-20 символов. Если ник новый — зарегистрируешься автоматически.
          </p>
        </div>
        
        <!-- WebAuthn prompts -->
        <div v-else-if="step === 'registering'" class="text-center py-8">
          <div class="i-ph-fingerprint w-20 h-20 mx-auto mb-4 text-toxic animate-pulse"></div>
          <p class="text-bone text-lg">Приложи палец для регистрации</p>
          <p class="text-bone-muted text-sm mt-2">Или используй Face ID / ключ безопасности</p>
        </div>
        
        <div v-else-if="step === 'authenticating'" class="text-center py-8">
          <div class="i-ph-fingerprint w-20 h-20 mx-auto mb-4 text-toxic animate-pulse"></div>
          <p class="text-bone text-lg">Приложи палец для входа</p>
        </div>
        
        <!-- Error message -->
        <div v-if="error" class="bg-blood/20 border-2 border-blood rounded-lg p-3 text-bone flex items-center gap-2">
          <span class="i-tabler-alert-circle icon text-blood"></span>
          {{ error }}
        </div>
        
        <!-- Submit button -->
        <button
          v-if="step === 'nickname'"
          type="submit"
          class="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
          :disabled="!nicknameValid || loading"
        >
          <span v-if="loading" class="i-tabler-loader-2 icon animate-spin"></span>
          <span v-else class="i-ph-fingerprint icon"></span>
          <span>{{ loading ? 'Загрузка...' : 'Войти по отпечатку' }}</span>
        </button>
        
        <!-- Simple login button (dev only) -->
        <button
          v-if="step === 'nickname' && isDev"
          type="button"
          @click="handleSimpleLogin"
          class="w-full py-3 text-lg flex items-center justify-center gap-2 bg-dark border-2 border-bone-muted rounded-lg text-bone hover:border-bone transition-colors"
          :disabled="!nicknameValid || loading"
        >
          <span class="i-tabler-login icon"></span>
          <span>Простой вход (dev)</span>
        </button>
      </form>
      
      <p class="text-center text-bone-muted text-sm mt-8 flex items-center justify-center gap-2">
        <span class="i-ph-fingerprint icon-sm text-toxic-muted"></span>
        Вход по отпечатку пальца или Face ID
      </p>
    </div>
  </div>
</template>
