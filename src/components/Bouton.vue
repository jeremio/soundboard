<template>
  <div class="bouton">
    <div class="action copy-cursor" @click="copyURL(sound.src)">
      <svg
        xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard"
        viewBox="0 0 16 16"
      >
        <path
          d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"
        />
        <path
          d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"
        />
      </svg>
    </div>
    <p class="action label">
      {{ sound.label }}
    </p>
    <div
      class="action"
      @click="toggle(sound.id.toString())"
    >
      <div class="triangle_square" :class="{ 'is-playing': isPlaying }" />
    </div>
    <audio
      :id="sound.id.toString()"
      controls
      :class="{ 'is-playing': isPlaying }"
      @play="isPlaying = true"
      @pause="isPlaying = false"
    >
      <source :src="`/sounds/${sound.src}`">
    </audio>
  </div>
</template>

<script setup lang="ts">
import type { MySound } from '~/types/MySound'

defineProps<{
  sound: MySound
}>()

const isPlaying = ref(false)

function play(id: string) {
  const audioElement = document.getElementById(id) as HTMLAudioElement
  audioElement.play()
  isPlaying.value = true
}

function stop(id: string) {
  const audioElement = document.getElementById(id) as HTMLAudioElement
  audioElement.pause()
  audioElement.currentTime = 0
  isPlaying.value = false
}

function toggle(id: string) {
  if (isPlaying.value) {
    stop(id)
  }
  else {
    play(id)
  }
}

async function copyURL(mytext: string) {
  try {
    const url = `/sounds/${mytext}`
    const imageUrl = new URL(url, import.meta.url)
    await navigator.clipboard.writeText(imageUrl.href)
  }
  catch (e) {
    console.log(e)
  }
}
</script>

<style scoped>
.bouton {
  background-color: white;
  display: flex;
  margin: 30px 20px;
  position: relative;
  border-radius: 5px;
  border: 2px solid white;
  height: 60px;
}

.action {
  width: 60px;
  background: white;
  display: grid;
  place-items: center;

  &:has(.triangle_square){
    cursor: pointer;
  }
  &:hover, &:focus {
    border-color: #0e1e24;
    border-width: 2px;

  }
}

.copy-cursor {
  cursor: copy;
  border-right: 1px solid;
}

.label {
  color: #0e1e24;
  font-weight: bold;
  text-transform: capitalize;
  padding: 0 8px;
  width: 200px;
}

.triangle_square {
  width: 0;
  height: 0;
  border-left: 10px solid #0e1e24;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  display: block;
  transition: all 0.5s;

  &.is-playing {
    border-bottom: 10px solid #0e1e24;
    border-top: 10px solid #0e1e24;
    border-right: 10px solid #0e1e24;
    transition: all 0.5s;
  }
}

audio {
  visibility: hidden;
  position: absolute;
  top: 60px;
  left: 0;
  width: 100%;

  &.is-playing {
    visibility: visible;
  }
}
</style>
