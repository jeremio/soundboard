<template>
  <div v-if="show" class="toast" role="alert">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  message: string
}>()
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  background-color: #0e1e24;
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 0.3125rem;
  animation: fadeInOut 3s ease-in-out;
  z-index: 1000;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0; }
  10%, 90% { opacity: 1; }
}
</style>
