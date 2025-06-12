<template>
  <div class="metronome-page">
    <h1>Métronome</h1>
    <div class="controls">
      <label for="bpm">BPM:</label>
      <input id="bpm" v-model.number="bpm" type="number" min="2" step="2" max="300" :disabled="isRunning">
      <button class="toggle-button" @click="toggleMetronome">
        {{ isRunning ? 'Arrêter' : 'Démarrer' }}
      </button>
    </div>
    <div class="slider-container">
      <input
        v-model.number="bpm"
        type="range"
        min="2"
        step="2"
        max="300"
        class="tempo-slider"
        :disabled="isRunning"
      >
      <div class="slider-labels">
        <span>2</span>
        <span>60</span>
        <span>120</span>
        <span>180</span>
        <span>240</span>
        <span>300</span>
      </div>
    </div>
    <div class="presets-container">
      <div class="preset-label">
        Préréglages:
      </div>
      <div class="preset-buttons">
        <button
          v-for="preset in tempoPresets"
          :key="preset.name"
          :disabled="isRunning"
          class="preset-button"
          :class="{ active: isActivePreset(preset.bpm) }"
          @click="setTempo(preset.bpm)"
        >
          {{ preset.name }}
        </button>
      </div>
    </div>
    <div class="option-controls">
      <label class="checkbox-container">
        <input v-model="minuteRepeat" type="checkbox" :disabled="isRunning">
        <span class="checkbox-text">Répétition</span>
      </label>
      <label v-if="minuteRepeat" class="checkbox-container">
        <input v-model="accentFirstBeat" type="checkbox" :disabled="isRunning">
        <span class="checkbox-text">Accentuer le premier temps de chaque minute</span>
      </label>
    </div>
    <div class="metronome-visual">
      <div class="metronome-display">
        <div class="tempo-display">
          {{ bpm }} BPM
        </div>
        <div v-if="isRunning" class="time-remaining">
          Temps: {{ timeInProgress }}s {{ !minuteRepeat ? '/ 60s' : '' }}
        </div>
        <div class="pendulum-track">
          <div class="pendulum-marker" :class="{ 'position-left': showVisualBeat, 'position-right': !showVisualBeat, 'accent-beat': showFirstBeat }" />
          <div class="tick-marks">
            <div class="tick tick-left" />
            <div class="tick tick-center" />
            <div class="tick tick-right" />
          </div>
        </div>
      </div>
    </div>
    <p v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
const bpm = ref<number>(60)
const isRunning = ref<boolean>(false)
const showVisualBeat = ref<boolean>(false) // Pour l'animation du pendule (gauche/droite)
const showFirstBeat = ref<boolean>(false) // Pour l'animation du premier temps
const minuteRepeat = ref<boolean>(false) // Option pour la répétition
const accentFirstBeat = ref<boolean>(true) // Option pour accentuer le premier temps (activée par défaut)
const errorMessage = ref<string>('')
// Modifions d'abord la déclaration pour plus de précision
const timeInProgress = ref<number>(0)
const lastMinuteTime = ref<number>(0) // Pour suivre le temps de la dernière minute complétée
let startTime = 0 // Temps de démarrage du métronome

let audioContext: AudioContext | null = null
let timerId: number | null = null
let nextBeatTime: number = 0
const scheduleAheadTime: number = 0.1 // (secondes) Planifier les battements un peu en avance
const lookahead: number = 25.0 // (ms) Fréquence à laquelle le scheduler s'exécute

// Définition des préréglages de tempo standards
const tempoPresets = [
  { name: 'Largo', bpm: 50 },
  { name: 'Adagio', bpm: 70 },
  { name: 'Andante', bpm: 90 },
  { name: 'Moderato', bpm: 112 },
  { name: 'Allegro', bpm: 140 },
  { name: 'Vivace', bpm: 170 },
  { name: 'Presto', bpm: 190 },
]

function setTempo(value: number) {
  if (!isRunning.value) {
    bpm.value = value
  }
}

function isActivePreset(presetBpm: number): boolean {
  return Math.abs(bpm.value - presetBpm) <= 2
}

function createAudioContext(): Promise<AudioContext> {
  return new Promise((resolve, reject) => {
    try {
      const context = new AudioContext()
      if (context.state === 'suspended') {
        context.resume()
          .then(() => resolve(context))
          .catch(reject)
      }
      else {
        resolve(context)
      }
    }
    catch (error) {
      reject(new Error('Impossible de créer le contexte audio', { cause: error }))
    }
  })
}

