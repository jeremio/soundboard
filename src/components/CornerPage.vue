<template>
  <div class="corner-component">
    <router-link v-if="route.path === '/pomodoro'" class="corner-button" to="/">
      Soundboard
    </router-link>
    <router-link v-else to="/pomodoro" class="corner-button">
      Pomodoro
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
}

.corner-button {
  padding: 10px 15px;
  background-color: #4CAF50;
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
