<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCharactersStore } from '../stores/characters'

const route = useRoute()
const router = useRouter()
const store = useCharactersStore()

// UI state
const activeMode = ref('active') // 'active' | 'archive'
const compactHeader = ref(false)
const shareLink = ref('')
const showShareDialog = ref(false)
const showDeleteConfirm = ref(false)
const copied = ref(false)

// View modal state (click to view details, then can edit)
const showViewModal = ref(false)
const viewingSection = ref('')
const viewingIndex = ref(-1)
const viewingItem = ref(null)

// View modes for each section: 'large' | 'small' | 'list' | 'table'
const viewModes = reactive({
  skills: 'large',
  qualities: 'large',
  drawbacks: 'large',
  inventory: 'list', // inventory only uses list/table
})

// Filters
const filters = reactive({
  skills: '',
  qualities: '',
  drawbacks: '',
  inventory: '',
})
const showFilters = reactive({
  skills: false,
  qualities: false,
  drawbacks: false,
  inventory: false,
})

// Add/Edit modal state
const showItemModal = ref(false)
const editingSection = ref('') // 'skills' | 'qualities' | 'drawbacks' | 'inventory'
const editingIndex = ref(-1) // -1 = new item
const editingItem = reactive({
  // Common fields
  name: '',
  icon: 'i-game-icons-skills',
  description: '',
  color: '',
  category: '',
  broken: false,
  // Skills
  level: 1,
  // Qualities/Drawbacks
  points: 1,
  // Inventory - type & basic
  itemType: 'simple', // 'simple' | 'quantity' | 'weapon' | 'weapon_ammo' | 'weapon_mag' | 'armor'
  quantity: 1,
  unit: 'шт',
  // Weapon fields
  damage: '',
  range: '',
  // Ammo fields
  ammo: 0,
  ammo_type: '',
  // Magazine fields
  mag: 0,
  mag_max: 0,
  ammo_reserve: 0,
  // Armor fields
  armor_value: 0,
  armor_location: '',
})
const newCategory = ref('')
const showExtendedLevels = ref(false)

// Inventory item types
const itemTypes = [
  { value: 'simple', label: 'Простой', icon: 'i-game-icons-key' },
  { value: 'quantity', label: 'С количеством', icon: 'i-game-icons-cardboard-box' },
  { value: 'weapon', label: 'Оружие', icon: 'i-game-icons-knife-thrust' },
  { value: 'weapon_ammo', label: 'Оружие с запасом', icon: 'i-game-icons-bow-arrow' },
  { value: 'weapon_mag', label: 'Огнестрел', icon: 'i-game-icons-pistol-gun' },
  { value: 'armor', label: 'Броня', icon: 'i-game-icons-chest-armor' },
]

// Format quantity display
function formatQuantity(item) {
  if (!item.quantity || item.quantity <= 1) return ''
  const unit = item.unit || 'шт'
  if (unit === 'шт') return `×${item.quantity}`
  return `${item.quantity}${unit}`
}

// Inventory categories
const inventoryCategories = [
  { value: 'weapon', label: 'Оружие' },
  { value: 'armor', label: 'Броня' },
  { value: 'consumable', label: 'Расходники' },
  { value: 'medicine', label: 'Медицина' },
  { value: 'food', label: 'Продовольствие' },
  { value: 'misc', label: 'Прочее' },
]

// Available colors for picker
const availableColors = [
  { name: 'Зелёный', value: 'toxic', class: 'bg-toxic' },
  { name: 'Голубой', value: 'cyan-400', class: 'bg-cyan-400' },
  { name: 'Красный', value: 'red-500', class: 'bg-red-500' },
  { name: 'Жёлтый', value: 'yellow-400', class: 'bg-yellow-400' },
  { name: 'Оранжевый', value: 'orange-400', class: 'bg-orange-400' },
  { name: 'Фиолетовый', value: 'purple-400', class: 'bg-purple-400' },
  { name: 'Розовый', value: 'pink-400', class: 'bg-pink-400' },
  { name: 'Синий', value: 'blue-400', class: 'bg-blue-400' },
]

// Available icons for picker - verified game-icons names
const availableIcons = [
  // Combat & Weapons
  'i-game-icons-fist', 'i-game-icons-punch-blast', 'i-game-icons-high-kick',
  'i-game-icons-pistol-gun', 'i-game-icons-semi-automatic-gun', 'i-game-icons-revolver',
  'i-game-icons-ak47', 'i-game-icons-ak47u', 'i-game-icons-mp5',
  'i-game-icons-blunderbuss', 'i-game-icons-winchester-rifle', 'i-game-icons-spectre-m4',
  'i-game-icons-uzi', 'i-game-icons-sawed-off-shotgun', 'i-game-icons-desert-eagle',
  'i-game-icons-knife-thrust', 'i-game-icons-bowie-knife', 'i-game-icons-machete',
  'i-game-icons-tomahawk', 'i-game-icons-baseball-bat', 'i-game-icons-thor-hammer',
  'i-game-icons-fire-axe', 'i-game-icons-battle-axe', 'i-game-icons-wood-axe',
  'i-game-icons-crowbar', 'i-game-icons-spiked-bat', 'i-game-icons-flail',
  'i-game-icons-brass-knuckles', 'i-game-icons-crossbow', 'i-game-icons-bow-arrow',
  'i-game-icons-thrown-knife', 'i-game-icons-grenade', 'i-game-icons-molotov',
  'i-game-icons-dynamite', 'i-game-icons-mine-explosion', 'i-game-icons-caltrops',
  
  // Skills & Abilities
  'i-game-icons-skills', 'i-game-icons-auto-repair', 'i-game-icons-cog',
  'i-game-icons-gears', 'i-game-icons-brain', 'i-game-icons-brain-stem',
  'i-game-icons-talk', 'i-game-icons-conversation', 'i-game-icons-public-speaker',
  'i-game-icons-lock-picking', 'i-game-icons-padlock-open', 'i-game-icons-padlock',
  'i-game-icons-spy', 'i-game-icons-ninja-mask', 'i-game-icons-invisible',
  'i-game-icons-run', 'i-game-icons-sprint', 'i-game-icons-running-ninja',
  'i-game-icons-jump-across', 'i-game-icons-acrobatic', 'i-game-icons-falling',
  'i-game-icons-mountain-climbing', 'i-game-icons-rope-coil', 'i-game-icons-parachute',
  'i-game-icons-swimming', 'i-game-icons-diving-helmet', 'i-game-icons-drowning',
  'i-game-icons-eye-target', 'i-game-icons-binoculars', 'i-game-icons-radar-sweep',
  'i-game-icons-thermometer-scale', 'i-game-icons-nose-front', 'i-game-icons-ear',
  'i-game-icons-muscle-up', 'i-game-icons-weight-lifting-up', 'i-game-icons-weight',
  'i-game-icons-first-aid-kit', 'i-game-icons-medical-pack', 'i-game-icons-hospital-cross',
  'i-game-icons-syringe', 'i-game-icons-pill', 'i-game-icons-medicines',
  'i-game-icons-car', 'i-game-icons-truck', 'i-game-icons-motorcycle',
  'i-game-icons-speedboat', 'i-game-icons-helicopter', 'i-game-icons-commercial-airplane',
  'i-game-icons-artificial-intelligence', 'i-game-icons-laptop', 'i-game-icons-circuitry',
  'i-game-icons-radio-tower', 'i-game-icons-walkie-talkie', 'i-game-icons-satellite-communication',
  'i-game-icons-cooking-pot', 'i-game-icons-campfire', 'i-game-icons-camping-tent',
  'i-game-icons-fishing-pole', 'i-game-icons-hunting-bolas', 'i-game-icons-animal-hide',
  'i-game-icons-wolf-trap', 'i-game-icons-footprint', 'i-game-icons-treasure-map',
  
  // Qualities & Positive traits
  'i-game-icons-star-formation', 'i-game-icons-star-medal', 'i-game-icons-round-star',
  'i-game-icons-shield', 'i-game-icons-shield-bounces', 'i-game-icons-armor-upgrade',
  'i-game-icons-charm', 'i-game-icons-heart-beats', 'i-game-icons-hearts',
  'i-game-icons-lightning-helix', 'i-game-icons-lightning-bow', 'i-game-icons-high-voltage',
  'i-game-icons-health-increase', 'i-game-icons-health-normal', 'i-game-icons-healing',
  'i-game-icons-upgrade', 'i-game-icons-level-four-advanced', 'i-game-icons-shuriken',
  'i-game-icons-angel-wings', 'i-game-icons-holy-symbol', 'i-game-icons-sunbeams',
  'i-game-icons-laurel-crown', 'i-game-icons-medal', 'i-game-icons-trophy',
  'i-game-icons-two-coins', 'i-game-icons-cash', 'i-game-icons-wallet',
  'i-game-icons-handshake', 'i-game-icons-rally-the-troops', 'i-game-icons-minions',
  'i-game-icons-police-badge', 'i-game-icons-rank-3', 'i-game-icons-medal-skull',
  'i-game-icons-dog-house', 'i-game-icons-sitting-dog', 'i-game-icons-wolf-head',
  
  // Drawbacks & Negative traits
  'i-game-icons-broken-skull', 'i-game-icons-skull-crack', 'i-game-icons-death-skull',
  'i-game-icons-broken-bone', 'i-game-icons-bone-gnawer', 'i-game-icons-leg',
  'i-game-icons-bleeding-wound', 'i-game-icons-blood', 'i-game-icons-bloody-stash',
  'i-game-icons-paranoia', 'i-game-icons-asylum', 'i-game-icons-mummy-head',
  'i-game-icons-screaming', 'i-game-icons-ghost', 'i-game-icons-spectre',
  'i-game-icons-broken-heart', 'i-game-icons-heartburn', 'i-game-icons-despair',
  'i-game-icons-poison-bottle', 'i-game-icons-biohazard', 'i-game-icons-radioactive',
  'i-game-icons-vomiting', 'i-game-icons-tear-tracks', 'i-game-icons-headache',
  'i-game-icons-imprisoned', 'i-game-icons-handcuffed', 'i-game-icons-manacles',
  'i-game-icons-cracked-disc', 'i-game-icons-cracked-glass', 'i-game-icons-crutch',
  'i-game-icons-audio-cassette', 'i-game-icons-blindfold', 'i-game-icons-silenced',
  'i-game-icons-nightmare', 'i-game-icons-night-sleep', 'i-game-icons-sleepy',
  'i-game-icons-fire', 'i-game-icons-burning-meteor', 'i-game-icons-burning-embers',
  'i-game-icons-cold-heart', 'i-game-icons-frozen-body', 'i-game-icons-snowflake-2',
  
  // Inventory & Equipment
  'i-game-icons-swap-bag', 'i-game-icons-backpack', 'i-game-icons-knapsack',
  'i-game-icons-ammo-box', 'i-game-icons-bullets', 'i-game-icons-bullet-impacts',
  'i-game-icons-canteen', 'i-game-icons-water-flask', 'i-game-icons-soda-can',
  'i-game-icons-flashlight', 'i-game-icons-lantern-flame', 'i-game-icons-torch',
  'i-game-icons-key', 'i-game-icons-keyring', 'i-game-icons-house-keys',
  'i-game-icons-binoculars', 'i-game-icons-telescope', 'i-game-icons-night-vision',
  'i-game-icons-compass', 'i-game-icons-direction-signs', 'i-game-icons-world',
  'i-game-icons-watch', 'i-game-icons-stopwatch', 'i-game-icons-time-trap',
  'i-game-icons-clothes', 'i-game-icons-shirt', 'i-game-icons-boots',
  'i-game-icons-gas-mask', 'i-game-icons-hazmat-suit', 'i-game-icons-goggles',
  'i-game-icons-kevlar-vest', 'i-game-icons-leather-armor', 'i-game-icons-visored-helm',
  'i-game-icons-toolbox', 'i-game-icons-swiss-army-knife', 'i-game-icons-roll-of-cloth',
  'i-game-icons-battery-pack', 'i-game-icons-plug', 'i-game-icons-electric',
  'i-game-icons-canned-fish', 'i-game-icons-meat', 'i-game-icons-sliced-bread',
  'i-game-icons-cigarette', 'i-game-icons-wine-bottle', 'i-game-icons-coffee-cup',
  'i-game-icons-book-cover', 'i-game-icons-notebook', 'i-game-icons-burning-book',
  'i-game-icons-photo-camera', 'i-game-icons-video-camera', 'i-game-icons-smartphone',
  
  // Zombies & Horror
  'i-game-icons-shambling-zombie', 'i-game-icons-half-body-crawling', 'i-game-icons-shambling-mound',
  'i-game-icons-grab', 'i-game-icons-talons', 'i-game-icons-fangs',
  'i-game-icons-virus', 'i-game-icons-death-zone', 'i-game-icons-plague-doctor-profile',
  'i-game-icons-tombstone', 'i-game-icons-coffin', 'i-game-icons-ribs',
  'i-game-icons-brain-freeze', 'i-game-icons-psychic-waves', 'i-game-icons-brainstorm',
]

