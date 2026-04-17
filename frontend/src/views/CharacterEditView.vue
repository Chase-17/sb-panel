<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCharactersStore } from '../stores/characters'

const route = useRoute()
const router = useRouter()
const store = useCharactersStore()

// Form state
const name = ref('')
const characterType = ref('')
const attributes = ref({
  strength: 2,
  dexterity: 2,
  constitution: 2,
  intelligence: 2,
  perception: 2,
  willpower: 2,
})
const lifePoints = ref(0)
const endurancePoints = ref(0)
const speed = ref(0)
const essence = ref(0)
const skills = ref([])
const qualities = ref([])
const drawbacks = ref([])
const inventory = ref([])
const notes = ref('')

// Derived stats calculation
const derivedStats = computed(() => {
  const str = attributes.value.strength
  const con = attributes.value.constitution
  const dex = attributes.value.dexterity
  const wil = attributes.value.willpower
  
  return {
    lifePoints: (str + con) * 4 + 10,
    endurancePoints: (str + con + wil) * 3 + 5,
    speed: (con + dex) * 2,
    essence: Math.round((str + dex + con + attributes.value.intelligence + attributes.value.perception + wil) / 6) * 2
  }
})

// Attribute points tracking
const totalAttributePoints = 20
const spentAttributePoints = computed(() => {
  return Object.values(attributes.value).reduce((sum, val) => sum + val, 0)
})
const attributePointsRemaining = computed(() => totalAttributePoints - spentAttributePoints.value)

// Auto-fill derived stats
watch(derivedStats, (stats) => {
  if (lifePoints.value === 0) lifePoints.value = stats.lifePoints
  if (endurancePoints.value === 0) endurancePoints.value = stats.endurancePoints
  if (speed.value === 0) speed.value = stats.speed
  if (essence.value === 0) essence.value = stats.essence
}, { immediate: true })

// Load character data
onMounted(async () => {
  await store.fetchCharacter(route.params.id)
  if (store.currentCharacter) {
    const c = store.currentCharacter
    name.value = c.name
    characterType.value = c.data.character_type || ''
    attributes.value = { ...attributes.value, ...c.data.attributes }
    lifePoints.value = c.data.life_points || derivedStats.value.lifePoints
    endurancePoints.value = c.data.endurance_points || derivedStats.value.endurancePoints
    speed.value = c.data.speed || derivedStats.value.speed
    essence.value = c.data.essence || derivedStats.value.essence
    skills.value = c.data.skills || []
    qualities.value = c.data.qualities || []
    drawbacks.value = c.data.drawbacks || []
    inventory.value = c.data.inventory || []
    notes.value = c.data.notes || ''
  }
})

// Save
async function save() {
  // Preserve storage from existing data
  const existingData = store.currentCharacter?.data || {}
  await store.updateCharacter(route.params.id, {
    name: name.value,
    data: {
      character_type: characterType.value,
      attributes: attributes.value,
      life_points: lifePoints.value,
      life_points_max: lifePoints.value,
      endurance_points: endurancePoints.value,
      endurance_points_max: endurancePoints.value,
      speed: speed.value,
      essence: essence.value,
      essence_max: essence.value,
      skills: skills.value,
      qualities: qualities.value,
      drawbacks: drawbacks.value,
      inventory: inventory.value,
      storage: existingData.storage || [],
      notes: notes.value,
    }
  })
  router.push(`/character/${route.params.id}`)
}

// List item helpers - no longer needed, editing done on main screen

const attrKeys = ['strength', 'dexterity', 'constitution', 'intelligence', 'perception', 'willpower']
const attrLabels = {
  strength: 'Сила',
  dexterity: 'Ловкость',
  constitution: 'Телосложение',
  intelligence: 'Интеллект',
  perception: 'Восприятие',
  willpower: 'Воля',
}
const attrIcons = {
  strength: 'i-game-icons-muscle-up',
  dexterity: 'i-game-icons-running-ninja',
  constitution: 'i-game-icons-heart-organ',
  intelligence: 'i-game-icons-brain',
  perception: 'i-game-icons-eye-target',
  willpower: 'i-game-icons-psychic-waves',
}
const attrColors = {
  strength: 'text-red-400',
  dexterity: 'text-yellow-400',
  constitution: 'text-orange-400',
  intelligence: 'text-blue-400',
  perception: 'text-cyan-400',
  willpower: 'text-purple-400',
}
</script>

