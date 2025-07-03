<template>
  <div>
    <div class="sound-button" :class="{ 'is-playing': isPlaying }">
      <button
        class="action copy-button"
        :title="t.copyUrl"
        @click="copyURL"
      >
        <img :src="copySVG" alt="copy url">
      </button>

      <p class="action label" :title="sound.label">
        {{ sound.label }}
      </p>

      <button
        class="action play-button"
        :aria-label="isPlaying ? t.pause : t.play"
        @click="toggle"
      >
        <div class="triangle_square" />
      </button>

      <ProgressBar
        v-show="isPlaying"
        :progress="progress"
        :current-time="currentTime"
        :duration="duration"
        :format-time="formatTime"
      />
    </div>

    <Toast :show="showToast" :message="toastMessage" />
  </div>
</template>

<script setup lang="ts">
import type { MySound } from '~/types/MySound'
import copySVG from '~/assets/copy.svg'
import ProgressBar from '~/components/ProgressBar.vue'
import Toast from '~/components/Toast.vue'
import { useAudioPlayer } from '~/composables/useAudioPlayer'

const props = defineProps<{
  sound: MySound
}>()

const soundSrc = computed(() => `/sounds/${props.sound.src}`)

const {
  isPlaying,
  currentTime,
  duration,
  progress,
  formatTime,
  toggle,
} = useAudioPlayer({ soundSrc })

const showToast = ref(false)
const toastMessage = ref('')

const t = {
  copyUrl: 'Copier l\'URL',
  play: 'Lire',
  pause: 'Pause',
  urlCopied: 'URL copiée dans le presse-papier',
  copyError: 'Erreur lors de la copie de l\'URL',
}

function showToastMessage(message: string, duration = 3000) {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, duration)
}

async function copyURL() {
  try {
    const url = new URL(`/sounds/${props.sound.src}`, window.location.origin)
    await navigator.clipboard.writeText(url.href)
    showToastMessage(t.urlCopied)
  }
  catch (e) {
    console.error(e)
    showToastMessage(t.copyError)
  }
}
</script>

<style scoped>
.sound-button {
  background-color: white;
  display: flex;
  align-items: center;
  margin: 1.875rem 1.25rem;
  position: relative;
  border-radius: 0.3125rem;
  border: 0.125rem solid white;
  height: 3.75rem;
  transition: box-shadow 0.3s ease;
}

.sound-button:hover {
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
}

.action {
  width: 3.75rem;
  height: 100%;
  display: grid;
  place-items: center;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action:hover {
  background-color: rgba(14, 30, 36, 0.05);
}

.copy-button {
  border-right: 0.0625rem solid #e5e7eb;
}

.label {
  color: #0e1e24;
  font-weight: bold;
  text-transform: capitalize;
  padding: 0 0.5rem;
  width: 12.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.triangle_square {
  width: 0;
  height: 0;
  border-left: 0.625rem solid #0e1e24;
  border-top: 0.625rem solid transparent;
  border-bottom: 0.625rem solid transparent;
  transition: all 0.3s;
}

.is-playing .triangle_square {
  border: none;
  width: 1.25rem;
  height: 1.25rem;
  background-color: #0e1e24;
}

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
