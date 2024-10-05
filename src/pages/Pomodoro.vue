<template>
  <div class="pomodoro-timer">
    <h1 class="title">
      <span class="icon">⏱️</span>
      Pomodoro Timer
    </h1>

    <div class="timer-modes">
      <button
        v-for="mode in modes"
        :key="mode.name"
        :class="{ active: currentMode === mode.name }"
        @click="changeMode(mode)"
      >
        {{ mode.label }}
      </button>
    </div>

    <div class="timer-display">
      <div class="time">
        {{ formatTime(minutes) }}:{{ formatTime(seconds) }}
      </div>
    </div>

    <div class="controls">
      <button :class="{ running: isActive }" @click="toggleTimer">
        {{ isActive ? 'Pause' : 'Démarrer' }}
      </button>
      <button class="reset" @click="resetTimer">
        Réinitialiser
      </button>
    </div>

    <div class="sound-controls">
      <label class="sound-toggle">
        <input v-model="soundEnabled" type="checkbox">
        Son activé
      </label>
      <!--      <button class="test-sound" @click="testCurrentSound"> -->
      <!--        Tester le son -->
      <!--      </button> -->
    </div>

    <!-- Elements audio pour chaque type de minuteur -->
    <audio v-for="mode in modes" :key="`audio-${mode.name}`" :ref="setAudioRef(mode.name)" preload="auto">
      <source :src="mode.sound" type="audio/mp3">
      Votre navigateur ne supporte pas l'élément audio.
    </audio>
  </div>
</template>

<script setup>
import pomodoroFinishedSound from '/sounds/travail-termine.mp3'
import BreakFinishedSound from '/sounds/warcraft-3-humain-travail.mp3'

const modes = [
  {
    name: 'pomodoro',
    label: 'Pomodoro',
    duration: 25,
    sound: pomodoroFinishedSound,
  },
  {
    name: 'shortBreak',
    label: 'Pause courte',
    duration: 5,
    sound: BreakFinishedSound,
  },
  {
    name: 'longBreak',
    label: 'Pause longue',
    duration: 15,
    sound: BreakFinishedSound,
  },
]

const minutes = ref(25)
const seconds = ref(0)
const isActive = ref(false)
const currentMode = ref('pomodoro')
const soundEnabled = ref(true)
let interval = null

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

function formatTime(time) {
  return time.toString().padStart(2, '0')
}

function playSound() {
  if (soundEnabled.value && audioRefs[currentMode.value]) {
    const audio = audioRefs[currentMode.value]
    audio.currentTime = 0
    audio.play().catch((error) => {
      console.error(`Erreur lors de la lecture du son ${currentMode.value}:`, error)
    })
  }
}

// function testCurrentSound() {
//   playSound()
// }

function changeMode(mode) {
  if (isActive.value) {
    if (!confirm('Le minuteur est en cours. Voulez-vous vraiment changer de mode ?')) {
      return
    }
  }
  currentMode.value = mode.name
  minutes.value = mode.duration
  seconds.value = 0
  isActive.value = false
}

function toggleTimer() {
  isActive.value = !isActive.value
}

function resetTimer() {
  isActive.value = false
  const currentModeData = modes.find(mode => mode.name === currentMode.value)
  minutes.value = currentModeData.duration
  seconds.value = 0
}

watch(isActive, (newValue) => {
  if (newValue) {
    interval = setInterval(() => {
      if (seconds.value === 0) {
        if (minutes.value === 0) {
          isActive.value = false
          playSound()
          alert('Temps écoulé !')
          resetTimer()
          return
        }
        minutes.value--
        seconds.value = 59
      }
      else {
        seconds.value--
      }
    }, 1000)
  }
  else {
    clearInterval(interval)
  }
})

onUnmounted(() => {
  clearInterval(interval)
})
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

.test-sound {
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  background-color: #757575;
  color: white;
  transition: background-color 0.3s;
}

.test-sound:hover {
  background-color: #616161;
}
</style>
