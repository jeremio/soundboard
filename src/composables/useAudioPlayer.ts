import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface UseAudioPlayerOptions {
  soundSrc: Ref<string>
}

export function useAudioPlayer(options?: UseAudioPlayerOptions) {
  const audio = ref<HTMLAudioElement>()
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)

  const progress = computed(() => {
    if (!duration.value)
      return 0
    return (currentTime.value / duration.value) * 100
  })

  function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  function play() {
    if (audio.value) {
      audio.value.play()
    }
  }

  function toggle() {
    if (!audio.value)
      return

    if (isPlaying.value) {
      audio.value.pause()
    }
    else {
      audio.value.play()
    }
  }

  function onPlay() {
    isPlaying.value = true
  }

  function onPause() {
    isPlaying.value = false
  }

  function onEnded() {
    isPlaying.value = false
    currentTime.value = 0
  }

  function onTimeUpdate() {
    if (!audio.value)
      return
    currentTime.value = audio.value.currentTime
  }

  function onLoadedMetadata() {
    if (!audio.value)
      return
    duration.value = audio.value.duration
  }
  
  onMounted(() => {
    audio.value = new Audio()
    if (options?.soundSrc.value) {
      audio.value.src = options.soundSrc.value
    }
    audio.value.addEventListener('play', onPlay)
    audio.value.addEventListener('pause', onPause)
    audio.value.addEventListener('ended', onEnded)
    audio.value.addEventListener('timeupdate', onTimeUpdate)
    audio.value.addEventListener('loadedmetadata', onLoadedMetadata)
  })

  onUnmounted(() => {
    if (audio.value) {
      audio.value.removeEventListener('play', onPlay)
      audio.value.removeEventListener('pause', onPause)
      audio.value.removeEventListener('ended', onEnded)
      audio.value.removeEventListener('timeupdate', onTimeUpdate)
      audio.value.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.value.pause()
      audio.value.src = ''
    }
  })

  if (options?.soundSrc) {
    watch(options.soundSrc, (newSound) => {
      if (audio.value && newSound) {
        audio.value.src = newSound
        audio.value.load()
      }
    })
  }

  return {
    // no audioRef needed anymore
    isPlaying,
    currentTime,
    duration,
    progress,
    formatTime,
    toggle,
    play,
    // no event handlers needed anymore
  }
}
