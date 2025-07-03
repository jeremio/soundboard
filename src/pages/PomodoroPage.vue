<template>
  <div class="pomodoro-timer" role="application" aria-label="Minuteur Pomodoro">
    <h1 id="timer-title" class="title">
      <span class="icon" aria-hidden="true">⏱️</span>
      Pomodoro Timer
    </h1>

    <div class="timer-modes" role="radiogroup" aria-labelledby="timer-title">
      <button
        v-for="mode in modes"
        :key="mode.name"
        role="radio"
        :aria-checked="currentMode === mode.name"
        :aria-label="mode.ariaLabel"
        :class="{ active: currentMode === mode.name }"
        @click="changeMode(mode)"
      >
        {{ mode.name }}
      </button>
    </div>

    <div
      class="timer-display"
      role="timer"
      aria-live="polite"
      :aria-label="getAriaTimeString()"
    >
      <div class="time">
        {{ getTimeString() }}
      </div>
    </div>

    <div class="controls">
      <button
        :class="{ running: isActive }"
        :aria-label="isActive ? 'Mettre en pause' : 'Démarrer'"
        :disabled="status === 'Temps écoulé'"
        @click="isActive ? pauseTimer() : startTimer()"
      >
        {{ isActive ? 'Pause' : 'Démarrer' }}
      </button>
      <button
        class="reset"
        aria-label="Réinitialiser le minuteur"
        @click="resetTimer"
      >
        Réinitialiser
      </button>
    </div>

    <div class="sound-controls">
      <label class="sound-toggle">
        <input
          v-model="soundEnabled"
          type="checkbox"
          aria-label="Activer ou désactiver le son"
        >
        Son activé
      </label>
    </div>

    <!-- Élément pour les annonces d'accessibilité -->
    <div
      role="status"
      aria-live="polite"
      class="sound-controls"
    >
      {{ currentAnnouncement }}
    </div>
  </div>
</template>

<script setup>
import { useAudioPlayer } from '~/composables/useAudioPlayer'
import { useTimer } from '~/composables/useTimer'

const {
  isActive,
  currentMode,
  soundEnabled,
  status,
  endTime,
  modes,
  getTimeString,
  getAriaTimeString,
  startTimer,
  pauseTimer,
  resetTimer,
  changeMode,
} = useTimer()

const soundSrc = computed(() => modes.find(m => m.name === currentMode.value)?.sound ?? '')
const { play } = useAudioPlayer({ soundSrc })

// Gestion des annonces d'accessibilité
const currentAnnouncement = computed(() => {
  if (status.value === 'En cours' || status.value === 'En pause') {
    return `${status.value} - Se termine à ${endTime.value}`
  }
  if (status.value === 'Temps écoulé') {
    return `${status.value} à ${endTime.value}`
  }
  return status.value
})

function handleTimerFinished() {
  if (soundEnabled.value) {
    play()
  }
}

function handleKeyDown(e) {
  if (e.code === 'Space') {
    e.preventDefault()
    isActive.value ? pauseTimer() : startTimer()
  }
  else if (e.code === 'KeyR') {
    e.preventDefault()
    resetTimer()
  }
}

onMounted(() => {
  window.addEventListener('timer-announcement', handleTimerFinished)
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('timer-announcement', handleTimerFinished)
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.pomodoro-timer {
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}

.title {
  font-size: var(--h1-font-size);
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  margin-right: 10px;
}

.timer-modes {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.timer-modes button {
  padding: 8px 16px;
  font-size: var(--p-font-size);
  border-radius: 4px;
  background-color: var(--light-gray);
  color: var(--text-color);
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.timer-modes button.active {
  background-color: var(--primary-color);
  color: var(--white);
}

.timer-display {
  margin-bottom: 20px;
}

.time {
  font-size: 3rem;
  font-weight: bold;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.controls button {
  padding: 10px 20px;
  font-size: var(--p-font-size);
  cursor: pointer;
  border: none;
  border-radius: 4px;
  background-color: var(--primary-color);
  color: var(--white);
  transition: background-color 0.3s;
}

.controls button:hover {
  background-color: #00a39e;
}

.controls button:disabled {
  background-color: var(--gray);
  cursor: not-allowed;
}

.controls button.running {
  background-color: var(--red);
}

.controls button.reset {
  background-color: var(--blue);
}

.controls button.reset:hover {
  background-color: #0056b3;
}

.sound-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
}

.sound-toggle {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-size: var(--small-font-size);
}
</style>
