<template>
  <div class="page">
    <h1>Sound board</h1>
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
import type { Category } from '~/types/Category'
import type { MySound, MySoundWithoutId } from '~/types/MySound'
import soundsData from '~/assets/sounds.json'
import Grid from '~/components/board/Grid.vue'
import SearchTools from '~/components/board/SearchTools.vue'
import { assignEmptyCategory, assignIds, getCategories, sortArrayByField } from '~/utils'

const allSounds = ref<MySound[]>([])
const categories = ref<Category[]>([])
const selectedCategory = ref<Category | 'tous'>('tous')
const search = ref('')

onMounted(() => {
  const sounds = soundsData as MySoundWithoutId[]
  const soundsWithIds: MySound[] = assignIds(sounds)
  const soundsWithIdsAndCategories: MySound[] = assignEmptyCategory(soundsWithIds)

  allSounds.value = sortArrayByField(soundsWithIdsAndCategories, 'label')
  categories.value = getCategories(soundsWithIdsAndCategories).sort()
})
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  padding-bottom: 20px;
  background-color: var(--light-gray);
  min-height: 200px;
  border-radius: 8px;
}

.search-tools {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--text-color);
}

.grid-container {
  flex-grow: 1;
  overflow-y: auto;
  width: 100%;
}
</style>
