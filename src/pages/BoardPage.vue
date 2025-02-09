<template>
  <div class="board-container">
    <SearchTools
      v-if="categories.length > 0"
      v-model:search="search"
      v-model:selected-category="selectedCategory"
      :categories="categories"
      class="search-tools"
    />
    <div class="grid-container">
      <Grid
        v-if="allSounds.length > 0"
        :search="search"
        :selected-category="selectedCategory"
        :all-sounds="allSounds"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MySound } from '~/types/MySound'

import sounds from '~/assets/sounds.json'
import Grid from '~/components/Grid.vue'

import SearchTools from '~/components/SearchTools.vue'
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

<style scoped>
.board-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.search-tools {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #00c6bf;
}

.grid-container {
  flex-grow: 1;
  overflow-y: auto;
}
</style>
