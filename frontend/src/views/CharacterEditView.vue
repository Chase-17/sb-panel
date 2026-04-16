<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCharactersStore } from '../stores/characters'

const route = useRoute()
const router = useRouter()
const store = useCharactersStore()

// Form state
const name = ref('')
const concept = ref('')
const characterType = ref('Survivor')
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
const totalAttributePoints = 20 // Default for Norms
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
    concept.value = c.data.concept || ''
    characterType.value = c.data.character_type || 'Survivor'
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
  await store.updateCharacter(route.params.id, {
    name: name.value,
    data: {
      concept: concept.value,
      character_type: characterType.value,
      attributes: attributes.value,
      life_points: lifePoints.value,
      endurance_points: endurancePoints.value,
      speed: speed.value,
      essence: essence.value,
      skills: skills.value,
      qualities: qualities.value,
      drawbacks: drawbacks.value,
      inventory: inventory.value,
      notes: notes.value,
    }
  })
  router.push(`/character/${route.params.id}`)
}

// List item helpers
function addSkill() {
  skills.value.push({ name: '', level: 1, attribute: 'intelligence' })
}
function removeSkill(index) {
  skills.value.splice(index, 1)
}

function addQuality() {
  qualities.value.push({ name: '', points: 1, description: '' })
}
function removeQuality(index) {
  qualities.value.splice(index, 1)
}

function addDrawback() {
  drawbacks.value.push({ name: '', points: 1, description: '' })
}
function removeDrawback(index) {
  drawbacks.value.splice(index, 1)
}

function addItem() {
  inventory.value.push({ name: '', quantity: 1, notes: '' })
}
function removeItem(index) {
  inventory.value.splice(index, 1)
}

const characterTypes = ['Survivor', 'Norm', 'Inspired']
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
</script>