// Data
const char = computed(() => store.currentCharacter)
const data = computed(() => char.value?.data || {})
const attrs = computed(() => data.value.attributes || {})

// Filtered items
const filteredSkills = computed(() => {
  const q = filters.skills.toLowerCase()
  return (data.value.skills || []).filter(s => !q || s.name.toLowerCase().includes(q))
})
const filteredQualities = computed(() => {
  const q = filters.qualities.toLowerCase()
  return (data.value.qualities || []).filter(s => !q || s.name.toLowerCase().includes(q))
})
const filteredDrawbacks = computed(() => {
  const q = filters.drawbacks.toLowerCase()
  return (data.value.drawbacks || []).filter(s => !q || s.name.toLowerCase().includes(q))
})
const filteredInventory = computed(() => {
  const q = filters.inventory.toLowerCase()
  return (data.value.inventory || []).filter(s => !q || s.name.toLowerCase().includes(q))
})

onMounted(() => {
  store.fetchCharacter(route.params.id)
})

async function handleExport() {
  const result = await store.shareCharacter(route.params.id)
  if (result) {
    shareLink.value = `${window.location.origin}/share/${result.code}`
    showShareDialog.value = true
  }
}

async function handleDelete() {
  await store.deleteCharacter(route.params.id)
  router.push('/')
}

