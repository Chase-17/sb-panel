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
      <h1 class="font-display text-2xl text-toxic tracking-wider flex items-center gap-2">
        <span class="i-game-icons-person icon-lg text-toxic-muted"></span>
        МОИ ПЕРСОНАЖИ
      </h1>
      <div class="flex gap-2">
        <button @click="showImportDialog = true" class="btn-secondary flex items-center gap-1.5">
          <span class="i-tabler-download icon-sm"></span>
          Импорт
        </button>
        <button @click="showNewDialog = true" class="btn-primary flex items-center gap-1.5">
          <span class="i-tabler-plus icon-sm"></span>
          Создать
        </button>
      </div>
    </div>
    
    <!-- Loading -->
    <div v-if="store.loading" class="text-center py-12 text-toxic flex items-center justify-center gap-2">
      <span class="i-tabler-loader-2 icon animate-spin"></span>
      Загрузка...
    </div>
    
    <!-- Empty state -->
    <div v-else-if="store.characters.length === 0" class="text-center py-16">
      <div class="i-game-icons-skull w-24 h-24 mx-auto mb-4 text-bone-muted"></div>
      <p class="text-bone-dim text-lg">Пока нет персонажей</p>
      <p class="text-bone-muted mt-2">Создай первого выжившего!</p>
      <button @click="showNewDialog = true" class="btn-primary mt-6 inline-flex items-center gap-2">
        <span class="i-tabler-plus icon-sm"></span>
        Создать персонажа
      </button>
    </div>
    
    <!-- Character list -->
    <div v-else class="grid gap-4 md:grid-cols-2">
      <router-link
        v-for="char in store.characters"
        :key="char.id"
        :to="`/character/${char.id}`"
        class="bg-dark border-2 border-bone-muted hover:border-toxic rounded-lg p-4 transition group"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-3">
            <span class="i-game-icons-person icon-lg text-bone-muted group-hover:text-toxic transition mt-0.5"></span>
            <div>
              <h3 class="text-lg font-semibold text-bone group-hover:text-toxic transition">
                {{ char.name }}
              </h3>
              <p class="text-bone-muted text-sm mt-1">
                {{ char.concept || 'Без концепта' }}
              </p>
            </div>
          </div>
          <span class="text-xs px-2 py-1 rounded border border-toxic-muted text-toxic-muted">
            {{ char.character_type }}
          </span>
        </div>
        <p class="text-bone-muted text-xs mt-4 flex items-center gap-1">
          <span class="i-tabler-clock icon-sm"></span>
          Обновлён {{ formatDate(char.updated_at) }}
        </p>
      </router-link>
    </div>
    
    <!-- New character dialog -->
    <Teleport to="body">
      <div v-if="showNewDialog" class="fixed inset-0 bg-void/95 flex items-center justify-center z-50 p-4" @click.self="showNewDialog = false">
        <div class="bg-night border-2 border-toxic rounded-xl p-6 w-full max-w-lg">
          <h2 class="font-display text-2xl text-toxic mb-6 flex items-center gap-3">
            <span class="i-tabler-plus icon-xl"></span>
            НОВЫЙ ПЕРСОНАЖ
          </h2>
          <input
            v-model="newCharName"
            type="text"
            placeholder="Имя персонажа..."
            class="w-full px-5 py-4 bg-dark border-2 border-bone-muted rounded-lg text-bone text-xl placeholder-bone-muted/50 focus:outline-none focus:border-toxic transition-colors box-border mb-6"
            @keyup.enter="createCharacter"
            autofocus
          />
          <div class="flex gap-3 justify-end">
            <button @click="showNewDialog = false" class="px-6 py-3 bg-surface border-2 border-bone-muted text-bone rounded-lg font-semibold hover:border-bone transition-colors">
              Отмена
            </button>
            <button 
              @click="createCharacter" 
              class="px-6 py-3 bg-toxic border-2 border-toxic text-night rounded-lg font-semibold hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed" 
              :disabled="!newCharName.trim()"
            >
              Создать
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Import dialog -->
    <Teleport to="body">
      <div v-if="showImportDialog" class="fixed inset-0 bg-void/95 flex items-center justify-center z-50 p-4" @click.self="showImportDialog = false">
        <div class="bg-night border-2 border-toxic rounded-xl p-6 w-full max-w-lg">
          <h2 class="font-display text-2xl text-toxic mb-6 flex items-center gap-3">
            <span class="i-tabler-download icon-xl"></span>
            ИМПОРТ ПЕРСОНАЖА
          </h2>
          <textarea
            v-model="importCode"
            placeholder="Вставь код персонажа..."
            class="w-full px-4 py-4 bg-dark border-2 border-bone-muted rounded-lg text-bone placeholder-bone-muted/50 focus:outline-none focus:border-toxic transition-colors h-40 resize-none font-mono text-sm box-border mb-6"
          />
          <div class="flex gap-3 justify-end">
            <button @click="showImportDialog = false" class="px-6 py-3 bg-surface border-2 border-bone-muted text-bone rounded-lg font-semibold hover:border-bone transition-colors">
              Отмена
            </button>
            <button 
              @click="importCharacter" 
              class="px-6 py-3 bg-toxic border-2 border-toxic text-night rounded-lg font-semibold hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="!importCode.trim()"
            >
              Импортировать
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
