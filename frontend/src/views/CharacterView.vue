<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCharactersStore } from '../stores/characters'

const route = useRoute()
const router = useRouter()
const store = useCharactersStore()

const exportCode = ref('')
const showExportDialog = ref(false)
const showDeleteConfirm = ref(false)
const copied = ref(false)

const char = computed(() => store.currentCharacter)
const data = computed(() => char.value?.data || {})
const attrs = computed(() => data.value.attributes || {})

onMounted(() => {
  store.fetchCharacter(route.params.id)
})

async function handleExport() {
  const result = await store.exportCharacter(route.params.id)
  if (result) {
    exportCode.value = result.code
    showExportDialog.value = true
  }
}

async function handleDelete() {
  await store.deleteCharacter(route.params.id)
  router.push('/')
}

function copyCode() {
  navigator.clipboard.writeText(exportCode.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

// Attribute abbreviations
const attrLabels = {
  strength: 'СИЛ',
  dexterity: 'ЛОВ',
  constitution: 'ТЕЛ',
  intelligence: 'ИНТ',
  perception: 'ВОС',
  willpower: 'ВОЛ',
}

const attrIcons = {
  strength: 'i-game-icons-muscle-up',
  dexterity: 'i-game-icons-running-ninja',
  constitution: 'i-game-icons-heart-organ',
  intelligence: 'i-game-icons-brain',
  perception: 'i-game-icons-eye-target',
  willpower: 'i-game-icons-psychic-waves',
}
</script>

<template>
  <div v-if="store.loading" class="text-center py-12 text-bone/60 flex items-center justify-center gap-2">
    <span class="i-tabler-loader-2 icon animate-spin"></span>
    Загрузка...
  </div>
  
  <div v-else-if="char" class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <router-link to="/" class="text-bone/60 hover:text-bone text-sm mb-2 inline-flex items-center gap-1">
          <span class="i-tabler-arrow-left icon-sm"></span>
          Назад
        </router-link>
        <h1 class="text-3xl font-bold text-bone flex items-center gap-3">
          <span class="i-game-icons-person icon-xl text-bone/40"></span>
          {{ char.name }}
        </h1>
        <p class="text-bone/60 mt-1">{{ data.concept || 'Без концепта' }}</p>
      </div>
      <div class="flex gap-2">
        <button @click="handleExport" class="btn-secondary flex items-center gap-1.5">
          <span class="i-tabler-share icon-sm"></span>
          Поделиться
        </button>
        <router-link :to="`/character/${char.id}/edit`" class="btn-primary flex items-center gap-1.5">
          <span class="i-tabler-edit icon-sm"></span>
          Редактировать
        </router-link>
      </div>
    </div>
    
    <!-- Stats overview -->
    <div class="grid md:grid-cols-3 gap-4 mb-6">
      <!-- Type & derived stats -->
      <div class="card">
        <h3 class="text-bone/60 text-sm mb-3 flex items-center gap-1.5">
          <span class="i-game-icons-person-rifle icon-sm"></span>
          Тип
        </h3>
        <p class="text-xl font-bold text-bone">{{ data.character_type || 'Survivor' }}</p>
        <div class="grid grid-cols-2 gap-2 mt-4 text-sm">
          <div class="flex items-center gap-1.5">
            <span class="i-game-icons-hearts icon-sm text-blood"></span>
            <span class="text-bone/60">LP:</span>
            <span class="text-bone">{{ data.life_points || '—' }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="i-game-icons-sprint icon-sm text-decay"></span>
            <span class="text-bone/60">EP:</span>
            <span class="text-bone">{{ data.endurance_points || '—' }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="i-game-icons-running-shoe icon-sm text-bone/60"></span>
            <span class="text-bone/60">Speed:</span>
            <span class="text-bone">{{ data.speed || '—' }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="i-game-icons-vine-whip icon-sm text-purple-400"></span>
            <span class="text-bone/60">Essence:</span>
            <span class="text-bone">{{ data.essence || '—' }}</span>
          </div>
        </div>
      </div>
      
      <!-- Attributes -->
      <div class="card md:col-span-2">
        <h3 class="text-bone/60 text-sm mb-3 flex items-center gap-1.5">
          <span class="i-game-icons-progression icon-sm"></span>
          Атрибуты
        </h3>
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <div v-for="(label, key) in attrLabels" :key="key" class="text-center">
            <span :class="attrIcons[key]" class="icon text-bone/40 mb-1"></span>
            <div class="text-2xl font-bold text-bone">{{ attrs[key] || 2 }}</div>
            <div class="text-xs text-bone/60">{{ label }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Skills, Qualities, Drawbacks -->
    <div class="grid md:grid-cols-3 gap-4 mb-6">
      <!-- Skills -->
      <div class="card">
        <h3 class="text-bone/60 text-sm mb-3 flex items-center gap-1.5">
          <span class="i-game-icons-skills icon-sm"></span>
          Навыки
        </h3>
        <div v-if="data.skills?.length" class="space-y-2">
          <div v-for="skill in data.skills" :key="skill.name" class="flex justify-between">
            <span class="text-bone">{{ skill.name }}</span>
            <span class="text-bone/60">{{ skill.level }}</span>
          </div>
        </div>
        <p v-else class="text-bone/40 text-sm">Нет навыков</p>
      </div>
      
      <!-- Qualities -->
      <div class="card">
        <h3 class="text-bone/60 text-sm mb-3 flex items-center gap-1.5">
          <span class="i-game-icons-star-formation icon-sm"></span>
          Качества
        </h3>
        <div v-if="data.qualities?.length" class="space-y-2">
          <div v-for="q in data.qualities" :key="q.name" class="flex justify-between">
            <span class="text-bone">{{ q.name }}</span>
            <span class="text-decay">+{{ q.points }}</span>
          </div>
        </div>
        <p v-else class="text-bone/40 text-sm">Нет качеств</p>
      </div>
      
      <!-- Drawbacks -->
      <div class="card">
        <h3 class="text-bone/60 text-sm mb-3 flex items-center gap-1.5">
          <span class="i-game-icons-broken-skull icon-sm"></span>
          Недостатки
        </h3>
        <div v-if="data.drawbacks?.length" class="space-y-2">
          <div v-for="d in data.drawbacks" :key="d.name" class="flex justify-between">
            <span class="text-bone">{{ d.name }}</span>
            <span class="text-blood">-{{ d.points }}</span>
          </div>
        </div>
        <p v-else class="text-bone/40 text-sm">Нет недостатков</p>
      </div>
    </div>
    
    <!-- Inventory -->
    <div class="card mb-6">
      <h3 class="text-bone/60 text-sm mb-3 flex items-center gap-1.5">
        <span class="i-game-icons-knapsack icon-sm"></span>
        Инвентарь
      </h3>
      <div v-if="data.inventory?.length" class="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
        <div v-for="item in data.inventory" :key="item.name" class="text-bone flex items-center gap-1.5">
          <span class="i-game-icons-swap-bag icon-sm text-bone/40"></span>
          {{ item.name }}
          <span v-if="item.quantity > 1" class="text-bone/60">×{{ item.quantity }}</span>
        </div>
      </div>
      <p v-else class="text-bone/40 text-sm">Инвентарь пуст</p>
    </div>
    
    <!-- Notes -->
    <div v-if="data.notes" class="card mb-6">
      <h3 class="text-bone/60 text-sm mb-3 flex items-center gap-1.5">
        <span class="i-tabler-notes icon-sm"></span>
        Заметки
      </h3>
      <p class="text-bone whitespace-pre-wrap">{{ data.notes }}</p>
    </div>
    
    <!-- Danger zone -->
    <div class="mt-12 pt-6 border-t border-bone/10">
      <button @click="showDeleteConfirm = true" class="text-blood/60 hover:text-blood text-sm flex items-center gap-1.5">
        <span class="i-tabler-trash icon-sm"></span>
        Удалить персонажа
      </button>
    </div>
    
    <!-- Export dialog -->
    <Teleport to="body">
      <div v-if="showExportDialog" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" @click.self="showExportDialog = false">
        <div class="card w-full max-w-lg">
          <h2 class="text-xl font-bold text-bone mb-4 flex items-center gap-2">
            <span class="i-tabler-share icon text-blood"></span>
            Код персонажа
          </h2>
          <p class="text-bone/60 text-sm mb-3">Скопируй и отправь другу для импорта</p>
          <textarea
            :value="exportCode"
            readonly
            class="input-field h-32 resize-none font-mono text-xs"
            @focus="$event.target.select()"
          />
          <div class="flex gap-2 justify-end mt-4">
            <button @click="showExportDialog = false" class="btn-secondary">Закрыть</button>
            <button @click="copyCode" class="btn-primary flex items-center gap-1.5">
              <span :class="copied ? 'i-tabler-check' : 'i-tabler-copy'" class="icon-sm"></span>
              {{ copied ? 'Скопировано!' : 'Скопировать' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Delete confirm -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" @click.self="showDeleteConfirm = false">
        <div class="card w-full max-w-sm">
          <h2 class="text-xl font-bold text-blood mb-4 flex items-center gap-2">
            <span class="i-tabler-alert-triangle icon"></span>
            Удалить персонажа?
          </h2>
          <p class="text-bone/60 mb-6">{{ char.name }} будет удалён навсегда.</p>
          <div class="flex gap-2 justify-end">
            <button @click="showDeleteConfirm = false" class="btn-secondary">Отмена</button>
            <button @click="handleDelete" class="btn bg-blood text-bone hover:bg-blood-light flex items-center gap-1.5">
              <span class="i-tabler-trash icon-sm"></span>
              Удалить
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
