<template>
  <div class="metronome-page">
    <h1>Métronome</h1>
    <div class="controls">
      <label for="bpm">BPM:</label>
      <input id="bpm" v-model.number="bpm" type="number" min="1" max="300" :disabled="isRunning">
      <button @click="toggleMetronome">
        {{ isRunning ? 'Arrêter' : 'Démarrer' }}
      </button>
    </div>
    <div class="option-controls">
      <label class="checkbox-container">
        <input type="checkbox" v-model="minuteRepeat" :disabled="isRunning">
        <span class="checkbox-text">Répétition par minute</span>
      </label>
    </div>
    <div v-if="visualBeat" class="visual-beat" :class="{ 'beat-active': showVisualBeat, 'beat-first': showFirstBeat }" />
    <p v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
const bpm = ref<number>(120)
const isRunning = ref<boolean>(false)
const visualBeat = ref<boolean>(true) // Option pour activer/désactiver l'indicateur visuel
const showVisualBeat = ref<boolean>(false) // Pour l'animation de l'indicateur visuel
const showFirstBeat = ref<boolean>(false) // Pour l'animation du premier temps
const minuteRepeat = ref<boolean>(false) // Option pour la répétition par minute
const errorMessage = ref<string>('')
let beatCount = 0 // Compteur de battements pour le mode répétition par minute

let audioContext: AudioContext | null = null
let timerId: number | null = null
let nextBeatTime: number = 0
const scheduleAheadTime: number = 0.1 // (secondes) Planifier les battements un peu en avance
const lookahead: number = 25.0 // (ms) Fréquence à laquelle le scheduler s'exécute

function scheduleBeat(beatTime: number, isFirstBeat: boolean = false) {
  if (!audioContext)
    return

  const osc = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  osc.connect(gainNode)
  gainNode.connect(audioContext.destination)

  // Son plus aigu pour le premier battement si option activée
  if (isFirstBeat) {
    osc.type = 'triangle' // Type d'onde différent pour le premier temps
    osc.frequency.setValueAtTime(880, beatTime) // Fréquence plus élevée (La5, une octave au-dessus)
    gainNode.gain.setValueAtTime(0.6, beatTime) // Volume légèrement plus fort
  } else {
    osc.type = 'sine' // Type d'onde pour un son simple
    osc.frequency.setValueAtTime(440, beatTime) // Fréquence du son (La4)
    gainNode.gain.setValueAtTime(0.5, beatTime) // Volume
  }

  gainNode.gain.exponentialRampToValueAtTime(0.00001, beatTime + 0.05) // Fondu rapide

  osc.start(beatTime)
  osc.stop(beatTime + 0.05)

  // Indication visuelle
  if (visualBeat.value) {
    setTimeout(() => {
      if (isFirstBeat) {
        showFirstBeat.value = true
        showVisualBeat.value = false
      } else {
        showVisualBeat.value = true
        showFirstBeat.value = false
      }

      setTimeout(() => {
        showVisualBeat.value = false
        showFirstBeat.value = false
      }, 50) // Durée de l'indication visuelle
    }, (beatTime - audioContext.currentTime) * 1000)
  }
}

function scheduler() {
  if (!audioContext)
    return

  while (nextBeatTime < audioContext.currentTime + scheduleAheadTime) {
    let isFirstBeat = false

    if (minuteRepeat.value) {
      // Pour le mode répétition par minute, on compte les battements
      // et on considère le premier battement de chaque minute comme spécial
      const currentBeatTime = nextBeatTime
      const beatTimeInMinute = currentBeatTime % 60 // Position dans la minute courante

      // Si on est proche du début d'une minute (moins de 0.1 seconde) ou c'est le premier battement
      if (beatTimeInMinute < 0.1 || beatCount === 0) {
        isFirstBeat = true
        beatCount = 1
      } else {
        beatCount++
      }
    }

    scheduleBeat(nextBeatTime, isFirstBeat)
    const secondsPerBeat = 60.0 / bpm.value
    nextBeatTime += secondsPerBeat
  }

  if (isRunning.value) {
    timerId = window.setTimeout(scheduler, lookahead)
  }
}

function start() {
  if (isRunning.value)
    return
  if (bpm.value < 1 || bpm.value > 300) {
    errorMessage.value = 'Veuillez entrer une valeur de BPM entre 1 et 300.'
    return
  }
  errorMessage.value = ''

  if (!audioContext) {
    audioContext = new AudioContext()
  }
  // Reprendre le contexte audio s'il était suspendu (interaction utilisateur requise)
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }

  beatCount = 0 // Réinitialiser le compteur de battements
  nextBeatTime = audioContext.currentTime + 0.1 // Démarrer le premier battement légèrement dans le futur
  isRunning.value = true
  scheduler()
}

function stop() {
  if (!isRunning.value)
    return
  isRunning.value = false
  if (timerId !== null) {
    clearTimeout(timerId)
    timerId = null
  }
  // Il n'est pas nécessaire d'arrêter l'audioContext lui-même,
  // mais on s'assure que plus aucun son n'est planifié.
}

function toggleMetronome() {
  if (isRunning.value) {
    stop()
  }
  else {
    start()
  }
}

// S'assurer que le tempo est dans les limites
watch(bpm, (newValue) => {
  if (newValue < 1) {
    bpm.value = 1
  }
  else if (newValue > 300) {
    bpm.value = 300
  }
  if (isRunning.value) {
    // Si le métronome tourne, on peut ajuster le tempo en direct
    // Pour une transition plus douce, on pourrait redémarrer avec le nouveau tempo
    // ou ajuster le nextBeatTime plus finement.
    // Pour l'instant, on recalcule simplement nextBeatTime pour le prochain cycle du scheduler.
    if (audioContext) {
      const secondsPerBeat = 60.0 / bpm.value
      // Si on change le bpm pendant que ça tourne, on veut que le prochain battement
      // soit relatif au temps actuel, pas basé sur l'ancien `nextBeatTime` qui pourrait être loin.
      nextBeatTime = audioContext.currentTime + secondsPerBeat
    }
  }
})
onUnmounted(() => {
  stop()
  if (audioContext) {
    audioContext.close() // Fermer le contexte audio pour libérer les ressources
    audioContext = null
  }
})
</script>

<style scoped>
.metronome-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: sans-serif;
  padding: 20px;
  background-color: #f0f0f0;
  min-height: 200px;
  border-radius: 8px;
}

.controls {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.controls label {
  margin-right: 10px;
  font-size: 1.1em;
}

.controls input[type="number"] {
  width: 70px;
  padding: 8px;
  margin-right: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1.1em;
  text-align: center;
}

.controls input[type="number"]:disabled {
  background-color: #e9e9e9;
  color: #999;
}

.controls button {
  padding: 10px 20px;
  font-size: 1.1em;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.controls button:hover {
  background-color: #0056b3;
}

.controls button:active {
  background-color: #004085;
}

.option-controls {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-container input[type="checkbox"] {
  margin-right: 8px;
  cursor: pointer;
}

.checkbox-text {
  font-size: 1em;
}

.visual-beat {
  width: 50px;
  height: 50px;
  background-color: #ddd;
  border-radius: 50%;
  transition: background-color 0.05s ease-in-out;
  margin-top: 10px;
}

.visual-beat.beat-active {
  background-color: #007bff;
}

.visual-beat.beat-first {
  background-color: #ff5722; /* Couleur différente pour le premier temps */
}

.error-message {
  color: red;
  margin-top: 10px;
}
</style>
