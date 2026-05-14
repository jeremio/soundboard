<template>
  <div class="page">
    <h1>Métronome</h1>

    <div class="controls">
      <label for="bpm">BPM:</label>
      <input
        id="bpm"
        v-model.number="bpm"
        type="number"
        min="2"
        step="1"
        max="300"
      >
      <button class="toggle-button" :class="{ running: isRunning }" @click="toggleMetronome">
        {{ isRunning ? 'Arrêter' : 'Démarrer' }}
      </button>
    </div>

    <div class="slider-container">
      <input
        v-model.number="bpm"
        type="range"
        min="2"
        step="1"
        max="300"
        class="tempo-slider"
        aria-label="Tempo en BPM"
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
        Préréglages :
      </div>
      <div class="preset-buttons">
        <button
          v-for="preset in tempoPresets"
          :key="preset.name"
          class="preset-button"
          :class="{ active: isActivePreset(preset.bpm) }"
          @click="setTempo(preset.bpm)"
        >
          {{ preset.name }}
        </button>
      </div>
    </div>

    <div v-memo="[timeSignature, subdivision, volume]" class="settings-row">
      <div class="setting">
        <label for="time-signature">Mesure :</label>
        <select id="time-signature" v-model="timeSignature">
          <option
            v-for="sig in timeSignatures"
            :key="`${sig.beats}/${sig.unit}`"
            :value="sig"
          >
            {{ sig.beats }}/{{ sig.unit }}
          </option>
        </select>
      </div>

      <div class="setting">
        <label for="subdivision">Subdivision :</label>
        <select id="subdivision" v-model.number="subdivision">
          <option
            v-for="opt in subdivisionOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="setting volume-setting">
        <label for="volume">Volume : {{ Math.round(volume * 100) }}%</label>
        <input
          id="volume"
          v-model.number="volume"
          type="range"
          min="0"
          max="1"
          step="0.05"
          class="volume-slider"
        >
      </div>
    </div>

    <div class="metronome-visual">
      <div class="metronome-display">
        <div class="tempo-display">
          {{ bpm }} BPM
        </div>

        <div class="beat-indicator">
          <span
            v-for="i in timeSignature.beats"
            :key="i"
            class="beat-dot"
            :class="{
              active: isRunning && currentBeat === i - 1,
              accent: i === 1,
            }"
          />
        </div>

        <div class="pendulum-track">
          <div
            class="pendulum-marker"
            :class="{
              'position-left': showVisualBeat,
              'position-right': !showVisualBeat,
              'accent-beat': showAccentBeat,
            }"
            :style="{ transitionDuration: `${pendulumTransitionMs}ms` }"
          />
          <div class="tick tick-left" />
          <div class="tick tick-center" />
          <div class="tick tick-right" />
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
  showAccentBeat,
  errorMessage,
  tempoPresets,
  timeSignature,
  timeSignatures,
  subdivision,
  subdivisionOptions,
  volume,
  currentBeat,
  setTempo,
  isActivePreset,
  toggleMetronome,
} = useMetronome()

const pendulumTransitionMs = computed(() => {
  const beatMs = 60_000 / bpm.value
  return Math.min(120, Math.max(40, beatMs * 0.45))
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

.controls {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
}

.controls label {
  font-size: 1.1em;
}

.controls input[type="number"] {
  width: 70px;
  padding: 8px;
  border: 1px solid var(--gray);
  border-radius: 4px;
  font-size: 1.1em;
  text-align: center;
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
  background-color: var(--primary-color);
}

.toggle-button.running {
  background-color: var(--red);
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
  color: var(--dark-gray);
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
  background-color: var(--accent-color);
  border-color: var(--primary-color);
  color: var(--white);
}

.settings-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  margin-bottom: 20px;
}

.setting {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting label {
  font-size: 0.95em;
  color: var(--dark-gray);
}

.setting select {
  padding: 6px 8px;
  border: 1px solid var(--gray);
  border-radius: 4px;
  background-color: var(--white);
  cursor: pointer;
}

.volume-setting {
  flex-direction: column;
  align-items: flex-start;
}

.volume-slider {
  width: 140px;
  appearance: none;
  height: 6px;
  background: var(--gray);
  border-radius: 3px;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--blue);
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--blue);
  cursor: pointer;
  border: none;
}

.metronome-visual {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.metronome-display {
  width: 300px;
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
  color: var(--text-color);
  text-align: center;
  margin-bottom: 12px;
  padding: 8px 15px;
  background-color: var(--white);
  border-radius: 8px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.beat-indicator {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  min-height: 16px;
}

.beat-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #b8bdc7;
  transition: background-color 0.1s, transform 0.1s;
}

.beat-dot.active {
  background-color: var(--blue);
  transform: scale(1.4);
}

.beat-dot.active.accent {
  background-color: var(--red);
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
  transition: left 0.12s ease-in-out, background-color 0.1s ease, box-shadow 0.1s ease;
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
  box-shadow: 0 0 12px var(--red);
}

.tick {
  position: absolute;
  top: 50%;
  width: 3px;
  height: 20px;
  background-color: var(--dark-gray);
  border-radius: 1.5px;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.tick-left {
  left: 20%;
}

.tick-center {
  left: 50%;
  height: 30px;
}

.tick-right {
  left: 80%;
}

.error-message {
  color: var(--red);
  margin-top: 10px;
}
</style>
