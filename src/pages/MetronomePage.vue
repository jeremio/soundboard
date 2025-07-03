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
import { useMetronome } from '~/composables/useMetronome'

const {
  bpm,
  isRunning,
  showVisualBeat,
  showFirstBeat,
  minuteRepeat,
  accentFirstBeat,
  errorMessage,
  timeInProgress,
  tempoPresets,
  setTempo,
  isActivePreset,
  toggleMetronome,
} = useMetronome()
</script>

<style scoped>
.metronome-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: var(--light-gray);
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
  border: 1px solid var(--gray);
  border-radius: 4px;
  font-size: 1.1em;
  text-align: center;
}

.controls input[type="number"]:disabled {
  background-color: var(--gray);
  color: var(--dark-gray);
}

.toggle-button {
  padding: 10px 20px;
  font-size: 1.1em;
  color: var(--white);
  background-color: var(--blue);
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
  background: var(--gray);
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
  background: var(--blue);
  cursor: pointer;
}

.tempo-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--blue);
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
  color: var(--dark-gray);
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
  background-color: var(--light-gray);
  border: 1px solid var(--gray);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-button:hover {
  background-color: var(--gray);
}

.preset-button.active {
  background-color: #d7ebff;
  border-color: var(--blue);
  color: var(--blue);
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
  background: linear-gradient(145deg, var(--light-gray), #e6e6e6);
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
  background-color: var(--light-gray);
  border-radius: 5px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.pendulum-track {
  width: 100%;
  height: 70px;
  background: var(--gray);
  border-radius: 35px;
  position: relative;
  margin-top: 10px;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.pendulum-marker {
  width: 30px;
  height: 30px;
  background: var(--blue);
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
  background-color: var(--red);
  box-shadow: 0 0 10px var(--red);
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
  color: var(--red);
  margin-top: 10px;
}
</style>
