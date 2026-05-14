<template>
  <div class="page" role="application" aria-label="Minuteur Pomodoro">
    <h1 id="timer-title">
      Pomodoro
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

    <div class="timer-display">
      <svg class="progress-ring" viewBox="0 0 220 220" aria-hidden="true">
        <circle
          class="progress-ring-bg"
          cx="110"
          cy="110"
          r="100"
        />
        <circle
          class="progress-ring-fg"
          cx="110"
          cy="110"
          r="100"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
        />
      </svg>
      <div
        class="time"
        role="timer"
        :aria-label="getAriaTimeString()"
      >
        {{ getTimeString() }}
      </div>
    </div>

    <p v-if="endTime && status !== 'En attente'" class="end-time">
      Se termine à {{ endTime }}
    </p>

    <div class="controls">
      <button
        :class="{ running: isActive }"
        :aria-label="isActive ? 'Mettre en pause' : 'Démarrer'"
        :disabled="status === 'Temps écoulé'"
        @click="isActive ? pauseTimer() : startTimer()"
      >
        {{ isActive ? "Pause" : "Démarrer" }}
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

    <p class="shortcuts" aria-hidden="true">
      Raccourcis : <kbd>Espace</kbd> Démarrer/Pause · <kbd>R</kbd> Réinitialiser
    </p>

    <div role="status" aria-live="polite" class="sr-only">
      {{ statusAnnouncement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAudioPlayer } from '~/composables/useAudioPlayer'
import { useTimer } from '~/composables/useTimer'

const {
  isActive,
  currentMode,
  soundEnabled,
  status,
  endTime,
  progress,
  modes,
  getTimeString,
  getAriaTimeString,
  startTimer,
  pauseTimer,
  resetTimer,
  changeMode,
} = useTimer()

const soundSrc = computed(
  () => modes.find(m => m.name === currentMode.value)?.sound ?? '',
)
const { play } = useAudioPlayer({ soundSrc })

const circumference = 2 * Math.PI * 100
const dashOffset = computed(() => circumference * (1 - progress.value))

// Annonce uniquement le changement de status, pas le compte à rebours
const statusAnnouncement = computed(() => {
  if (status.value === 'En cours' && endTime.value)
    return `Démarré, se termine à ${endTime.value}`
  if (status.value === 'En pause')
    return 'En pause'
  if (status.value === 'Temps écoulé')
    return 'Temps écoulé'
  return ''
})

function handleTimerFinished() {
  if (soundEnabled.value) {
    play()
  }
}

function handleKeyDown(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'))
    return

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
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  padding-bottom: 20px;
  background-color: var(--light-gray);
  min-height: 200px;
  border-radius: 8px;
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
  border: 1px solid var(--gray);
  cursor: pointer;
  transition: all 0.3s;
}

.timer-modes button.active {
  background-color: var(--primary-color);
  color: var(--white);
  border-color: var(--primary-color);
}

.timer-display {
  position: relative;
  width: 220px;
  height: 220px;
  margin-bottom: 12px;
  display: grid;
  place-items: center;
}

.progress-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring-bg {
  fill: none;
  stroke: var(--gray);
  stroke-width: 8;
}

.progress-ring-fg {
  fill: none;
  stroke: var(--primary-color);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.2s linear;
}

.time {
  position: relative;
  font-size: 3rem;
  font-weight: bold;
  font-variant-numeric: tabular-nums;
}

.end-time {
  font-size: var(--small-font-size);
  color: var(--dark-gray);
  margin-bottom: 16px;
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
  background-color: var(--accent-color);
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
  background-color: var(--primary-color);
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

.shortcuts {
  margin-top: 16px;
  font-size: var(--small-font-size);
  color: var(--dark-gray);
}

.shortcuts kbd {
  display: inline-block;
  padding: 1px 6px;
  margin: 0 2px;
  font-family: monospace;
  font-size: 0.85em;
  background-color: var(--white);
  border: 1px solid var(--gray);
  border-radius: 3px;
  box-shadow: 0 1px 0 var(--gray);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
