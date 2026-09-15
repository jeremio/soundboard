import PomodoroFinishedSound from '/sounds/travail-termine.mp3'
import BreakFinishedSound from '/sounds/warcraft-3-humain-travail.mp3'

type TimerMode = 'Pomodoro' | 'Pause courte' | 'Pause longue'
type TimerStatus = 'En attente' | 'En cours' | 'En pause' | 'Temps écoulé'

interface Mode {
  name: TimerMode
  duration: number
  ariaLabel: string
  sound: string
}

export function useTimer() {
  const modes: Mode[] = [
    {
      name: 'Pomodoro',
      duration: 25,
      ariaLabel: 'Mode Pomodoro, 25 minutes de travail',
      sound: PomodoroFinishedSound,
    },
    {
      name: 'Pause courte',
      duration: 5,
      ariaLabel: 'Mode pause courte, 5 minutes de repos',
      sound: BreakFinishedSound,
    },
    {
      name: 'Pause longue',
      duration: 15,
      ariaLabel: 'Mode pause longue, 15 minutes de repos',
      sound: BreakFinishedSound,
    },
  ]

  const currentMode = ref<TimerMode>('Pomodoro')
  const minutes = ref(modes.find(x => x.name === currentMode.value)!.duration)
  const seconds = ref(0)
  const isActive = ref(false)
  const soundEnabled = ref(true)
  const status = ref<TimerStatus>('En attente')
  const remainingTime = ref(0)
  const endsAt = ref<Date | null>(null)
  const endTime = computed(() => {
    if (!endsAt.value)
      return ''
    return endsAt.value.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  })
  const totalDuration = computed(() => {
    const mode = modes.find(m => m.name === currentMode.value)
    return mode ? mode.duration * 60 * 1000 : 0
  })
  const progress = computed(() => {
    if (totalDuration.value === 0)
      return 0
    // remainingTime vaut 0 avant un cycle comme apres : seul l'anneau termine doit etre plein.
    // Sans ce garde, la page s'ouvre sur un cercle entierement rempli qui se vide au demarrage.
    if (remainingTime.value === 0 && status.value === 'En attente')
      return 0
    return 1 - remainingTime.value / totalDuration.value
  })
  let animationFrameId: number | null = null
  let lastTime = 0

  function formatTime(time: number): string {
    return time.toString().padStart(2, '0')
  }

  function getTimeString(): string {
    return `${formatTime(minutes.value)}:${formatTime(seconds.value)}`
  }

  function getAriaTimeString(): string {
    let timeString = ''
    if (minutes.value > 0)
      timeString += `${minutes.value} minute${minutes.value > 1 ? 's' : ''}`
    if (seconds.value > 0) {
      if (timeString)
        timeString += ' et '
      timeString += `${seconds.value} seconde${seconds.value > 1 ? 's' : ''}`
    }
    return timeString || 'Temps écoulé'
  }

  function updateTimer(currentTime: number) {
    if (!isActive.value)
      return

    if (!lastTime)
      lastTime = currentTime

    const deltaTime = currentTime - lastTime
    remainingTime.value -= deltaTime

    if (remainingTime.value <= 0) {
      remainingTime.value = 0
      minutes.value = 0
      seconds.value = 0
      handleTimerComplete()
      return
    }

    minutes.value = Math.floor(remainingTime.value / 60000)
    seconds.value = Math.floor((remainingTime.value % 60000) / 1000)

    lastTime = currentTime
    animationFrameId = requestAnimationFrame(updateTimer)
  }

  function startTimer() {
    if (!isActive.value) {
      isActive.value = true
      lastTime = 0
      if (remainingTime.value === 0) {
        remainingTime.value = (minutes.value * 60 + seconds.value) * 1000
      }
      endsAt.value = new Date(Date.now() + remainingTime.value)
      status.value = 'En cours'
      animationFrameId = requestAnimationFrame(updateTimer)
    }
  }

  function pauseTimer() {
    isActive.value = false
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
      status.value = 'En pause'
    }
  }

  function resetTimer() {
    isActive.value = false
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    const currentModeData = modes.find(mode => mode.name === currentMode.value)!
    minutes.value = currentModeData.duration
    seconds.value = 0
    remainingTime.value = 0
    endsAt.value = null
    status.value = 'En attente'
  }

  function changeMode(mode: Mode) {
    if (mode.name === currentMode.value && status.value === 'En attente')
      return
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    currentMode.value = mode.name
    minutes.value = mode.duration
    seconds.value = 0
    isActive.value = false
    remainingTime.value = 0
    endsAt.value = null
    status.value = 'En attente'
  }

  function handleTimerComplete() {
    isActive.value = false
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    status.value = 'Temps écoulé'
    announceTimerComplete()
  }

  // Fonctions d'accessibilité
  function announceTimerComplete() {
    const announcement = new CustomEvent('timer-announcement', {
      detail: {
        message: 'finished',
      },
    })
    window.dispatchEvent(announcement)
  }

  onUnmounted(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  })

  return {
    isActive,
    currentMode,
    soundEnabled,
    status,
    remainingTime,
    endTime,
    progress,
    modes,
    getTimeString,
    getAriaTimeString,
    startTimer,
    pauseTimer,
    resetTimer,
    changeMode,
  }
}
