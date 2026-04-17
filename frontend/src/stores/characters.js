import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useCharactersStore = defineStore('characters', () => {
  const auth = useAuthStore()
  const characters = ref([])
  const currentCharacter = ref(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)
  
  async function fetchCharacters() {
    loading.value = true
    error.value = null
    
    try {
      const res = await auth.api('/characters/')
      if (res.ok) {
        characters.value = await res.json()
      }
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }
  
  async function fetchCharacter(id, { silent = false } = {}) {
    if (!silent) loading.value = true
    error.value = null
    
    try {
      const res = await auth.api(`/characters/${id}`)
      if (res.ok) {
        currentCharacter.value = await res.json()
        return currentCharacter.value
      }
    } catch (e) {
      error.value = e.message
    } finally {
      if (!silent) loading.value = false
    }
  }
  
  async function createCharacter(name) {
    loading.value = true
    error.value = null
    
    try {
      const res = await auth.api('/characters/', {
        method: 'POST',
        body: JSON.stringify({ name })
      })
      
      if (res.ok) {
        const newChar = await res.json()
        characters.value.push({
          id: newChar.id,
          name: newChar.name,
          concept: newChar.data.concept,
          character_type: newChar.data.character_type,
          updated_at: newChar.updated_at
        })
        return newChar
      }
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }
  
  async function updateCharacter(id, data) {
    saving.value = true
    error.value = null
    
    try {
      const res = await auth.api(`/characters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
      
      if (res.ok) {
        const updated = await res.json()
        currentCharacter.value = updated
        
        // Update in list
        const idx = characters.value.findIndex(c => c.id === id)
        if (idx !== -1) {
          characters.value[idx] = {
            id: updated.id,
            name: updated.name,
            concept: updated.data.concept,
            character_type: updated.data.character_type,
            updated_at: updated.updated_at
          }
        }
        
        return updated
      }
    } catch (e) {
      error.value = e.message
    } finally {
      saving.value = false
    }
  }
  
  async function deleteCharacter(id) {
    try {
      const res = await auth.api(`/characters/${id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        characters.value = characters.value.filter(c => c.id !== id)
        if (currentCharacter.value?.id === id) {
          currentCharacter.value = null
        }
      }
    } catch (e) {
      error.value = e.message
    }
  }
  
  async function exportCharacter(id) {
    const res = await auth.api(`/characters/${id}/export`)
    if (res.ok) {
      return res.json()
    }
  }
  
  async function importCharacter(code) {
    const res = await auth.api(`/characters/import?code=${encodeURIComponent(code)}`, {
      method: 'POST'
    })
    if (res.ok) {
      const imported = await res.json()
      await fetchCharacters()
      return imported
    }
  }

  async function shareCharacter(id) {
    const res = await auth.api(`/characters/${id}/share`, { method: 'POST' })
    if (res.ok) {
      return res.json()
    }
  }

  async function importShared(code) {
    const res = await auth.api(`/characters/import-shared/${code}`, { method: 'POST' })
    if (res.ok) {
      const imported = await res.json()
      await fetchCharacters()
      return imported
    }
  }
  
  return {
    characters,
    currentCharacter,
    loading,
    saving,
    error,
    fetchCharacters,
    fetchCharacter,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    exportCharacter,
    importCharacter,
    shareCharacter,
    importShared,
  }
})
