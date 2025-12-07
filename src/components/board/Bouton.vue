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
import ProgressBar from '~/components/board/ProgressBar.vue'
import Toast from '~/components/board/Toast.vue'
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
  background-color: var(--white);
  display: flex;
  align-items: center;
  margin: 1.875rem 1.25rem;
  position: relative;
  border-radius: 0.3125rem;
  border: 0.125rem solid var(--white);
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
  border-right: 0.0625rem solid var(--gray);
}

.label {
  color: var(--secondary-color);
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
  border-left: 0.625rem solid var(--secondary-color);
  border-top: 0.625rem solid transparent;
  border-bottom: 0.625rem solid transparent;
  transition: all 0.3s;
}

.is-playing .triangle_square {
  border: none;
  width: 1.25rem;
  height: 1.25rem;
  background-color: var(--secondary-color);
}
</style>
