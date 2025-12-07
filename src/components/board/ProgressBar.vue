<template>
  <div class="progress-container">
    <div class="progress-bar" :style="{ width: `${progress}%` }" />
    <span class="time">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  progress: number
  currentTime: number
  duration: number
  formatTime: (seconds: number) => string
}>()
</script>

<style scoped>
.progress-container {
  position: absolute;
  bottom: -1.25rem;
  left: 0;
  width: 100%;
  height: 0.25rem;
  background-color: #e5e7eb;
  border-radius: 0.125rem;
}

.progress-bar {
  height: 100%;
  background-color: #0e1e24;
  border-radius: 0.125rem;
  transition: width 0.1s linear;
}

.time {
  position: absolute;
  right: 0;
  bottom: -1.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}
</style>
