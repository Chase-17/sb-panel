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
</script>

<template>
  <div v-if="store.loading" class="text-center py-12 text-bone/60">
    Загрузка...
  </div>
  
  <div v-else-if="char" class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <router-link to="/" class="text-bone/60 hover:text-bone text-sm mb-2 inline-block">
          ← Назад
        </router-link>
        <h1 class="text-3xl font-bold text-bone">{{ char.name }}</h1>
        <p class="text-bone/60 mt-1">{{ data.concept || 'Без концепта' }}</p>
      </div>
      <div class="flex gap-2">
        <button @click="handleExport" class="btn-secondary">📤 Поделиться</button>
        <router-link :to="`/character/${char.id}/edit`" class="btn-primary">
          ✏️ Редактировать
        </router-link>
      </div>
    </div>
    
    <!-- Stats overview -->
    <div class="grid md:grid-cols-3 gap-4 mb-6">
      <!-- Type & derived stats -->
      <div class="card">
        <h3 class="text-bone/60 text-sm mb-3">Тип</h3>
        <p class="text-xl font-bold text-bone">{{ data.character_type || 'Survivor' }}</p>
        <div class="grid grid-cols-2 gap-2 mt-4 text-sm">
          <div>
            <span class="text-bone/60">LP:</span>
            <span class="text-bone ml-1">{{ data.life_points || '—' }}</span>
          </div>
          <div>
            <span class="text-bone/60">EP:</span>
            <span class="text-bone ml-1">{{ data.endurance_points || '—' }}</span>
          </div>
          <div>
            <span class="text-bone/60">Speed:</span>
            <span class="text-bone ml-1">{{ data.speed || '—' }}</span>
          </div>
          <div>
            <span class="text-bone/60">Essence:</span>
            <span class="text-bone ml-1">{{ data.essence || '—' }}</span>
          </div>
        </div>
      </div>
      
      <!-- Attributes -->
      <div class="card md:col-span-2">
        <h3 class="text-bone/60 text-sm mb-3">Атрибуты</h3>
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <div v-for="(label, key) in attrLabels" :key="key" class="text-center">
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
        <h3 class="text-bone/60 text-sm mb-3">Навыки</h3>
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
        <h3 class="text-bone/60 text-sm mb-3">Качества</h3>
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
        <h3 class="text-bone/60 text-sm mb-3">Недостатки</h3>
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
      <h3 class="text-bone/60 text-sm mb-3">Инвентарь</h3>
      <div v-if="data.inventory?.length" class="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
        <div v-for="item in data.inventory" :key="item.name" class="text-bone">
          {{ item.name }}
          <span v-if="item.quantity > 1" class="text-bone/60">×{{ item.quantity }}</span>
        </div>
      </div>
      <p v-else class="text-bone/40 text-sm">Инвентарь пуст</p>
    </div>
    
    <!-- Notes -->
    <div v-if="data.notes" class="card mb-6">
      <h3 class="text-bone/60 text-sm mb-3">Заметки</h3>
      <p class="text-bone whitespace-pre-wrap">{{ data.notes }}</p>
    </div>
    
    <!-- Danger zone -->
    <div class="mt-12 pt-6 border-t border-bone/10">
      <button @click="showDeleteConfirm = true" class="text-blood/60 hover:text-blood text-sm">
        🗑️ Удалить персонажа
      </button>
    </div>
    
    <!-- Export dialog -->
    <Teleport to="body">
      <div v-if="showExportDialog" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" @click.self="showExportDialog = false">
        <div class="card w-full max-w-lg mx-4">
          <h2 class="text-xl font-bold text-bone mb-4">Код персонажа</h2>
          <p class="text-bone/60 text-sm mb-3">Скопируй и отправь другу для импорта</p>
          <textarea
            :value="exportCode"
            readonly
            class="input-field h-32 resize-none font-mono text-xs"
            @focus="$event.target.select()"
          />
          <div class="flex gap-2 justify-end mt-4">
            <button @click="showExportDialog = false" class="btn-secondary">Закрыть</button>
            <button @click="copyCode" class="btn-primary">📋 Скопировать</button>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Delete confirm -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" @click.self="showDeleteConfirm = false">
        <div class="card w-full max-w-sm mx-4">
          <h2 class="text-xl font-bold text-blood mb-4">Удалить персонажа?</h2>
          <p class="text-bone/60 mb-6">{{ char.name }} будет удалён навсегда.</p>
          <div class="flex gap-2 justify-end">
            <button @click="showDeleteConfirm = false" class="btn-secondary">Отмена</button>
            <button @click="handleDelete" class="btn bg-blood text-bone hover:bg-rust">
              Удалить
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