<template>
  <div class="pb-16 bg-void min-h-screen overflow-x-hidden">
    <!-- Top bar -->
    <div class="sticky top-0 z-10 bg-night border-b-2 border-toxic-muted px-3 py-3 flex items-center justify-between">
      <router-link :to="`/character/${route.params.id}`" class="text-bone-muted hover:text-toxic flex items-center gap-1 transition-colors font-sans">
        <span class="i-tabler-arrow-left icon-lg"></span>
        <span class="text-base">Отмена</span>
      </router-link>
      <button @click="save" class="btn-primary flex items-center gap-1.5 font-sans">
        <span class="i-tabler-device-floppy icon"></span>
        Сохранить
      </button>
    </div>
    
    <div class="p-3 space-y-4">
      <!-- Basic info -->
      <section class="bg-dark border-2 border-bone-muted/50 rounded-lg p-3">
        <h2 class="font-sans text-base text-bone-dim tracking-wider uppercase mb-3 flex items-center gap-2">
          <span class="i-game-icons-person icon-lg text-toxic"></span>
          ОСНОВНОЕ
        </h2>
        <div class="space-y-3">
          <div>
            <label class="block text-bone-muted text-sm font-sans uppercase tracking-wide mb-1">Имя</label>
            <input v-model="name" type="text" class="input-field" placeholder="Имя персонажа" />
          </div>
          <div>
            <label class="block text-bone-muted text-sm font-sans uppercase tracking-wide mb-1">Тип персонажа</label>
            <input v-model="characterType" type="text" class="input-field" placeholder="Survivor, Inspired..." />
          </div>
        </div>
      </section>
      
      <!-- Attributes -->
      <section class="bg-dark border-2 border-bone-muted/50 rounded-lg p-3">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-sans text-base text-bone-dim tracking-wider uppercase flex items-center gap-2">
            <span class="i-game-icons-progression icon-lg text-toxic"></span>
            АТРИБУТЫ
          </h2>
          <span :class="attributePointsRemaining < 0 ? 'text-blood' : 'text-toxic'" class="text-lg font-sans font-bold flex items-center gap-1">
            <span class="i-game-icons-coins icon"></span>
            {{ attributePointsRemaining }}
          </span>
        </div>
        
        <!-- Attribute rows -->
        <div class="space-y-2">
          <div v-for="key in attrKeys" :key="key" class="flex items-center justify-between py-1 border-b border-bone-muted/20 last:border-b-0">
            <div class="flex items-center gap-2 min-w-0">
              <span :class="[attrIcons[key], attrColors[key]]" class="icon flex-none"></span>
              <span class="text-bone text-base font-sans truncate">{{ attrLabels[key] }}</span>
            </div>
            <div class="flex items-center gap-0 flex-none">
              <button 
                @click="attributes[key] = Math.max(1, attributes[key] - 1)"
                class="w-8 h-8 flex items-center justify-center text-bone-muted hover:text-toxic rounded transition-colors"
              >
                <span class="i-tabler-minus icon-sm"></span>
              </button>
              <span :class="attrColors[key]" class="text-xl font-sans font-bold w-8 text-center">{{ attributes[key] }}</span>
              <button 
                @click="attributes[key] = attributes[key] + 1"
                class="w-8 h-8 flex items-center justify-center text-bone-muted hover:text-toxic rounded transition-colors"
              >
                <span class="i-tabler-plus icon-sm"></span>
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Derived stats -->
      <section class="bg-dark border-2 border-bone-muted/50 rounded-lg p-3">
        <h2 class="font-sans text-base text-bone-dim tracking-wider uppercase mb-3 flex items-center gap-2">
          <span class="i-game-icons-stats icon-lg text-toxic"></span>
          ПРОИЗВОДНЫЕ ХАРАКТЕРИСТИКИ
        </h2>
        
        <div class="space-y-2">
          <!-- LP -->
          <div class="flex items-center justify-between py-1 border-b border-bone-muted/20">
            <div class="flex items-center gap-2 min-w-0">
              <span class="i-game-icons-hearts icon text-health flex-none"></span>
              <span class="text-bone text-base font-sans">LP</span>
              <span class="text-bone-muted/50 text-xs">({{ derivedStats.lifePoints }})</span>
            </div>
            <div class="flex items-center gap-0 flex-none">
              <button 
                @click="lifePoints = Math.max(1, lifePoints - 1)"
                class="w-8 h-8 flex items-center justify-center text-bone-muted hover:text-health rounded transition-colors"
              >
                <span class="i-tabler-minus icon-sm"></span>
              </button>
              <span class="text-health text-xl font-sans font-bold w-10 text-center">{{ lifePoints }}</span>
              <button 
                @click="lifePoints++"
                class="w-8 h-8 flex items-center justify-center text-bone-muted hover:text-health rounded transition-colors"
              >
                <span class="i-tabler-plus icon-sm"></span>
              </button>
            </div>
          </div>
          
          <!-- EP -->
          <div class="flex items-center justify-between py-1 border-b border-bone-muted/20">
            <div class="flex items-center gap-2 min-w-0">
              <span class="i-game-icons-sprint icon text-energy flex-none"></span>
              <span class="text-bone text-base font-sans">EP</span>
              <span class="text-bone-muted/50 text-xs">({{ derivedStats.endurancePoints }})</span>
            </div>
            <div class="flex items-center gap-0 flex-none">
              <button 
                @click="endurancePoints = Math.max(1, endurancePoints - 1)"
                class="w-8 h-8 flex items-center justify-center text-bone-muted hover:text-energy rounded transition-colors"
              >
                <span class="i-tabler-minus icon-sm"></span>
              </button>
              <span class="text-energy text-xl font-sans font-bold w-10 text-center">{{ endurancePoints }}</span>
              <button 
                @click="endurancePoints++"
                class="w-8 h-8 flex items-center justify-center text-bone-muted hover:text-energy rounded transition-colors"
              >
                <span class="i-tabler-plus icon-sm"></span>
              </button>
            </div>
          </div>
          
          <!-- SP -->
          <div class="flex items-center justify-between py-1 border-b border-bone-muted/20">
            <div class="flex items-center gap-2 min-w-0">
              <span class="i-game-icons-running-shoe icon text-speed flex-none"></span>
              <span class="text-bone text-base font-sans">SP</span>
              <span class="text-bone-muted/50 text-xs">({{ derivedStats.speed }})</span>
            </div>
            <div class="flex items-center gap-0 flex-none">
              <button 
                @click="speed = Math.max(1, speed - 1)"
                class="w-8 h-8 flex items-center justify-center text-bone-muted hover:text-speed rounded transition-colors"
              >
                <span class="i-tabler-minus icon-sm"></span>
              </button>
              <span class="text-speed text-xl font-sans font-bold w-10 text-center">{{ speed }}</span>
              <button 
                @click="speed++"
                class="w-8 h-8 flex items-center justify-center text-bone-muted hover:text-speed rounded transition-colors"
              >
                <span class="i-tabler-plus icon-sm"></span>
              </button>
            </div>
          </div>
          
          <!-- ES -->
          <div class="flex items-center justify-between py-1">
            <div class="flex items-center gap-2 min-w-0">
              <span class="i-game-icons-vine-whip icon text-essence flex-none"></span>
              <span class="text-bone text-base font-sans">ES</span>
              <span class="text-bone-muted/50 text-xs">({{ derivedStats.essence }})</span>
            </div>
            <div class="flex items-center gap-0 flex-none">
              <button 
                @click="essence = Math.max(1, essence - 1)"
                class="w-8 h-8 flex items-center justify-center text-bone-muted hover:text-essence rounded transition-colors"
              >
                <span class="i-tabler-minus icon-sm"></span>
              </button>
              <span class="text-essence text-xl font-sans font-bold w-10 text-center">{{ essence }}</span>
              <button 
                @click="essence++"
                class="w-8 h-8 flex items-center justify-center text-bone-muted hover:text-essence rounded transition-colors"
              >
                <span class="i-tabler-plus icon-sm"></span>
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Notes -->
      <section class="bg-dark border-2 border-bone-muted/50 rounded-lg p-3">
        <h2 class="font-sans text-base text-bone-dim tracking-wider uppercase mb-3 flex items-center gap-2">
          <span class="i-tabler-notes icon-lg text-toxic"></span>
          ЗАМЕТКИ
        </h2>
        <textarea 
          v-model="notes" 
          placeholder="Бэкграунд, особенности, мотивация..."
          class="input-field h-32 resize-y font-sans text-base"
        />
      </section>
    </div>
    
    <!-- Floating save button for mobile -->
    <div class="fixed bottom-3 left-3 right-3 md:hidden flex justify-center">
      <button @click="save" class="btn-primary shadow-[0_0_20px_rgba(57,255,20,0.3)] font-sans px-5 py-2 flex items-center gap-2">
        <span class="i-tabler-device-floppy icon"></span>
        Сохранить
      </button>
    </div>
  </div>
</template>
