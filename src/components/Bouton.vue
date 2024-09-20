<template>
  <div class="bouton">
    <div class="action copy-cursor" @click="copyURL(sound.src)">
      <img :src="copySVG" alt="copy url">
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
import copySVG from '~/assets/copy.svg'
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
