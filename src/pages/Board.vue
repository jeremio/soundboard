<template>
  <SearchTools
    v-model:search="search"
    v-model:selected-category="selectedCategory"
    :categories="categories"
  />
  <Grid
    :search="search"
    :selected-category="selectedCategory"
    :all-sounds="allSounds"
  />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Grid from '~/components/Grid.vue'
import SearchTools from '~/components/SearchTools.vue'

import type { MySound } from '~/types/MySound'
import { assignEmptyCategory, assignIds, getCategories, sortArrayByField } from '~/utils'

const allSounds = ref<MySound[]>([])
const categories = ref<string[]>([])

const selectedCategory = ref('tous')
const search = ref('')

async function api<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok)
    throw new Error(`HTTP error! status: ${response.status}`)

  const data = await response.json()
  return data as T
}

onMounted(async () => {
  try {
    const response = await api<MySound[]>('/sounds.json')
    const soundsWithIds = assignIds(response)
    const soundsWithIdsAndCategories = assignEmptyCategory(soundsWithIds)

    allSounds.value = sortArrayByField(soundsWithIdsAndCategories, 'label')
    categories.value = getCategories(soundsWithIdsAndCategories).sort()
  }
  catch (error) {
    console.error('Error fetching sounds:', error)
  }
})
</script>
