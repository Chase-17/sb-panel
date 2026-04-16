<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCharactersStore } from '../stores/characters'

const router = useRouter()
const store = useCharactersStore()

const showNewDialog = ref(false)
const newCharName = ref('')
const importCode = ref('')
const showImportDialog = ref(false)

onMounted(() => {
  store.fetchCharacters()
})

async function createCharacter() {
  if (!newCharName.value.trim()) return
  
  const char = await store.createCharacter(newCharName.value.trim())
  if (char) {
    showNewDialog.value = false
    newCharName.value = ''
    router.push(`/character/${char.id}/edit`)
  }
}

async function importCharacter() {
  if (!importCode.value.trim()) return
  
  const char = await store.importCharacter(importCode.value.trim())
  if (char) {
    showImportDialog.value = false
    importCode.value = ''
    router.push(`/character/${char.id}`)
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-bold text-bone">Мои персонажи</h1>
      <div class="flex gap-2">
        <button @click="showImportDialog = true" class="btn-secondary">
          📥 Импорт
        </button>
        <button @click="showNewDialog = true" class="btn-primary">
          + Создать
        </button>
      </div>
    </div>
    
    <!-- Loading -->
    <div v-if="store.loading" class="text-center py-12 text-bone/60">
      Загрузка...
    </div>
    
    <!-- Empty state -->
    <div v-else-if="store.characters.length === 0" class="text-center py-16">
      <div class="text-6xl mb-4">💀</div>
      <p class="text-bone/60 text-lg">Пока нет персонажей</p>
      <p class="text-bone/40 mt-2">Создай первого выжившего!</p>
      <button @click="showNewDialog = true" class="btn-primary mt-6">
        + Создать персонажа
      </button>
    </div>
    
    <!-- Character list -->
    <div v-else class="grid gap-4 md:grid-cols-2">
      <router-link
        v-for="char in store.characters"
        :key="char.id"
        :to="`/character/${char.id}`"
        class="card hover:border-blood/50 transition group"
      >
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-semibold text-bone group-hover:text-blood transition">
              {{ char.name }}
            </h3>
            <p class="text-bone/60 text-sm mt-1">
              {{ char.concept || 'Без концепта' }}
            </p>
          </div>
          <span class="text-xs px-2 py-1 rounded bg-decay/30 text-bone/80">
            {{ char.character_type }}
          </span>
        </div>
        <p class="text-bone/40 text-xs mt-4">
          Обновлён {{ formatDate(char.updated_at) }}
        </p>
      </router-link>
    </div>
    
    <!-- New character dialog -->
    <Teleport to="body">
      <div v-if="showNewDialog" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" @click.self="showNewDialog = false">
        <div class="card w-full max-w-md mx-4">
          <h2 class="text-xl font-bold text-bone mb-4">Новый персонаж</h2>
          <input
            v-model="newCharName"
            type="text"
            placeholder="Имя персонажа..."
            class="input-field mb-4"
            @keyup.enter="createCharacter"
            autofocus
          />
          <div class="flex gap-2 justify-end">
            <button @click="showNewDialog = false" class="btn-secondary">Отмена</button>
            <button @click="createCharacter" class="btn-primary" :disabled="!newCharName.trim()">
              Создать
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Import dialog -->
    <Teleport to="body">
      <div v-if="showImportDialog" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" @click.self="showImportDialog = false">
        <div class="card w-full max-w-md mx-4">
          <h2 class="text-xl font-bold text-bone mb-4">Импорт персонажа</h2>
          <textarea
            v-model="importCode"
            placeholder="Вставь код персонажа..."
            class="input-field mb-4 h-32 resize-none font-mono text-sm"
          />
          <div class="flex gap-2 justify-end">
            <button @click="showImportDialog = false" class="btn-secondary">Отмена</button>
            <button @click="importCharacter" class="btn-primary" :disabled="!importCode.trim()">
              Импортировать
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
