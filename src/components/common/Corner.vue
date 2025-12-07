<template>
  <div class="corner-component">
    <router-link v-if="route.name !== 'index'" :to="{ name: 'index' }" class="corner-button">
      Soundboard
    </router-link>
    <router-link v-if="route.name !== 'pomodoro'" :to="{ name: 'pomodoro' }" class="corner-button">
      Pomodoro
    </router-link>
    <router-link v-if="route.name !== 'Metronome'" :to="{ name: 'Metronome' }" class="corner-button">
      Metronome
    </router-link>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style scoped>
.corner-component {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  gap: 10px;
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
  text-decoration: none;
}

.corner-button:hover {
  background-color: #45a049;
}
</style>