// Amélioration de la fonction start
async function start() {
  if (isRunning.value)
    return

  // Validation du BPM
  const bpmValue = Number(bpm.value)
  if (Number.isNaN(bpmValue) || bpmValue < 2 || bpmValue > 300) {
    errorMessage.value = 'Veuillez entrer une valeur de BPM valide entre 2 et 300.'
    return
  }

  try {
    if (!audioContext) {
      audioContext = await createAudioContext()
    }

    nextBeatTime = audioContext.currentTime + 0.1
    startTime = audioContext.currentTime // Initialiser le temps de démarrage
    timeInProgress.value = 0
    lastMinuteTime.value = 0 // Réinitialiser le temps de la dernière minute
    isRunning.value = true
    scheduler()
  }
  catch (error) {
    errorMessage.value = 'Erreur lors du démarrage du métronome. Veuillez réessayer.'
    console.error(error)
  }
}

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
  }
  else {
    osc.type = 'sine' // Type d'onde pour un son simple
    osc.frequency.setValueAtTime(440, beatTime) // Fréquence du son (La4)
    gainNode.gain.setValueAtTime(0.5, beatTime) // Volume
  }

  gainNode.gain.exponentialRampToValueAtTime(0.00001, beatTime + 0.05) // Fondu rapide

  osc.start(beatTime)
  osc.stop(beatTime + 0.05)

  // Nettoyage des ressources
  setTimeout(() => {
    gainNode.disconnect()
    osc.disconnect()
  }, (beatTime - audioContext.currentTime + 0.1) * 1000)

  setTimeout(() => {
    if (isFirstBeat) {
      showFirstBeat.value = true
    }
    // Alternance du pendule entre gauche et droite
    showVisualBeat.value = !showVisualBeat.value

    // Réinitialisation de l'indicateur de premier temps après un court délai
    if (isFirstBeat) {
      setTimeout(() => {
        showFirstBeat.value = false
      }, 100) // Durée de l'indication du premier temps
    }
  }, (beatTime - audioContext.currentTime) * 1000)
}

// Dans la fonction scheduler, mettons à jour le temps de manière plus précise
function scheduler() {
  if (!audioContext)
    return

  const currentTime = audioContext.currentTime
  const elapsedTime = Math.floor(currentTime - startTime)

  // Mise à jour du temps écoulé de manière plus précise
  if (!minuteRepeat.value) {
    timeInProgress.value = elapsedTime

    // Arrêt après 60 secondes si pas en mode répétition
    if (timeInProgress.value >= 60) {
      stop()
      return
    }
  }
  else {
    // En mode répétition, on continue à suivre le temps pour l'accentuation
    timeInProgress.value = elapsedTime
  }

  while (nextBeatTime < currentTime + scheduleAheadTime) {
    let isFirstBeat = false

    if (minuteRepeat.value && accentFirstBeat.value) {
      // Calculer le temps écoulé à ce battement précis
      const beatTime = Math.floor(nextBeatTime - startTime)

      // Si on a franchi une minute (60s) depuis le dernier accent
      if (Math.floor(beatTime / 60) > Math.floor(lastMinuteTime.value / 60)) {
        isFirstBeat = true
        lastMinuteTime.value = beatTime
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

function stop() {
  if (!isRunning.value)
    return
  isRunning.value = false
  if (timerId !== null) {
    clearTimeout(timerId)
    timerId = null
  }
  timeInProgress.value = 0
  lastMinuteTime.value = 0
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
  if (newValue < 2) {
    bpm.value = 2
  }
  else if (newValue > 300) {
    bpm.value = 300
  }
  if (isRunning.value) {
    if (audioContext) {
      const secondsPerBeat = 60.0 / bpm.value
      nextBeatTime = audioContext.currentTime + secondsPerBeat
    }
  }
})
onUnmounted(() => {
  stop()
  if (audioContext) {
    audioContext.close()
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
  margin-bottom: 15px;
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

.toggle-button {
  padding: 10px 20px;
  font-size: 1.1em;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.toggle-button:hover {
  background-color: #0056b3;
}

.toggle-button:active {
  background-color: #004085;
}

.toggle-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.slider-container {
  width: 90%;
  max-width: 500px;
  margin-bottom: 20px;
}

.tempo-slider {
  width: 100%;
  height: 10px;
  appearance: none;
  background: #ddd;
  outline: none;
  border-radius: 5px;
  margin-bottom: 5px;
  transition: opacity 0.2s;
}

.tempo-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
}

.tempo-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
}

.tempo-slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8em;
  color: #666;
}

.presets-container {
  width: 90%;
  max-width: 600px;
  margin-bottom: 20px;
}

.preset-label {
  font-size: 1em;
  color: #555;
  margin-bottom: 5px;
}

.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.preset-button {
  padding: 8px 14px;
  font-size: 0.9em;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-button:hover {
  background-color: #e0e0e0;
}

.preset-button.active {
  background-color: #d7ebff;
  border-color: #007bff;
  color: #007bff;
}

.preset-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.option-controls {
  margin-bottom: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  justify-content: center;
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

.metronome-visual {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}

.metronome-display {
  width: 260px;
  background: linear-gradient(145deg, #f0f0f0, #e6e6e6);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tempo-display {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 15px;
  padding: 8px 15px;
  background-color: #f8f8f8;
  border-radius: 8px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.time-remaining {
  font-size: 1rem;
  font-weight: 500;
  color: #555;
  text-align: center;
  margin-bottom: 10px;
  padding: 5px 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.pendulum-track {
  width: 100%;
  height: 70px;
  background: #e0e0e0;
  border-radius: 35px;
  position: relative;
  margin-top: 10px;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.pendulum-marker {
  width: 30px;
  height: 30px;
  background: #007bff;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: left 0.12s ease-in-out, background-color 0.1s ease;
  z-index: 2;
}

.pendulum-marker.position-left {
  left: 20%;
}

.pendulum-marker.position-right {
  left: 80%;
}

.pendulum-marker.accent-beat {
  background-color: #ff5722;
  box-shadow: 0 0 10px #ff5722;
}

.tick-marks {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 30px;
  align-items: center;
  z-index: 1;
}

.tick {
  width: 3px;
  height: 20px;
  background-color: #bbb;
  border-radius: 1.5px;
}

.tick-center {
  height: 30px;
}

.error-message {
  color: red;
  margin-top: 10px;
}
</style>
