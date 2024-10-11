<template>
  <div class="corner-component">
    <router-link :to="targetRoute" class="corner-button">
      {{ buttonText }}
    </router-link>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

// Définir la route cible en fonction de la page actuelle
const targetRoute = computed(() => {
  return route.name === 'index' ? { name: 'pomodoro' } : { name: 'index' }
})

// Modifier le texte du bouton selon la page
const buttonText = computed(() => {
  return route.name === 'index' ? 'Go to Pomodoro' : 'Go to Soundboard'
})
</script>

<style scoped>
.corner-component {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.corner-button {
  padding: 10px 15px;
  background-color: #7fd1ae;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.corner-button:hover {
  background-color: #45a049;
}
</style>
