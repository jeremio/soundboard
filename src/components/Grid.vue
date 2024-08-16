<template>
  <div class="grid">
    <template
      v-for="(sound) in allSounds"
      :key="sound.id"
    >
      <Bouton
        v-show="showSoundOnSelect(sound)"
        :sound="sound"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import Bouton from '~/components/Bouton.vue'
import type { MySound } from '~/types/MySound'

const props = defineProps<{
  allSounds: MySound[]
  search: string
  selectedCategory: string
}>()

function showSoundOnSelect(sound: MySound) {
  if (props.search !== '')
    return inputIntoSelectOrNot(sound)
  else if (props.selectedCategory === 'tous')
    return true
  else
    return sound.categories.includes(props.selectedCategory)
}

function inputIntoSelectOrNot(sound: MySound) {
  const isSearchMatch = (field: string) => field.toLowerCase().includes(props.search.toLowerCase())
  const isCategoryMatch = () => sound.categories.includes(props.selectedCategory)

  if (props.selectedCategory !== 'tous')
    return isCategoryMatch() && (isSearchMatch(sound.label) || isSearchMatch(sound.src))
  else
    return isSearchMatch(sound.label) || isSearchMatch(sound.src)
}
</script>

<style lang="css">
.grid {
  display: flex;
  flex-wrap: wrap;
}
</style>
