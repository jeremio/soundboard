<template>
  <div class="grid">
    <Bouton
      v-for="sound in categorizedSounds"
      v-show="matchesSearch(sound)"
      :key="sound.id"
      :sound="sound"
    />
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

// Filtre par catégorie - ce calcul est moins fréquent
const categorizedSounds = computed(() => {
  if (props.selectedCategory === 'tous')
    return props.allSounds
  return props.allSounds.filter(sound =>
    sound.categories.includes(props.selectedCategory),
  )
})

// Utilise v-show pour le filtrage par recherche - plus réactif
function matchesSearch(sound: MySound) {
  if (props.search === '')
    return true

  const searchLower = props.search.toLowerCase()
  return sound.label.toLowerCase().includes(searchLower)
}
</script>

<style lang="css">
.grid {
  display: flex;
  flex-wrap: wrap;
}
</style>
