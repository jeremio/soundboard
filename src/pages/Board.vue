<template>
  <SearchTools
    v-if="categories.length > 0"
    v-model:search="search"
    v-model:selected-category="selectedCategory"
    :categories="categories"
  />
  <Grid
    v-if="allSounds.length > 0"
    :search="search"
    :selected-category="selectedCategory"
    :all-sounds="allSounds"
  />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import sounds from '~/assets/sounds.json'
import Grid from '~/components/Grid.vue'

import SearchTools from '~/components/SearchTools.vue'

import type { MySound } from '~/types/MySound'
import { assignEmptyCategory, assignIds, getCategories, sortArrayByField } from '~/utils'

const allSounds = shallowRef<MySound[]>([])
const categories = shallowRef<string[]>([])

const selectedCategory = shallowRef('tous')
const search = shallowRef('')

onMounted(() => {
  const soundsWithIds: MySound[] = assignIds(sounds)
  const soundsWithIdsAndCategories: MySound[] = assignEmptyCategory(soundsWithIds)

  allSounds.value = sortArrayByField(soundsWithIdsAndCategories, 'label')
  categories.value = getCategories(soundsWithIdsAndCategories).sort()
})
</script>