function copyCode() {
  navigator.clipboard.writeText(shareLink.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

function cycleViewMode(section) {
  // Inventory only has list and table modes
  const modes = section === 'inventory' ? ['list', 'table'] : ['large', 'small', 'list', 'table']
  const current = modes.indexOf(viewModes[section])
  viewModes[section] = modes[(current + 1) % modes.length]
}

const viewModeIcons = {
  large: 'i-tabler-layout-grid',
  small: 'i-tabler-grid-dots',
  list: 'i-tabler-list',
  table: 'i-tabler-table',
}

// Color helpers for items with custom colors
function getItemBorderClass(item, defaultColor) {
  if (item.color) return `border-${item.color}`
  return `border-${defaultColor}`
}

function getItemTextClass(item, defaultColor) {
  if (item.color) return `text-${item.color}`
  return `text-${defaultColor}`
}

function getItemBorderHoverClass(item, defaultColor) {
  if (item.color) return `hover:border-${item.color}`
  return `hover:border-${defaultColor}`
}

// Add/Edit functions
function openAddModal(section) {
  editingSection.value = section
  editingIndex.value = -1
  editingItem.name = ''
  editingItem.level = 1
  editingItem.points = 1
  editingItem.description = ''
  editingItem.color = ''
  editingItem.category = ''
  editingItem.broken = false
  newCategory.value = ''
  showExtendedLevels.value = false
  
  // Reset inventory fields
  editingItem.itemType = 'simple'
  editingItem.quantity = 1
  editingItem.unit = 'шт'
  editingItem.damage = ''
  editingItem.range = ''
  editingItem.ammo = 0
  editingItem.ammo_type = ''
  editingItem.mag = 0
  editingItem.mag_max = 0
  editingItem.ammo_reserve = 0
  editingItem.armor_value = 0
  editingItem.armor_location = ''
  
  if (section === 'skills') editingItem.icon = 'i-game-icons-skills'
  else if (section === 'qualities') editingItem.icon = 'i-game-icons-star-formation'
  else if (section === 'drawbacks') editingItem.icon = 'i-game-icons-broken-skull'
  else editingItem.icon = 'i-game-icons-swap-bag'
  
  showItemModal.value = true
}

function openEditModal(section, index, item) {
  editingSection.value = section
  editingIndex.value = index
  editingItem.name = item.name
  editingItem.level = item.level || 1
  editingItem.points = item.points || 1
  editingItem.icon = item.icon || getDefaultIcon(section)
  editingItem.description = item.description || ''
  editingItem.color = item.color || ''
  editingItem.category = item.category || ''
  editingItem.broken = item.broken || false
  newCategory.value = ''
  showExtendedLevels.value = (item.level || 1) > 5
  
  // Inventory fields
  editingItem.itemType = item.itemType || 'simple'
  editingItem.quantity = item.quantity || 1
  editingItem.unit = item.unit || 'шт'
  editingItem.damage = item.damage || ''
  editingItem.range = item.range || ''
  editingItem.ammo = item.ammo || 0
  editingItem.ammo_type = item.ammo_type || ''
  editingItem.mag = item.mag || 0
  editingItem.mag_max = item.mag_max || 0
  editingItem.ammo_reserve = item.ammo_reserve || 0
  editingItem.armor_value = item.armor_value || 0
  editingItem.armor_location = item.armor_location || ''
  
  showItemModal.value = true
}

// Get unique categories from current section
const existingCategories = computed(() => {
  const section = editingSection.value
  if (!section || !data.value[section]) return []
  const cats = data.value[section]
    .map(item => item.category)
    .filter(c => c && c.trim())
  return [...new Set(cats)]
})

function setCategory(cat) {
  editingItem.category = cat
  newCategory.value = ''
}

function addNewCategory() {
  const cat = newCategory.value.trim()
  if (cat) {
    editingItem.category = cat
    newCategory.value = ''
  }
}

function getDefaultIcon(section) {
  if (section === 'skills') return 'i-game-icons-skills'
  if (section === 'qualities') return 'i-game-icons-star-formation'
  if (section === 'drawbacks') return 'i-game-icons-broken-skull'
  return 'i-game-icons-swap-bag'
}

async function saveItem() {
  if (!editingItem.name.trim()) return
  
  // Deep copy the data
  const currentData = JSON.parse(JSON.stringify(data.value))
  const section = editingSection.value
  
  if (!currentData[section]) currentData[section] = []
  
  const newItem = {
    name: editingItem.name.trim(),
    icon: editingItem.icon,
    description: editingItem.description,
    color: editingItem.color || '',
    category: editingItem.category || '',
  }
  
  if (section === 'skills') {
    newItem.level = editingItem.level
  } else if (section === 'qualities' || section === 'drawbacks') {
    newItem.points = editingItem.points
  } else if (section === 'inventory' || section === 'storage') {
    newItem.itemType = editingItem.itemType
    newItem.broken = editingItem.broken || false
    
    // Type-specific fields
    if (editingItem.itemType === 'quantity') {
      newItem.quantity = editingItem.quantity
      newItem.unit = editingItem.unit || 'шт'
    } else if (editingItem.itemType === 'weapon') {
      newItem.damage = editingItem.damage
    } else if (editingItem.itemType === 'weapon_ammo') {
      newItem.damage = editingItem.damage
      newItem.range = editingItem.range
      newItem.ammo = editingItem.ammo
      newItem.ammo_type = editingItem.ammo_type
    } else if (editingItem.itemType === 'weapon_mag') {
      newItem.damage = editingItem.damage
      newItem.range = editingItem.range
      newItem.mag = editingItem.mag
      newItem.mag_max = editingItem.mag_max
      newItem.ammo_reserve = editingItem.ammo_reserve
      newItem.ammo_type = editingItem.ammo_type
    } else if (editingItem.itemType === 'armor') {
      newItem.armor_value = editingItem.armor_value
      newItem.armor_location = editingItem.armor_location
    }
  }
  
  if (editingIndex.value === -1) {
    currentData[section].push(newItem)
  } else {
    currentData[section][editingIndex.value] = newItem
  }
  
  await store.updateCharacter(route.params.id, {
    name: char.value.name,
    data: currentData,
  })
  
  // Refresh character data
  await store.fetchCharacter(route.params.id, { silent: true })
  
  showItemModal.value = false
}

async function deleteItem() {
  // Deep copy the data
  const currentData = JSON.parse(JSON.stringify(data.value))
  const section = editingSection.value
  
  if (currentData[section] && editingIndex.value >= 0) {
    currentData[section].splice(editingIndex.value, 1)
    
    await store.updateCharacter(route.params.id, {
      name: char.value.name,
      data: currentData,
    })
    
    // Refresh character data
    await store.fetchCharacter(route.params.id, { silent: true })
  }
  
  showItemModal.value = false
}

// View item details (click from list)
function openViewModal(section, index, item) {
  viewingSection.value = section
  viewingIndex.value = index
  viewingItem.value = { ...item }
  showViewModal.value = true
}

// From view modal -> open edit modal
function viewToEdit() {
  const section = viewingSection.value
  const index = viewingIndex.value
  const item = viewingItem.value
  showViewModal.value = false
  openEditModal(section, index, item)
}

// Move item between inventory and storage
async function moveItem(fromSection, toSection, index) {
  const currentData = JSON.parse(JSON.stringify(data.value))
  if (!currentData[fromSection] || index < 0) return
  if (!currentData[toSection]) currentData[toSection] = []
  
  const [item] = currentData[fromSection].splice(index, 1)
  currentData[toSection].push(item)
  
  await store.updateCharacter(route.params.id, {
    name: char.value.name,
    data: currentData,
  })
  await store.fetchCharacter(route.params.id, { silent: true })
  showViewModal.value = false
}

// Computed for storage items
const filteredStorage = computed(() => {
  return data.value.storage || []
})

// Computed for v-model in modal
const editingValue = computed({
  get() {
    if (editingSection.value === 'skills') return editingItem.level
    if (editingSection.value === 'inventory' || editingSection.value === 'storage') return editingItem.quantity
    return editingItem.points
  },
  set(val) {
    if (editingSection.value === 'skills') editingItem.level = val
    else if (editingSection.value === 'inventory' || editingSection.value === 'storage') editingItem.quantity = val
    else editingItem.points = val
  }
})

// Color scheme for modal based on section
const sectionColors = computed(() => {
  switch (editingSection.value) {
    case 'qualities': return { border: 'border-cyan-400', text: 'text-cyan-400', bg: 'bg-cyan-400' }
    case 'drawbacks': return { border: 'border-red-500', text: 'text-red-500', bg: 'bg-red-500' }
    default: return { border: 'border-toxic', text: 'text-toxic', bg: 'bg-toxic' }
  }
})

// Attribute config
const attrKeys = ['strength', 'dexterity', 'constitution', 'intelligence', 'perception', 'willpower']
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
const attrColors = {
  strength: 'text-red-400',
  dexterity: 'text-yellow-400',
  constitution: 'text-orange-400',
  intelligence: 'text-blue-400',
  perception: 'text-cyan-400',
  willpower: 'text-purple-400',
}

// ═══════════════════════════════════════════════════════════
// LONG-PRESS SLIDER
// ═══════════════════════════════════════════════════════════
const showSlider = ref(false)
const sliderLabel = ref('')
const sliderValue = ref(0)
const sliderMin = ref(0)
const sliderMax = ref(100)
const sliderColor = ref('text-toxic')
// What the slider is adjusting
const sliderTarget = ref(null) // { type: 'stat', key: 'life_points' } or { type: 'item', section, index, field }
const sliderReloadable = ref(false)
// Long-press detection
let longPressTimer = null
let longPressTriggered = false

function startLongPress(callback, event) {
  longPressTriggered = false
  // Prevent context menu on long-press
  if (event) event.preventDefault()
  longPressTimer = setTimeout(() => {
    longPressTriggered = true
    callback()
  }, 400)
}

function cancelLongPress() {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

function wasLongPress() {
  return longPressTriggered
}

// Open slider for a stat (LP, EP, ES)
function openStatSlider(key, label, color) {
  const maxKey = key + '_max'
  const currentVal = Number(data.value[key]) || 0
  const maxVal = Number(data.value[maxKey]) || currentVal
  if (maxVal <= 0) return // No max set, can't adjust
  sliderLabel.value = label
  sliderValue.value = currentVal
  sliderMin.value = 0
  sliderMax.value = maxVal
  sliderColor.value = color
  sliderTarget.value = { type: 'stat', key }
  sliderReloadable.value = false
  showSlider.value = true
}

// Open slider for an inventory item
function openItemSlider(section, index, item) {
  if (item.itemType === 'quantity') {
    sliderLabel.value = item.name
    sliderValue.value = item.quantity || 0
    sliderMin.value = 0
    sliderMax.value = Math.max((item.quantity || 0) * 3, 100)
    sliderColor.value = 'text-toxic'
    sliderTarget.value = { type: 'item', section, index, field: 'quantity' }
    sliderReloadable.value = false
    showSlider.value = true
  } else if (item.itemType === 'weapon_mag') {
    sliderLabel.value = item.name
    sliderValue.value = item.mag || 0
    sliderMin.value = 0
    sliderMax.value = item.mag_max || 30
    sliderColor.value = 'text-toxic'
    sliderTarget.value = { type: 'item', section, index, field: 'mag', item }
    sliderReloadable.value = true
    showSlider.value = true
  } else if (item.itemType === 'weapon_ammo') {
    sliderLabel.value = item.name
    sliderValue.value = item.ammo || 0
    sliderMin.value = 0
    sliderMax.value = Math.max((item.ammo || 0) * 3, 100)
    sliderColor.value = 'text-toxic'
    sliderTarget.value = { type: 'item', section, index, field: 'ammo' }
    sliderReloadable.value = false
    showSlider.value = true
  }
}

// Reload: remaining mag goes to reserve, full mag taken from reserve
function reloadMag() {
  const t = sliderTarget.value
  if (!t || t.type !== 'item') return
  const currentData = JSON.parse(JSON.stringify(data.value))
  const item = currentData[t.section][t.index]
  if (!item) return
  
  const remaining = item.mag || 0
  const magMax = item.mag_max || 0
  const reserve = item.ammo_reserve || 0
  
  // Return remaining rounds to reserve
  const totalReserve = reserve + remaining
  // Take a full mag from reserve
  const newMag = Math.min(magMax, totalReserve)
  const newReserve = totalReserve - newMag
  
  item.mag = newMag
  item.ammo_reserve = newReserve
  sliderValue.value = newMag
  
  // Save immediately
  store.updateCharacter(route.params.id, { name: char.value.name, data: currentData })
    .then(() => store.fetchCharacter(route.params.id, { silent: true }))
}

// Save slider value when closed or changed 
async function saveSliderValue() {
  const t = sliderTarget.value
  if (!t) return
  
  const currentData = JSON.parse(JSON.stringify(data.value))
  
  if (t.type === 'stat') {
    currentData[t.key] = sliderValue.value
  } else if (t.type === 'item') {
    if (currentData[t.section] && currentData[t.section][t.index]) {
      currentData[t.section][t.index][t.field] = sliderValue.value
    }
  }
  
  await store.updateCharacter(route.params.id, { name: char.value.name, data: currentData })
  await store.fetchCharacter(route.params.id, { silent: true })
  showSlider.value = false
}
</script>

<template class="">
  <!-- Loading state -->
  <div v-if="store.loading" class="fixed inset-0 bg-void flex items-center justify-center">
    <div class="text-toxic flex items-center gap-3">
      <span class="i-tabler-loader-2 icon-lg animate-spin"></span>
      <span class="font-display text-xl">ЗАГРУЗКА...</span>
    </div>
  </div>
  
  <div v-else-if="char" class="fixed inset-0 bg-void flex flex-col font-sans px-1">
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- FIXED TOP SECTION -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div class="flex-none bg-night border-b-2 border-toxic-muted">
      <!-- Top navigation bar with character info -->
      <div class="flex items-center px-2 h-10 gap-2">
        <router-link to="/" class="text-bone-muted hover:text-toxic p-1 -ml-1 transition-colors flex-none">
          <span class="i-tabler-arrow-left icon-lg"></span>
        </router-link>
        
        <!-- Character mini-avatar and name -->
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <div class="w-7 h-7 rounded border-2 border-toxic-muted bg-dark flex items-center justify-center flex-none">
            <span class="i-game-icons-person icon text-toxic"></span>
          </div>
          <h1 class="font-display text-lg text-toxic truncate tracking-wider font-normal">{{ char.name }}</h1>
        </div>
        
        <div class="flex items-center gap-0 flex-none">
          <button @click="compactHeader = !compactHeader" class="text-bone-muted hover:text-toxic p-1.5 transition-colors">
            <span :class="compactHeader ? 'i-tabler-layout-navbar-expand' : 'i-tabler-layout-navbar-collapse'" class="icon-lg"></span>
          </button>
          <router-link :to="`/character/${char.id}/edit`" class="text-bone-muted hover:text-toxic p-1.5 transition-colors">
            <span class="i-tabler-pencil icon-lg"></span>
          </router-link>
          <button @click="handleExport" class="text-bone-muted hover:text-toxic p-1.5 transition-colors">
            <span class="i-tabler-share icon-lg"></span>
          </button>
        </div>
      </div>
      
      <!-- 6 Primary attributes row -->
      <div class="px-2 pb-1">
        <div class="grid grid-cols-6 gap-0">
          <div v-for="key in attrKeys" :key="key" class="text-center py-1">
            <div :class="attrColors[key]" class="text-[8px] uppercase tracking-wider opacity-70">{{ attrLabels[key] }}</div>
            <span v-if="!compactHeader" :class="[attrIcons[key], attrColors[key]]" class="icon-sm"></span>
            <div :class="attrColors[key]" class="text-xl font-bold leading-none">{{ attrs[key] || 2 }}</div>
          </div>
        </div>
      </div>
      
      <!-- 4 Derived stats (LP, EP, SP, ES) -->
      <div class="px-2 pb-2">
        <div class="grid grid-cols-4 gap-1">
          <!-- Life Points -->
          <div 
            class="bg-dark border-2 border-health/40 rounded-lg p-1 text-center select-none"
            @pointerdown="startLongPress(() => openStatSlider('life_points', 'LP', 'text-health'), $event)"
            @pointerup="cancelLongPress" @pointerleave="cancelLongPress"
            @contextmenu.prevent
          >
            <div class="text-[8px] text-health uppercase tracking-wider">LP</div>
            <span v-if="!compactHeader" class="i-game-icons-hearts icon text-health"></span>
            <div class="text-2xl font-bold text-health leading-none">{{ data.life_points || '—' }}</div>
            <div v-if="data.life_points_max" class="text-[8px] text-health/50">/ {{ data.life_points_max }}</div>
          </div>
          <!-- Endurance -->
          <div 
            class="bg-dark border-2 border-energy/40 rounded-lg p-1 text-center select-none"
            @pointerdown="startLongPress(() => openStatSlider('endurance_points', 'EP', 'text-energy'), $event)"
            @pointerup="cancelLongPress" @pointerleave="cancelLongPress"
            @contextmenu.prevent
          >
            <div class="text-[8px] text-energy uppercase tracking-wider">EP</div>
            <span v-if="!compactHeader" class="i-game-icons-sprint icon text-energy"></span>
            <div class="text-2xl font-bold text-energy leading-none">{{ data.endurance_points || '—' }}</div>
            <div v-if="data.endurance_points_max" class="text-[8px] text-energy/50">/ {{ data.endurance_points_max }}</div>
          </div>
          <!-- Speed -->
          <div class="bg-dark border-2 border-speed/40 rounded-lg p-1 text-center">
            <div class="text-[8px] text-speed uppercase tracking-wider">SP</div>
            <span v-if="!compactHeader" class="i-game-icons-running-shoe icon text-speed"></span>
            <div class="text-2xl font-bold text-speed leading-none">{{ data.speed || '—' }}</div>
          </div>
          <!-- Essence -->
          <div 
            class="bg-dark border-2 border-essence/40 rounded-lg p-1 text-center select-none"
            @pointerdown="startLongPress(() => openStatSlider('essence', 'ES', 'text-essence'), $event)"
            @pointerup="cancelLongPress" @pointerleave="cancelLongPress"
            @contextmenu.prevent
          >
            <div class="text-[8px] text-essence uppercase tracking-wider">ES</div>
            <span v-if="!compactHeader" class="i-game-icons-vine-whip icon text-essence"></span>
            <div class="text-2xl font-bold text-essence leading-none">{{ data.essence || '—' }}</div>
            <div v-if="data.essence_max" class="text-[8px] text-essence/50">/ {{ data.essence_max }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- SCROLLABLE MIDDLE SECTION -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div class="flex-1 overflow-auto">
      <!-- ACTIVE MODE: Skills, Qualities, Drawbacks, Inventory -->
      <div v-if="activeMode === 'active'" class="p-2 pb-16 space-y-2">
        
        <!-- SKILLS -->
        <section>
          <!-- Header with controls -->
          <div class="flex items-center gap-1 mb-1">
            <span class="i-game-icons-skills icon-lg text-toxic"></span>
            <h2 class="font-display text-sm text-toxic tracking-wider uppercase">Навыки</h2>
            <div class="flex-1 h-px bg-toxic-muted/30"></div>
            <button @click="showFilters.skills = !showFilters.skills; if(!showFilters.skills) filters.skills = ''" class="p-1 text-bone-muted hover:text-toxic transition-colors" :class="{ 'text-toxic': showFilters.skills }" title="Поиск">
              <span class="i-tabler-search icon"></span>
            </button>
            <button @click="cycleViewMode('skills')" class="p-1 text-bone-muted hover:text-toxic transition-colors" title="Режим отображения">
              <span :class="viewModeIcons[viewModes.skills]" class="icon"></span>
            </button>
            <button @click="openAddModal('skills')" class="p-1 text-toxic hover:text-toxic-dim transition-colors" title="Добавить">
              <span class="i-tabler-plus icon"></span>
            </button>
          </div>
          <input v-if="showFilters.skills" v-model="filters.skills" type="text" placeholder="Поиск навыков..." class="w-full mb-1 px-3 py-1.5 bg-dark border border-toxic-muted/30 rounded text-sm text-bone placeholder-bone-muted/50 focus:outline-none focus:border-toxic" />
          <!-- Content -->
          <div v-if="filteredSkills.length" :class="{
            'grid grid-cols-3 gap-1.5': viewModes.skills === 'large',
            'grid grid-cols-6 gap-1': viewModes.skills === 'small',
            'grid grid-cols-2 gap-x-4 gap-y-1': viewModes.skills === 'list',
            'border-2 border-bone-muted/20 rounded-lg overflow-hidden': viewModes.skills === 'table',
          }">
            <!-- Large tiles: 3 per row, aspect 3:2 -->
            <template v-if="viewModes.skills === 'large'">
              <div 
                v-for="(skill, i) in filteredSkills" 
                :key="skill.name" 
                @click="openEditModal('skills', i, skill)" 
                :class="[
                  'bg-dark border-2 transition-colors rounded p-2 cursor-pointer aspect-[3/2] flex flex-col',
                  skill.color ? `border-${skill.color}/30 hover:border-${skill.color}` : 'border-toxic/30 hover:border-toxic'
                ]"
              >
                <div class="flex items-start justify-between flex-1">
                  <span :class="[skill.icon || 'i-game-icons-skills', skill.color ? `text-${skill.color}/50` : 'text-toxic/50']" class="w-10 h-10"></span>
                  <span class="text-4xl font-bold leading-none text-toxic">{{ skill.level }}</span>
                </div>
                <div v-if="skill.category" class="text-sm text-bone-muted truncate">{{ skill.category }}</div>
                <div v-else class="text-sm text-transparent select-none">&nbsp;</div>
                <div class="text-sm text-bone font-medium leading-tight truncate">{{ skill.name }}</div>
              </div>
            </template>
            <!-- Small tiles: 6 per row, aspect 3:2 -->
            <template v-else-if="viewModes.skills === 'small'">
              <div 
                v-for="(skill, i) in filteredSkills" 
                :key="skill.name" 
                @click="openEditModal('skills', i, skill)" 
                :class="[
                  'bg-dark border transition-colors rounded p-1.5 cursor-pointer relative overflow-hidden aspect-[3/2]',
                  skill.color ? `border-${skill.color}/30 hover:border-${skill.color}` : 'border-toxic/30 hover:border-toxic'
                ]"
              >
                <span :class="[skill.icon || 'i-game-icons-skills', skill.color ? `text-${skill.color}/20` : 'text-toxic/20']" class="absolute left-0.5 top-1/2 -translate-y-1/2 w-8 h-8"></span>
                <div class="relative flex flex-col h-full">
                  <div class="text-2xl font-bold text-right leading-none text-toxic">{{ skill.level }}</div>
                  <div class="text-[10px] text-bone/80 mt-auto leading-tight truncate">{{ skill.name }}</div>
                </div>
              </div>
            </template>
            <!-- List: 2 columns, icon-name-value in row -->
            <template v-else-if="viewModes.skills === 'list'">
              <div 
                v-for="(skill, i) in filteredSkills" 
                :key="skill.name" 
                @click="openEditModal('skills', i, skill)" 
                class="flex items-center gap-2 py-1.5 px-2 hover:bg-dark/50 rounded cursor-pointer"
              >
                <span :class="[skill.icon || 'i-game-icons-skills', skill.color ? `text-${skill.color}/40` : 'text-toxic/40']" class="icon flex-none"></span>
                <span class="flex-1 text-sm text-bone truncate">{{ skill.name }}</span>
                <span class="text-lg font-bold flex-none w-6 text-right text-toxic">{{ skill.level }}</span>
              </div>
            </template>
            <!-- Table: columns for icon+name, category, value -->
            <template v-else>
              <div class="divide-y divide-bone-muted/20">
                <div 
                  v-for="(skill, i) in filteredSkills" 
                  :key="skill.name" 
                  @click="openEditModal('skills', i, skill)" 
                  class="flex items-center hover:bg-dark/50 cursor-pointer"
                >
                  <div class="flex items-center gap-2 flex-1 px-3 py-2">
                    <span :class="[skill.icon || 'i-game-icons-skills', skill.color ? `text-${skill.color}/40` : 'text-toxic/40']" class="icon-sm"></span>
                    <div class="text-sm text-bone">{{ skill.name }}</div>
                  </div>
                  <div class="w-24 px-2 py-2 text-[11px] text-bone-muted truncate border-l border-bone-muted/20">
                    {{ skill.category || '—' }}
                  </div>
                  <div class="w-12 px-3 py-2 text-right font-bold text-toxic border-l border-bone-muted/20">
                    {{ skill.level }}
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div v-else class="text-bone-muted text-sm py-6 text-center border-2 border-dashed border-toxic/20 rounded-lg">
            {{ filters.skills ? 'Ничего не найдено' : 'Нет навыков' }}
          </div>
        </section>
        
        <!-- QUALITIES -->
        <section>
          <div class="flex items-center gap-1 mb-1">
            <span class="i-game-icons-star-formation icon-lg text-cyan-400"></span>
            <h2 class="font-display text-sm text-cyan-400 tracking-wider uppercase">Качества</h2>
            <div class="flex-1 h-px bg-cyan-400/30"></div>
            <button @click="showFilters.qualities = !showFilters.qualities; if(!showFilters.qualities) filters.qualities = ''" class="p-1 text-bone-muted hover:text-cyan-400 transition-colors" :class="{ 'text-cyan-400': showFilters.qualities }">
              <span class="i-tabler-search icon"></span>
            </button>
            <button @click="cycleViewMode('qualities')" class="p-1 text-bone-muted hover:text-cyan-400 transition-colors">
              <span :class="viewModeIcons[viewModes.qualities]" class="icon"></span>
            </button>
            <button @click="openAddModal('qualities')" class="p-1 text-cyan-400 hover:text-cyan-300 transition-colors">
              <span class="i-tabler-plus icon"></span>
            </button>
          </div>
          <input v-if="showFilters.qualities" v-model="filters.qualities" type="text" placeholder="Поиск качеств..." class="w-full mb-1 px-3 py-1.5 bg-dark border border-cyan-400/30 rounded text-sm text-bone placeholder-bone-muted/50 focus:outline-none focus:border-cyan-400" />
          <div v-if="filteredQualities.length" :class="{
            'grid grid-cols-3 gap-1.5': viewModes.qualities === 'large',
            'grid grid-cols-6 gap-1': viewModes.qualities === 'small',
            'grid grid-cols-2 gap-x-4 gap-y-1': viewModes.qualities === 'list',
            'border-2 border-bone-muted/20 rounded-lg overflow-hidden': viewModes.qualities === 'table',
          }">
            <!-- Large tiles: 3 per row, aspect 3:2 -->
            <template v-if="viewModes.qualities === 'large'">
              <div 
                v-for="(q, i) in filteredQualities" 
                :key="q.name" 
                @click="openEditModal('qualities', i, q)" 
                :class="[
                  'bg-dark border-2 transition-colors rounded p-2 cursor-pointer aspect-[3/2] flex flex-col',
                  q.color ? `border-${q.color}/30 hover:border-${q.color}` : 'border-cyan-400/30 hover:border-cyan-400'
                ]"
              >
                <div class="flex items-start justify-between flex-1">
                  <span :class="[q.icon || 'i-game-icons-star-formation', q.color ? `text-${q.color}/50` : 'text-cyan-400/50']" class="w-10 h-10"></span>
                  <span class="text-4xl font-bold leading-none text-cyan-400">+{{ q.points }}</span>
                </div>
                <div v-if="q.category" class="text-sm text-bone-muted truncate">{{ q.category }}</div>
                <div v-else class="text-sm text-transparent select-none">&nbsp;</div>
                <div class="text-sm text-bone font-medium leading-tight truncate">{{ q.name }}</div>
              </div>
            </template>
            <!-- Small tiles: 6 per row, aspect 3:2 -->
            <template v-else-if="viewModes.qualities === 'small'">
              <div 
                v-for="(q, i) in filteredQualities" 
                :key="q.name" 
                @click="openEditModal('qualities', i, q)" 
                :class="[
                  'bg-dark border transition-colors rounded p-1.5 cursor-pointer relative overflow-hidden aspect-[3/2]',
                  q.color ? `border-${q.color}/30 hover:border-${q.color}` : 'border-cyan-400/30 hover:border-cyan-400'
                ]"
              >
                <span :class="[q.icon || 'i-game-icons-star-formation', q.color ? `text-${q.color}/20` : 'text-cyan-400/20']" class="absolute left-0.5 top-1/2 -translate-y-1/2 w-8 h-8"></span>
                <div class="relative flex flex-col h-full">
                  <div class="text-2xl font-bold text-right leading-none text-cyan-400">+{{ q.points }}</div>
                  <div class="text-[10px] text-bone/80 mt-auto leading-tight truncate">{{ q.name }}</div>
                </div>
              </div>
            </template>
            <!-- List -->
            <template v-else-if="viewModes.qualities === 'list'">
              <div 
                v-for="(q, i) in filteredQualities" 
                :key="q.name" 
                @click="openEditModal('qualities', i, q)" 
                class="flex items-center gap-2 py-1.5 px-2 hover:bg-dark/50 rounded cursor-pointer"
              >
                <span :class="[q.icon || 'i-game-icons-star-formation', q.color ? `text-${q.color}/40` : 'text-cyan-400/40']" class="icon flex-none"></span>
                <span class="flex-1 text-sm text-bone truncate">{{ q.name }}</span>
                <span class="text-lg font-bold flex-none w-6 text-right text-cyan-400">+{{ q.points }}</span>
              </div>
            </template>
            <!-- Table -->
            <template v-else>
              <div class="divide-y divide-bone-muted/20">
                <div 
                  v-for="(q, i) in filteredQualities" 
                  :key="q.name" 
                  @click="openEditModal('qualities', i, q)" 
                  class="flex items-center hover:bg-dark/50 cursor-pointer"
                >
                  <div class="flex items-center gap-2 flex-1 px-3 py-2">
                    <span :class="[q.icon || 'i-game-icons-star-formation', q.color ? `text-${q.color}/40` : 'text-cyan-400/40']" class="icon-sm"></span>
                    <div class="text-sm text-bone">{{ q.name }}</div>
                  </div>
                  <div class="w-24 px-2 py-2 text-[11px] text-bone-muted truncate border-l border-bone-muted/20">
                    {{ q.category || '—' }}
                  </div>
                  <div class="w-14 px-3 py-2 text-right font-bold text-cyan-400 border-l border-bone-muted/20">
                    +{{ q.points }}
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div v-else class="text-bone-muted text-sm py-6 text-center border-2 border-dashed border-cyan-400/20 rounded-lg">
            {{ filters.qualities ? 'Ничего не найдено' : 'Нет качеств' }}
          </div>
        </section>
        
        <!-- DRAWBACKS -->
        <section>
          <div class="flex items-center gap-1 mb-1">
            <span class="i-game-icons-broken-skull icon-lg text-red-500"></span>
            <h2 class="font-display text-sm text-red-500 tracking-wider uppercase">Недостатки</h2>
            <div class="flex-1 h-px bg-red-500/30"></div>
            <button @click="showFilters.drawbacks = !showFilters.drawbacks; if(!showFilters.drawbacks) filters.drawbacks = ''" class="p-1 text-bone-muted hover:text-red-500 transition-colors" :class="{ 'text-red-500': showFilters.drawbacks }">
              <span class="i-tabler-search icon"></span>
            </button>
            <button @click="cycleViewMode('drawbacks')" class="p-1 text-bone-muted hover:text-red-500 transition-colors">
              <span :class="viewModeIcons[viewModes.drawbacks]" class="icon"></span>
            </button>
            <button @click="openAddModal('drawbacks')" class="p-1 text-red-500 hover:text-red-400 transition-colors">
              <span class="i-tabler-plus icon"></span>
            </button>
          </div>
          <input v-if="showFilters.drawbacks" v-model="filters.drawbacks" type="text" placeholder="Поиск недостатков..." class="w-full mb-1 px-3 py-1.5 bg-dark border border-red-500/30 rounded text-sm text-bone placeholder-bone-muted/50 focus:outline-none focus:border-red-500" />
          <div v-if="filteredDrawbacks.length" :class="{
            'grid grid-cols-3 gap-1.5': viewModes.drawbacks === 'large',
            'grid grid-cols-6 gap-1': viewModes.drawbacks === 'small',
            'grid grid-cols-2 gap-x-4 gap-y-1': viewModes.drawbacks === 'list',
            'bg-dark border border-bone-muted/30 rounded-lg overflow-hidden': viewModes.drawbacks === 'table',
          }">
            <!-- Large tiles: 3 per row, aspect 3:2 -->
            <template v-if="viewModes.drawbacks === 'large'">
              <div 
                v-for="(d, i) in filteredDrawbacks" 
                :key="d.name" 
                @click="openEditModal('drawbacks', i, d)" 
                :class="[
                  'bg-dark border-2 transition-colors rounded p-2 cursor-pointer aspect-[3/2] flex flex-col',
                  d.color ? `border-${d.color}/30 hover:border-${d.color}` : 'border-red-500/30 hover:border-red-500'
                ]"
              >
                <div class="flex items-start justify-between flex-1">
                  <span :class="[d.icon || 'i-game-icons-broken-skull', d.color ? `text-${d.color}/50` : 'text-red-500/50']" class="w-10 h-10"></span>
                  <span class="text-4xl font-bold leading-none text-red-500">−{{ d.points }}</span>
                </div>
                <div v-if="d.category" class="text-sm text-bone-muted truncate">{{ d.category }}</div>
                <div v-else class="text-sm text-transparent select-none">&nbsp;</div>
                <div class="text-sm text-bone font-medium leading-tight truncate">{{ d.name }}</div>
              </div>
            </template>
            <!-- Small tiles: 6 per row, aspect 3:2 -->
            <template v-else-if="viewModes.drawbacks === 'small'">
              <div 
                v-for="(d, i) in filteredDrawbacks" 
                :key="d.name" 
                @click="openEditModal('drawbacks', i, d)" 
                :class="[
                  'bg-dark border transition-colors rounded p-1.5 cursor-pointer relative overflow-hidden aspect-[3/2]',
                  d.color ? `border-${d.color}/30 hover:border-${d.color}` : 'border-red-500/30 hover:border-red-500'
                ]"
              >
                <span :class="[d.icon || 'i-game-icons-broken-skull', d.color ? `text-${d.color}/20` : 'text-red-500/20']" class="absolute left-0.5 top-1/2 -translate-y-1/2 w-8 h-8"></span>
                <div class="relative flex flex-col h-full">
                  <div class="text-2xl font-bold text-right leading-none text-red-500">−{{ d.points }}</div>
                  <div class="text-[10px] text-bone/80 mt-auto leading-tight truncate">{{ d.name }}</div>
                </div>
              </div>
            </template>
            <!-- List: 2 columns -->
            <template v-else-if="viewModes.drawbacks === 'list'">
              <div 
                v-for="(d, i) in filteredDrawbacks" 
                :key="d.name" 
                @click="openEditModal('drawbacks', i, d)" 
                class="flex items-center gap-2 py-1.5 px-2 hover:bg-dark/50 rounded cursor-pointer"
              >
                <span :class="[d.icon || 'i-game-icons-broken-skull', d.color ? `text-${d.color}/40` : 'text-red-500/40']" class="icon flex-none"></span>
                <span class="flex-1 text-sm text-bone truncate">{{ d.name }}</span>
                <span class="text-lg font-bold flex-none w-6 text-right text-red-500">−{{ d.points }}</span>
              </div>
            </template>
            <!-- Table -->
            <template v-else>
              <div class="divide-y divide-bone-muted/20">
                <div 
                  v-for="(d, i) in filteredDrawbacks" 
                  :key="d.name" 
                  @click="openEditModal('drawbacks', i, d)" 
                  class="flex items-center hover:bg-dark/50 cursor-pointer"
                >
                  <div class="flex items-center gap-2 flex-1 px-3 py-2">
                    <span :class="[d.icon || 'i-game-icons-broken-skull', d.color ? `text-${d.color}/40` : 'text-red-500/40']" class="icon-sm"></span>
                    <div class="text-sm text-bone">{{ d.name }}</div>
                  </div>
                  <div class="w-24 px-2 py-2 text-[11px] text-bone-muted truncate border-l border-bone-muted/20">
                    {{ d.category || '—' }}
                  </div>
                  <div class="w-14 px-3 py-2 text-right font-bold text-red-500 border-l border-bone-muted/20">
                    −{{ d.points }}
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div v-else class="text-bone-muted text-sm py-6 text-center border-2 border-dashed border-red-500/20 rounded-lg">
            {{ filters.drawbacks ? 'Ничего не найдено' : 'Нет недостатков' }}
          </div>
        </section>
        
        <!-- INVENTORY -->
        <section>
          <div class="flex items-center gap-1 mb-1">
            <span class="i-game-icons-knapsack icon-lg text-toxic"></span>
            <h2 class="font-display text-sm text-toxic tracking-wider uppercase">Инвентарь</h2>
            <div class="flex-1 h-px bg-toxic-muted/30"></div>
            <button @click="showFilters.inventory = !showFilters.inventory; if(!showFilters.inventory) filters.inventory = ''" class="p-1 text-bone-muted hover:text-toxic transition-colors" :class="{ 'text-toxic': showFilters.inventory }">
              <span class="i-tabler-search icon"></span>
            </button>
            <button @click="cycleViewMode('inventory')" class="p-1 text-bone-muted hover:text-toxic transition-colors">
              <span :class="viewModeIcons[viewModes.inventory]" class="icon"></span>
            </button>
            <button @click="openAddModal('inventory')" class="p-1 text-toxic hover:text-toxic-dim transition-colors">
              <span class="i-tabler-plus icon"></span>
            </button>
          </div>
          <input v-if="showFilters.inventory" v-model="filters.inventory" type="text" placeholder="Поиск предметов..." class="w-full mb-1 px-3 py-1.5 bg-dark border border-toxic-muted/30 rounded text-sm text-bone placeholder-bone-muted/50 focus:outline-none focus:border-toxic" />
          <div v-if="filteredInventory.length" :class="{
            'flex flex-col gap-1': viewModes.inventory === 'list',
            'bg-dark border border-bone-muted/30 rounded-lg overflow-hidden': viewModes.inventory === 'table',
          }">
            <!-- List: full-width cards -->
            <template v-if="viewModes.inventory === 'list'">
              <div 
                v-for="(item, i) in filteredInventory" 
                :key="item.name" 
                @click="!wasLongPress() && openViewModal('inventory', i, item)" 
                @pointerdown="['quantity','weapon_mag','weapon_ammo'].includes(item.itemType) && startLongPress(() => openItemSlider('inventory', i, item), $event)"
                @pointerup="cancelLongPress" @pointerleave="cancelLongPress"
                @contextmenu.prevent 
                :class="[
                  'flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors',
                  item.broken 
                    ? 'bg-red-500/10 border border-red-500/30 hover:border-red-500' 
                    : 'bg-dark border border-bone-muted/20 hover:border-toxic/50'
                ]"
              >
                <span :class="[item.icon || 'i-game-icons-swap-bag', item.broken ? 'text-red-500/50' : item.color ? `text-${item.color}/70` : 'text-toxic/70']" class="icon-lg flex-none"></span>
                <div class="flex-1 min-w-0">
                  <div :class="['text-sm font-medium truncate', item.broken ? 'text-red-500/70 line-through' : 'text-bone']">{{ item.name }}</div>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span v-if="item.category" class="text-xs text-bone-muted">{{ item.category }}</span>
                    <span v-if="item.category && (item.damage || item.armor_value)" class="text-bone-muted/30">·</span>
                    <span v-if="item.damage" class="text-xs text-toxic">{{ item.damage }}</span>
                    <span v-if="item.range" class="text-xs text-bone-muted">{{ item.range }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2 flex-none">
                  <template v-if="item.itemType === 'quantity'">
                    <span v-if="formatQuantity(item)" class="text-lg font-bold text-toxic">{{ formatQuantity(item) }}</span>
                  </template>
                  <template v-else-if="item.itemType === 'weapon_mag'">
                    <div class="flex flex-col items-end">
                      <span class="text-sm font-bold text-toxic">{{ item.mag || 0 }}/{{ item.mag_max || 0 }}</span>
                      <span v-if="item.ammo_reserve" class="text-xs text-bone-muted">+{{ item.ammo_reserve }}</span>
                    </div>
                  </template>
                  <template v-else-if="item.itemType === 'weapon_ammo'">
                    <span class="text-sm font-bold text-toxic">{{ item.ammo || 0 }} {{ item.ammo_type || 'шт' }}</span>
                  </template>
                  <template v-else-if="item.itemType === 'armor' && item.armor_value">
                    <span class="text-sm font-bold text-toxic">🛡{{ item.armor_value }}</span>
                  </template>
                  <template v-else-if="item.quantity > 1">
                    <span class="text-lg font-bold text-toxic">{{ formatQuantity(item) || `×${item.quantity}` }}</span>
                  </template>
                </div>
              </div>
            </template>
            
            <!-- Table -->
            <template v-else>
              <div class="divide-y divide-bone-muted/20">
                <div 
                  v-for="(item, i) in filteredInventory" 
                  :key="item.name" 
                  @click="!wasLongPress() && openViewModal('inventory', i, item)" 
                  @pointerdown="['quantity','weapon_mag','weapon_ammo'].includes(item.itemType) && startLongPress(() => openItemSlider('inventory', i, item), $event)"
                  @pointerup="cancelLongPress" @pointerleave="cancelLongPress"
                  @contextmenu.prevent
                  :class="['flex items-center cursor-pointer', item.broken ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-dark/50']"
                >
                  <div class="flex items-center gap-2 flex-1 px-3 py-2 min-w-0">
                    <span :class="[item.icon || 'i-game-icons-swap-bag', item.broken ? 'text-red-500/40' : item.color ? `text-${item.color}/60` : 'text-toxic/50']" class="icon-sm flex-none"></span>
                    <div :class="['text-sm truncate', item.broken ? 'text-red-500/70 line-through' : 'text-bone']">{{ item.name }}</div>
                  </div>
                  <div class="w-16 px-2 py-2 text-center text-xs font-bold text-toxic border-l border-bone-muted/20">
                    <template v-if="item.damage">{{ item.damage }}</template>
                    <template v-else-if="item.itemType === 'armor' && item.armor_value">🛡{{ item.armor_value }}</template>
                    <template v-else>—</template>
                  </div>
                  <div class="w-16 px-2 py-2 text-right text-xs border-l border-bone-muted/20">
                    <template v-if="item.itemType === 'quantity'">
                      <span class="font-bold text-toxic">{{ formatQuantity(item) || '—' }}</span>
                    </template>
                    <template v-else-if="item.itemType === 'weapon_mag'">
                      <span class="font-bold text-toxic">{{ item.mag || 0 }}/{{ item.mag_max || 0 }}</span>
                    </template>
                    <template v-else-if="item.itemType === 'weapon_ammo'">
                      <span class="text-bone-muted">{{ item.ammo || 0 }}</span>
                    </template>
                    <template v-else><span class="text-bone-muted/30">—</span></template>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div v-else class="text-bone-muted text-sm py-6 text-center border-2 border-dashed border-bone-muted/30 rounded-lg">
            Инвентарь пуст
          </div>
        </section>
        
      </div>
      
      <!-- ARCHIVE MODE: Storage, Notes, NPCs, History -->
      <div v-else class="p-3 pb-20 space-y-4">
        
        <!-- NOTES -->
        <section>
          <div class="flex items-center gap-2 mb-2">
            <span class="i-tabler-notes icon-lg text-toxic"></span>
            <h2 class="font-display text-sm text-toxic tracking-wider uppercase">Заметки</h2>
            <div class="flex-1 h-px bg-toxic-muted/30"></div>
          </div>
          <div class="bg-dark border-2 border-bone-muted rounded-lg p-3">
            <p v-if="data.notes" class="text-bone text-sm whitespace-pre-wrap leading-relaxed">{{ data.notes }}</p>
            <p v-else class="text-bone-muted text-sm">Нет заметок</p>
          </div>
        </section>
        
        <!-- STORAGE -->
        <section>
          <div class="flex items-center gap-1 mb-1">
            <span class="i-game-icons-locked-chest icon-lg text-toxic"></span>
            <h2 class="font-display text-sm text-toxic tracking-wider uppercase">Хранилище</h2>
            <div class="flex-1 h-px bg-toxic-muted/30"></div>
            <button @click="openAddModal('storage')" class="p-1 text-toxic hover:text-toxic-dim transition-colors">
              <span class="i-tabler-plus icon"></span>
            </button>
          </div>
          <div v-if="filteredStorage.length" class="flex flex-col gap-1">
            <div 
              v-for="(item, i) in filteredStorage" 
              :key="item.name" 
              @click="!wasLongPress() && openViewModal('storage', i, item)" 
              @pointerdown="['quantity','weapon_mag','weapon_ammo'].includes(item.itemType) && startLongPress(() => openItemSlider('storage', i, item), $event)"
              @pointerup="cancelLongPress" @pointerleave="cancelLongPress"
              @contextmenu.prevent 
              :class="[
                'flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors',
                item.broken 
                  ? 'bg-red-500/10 border border-red-500/30 hover:border-red-500' 
                  : 'bg-dark border border-bone-muted/20 hover:border-toxic/50'
              ]"
            >
              <span :class="[item.icon || 'i-game-icons-swap-bag', item.broken ? 'text-red-500/50' : item.color ? `text-${item.color}/70` : 'text-toxic/70']" class="icon-lg flex-none"></span>
              <div class="flex-1 min-w-0">
                <div :class="['text-sm font-medium truncate', item.broken ? 'text-red-500/70 line-through' : 'text-bone']">{{ item.name }}</div>
                <div class="flex items-center gap-2 mt-0.5">
                  <span v-if="item.category" class="text-xs text-bone-muted">{{ item.category }}</span>
                  <span v-if="item.category && item.damage" class="text-bone-muted/30">·</span>
                  <span v-if="item.damage" class="text-xs text-toxic">{{ item.damage }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-none">
                <template v-if="item.itemType === 'quantity'">
                  <span v-if="formatQuantity(item)" class="text-lg font-bold text-toxic">{{ formatQuantity(item) }}</span>
                </template>
                <template v-else-if="item.itemType === 'weapon_mag'">
                  <span class="text-sm font-bold text-toxic">{{ item.mag || 0 }}/{{ item.mag_max || 0 }}</span>
                </template>
                <template v-else-if="item.itemType === 'weapon_ammo'">
                  <span class="text-sm font-bold text-toxic">{{ item.ammo || 0 }} {{ item.ammo_type || 'шт' }}</span>
                </template>
                <template v-else-if="item.itemType === 'armor' && item.armor_value">
                  <span class="text-sm font-bold text-toxic">🛡{{ item.armor_value }}</span>
                </template>
              </div>
            </div>
          </div>
          <div v-else class="text-bone-muted text-sm py-6 text-center border-2 border-dashed border-bone-muted/30 rounded-lg">
            Хранилище пусто
          </div>
        </section>
        
        <!-- DANGER ZONE -->
        <section class="pt-8">
          <button 
            @click="showDeleteConfirm = true" 
            class="w-full py-3 border-2 border-red-500/30 hover:border-red-500 rounded-lg text-red-500/60 hover:text-red-500 text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <span class="i-tabler-trash icon-sm"></span>
            Удалить персонажа
          </button>
        </section>
        
      </div>
    </div>
    
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- FIXED BOTTOM TAB BAR -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div class="flex-none bg-night border-t-2 border-toxic-muted">
      <div class="grid grid-cols-2 h-16">
        <button 
          @click="activeMode = 'active'"
          :class="[
            'flex flex-col items-center justify-center gap-1 transition-colors',
            activeMode === 'active' ? 'text-toxic' : 'text-bone-muted hover:text-toxic-muted'
          ]"
        >
          <span class="i-game-icons-swordman icon-xl"></span>
          <span class="text-[10px] uppercase tracking-wider">Активное</span>
        </button>
        <button 
          @click="activeMode = 'archive'"
          :class="[
            'flex flex-col items-center justify-center gap-1 transition-colors',
            activeMode === 'archive' ? 'text-toxic' : 'text-bone-muted hover:text-toxic-muted'
          ]"
        >
          <span class="i-game-icons-archive-register icon-xl"></span>
          <span class="text-[10px] uppercase tracking-wider">Архив</span>
        </button>
      </div>
    </div>
    
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- MODALS -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    
    <!-- Share dialog -->
    <Teleport to="body">
      <div v-if="showShareDialog" class="fixed inset-0 bg-void/95 flex items-center justify-center z-50 p-4 font-sans" @click.self="showShareDialog = false">
        <div class="bg-night border-2 border-toxic rounded-xl p-6 w-full max-w-lg">
          <h2 class="font-display text-2xl text-toxic mb-5 flex items-center gap-3">
            <span class="i-tabler-share icon-xl"></span>
            ССЫЛКА НА ПЕРСОНАЖА
          </h2>
          <p class="text-bone-muted mb-4 font-sans">Отправь ссылку другу — он сможет импортировать персонажа</p>
          <input
            :value="shareLink"
            readonly
            class="w-full px-4 py-4 bg-dark border-2 border-bone-muted/50 rounded-lg text-bone font-mono text-sm box-border focus:outline-none focus:border-toxic transition-colors"
            @focus="$event.target.select()"
          />
          <div class="flex gap-3 justify-end mt-5">
            <button @click="showShareDialog = false" class="px-6 py-3 bg-surface border-2 border-bone-muted text-bone rounded-lg font-sans font-semibold hover:border-bone transition-colors">
              Закрыть
            </button>
            <button @click="copyCode" class="px-6 py-3 bg-toxic border-2 border-toxic text-night rounded-lg font-sans font-semibold hover:brightness-110 transition flex items-center gap-2">
              <span :class="copied ? 'i-tabler-check' : 'i-tabler-copy'" class="icon"></span>
              {{ copied ? 'Скопировано!' : 'Скопировать' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Delete confirm -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-void/95 flex items-center justify-center z-50 p-4 font-sans" @click.self="showDeleteConfirm = false">
        <div class="bg-night border-2 border-red-500 rounded-xl p-6 w-full max-w-sm">
          <h2 class="font-display text-2xl text-red-500 mb-5 flex items-center gap-3">
            <span class="i-tabler-alert-triangle icon-xl"></span>
            УДАЛИТЬ?
          </h2>
          <p class="text-bone-muted mb-6 text-lg font-sans">{{ char.name }} будет удалён навсегда.</p>
          <div class="flex gap-3 justify-end">
            <button @click="showDeleteConfirm = false" class="px-6 py-3 bg-surface border-2 border-bone-muted text-bone rounded-lg font-sans font-semibold hover:border-bone transition-colors">
              Отмена
            </button>
            <button @click="handleDelete" class="px-6 py-3 bg-red-500 border-2 border-red-500 text-night rounded-lg font-sans font-semibold hover:brightness-110 transition flex items-center gap-2">
              <span class="i-tabler-trash icon"></span>
              Удалить
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Add/Edit Item Modal -->
    <Teleport to="body">
      <div v-if="showItemModal" class="fixed inset-0 bg-void/95 flex items-end sm:items-center justify-center z-50 font-sans" @click.self="showItemModal = false">
        <div :class="[
          'bg-night border-2 rounded-t-2xl sm:rounded-lg p-5 w-full sm:max-w-md max-h-[90vh] overflow-auto',
          sectionColors.border
        ]">
          <h2 :class="['font-display text-xl mb-5 flex items-center gap-2', sectionColors.text]">
            <span :class="{
              'i-game-icons-skills': editingSection === 'skills',
              'i-game-icons-star-formation': editingSection === 'qualities',
              'i-game-icons-broken-skull': editingSection === 'drawbacks',
              'i-game-icons-swap-bag': editingSection === 'inventory' || editingSection === 'storage',
            }" class="icon-lg"></span>
            {{ editingIndex === -1 ? 'Добавить' : 'Редактировать' }}
            {{ editingSection === 'skills' ? 'навык' : editingSection === 'qualities' ? 'качество' : editingSection === 'drawbacks' ? 'недостаток' : 'предмет' }}
          </h2>
          
          <!-- Name -->
          <div class="mb-5">
            <label :class="['block text-sm font-sans uppercase tracking-wide mb-2', sectionColors.text]">Название</label>
            <input 
              v-model="editingItem.name" 
              type="text" 
              :class="[
                'w-full px-0 py-2 bg-transparent border-b text-bone text-lg font-sans placeholder-bone-muted/50 focus:outline-none transition-colors box-border',
                sectionColors.border.replace('border-', 'focus:border-'),
                'border-bone-muted/50'
              ]"
              placeholder="Введите название..." 
            />
          </div>
          
          <!-- Value (level/points) for skills/qualities/drawbacks, OR Type selector for inventory -->
          <div class="mb-5">
            <label v-if="editingSection !== 'inventory' && editingSection !== 'storage'" :class="['block text-sm font-sans uppercase tracking-wide mb-2', sectionColors.text]">
              {{ editingSection === 'skills' ? 'Уровень' : 'Очки' }}
            </label>
            <label v-else :class="['block text-sm font-sans uppercase tracking-wide mb-2', sectionColors.text]">
              Тип предмета
            </label>
            <!-- Skills/Qualities/Drawbacks: button selector -->
            <template v-if="editingSection === 'skills' || editingSection === 'qualities' || editingSection === 'drawbacks'">
              <div class="grid grid-cols-5 gap-2">
                <button 
                  v-for="n in 5" 
                  :key="n"
                  type="button"
                  @click="editingSection === 'skills' ? (editingItem.level = n) : (editingItem.points = n)"
                  :class="[
                    'h-12 rounded-lg text-xl font-sans font-bold transition-all',
                    (editingSection === 'skills' ? editingItem.level : editingItem.points) === n 
                      ? `${sectionColors.bg} text-night` 
                      : 'bg-dark border-2 border-bone-muted/30 text-bone hover:border-bone-muted'
                  ]"
                >{{ n }}</button>
              </div>
              <!-- Chevron to expand -->
              <div 
                v-if="!showExtendedLevels" 
                @click="showExtendedLevels = true"
                class="flex justify-center mt-2 py-1 cursor-pointer text-bone-muted hover:text-bone transition-colors"
              >
                <span class="i-tabler-chevron-down icon"></span>
              </div>
              <!-- Extended levels 6-10 -->
              <div v-if="showExtendedLevels" class="grid grid-cols-5 gap-2 mt-2">
                <button 
                  v-for="n in 5" 
                  :key="n+5"
                  type="button"
                  @click="editingSection === 'skills' ? (editingItem.level = n + 5) : (editingItem.points = n + 5)"
                  :class="[
                    'h-12 rounded-lg text-xl font-sans font-bold transition-all',
                    (editingSection === 'skills' ? editingItem.level : editingItem.points) === n + 5 
                      ? `${sectionColors.bg} text-night` 
                      : 'bg-dark border-2 border-bone-muted/30 text-bone hover:border-bone-muted'
                  ]"
                >{{ n + 5 }}</button>
              </div>
            </template>
            <!-- Inventory: type selector and fields -->
            <template v-else>
              <!-- Item Type selector -->
              <div class="grid grid-cols-3 gap-1.5 mb-4">
                <button 
                  v-for="t in itemTypes" 
                  :key="t.value"
                  type="button"
                  @click="editingItem.itemType = t.value"
                  :class="[
                    'p-2 rounded-lg text-xs font-sans transition-all flex flex-col items-center gap-1',
                    editingItem.itemType === t.value 
                      ? `${sectionColors.bg} text-night` 
                      : 'bg-dark border border-bone-muted/30 text-bone-muted hover:border-bone-muted hover:text-bone'
                  ]"
                >
                  <span :class="t.icon" class="icon"></span>
                  <span class="truncate w-full text-center">{{ t.label }}</span>
                </button>
              </div>
              
              <!-- Type-specific fields -->
              <!-- Quantity type -->
              <div v-if="editingItem.itemType === 'quantity'" class="flex items-center gap-3">
                <input 
                  v-model.number="editingItem.quantity"
                  type="number" 
                  min="1" 
                  class="w-20 px-0 py-2 bg-transparent border-b border-bone-muted/50 text-center text-xl font-sans font-bold text-toxic focus:outline-none focus:border-toxic box-border"
                />
                <input 
                  v-model="editingItem.unit"
                  type="text" 
                  placeholder="шт"
                  class="w-20 px-0 py-2 bg-transparent border-b border-bone-muted/50 text-center text-base font-sans text-bone focus:outline-none focus:border-toxic box-border"
                />
              </div>
              
              <!-- Weapon (no ammo) -->
              <div v-else-if="editingItem.itemType === 'weapon'" class="space-y-3">
                <div>
                  <label class="block text-xs font-sans uppercase tracking-wide mb-1 text-bone-muted">Урон</label>
                  <input 
                    v-model="editingItem.damage"
                    type="text" 
                    placeholder="D6×3"
                    class="w-full px-0 py-1 bg-transparent border-b border-bone-muted/50 text-base font-sans text-bone focus:outline-none focus:border-toxic box-border"
                  />
                </div>
              </div>
              
              <!-- Weapon with ammo (bow, grenades) -->
              <div v-else-if="editingItem.itemType === 'weapon_ammo'" class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-sans uppercase tracking-wide mb-1 text-bone-muted">Урон</label>
                    <input 
                      v-model="editingItem.damage"
                      type="text" 
                      placeholder="D6×3"
                      class="w-full px-0 py-1 bg-transparent border-b border-bone-muted/50 text-base font-sans text-bone focus:outline-none focus:border-toxic box-border"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-sans uppercase tracking-wide mb-1 text-bone-muted">Дальность</label>
                    <input 
                      v-model="editingItem.range"
                      type="text" 
                      placeholder="20m/50m/100m"
                      class="w-full px-0 py-1 bg-transparent border-b border-bone-muted/50 text-base font-sans text-bone focus:outline-none focus:border-toxic box-border"
                    />
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-sans uppercase tracking-wide mb-1 text-bone-muted">Запас</label>
                    <input 
                      v-model.number="editingItem.ammo"
                      type="number" 
                      min="0"
                      class="w-full px-0 py-1 bg-transparent border-b border-bone-muted/50 text-base font-sans text-bone focus:outline-none focus:border-toxic box-border"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-sans uppercase tracking-wide mb-1 text-bone-muted">Тип БП</label>
                    <input 
                      v-model="editingItem.ammo_type"
                      type="text" 
                      placeholder="стрела"
                      class="w-full px-0 py-1 bg-transparent border-b border-bone-muted/50 text-base font-sans text-bone focus:outline-none focus:border-toxic box-border"
                    />
                  </div>
                </div>
              </div>
              
              <!-- Weapon with magazine -->
              <div v-else-if="editingItem.itemType === 'weapon_mag'" class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-sans uppercase tracking-wide mb-1 text-bone-muted">Урон</label>
                    <input 
                      v-model="editingItem.damage"
                      type="text" 
                      placeholder="D8×4"
                      class="w-full px-0 py-1 bg-transparent border-b border-bone-muted/50 text-base font-sans text-bone focus:outline-none focus:border-toxic box-border"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-sans uppercase tracking-wide mb-1 text-bone-muted">Дальность</label>
                    <input 
                      v-model="editingItem.range"
                      type="text" 
                      placeholder="50m/150m/300m"
                      class="w-full px-0 py-1 bg-transparent border-b border-bone-muted/50 text-base font-sans text-bone focus:outline-none focus:border-toxic box-border"
                    />
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-3">
                  <div>
                    <label class="block text-xs font-sans uppercase tracking-wide mb-1 text-bone-muted">Магазин</label>
                    <div class="flex items-center gap-1">
                      <input 
                        v-model.number="editingItem.mag"
                        type="number" 
                        min="0"
                        class="w-full px-0 py-1 bg-transparent border-b border-bone-muted/50 text-base font-sans text-toxic focus:outline-none focus:border-toxic box-border text-center"
                      />
                      <span class="text-bone-muted">/</span>
                      <input 
                        v-model.number="editingItem.mag_max"
                        type="number" 
                        min="1"
                        class="w-full px-0 py-1 bg-transparent border-b border-bone-muted/50 text-base font-sans text-bone focus:outline-none focus:border-toxic box-border text-center"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-sans uppercase tracking-wide mb-1 text-bone-muted">Запас</label>
                    <input 
                      v-model.number="editingItem.ammo_reserve"
                      type="number" 
                      min="0"
                      class="w-full px-0 py-1 bg-transparent border-b border-bone-muted/50 text-base font-sans text-yellow-400 focus:outline-none focus:border-toxic box-border text-center"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-sans uppercase tracking-wide mb-1 text-bone-muted">Тип БП</label>
                    <input 
                      v-model="editingItem.ammo_type"
                      type="text" 
                      placeholder="9mm"
                      class="w-full px-0 py-1 bg-transparent border-b border-bone-muted/50 text-base font-sans text-bone focus:outline-none focus:border-toxic box-border"
                    />
                  </div>
                </div>
              </div>
              
              <!-- Armor -->
              <div v-else-if="editingItem.itemType === 'armor'" class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-sans uppercase tracking-wide mb-1 text-bone-muted">Защита</label>
                    <input 
                      v-model.number="editingItem.armor_value"
                      type="number" 
                      min="0"
                      class="w-full px-0 py-1 bg-transparent border-b border-bone-muted/50 text-xl font-sans font-bold text-cyan-400 focus:outline-none focus:border-cyan-400 box-border text-center"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-sans uppercase tracking-wide mb-1 text-bone-muted">Область</label>
                    <input 
                      v-model="editingItem.armor_location"
                      type="text" 
                      placeholder="Торс"
                      class="w-full px-0 py-1 bg-transparent border-b border-bone-muted/50 text-base font-sans text-bone focus:outline-none focus:border-cyan-400 box-border"
                    />
                  </div>
                </div>
              </div>
              
              <!-- Simple type - no extra fields, show placeholder -->
              <div v-else class="text-bone-muted text-sm py-2">
                Простой предмет без дополнительных параметров
              </div>
            </template>
          </div>
          
          <!-- Icon picker -->
          <div class="mb-5">
            <label :class="['block text-sm font-sans uppercase tracking-wide mb-2', sectionColors.text]">Иконка</label>
            <div class="grid grid-cols-6 gap-1 max-h-56 overflow-auto p-2 bg-dark border-2 border-bone-muted/30 rounded-lg">
              <button 
                v-for="icon in availableIcons" 
                :key="icon"
                type="button"
                @click="editingItem.icon = icon"
                :class="[
                  'p-2 rounded transition-colors flex items-center justify-center',
                  editingItem.icon === icon 
                    ? `${sectionColors.bg} text-night` 
                    : 'text-bone-muted hover:text-bone hover:bg-surface'
                ]"
              >
                <span :class="icon" class="w-7 h-7"></span>
              </button>
            </div>
          </div>
          
          <!-- Color picker -->
          <div class="mb-5">
            <label :class="['block text-sm font-sans uppercase tracking-wide mb-2', sectionColors.text]">Цвет (опционально)</label>
            <div class="flex flex-wrap gap-2">
              <button 
                type="button"
                @click="editingItem.color = ''"
                :class="[
                  'w-9 h-9 rounded-full border-3 flex items-center justify-center transition-all',
                  editingItem.color === '' ? 'border-bone ring-2 ring-bone/50 ring-offset-2 ring-offset-night' : 'border-bone-muted/30 hover:border-bone-muted'
                ]"
                title="По умолчанию"
              >
                <span class="i-tabler-x text-bone-muted"></span>
              </button>
              <button 
                v-for="color in availableColors" 
                :key="color.value"
                type="button"
                @click="editingItem.color = color.value"
                :class="[
                  'w-9 h-9 rounded-full border-3 transition-all',
                  color.class,
                  editingItem.color === color.value 
                    ? 'border-bone ring-2 ring-bone/50 ring-offset-2 ring-offset-night scale-110' 
                    : 'border-transparent hover:scale-105 hover:border-bone/30'
                ]"
                :title="color.name"
              ></button>
            </div>
          </div>
          
          <!-- Category -->
          <div class="mb-5">
            <label :class="['block text-sm font-sans uppercase tracking-wide mb-2', sectionColors.text]">Категория</label>
            <!-- For inventory: preset categories -->
            <template v-if="editingSection === 'inventory' || editingSection === 'storage'">
              <div class="flex flex-wrap gap-1.5">
                <button 
                  v-for="cat in inventoryCategories" 
                  :key="cat.value"
                  type="button"
                  @click="editingItem.category = cat.label"
                  :class="[
                    'px-3 py-1.5 rounded text-sm font-sans transition-colors',
                    editingItem.category === cat.label 
                      ? `${sectionColors.bg} text-night` 
                      : 'bg-dark border border-bone-muted/30 text-bone-muted hover:text-bone hover:border-bone-muted'
                  ]"
                >{{ cat.label }}</button>
              </div>
            </template>
            <!-- For other sections: custom categories -->
            <template v-else>
              <!-- Current category -->
              <div v-if="editingItem.category" class="flex items-center gap-2 mb-2">
                <span class="px-3 py-1.5 bg-surface rounded-lg text-sm font-sans text-bone">{{ editingItem.category }}</span>
                <button type="button" @click="editingItem.category = ''" class="text-bone-muted hover:text-red-500">
                  <span class="i-tabler-x"></span>
                </button>
              </div>
              <!-- Existing categories -->
              <div class="flex flex-wrap gap-1.5 mb-2" v-if="existingCategories.length">
                <button 
                  v-for="cat in existingCategories" 
                  :key="cat"
                  type="button"
                  @click="setCategory(cat)"
                  :class="[
                    'px-2.5 py-1 rounded text-sm font-sans transition-colors',
                    editingItem.category === cat 
                      ? `${sectionColors.bg} text-night` 
                      : 'bg-dark border border-bone-muted/30 text-bone-muted hover:text-bone hover:border-bone-muted'
                  ]"
                >{{ cat }}</button>
              </div>
              <!-- New category input -->
              <div class="flex gap-2">
                <input 
                  v-model="newCategory"
                  type="text"
                  @keydown.enter.prevent="addNewCategory"
                  class="flex-1 px-0 py-2 bg-transparent border-b border-bone-muted/50 text-bone text-sm font-sans placeholder-bone-muted/50 focus:outline-none focus:border-bone-muted transition-colors box-border"
                  placeholder="Новая категория..."
                />
                <button 
                  type="button"
                  @click="addNewCategory"
                  :class="[
                    'px-4 py-2 rounded-lg font-sans font-semibold transition-colors',
                    sectionColors.bg,
                    'text-night hover:opacity-80'
                  ]"
                >
                  <span class="i-tabler-plus"></span>
                </button>
              </div>
            </template>
          </div>
          
          <!-- Broken (inventory only) -->
          <div v-if="editingSection === 'inventory' || editingSection === 'storage'" class="mb-5">
            <label 
              @click="editingItem.broken = !editingItem.broken"
              :class="[
                'flex items-center gap-3 cursor-pointer select-none',
                editingItem.broken ? 'text-red-500' : 'text-bone-muted'
              ]"
            >
              <span :class="[
                'w-6 h-6 rounded border-2 flex items-center justify-center transition-all',
                editingItem.broken 
                  ? 'bg-red-500 border-red-500' 
                  : 'bg-transparent border-bone-muted/50 hover:border-bone-muted'
              ]">
                <span v-if="editingItem.broken" class="i-tabler-check text-white text-sm"></span>
              </span>
              <span class="text-sm font-sans uppercase tracking-wide">Сломано / Непригодно</span>
            </label>
          </div>
          
          <!-- Description -->
          <div class="mb-6">
            <label :class="['block text-sm font-sans uppercase tracking-wide mb-2', sectionColors.text]">Описание (опционально)</label>
            <textarea 
              v-model="editingItem.description" 
              class="w-full px-0 py-2 bg-transparent border-b border-bone-muted/50 text-bone font-sans placeholder-bone-muted/50 focus:outline-none focus:border-toxic/50 transition-colors h-24 resize-none box-border"
              placeholder="Дополнительные заметки..."
            ></textarea>
          </div>
          
          <!-- Actions -->
          <div class="flex gap-3">
            <button 
              v-if="editingIndex >= 0" 
              type="button"
              @click="deleteItem" 
              class="flex-1 py-3 bg-red-500/20 border-2 border-red-500 text-red-500 rounded-lg font-sans font-semibold flex items-center justify-center gap-2 hover:bg-red-500 hover:text-night transition-colors"
            >
              <span class="i-tabler-trash icon"></span>
              Удалить
            </button>
            <button 
              type="button"
              @click="showItemModal = false" 
              class="flex-1 py-3 bg-surface border-2 border-bone-muted text-bone rounded-lg font-sans font-semibold hover:border-bone hover:text-white transition-colors"
            >
              Отмена
            </button>
            <button 
              type="button"
              @click="saveItem" 
              :disabled="!editingItem.name.trim()"
              :class="[
                'flex-1 py-3 border-2 rounded-lg font-sans font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                sectionColors.bg,
                sectionColors.border,
                'text-night hover:brightness-110'
              ]"
            >
              {{ editingIndex === -1 ? 'Добавить' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- VIEW ITEM MODAL (details + actions) -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="showViewModal && viewingItem" class="fixed inset-0 bg-void/90 z-50 flex items-end justify-center font-sans" @click.self="showViewModal = false">
        <div class="bg-night w-full max-w-lg rounded-t-2xl p-5 pb-8 max-h-[80vh] overflow-y-auto border-t-2 border-toxic-muted">
          
          <!-- Header -->
          <div class="flex items-start gap-3 mb-4">
            <span :class="[viewingItem.icon || 'i-game-icons-swap-bag', viewingItem.broken ? 'text-red-500' : viewingItem.color ? `text-${viewingItem.color}` : 'text-toxic']" class="w-10 h-10 flex-none mt-0.5"></span>
            <div class="flex-1 min-w-0">
              <h3 :class="['font-display text-lg leading-tight', viewingItem.broken ? 'text-red-500 line-through' : 'text-bone']">{{ viewingItem.name }}</h3>
              <div class="flex items-center gap-2 mt-1">
                <span v-if="viewingItem.category" class="text-xs text-bone-muted bg-surface px-2 py-0.5 rounded">{{ viewingItem.category }}</span>
                <span v-if="viewingItem.broken" class="text-xs text-red-500 bg-red-500/10 px-2 py-0.5 rounded">Сломано</span>
              </div>
            </div>
            <button @click="showViewModal = false" class="text-bone-muted hover:text-bone p-1">
              <span class="i-tabler-x icon"></span>
            </button>
          </div>
          
          <!-- Stats grid -->
          <div v-if="viewingItem.damage || viewingItem.range || (viewingItem.itemType && viewingItem.itemType !== 'simple')" class="grid grid-cols-2 gap-2 mb-4">
            <!-- Damage -->
            <div v-if="viewingItem.damage" class="bg-dark rounded-lg p-3 text-center">
              <div class="text-xs text-bone-muted uppercase tracking-wide mb-1">Урон</div>
              <div class="text-xl font-bold text-toxic">{{ viewingItem.damage }}</div>
            </div>
            <!-- Range -->
            <div v-if="viewingItem.range" class="bg-dark rounded-lg p-3 text-center">
              <div class="text-xs text-bone-muted uppercase tracking-wide mb-1">Дальность</div>
              <div class="text-xl font-bold text-bone">{{ viewingItem.range }}</div>
            </div>
            <!-- Magazine -->
            <div v-if="viewingItem.itemType === 'weapon_mag'" class="bg-dark rounded-lg p-3 text-center">
              <div class="text-xs text-bone-muted uppercase tracking-wide mb-1">Магазин</div>
              <div class="text-xl font-bold text-toxic">{{ viewingItem.mag || 0 }} / {{ viewingItem.mag_max || 0 }}</div>
            </div>
            <!-- Ammo reserve -->
            <div v-if="viewingItem.itemType === 'weapon_mag' && viewingItem.ammo_reserve" class="bg-dark rounded-lg p-3 text-center">
              <div class="text-xs text-bone-muted uppercase tracking-wide mb-1">Запас патронов</div>
              <div class="text-xl font-bold text-bone">{{ viewingItem.ammo_reserve }}</div>
            </div>
            <!-- Ammo pool -->
            <div v-if="viewingItem.itemType === 'weapon_ammo'" class="bg-dark rounded-lg p-3 text-center">
              <div class="text-xs text-bone-muted uppercase tracking-wide mb-1">Боезапас</div>
              <div class="text-xl font-bold text-toxic">{{ viewingItem.ammo || 0 }} {{ viewingItem.ammo_type || 'шт' }}</div>
            </div>
            <!-- Quantity -->
            <div v-if="viewingItem.itemType === 'quantity'" class="bg-dark rounded-lg p-3 text-center">
              <div class="text-xs text-bone-muted uppercase tracking-wide mb-1">Количество</div>
              <div class="text-xl font-bold text-toxic">{{ viewingItem.quantity || 0 }} {{ viewingItem.unit || 'шт' }}</div>
            </div>
            <!-- Armor -->
            <div v-if="viewingItem.itemType === 'armor' && viewingItem.armor_value" class="bg-dark rounded-lg p-3 text-center">
              <div class="text-xs text-bone-muted uppercase tracking-wide mb-1">Защита</div>
              <div class="text-xl font-bold text-toxic">🛡 {{ viewingItem.armor_value }}</div>
            </div>
            <div v-if="viewingItem.itemType === 'armor' && viewingItem.armor_location" class="bg-dark rounded-lg p-3 text-center">
              <div class="text-xs text-bone-muted uppercase tracking-wide mb-1">Локация</div>
              <div class="text-lg font-bold text-bone">{{ viewingItem.armor_location }}</div>
            </div>
          </div>
          
          <!-- Description -->
          <div v-if="viewingItem.description" class="bg-dark rounded-lg p-3 mb-4">
            <div class="text-xs text-bone-muted uppercase tracking-wide mb-1">Описание</div>
            <p class="text-sm text-bone whitespace-pre-wrap leading-relaxed">{{ viewingItem.description }}</p>
          </div>
          
          <!-- Actions -->
          <div class="flex flex-col gap-2">
            <!-- Move to storage / Move to inventory -->
            <button 
              v-if="viewingSection === 'inventory'"
              @click="moveItem('inventory', 'storage', viewingIndex)"
              class="w-full py-3 bg-dark border-2 border-bone-muted/30 text-bone rounded-lg font-sans font-semibold flex items-center justify-center gap-2 hover:border-toxic/50 transition-colors"
            >
              <span class="i-game-icons-locked-chest icon"></span>
              В хранилище
            </button>
            <button 
              v-if="viewingSection === 'storage'"
              @click="moveItem('storage', 'inventory', viewingIndex)"
              class="w-full py-3 bg-dark border-2 border-bone-muted/30 text-bone rounded-lg font-sans font-semibold flex items-center justify-center gap-2 hover:border-toxic/50 transition-colors"
            >
              <span class="i-game-icons-knapsack icon"></span>
              В инвентарь
            </button>
            
            <!-- Edit -->
            <button 
              @click="viewToEdit()"
              class="w-full py-3 bg-toxic border-2 border-toxic text-night rounded-lg font-sans font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition-colors"
            >
              <span class="i-tabler-edit icon"></span>
              Редактировать
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- SLIDER BOTTOM SHEET (long-press adjustment) -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="showSlider" class="fixed inset-0 bg-void/80 z-60 flex items-end justify-center font-sans" @click.self="saveSliderValue()">
        <div class="bg-night w-full max-w-lg rounded-t-2xl p-5 pb-8 border-t-2 border-toxic-muted">
          
          <!-- Label -->
          <div class="text-center mb-4">
            <div class="text-xs text-bone-muted uppercase tracking-wider mb-2">{{ sliderLabel }}</div>
            <div :class="['text-5xl font-bold leading-none', sliderColor]">{{ sliderValue }}</div>
            <div class="text-xs text-bone-muted/50 mt-1">из {{ sliderMax }}</div>
          </div>
          
          <!-- Range slider -->
          <div class="px-2 mb-3">
            <input 
              type="range" 
              :min="sliderMin" 
              :max="sliderMax" 
              v-model.number="sliderValue" 
              class="slider-input w-full h-10 cursor-pointer"
            />
            <div class="flex justify-between text-xs text-bone-muted/50 mt-1">
              <span>{{ sliderMin }}</span>
              <span>{{ sliderMax }}</span>
            </div>
          </div>
          
          <!-- +/- buttons -->
          <div class="flex items-center justify-center gap-4 mb-4">
            <button 
              @click="sliderValue = Math.max(sliderMin, sliderValue - 10)" 
              class="w-12 h-12 rounded-lg bg-dark border-2 border-bone-muted/30 text-bone-muted text-lg font-bold hover:border-bone transition-colors"
            >−10</button>
            <button 
              @click="sliderValue = Math.max(sliderMin, sliderValue - 1)" 
              class="w-14 h-14 rounded-xl bg-dark border-2 border-bone-muted/30 text-bone text-xl font-bold hover:border-bone transition-colors"
            >−1</button>
            <button 
              @click="sliderValue = Math.min(sliderMax, sliderValue + 1)" 
              class="w-14 h-14 rounded-xl bg-dark border-2 border-bone-muted/30 text-bone text-xl font-bold hover:border-bone transition-colors"
            >+1</button>
            <button 
              @click="sliderValue = Math.min(sliderMax, sliderValue + 10)" 
              class="w-12 h-12 rounded-lg bg-dark border-2 border-bone-muted/30 text-bone-muted text-lg font-bold hover:border-bone transition-colors"
            >+10</button>
          </div>
          
          <!-- Reload button for weapon_mag -->
          <button 
            v-if="sliderReloadable" 
            @click="reloadMag()"
            class="w-full mb-3 py-3 bg-dark border-2 border-yellow-400/30 text-yellow-400 rounded-lg font-semibold flex items-center justify-center gap-2 hover:border-yellow-400 transition-colors"
          >
            <span class="i-game-icons-ammo-box icon"></span>
            Перезарядка
          </button>
          
          <!-- Save -->
          <button 
            @click="saveSliderValue()"
            class="w-full py-3 bg-toxic border-2 border-toxic text-night rounded-lg font-semibold hover:brightness-110 transition-colors"
          >
            Готово
          </button>
        </div>
      </div>
    </Teleport>
    
  </div>
</template>

<style scoped>
.slider-input {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}
.slider-input::-webkit-slider-runnable-track {
  height: 8px;
  background: #1a1a1a;
  border-radius: 4px;
  border: 1px solid #525252;
}
.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #39FF14;
  border: 3px solid #111111;
  margin-top: -12px;
  cursor: pointer;
}
.slider-input::-moz-range-track {
  height: 8px;
  background: #1a1a1a;
  border-radius: 4px;
  border: 1px solid #525252;
}
.slider-input::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #39FF14;
  border: 3px solid #111111;
  cursor: pointer;
}
</style>