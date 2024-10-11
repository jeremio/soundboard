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

    <!-- Elements audio pour chaque type de minuteur -->
    <audio v-for="mode in modes" :key="`audio-${mode.name}`" :ref="setAudioRef(mode.name)" preload="auto">
      <source :src="mode.sound" type="audio/mp3">
      Votre navigateur ne supporte pas l'élément audio.
    </audio>
  </div>
</template>

<script setup>
import { useTimer } from './useTimer'

const {
  isActive,
  currentMode,
  soundEnabled,
  modes,
  getTimeString,
  getAriaTimeString,
  startTimer,
  pauseTimer,
  resetTimer,
  changeMode,
} = useTimer()

// Gestion des annonces d'accessibilité
const currentAnnouncement = ref('')
let announcementTimeout

function handleAnnouncement(event) {
  currentAnnouncement.value = event.detail.message
  if (event.detail.message === 'Temps écoulé !') {
    playSound()
  }
  if (announcementTimeout)
    clearTimeout(announcementTimeout)
  announcementTimeout = setTimeout(() => {
    currentAnnouncement.value = ''
  }, 2000)
}

onMounted(() => {
  window.addEventListener('timer-announcement', handleAnnouncement)

  // Gestion des raccourcis clavier
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault()
      isActive.value ? pauseTimer() : startTimer()
    }
    else if (e.code === 'KeyR') {
      e.preventDefault()
      resetTimer()
    }
  })
})

// Référence pour les éléments audio
const audioRefs = {}

// Fonction pour définir les références audio
function setAudioRef(modeName) {
  return (el) => {
    if (el) {
      audioRefs[modeName] = el
    }
  }
}

function playSound() {
  if (!soundEnabled.value || !audioRefs[currentMode.value])
    return

  const audio = audioRefs[currentMode.value]
  audio.currentTime = 0

  return audio.play()
    .catch((error) => {
      console.error(`Erreur lors de la lecture du son ${currentMode.value}:`, error)
    })
}
</script>

<style scoped>
.pomodoro-timer {
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
  font-family: Arial, sans-serif;
}

.title {
  font-size: 24px;
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
  font-size: 14px;
  border-radius: 4px;
  background-color: #f0f0f0;
  color: #333;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.timer-modes button.active {
  background-color: #4CAF50;
  color: white;
}

.timer-display {
  margin-bottom: 20px;
}

.time {
  font-size: 48px;
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
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  background-color: #4CAF50;
  color: white;
  transition: background-color 0.3s;
}

.controls button:hover {
  background-color: #45a049;
}

.controls button.running {
  background-color: #f44336;
}

.controls button.reset {
  background-color: #2196F3;
}

.controls button.reset:hover {
  background-color: #1e87dc;
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
  font-size: 14px;
}
</style>
