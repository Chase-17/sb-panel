<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const nickname = ref('')
const step = ref('nickname') // nickname, ready, prompting
const authMode = ref(null) // 'register' | 'login'
const authOptions = ref(null) // pre-fetched WebAuthn options
const error = ref('')
const loading = ref(false)

const nicknameValid = computed(() => {
  const n = nickname.value.trim()
  return n.length >= 2 && n.length <= 20
})

const isDev = import.meta.env.DEV

// Step 1: fetch WebAuthn options (network call, no biometric yet)
async function handleSubmit() {
  if (!nicknameValid.value) return
  
  error.value = ''
  loading.value = true
  
  try {
    const result = await auth.beginAuth(nickname.value)
    authMode.value = result.mode
    authOptions.value = result.options
    step.value = 'ready'
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// Step 2: trigger WebAuthn prompt (NO network call — instant)
async function handleBiometric() {
  error.value = ''
  loading.value = true
  step.value = 'prompting'
  
  try {
    await auth.completeAuth(nickname.value, { mode: authMode.value, options: authOptions.value })
    router.push('/')
  } catch (e) {
    error.value = e.message
    step.value = 'ready' // let them retry biometric
  } finally {
    loading.value = false
  }
}

function handleBack() {
  step.value = 'nickname'
  authMode.value = null
  authOptions.value = null
  error.value = ''
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
      
      <div class="space-y-6">
        <!-- Step 1: Enter nickname -->
        <template v-if="step === 'nickname'">
          <form @submit.prevent="handleSubmit">
            <div>
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
                2-20 символов. Если ник новый — зарегистрируешься.
              </p>
            </div>
            
            <button
              type="submit"
              class="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2 mt-6"
              :disabled="!nicknameValid || loading"
            >
              <span v-if="loading" class="i-tabler-loader-2 icon animate-spin"></span>
              <span v-else class="i-tabler-arrow-right icon"></span>
              <span>{{ loading ? 'Проверяю...' : 'Продолжить' }}</span>
            </button>
          </form>
          
          <!-- Simple login (dev only) -->
          <button
            v-if="isDev"
            type="button"
            @click="handleSimpleLogin"
            class="w-full py-3 text-lg flex items-center justify-center gap-2 bg-dark border-2 border-bone-muted rounded-lg text-bone hover:border-bone transition-colors"
            :disabled="!nicknameValid || loading"
          >
            <span class="i-tabler-login icon"></span>
            <span>Простой вход (dev)</span>
          </button>
        </template>
        
        <!-- Step 2: Ready for biometric (options pre-loaded) -->
        <template v-else-if="step === 'ready' || step === 'prompting'">
          <div class="text-center">
            <p class="text-bone-muted text-sm uppercase tracking-wide mb-1">
              {{ authMode === 'register' ? 'Регистрация' : 'Вход' }}
            </p>
            <p class="text-toxic font-display text-2xl mb-6">{{ nickname }}</p>
          </div>
          
          <button
            type="button"
            @click="handleBiometric"
            class="btn-primary w-full py-6 text-lg flex flex-col items-center justify-center gap-3"
            :disabled="loading"
          >
            <span v-if="step === 'prompting'" class="i-ph-fingerprint w-14 h-14 animate-pulse"></span>
            <span v-else class="i-ph-fingerprint w-14 h-14"></span>
            <span v-if="step === 'prompting'">Жду отпечаток...</span>
            <span v-else-if="authMode === 'register'">Зарегистрироваться по отпечатку</span>
            <span v-else>Войти по отпечатку</span>
          </button>
          
          <button
            type="button"
            @click="handleBack"
            class="w-full py-2 text-sm text-bone-muted hover:text-bone transition-colors flex items-center justify-center gap-1"
            :disabled="loading"
          >
            <span class="i-tabler-arrow-left icon-sm"></span>
            Назад
          </button>
        </template>
        
        <!-- Error message -->
        <div v-if="error" class="bg-blood/20 border-2 border-blood rounded-lg p-3 text-bone flex items-start gap-2">
          <span class="i-tabler-alert-circle icon text-blood shrink-0 mt-0.5"></span>
          <span>{{ error }}</span>
        </div>
      </div>
      
      <p class="text-center text-bone-muted text-sm mt-8 flex items-center justify-center gap-2">
        <span class="i-ph-fingerprint icon-sm text-toxic-muted"></span>
        Вход по отпечатку пальца или Face ID
      </p>
    </div>
  </div>
</template>