<template>
  <div class="max-w-4xl mx-auto pb-20">
    <div class="flex items-center justify-between mb-6">
      <router-link :to="`/character/${route.params.id}`" class="text-bone/60 hover:text-bone text-sm flex items-center gap-1">
        <span class="i-tabler-arrow-left icon-sm"></span>
        Отмена
      </router-link>
      <button @click="save" class="btn-primary flex items-center gap-1.5">
        <span class="i-tabler-device-floppy icon-sm"></span>
        Сохранить
      </button>
    </div>
    
    <!-- Basic info -->
    <div class="card mb-6">
      <h2 class="text-lg font-bold text-bone mb-4 flex items-center gap-2">
        <span class="i-game-icons-person icon text-bone/40"></span>
        Основное
      </h2>
      <div class="grid md:grid-cols-3 gap-4">
        <div>
          <label class="block text-bone/60 text-sm mb-1">Имя</label>
          <input v-model="name" type="text" class="input-field" />
        </div>
        <div>
          <label class="block text-bone/60 text-sm mb-1">Концепт</label>
          <input v-model="concept" type="text" class="input-field" placeholder="Ex-военный, Учёный..." />
        </div>
        <div>
          <label class="block text-bone/60 text-sm mb-1">Тип персонажа</label>
          <select v-model="characterType" class="input-field">
            <option v-for="t in characterTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Attributes -->
    <div class="card mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-bone flex items-center gap-2">
          <span class="i-game-icons-progression icon text-bone/40"></span>
          Атрибуты
        </h2>
        <span :class="attributePointsRemaining < 0 ? 'text-blood' : 'text-bone/60'" class="text-sm flex items-center gap-1">
          <span class="i-game-icons-coins icon-sm"></span>
          Очков: {{ attributePointsRemaining }}
        </span>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div v-for="key in attrKeys" :key="key">
          <label class="block text-bone/60 text-sm mb-1 flex items-center gap-1.5">
            <span :class="attrIcons[key]" class="icon-sm text-bone/40"></span>
            {{ attrLabels[key] }}
          </label>
          <div class="flex items-center gap-2">
            <button 
              @click="attributes[key] = Math.max(1, attributes[key] - 1)"
              class="btn-secondary w-10 h-10 flex items-center justify-center"
            >
              <span class="i-tabler-minus icon-sm"></span>
            </button>
            <input 
              v-model.number="attributes[key]" 
              type="number" 
              min="1" 
              max="6"
              class="input-field text-center w-16"
            />
            <button 
              @click="attributes[key] = Math.min(6, attributes[key] + 1)"
              class="btn-secondary w-10 h-10 flex items-center justify-center"
            >
              <span class="i-tabler-plus icon-sm"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Derived stats -->
    <div class="card mb-6">
      <h2 class="text-lg font-bold text-bone mb-4 flex items-center gap-2">
        <span class="i-game-icons-stats icon text-bone/40"></span>
        Производные характеристики
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-bone/60 text-sm mb-1 flex items-center gap-1">
            <span class="i-game-icons-hearts icon-sm text-blood"></span>
            Life Points
            <span class="text-bone/40">({{ derivedStats.lifePoints }})</span>
          </label>
          <input v-model.number="lifePoints" type="number" class="input-field" />
        </div>
        <div>
          <label class="block text-bone/60 text-sm mb-1 flex items-center gap-1">
            <span class="i-game-icons-sprint icon-sm text-decay"></span>
            Endurance
            <span class="text-bone/40">({{ derivedStats.endurancePoints }})</span>
          </label>
          <input v-model.number="endurancePoints" type="number" class="input-field" />
        </div>
        <div>
          <label class="block text-bone/60 text-sm mb-1 flex items-center gap-1">
            <span class="i-game-icons-running-shoe icon-sm text-bone/60"></span>
            Speed
            <span class="text-bone/40">({{ derivedStats.speed }})</span>
          </label>
          <input v-model.number="speed" type="number" class="input-field" />
        </div>
        <div>
          <label class="block text-bone/60 text-sm mb-1 flex items-center gap-1">
            <span class="i-game-icons-vine-whip icon-sm text-purple-400"></span>
            Essence
            <span class="text-bone/40">({{ derivedStats.essence }})</span>
          </label>
          <input v-model.number="essence" type="number" class="input-field" />
        </div>
      </div>
    </div>
    
    <!-- Skills -->
    <div class="card mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-bone flex items-center gap-2">
          <span class="i-game-icons-skills icon text-bone/40"></span>
          Навыки
        </h2>
        <button @click="addSkill" class="btn-secondary text-sm flex items-center gap-1">
          <span class="i-tabler-plus icon-sm"></span>
          Добавить
        </button>
      </div>
      <div v-if="skills.length" class="space-y-3">
        <div v-for="(skill, i) in skills" :key="i" class="flex gap-2 items-end">
          <div class="flex-1">
            <input v-model="skill.name" type="text" placeholder="Название навыка" class="input-field" />
          </div>
          <div class="w-20">
            <input v-model.number="skill.level" type="number" min="1" max="5" class="input-field text-center" />
          </div>
          <button @click="removeSkill(i)" class="btn-secondary text-blood/60 hover:text-blood w-10 h-10 flex items-center justify-center">
            <span class="i-tabler-x icon-sm"></span>
          </button>
        </div>
      </div>
      <p v-else class="text-bone/40 text-sm">Нажми «Добавить» чтобы добавить навык</p>
    </div>
    
    <!-- Qualities -->
    <div class="card mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-bone flex items-center gap-2">
          <span class="i-game-icons-star-formation icon text-bone/40"></span>
          Качества
        </h2>
        <button @click="addQuality" class="btn-secondary text-sm flex items-center gap-1">
          <span class="i-tabler-plus icon-sm"></span>
          Добавить
        </button>
      </div>
      <div v-if="qualities.length" class="space-y-3">
        <div v-for="(q, i) in qualities" :key="i" class="flex gap-2 items-end">
          <div class="flex-1">
            <input v-model="q.name" type="text" placeholder="Название" class="input-field" />
          </div>
          <div class="w-20">
            <input v-model.number="q.points" type="number" min="1" class="input-field text-center" placeholder="Pts" />
          </div>
          <button @click="removeQuality(i)" class="btn-secondary text-blood/60 hover:text-blood w-10 h-10 flex items-center justify-center">
            <span class="i-tabler-x icon-sm"></span>
          </button>
        </div>
      </div>
      <p v-else class="text-bone/40 text-sm">Качества дают бонусы</p>
    </div>
    
    <!-- Drawbacks -->
    <div class="card mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-bone flex items-center gap-2">
          <span class="i-game-icons-broken-skull icon text-bone/40"></span>
          Недостатки
        </h2>
        <button @click="addDrawback" class="btn-secondary text-sm flex items-center gap-1">
          <span class="i-tabler-plus icon-sm"></span>
          Добавить
        </button>
      </div>
      <div v-if="drawbacks.length" class="space-y-3">
        <div v-for="(d, i) in drawbacks" :key="i" class="flex gap-2 items-end">
          <div class="flex-1">
            <input v-model="d.name" type="text" placeholder="Название" class="input-field" />
          </div>
          <div class="w-20">
            <input v-model.number="d.points" type="number" min="1" class="input-field text-center" placeholder="Pts" />
          </div>
          <button @click="removeDrawback(i)" class="btn-secondary text-blood/60 hover:text-blood w-10 h-10 flex items-center justify-center">
            <span class="i-tabler-x icon-sm"></span>
          </button>
        </div>
      </div>
      <p v-else class="text-bone/40 text-sm">Недостатки дают дополнительные очки</p>
    </div>
    
    <!-- Inventory -->
    <div class="card mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-bone flex items-center gap-2">
          <span class="i-game-icons-knapsack icon text-bone/40"></span>
          Инвентарь
        </h2>
        <button @click="addItem" class="btn-secondary text-sm flex items-center gap-1">
          <span class="i-tabler-plus icon-sm"></span>
          Добавить
        </button>
      </div>
      <div v-if="inventory.length" class="space-y-3">
        <div v-for="(item, i) in inventory" :key="i" class="flex gap-2 items-end">
          <div class="flex-1">
            <input v-model="item.name" type="text" placeholder="Предмет" class="input-field" />
          </div>
          <div class="w-20">
            <input v-model.number="item.quantity" type="number" min="1" class="input-field text-center" placeholder="Кол." />
          </div>
          <button @click="removeItem(i)" class="btn-secondary text-blood/60 hover:text-blood w-10 h-10 flex items-center justify-center">
            <span class="i-tabler-x icon-sm"></span>
          </button>
        </div>
      </div>
      <p v-else class="text-bone/40 text-sm">Добавь снаряжение и предметы</p>
    </div>
    
    <!-- Notes -->
    <div class="card mb-6">
      <h2 class="text-lg font-bold text-bone mb-4 flex items-center gap-2">
        <span class="i-tabler-notes icon text-bone/40"></span>
        Заметки
      </h2>
      <textarea 
        v-model="notes" 
        placeholder="Бэкграунд, особенности, мотивация..."
        class="input-field h-32 resize-y"
      />
    </div>
    
    <!-- Floating save button for mobile -->
    <div class="fixed bottom-4 right-4 md:hidden">
      <button @click="save" class="btn-primary shadow-lg text-lg px-6 py-3 flex items-center gap-2">
        <span class="i-tabler-device-floppy icon"></span>
        Сохранить
      </button>
    </div>
  </div>
</template>
