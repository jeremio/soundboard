import PomodoroFinishedSound from '/sounds/travail-termine.mp3'
import BreakFinishedSound from '/sounds/warcraft-3-humain-travail.mp3'

export function useTimer() {
  const modes = [
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

  const currentMode = ref('Pomodoro')
  const minutes = ref(modes.find(x => x.name === currentMode.value).duration)
  const seconds = ref(0)
  const isActive = ref(false)
  const soundEnabled = ref(true)
  let animationFrameId = null
  let lastTime = 0

  function formatTime(time) {
    return time.toString().padStart(2, '0')
  }

  function getTimeString() {
    return `${formatTime(minutes.value)}:${formatTime(seconds.value)}`
  }

  function getAriaTimeString() {
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

  function updateTimer(currentTime) {
    if (!isActive.value)
      return

    if (!lastTime)
      lastTime = currentTime

    const deltaTime = currentTime - lastTime

    if (deltaTime >= 1000) {
      if (seconds.value === 0) {
        if (minutes.value === 0) {
          handleTimerComplete()
          return
        }
        minutes.value--
        seconds.value = 59
      }
      else {
        seconds.value--
      }

      lastTime = currentTime

      // Annonce vocale toutes les minutes
      // if (seconds.value === 0) {
      //   announceTime()
      // }
    }

    animationFrameId = requestAnimationFrame(updateTimer)
  }

  function startTimer() {
    if (!isActive.value) {
      isActive.value = true
      lastTime = 0
      animationFrameId = requestAnimationFrame(updateTimer)
      announceTimerStart()
    }
  }

  function pauseTimer() {
    isActive.value = false
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      announceTimerPause()
    }
  }

  function resetTimer() {
    isActive.value = false
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    const currentModeData = modes.find(mode => mode.name === currentMode.value)
    minutes.value = currentModeData.duration
    seconds.value = 0
    announceTimerReset()
  }

  function changeMode(mode) {
    currentMode.value = mode.name
    minutes.value = mode.duration
    seconds.value = 0
    isActive.value = false
    announceMode(mode)
  }

  function handleTimerComplete() {
    isActive.value = false
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    announceTimerComplete()
  }

  // Fonctions d'accessibilité
  function announceTime() {
    const announcement = new CustomEvent('timer-announcement', {
      detail: {
        message: `Il reste ${getAriaTimeString()}`,
      },
    })
    window.dispatchEvent(announcement)
  }

  function announceTimerStart() {
    const announcement = new CustomEvent('timer-announcement', {
      detail: {
        message: `Minuteur démarré. ${getAriaTimeString()} restant`,
      },
    })
    window.dispatchEvent(announcement)
  }

  function announceTimerPause() {
    const announcement = new CustomEvent('timer-announcement', {
      detail: {
        message: `Minuteur en pause. ${getAriaTimeString()} restant`,
      },
    })
    window.dispatchEvent(announcement)
  }

  function announceTimerReset() {
    const announcement = new CustomEvent('timer-announcement', {
      detail: {
        message: `Minuteur réinitialisé à ${getAriaTimeString()}`,
      },
    })
    window.dispatchEvent(announcement)
  }

  function announceMode(mode) {
    const announcement = new CustomEvent('timer-announcement', {
      detail: {
        // message: `Mode changé pour ${mode.ariaLabel}`,
        message: ``,
      },
    })
    window.dispatchEvent(announcement)
  }

  function announceTimerComplete() {
    const announcement = new CustomEvent('timer-announcement', {
      detail: {
        message: 'Temps écoulé !',
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
    modes,
    getTimeString,
    getAriaTimeString,
    startTimer,
    pauseTimer,
    resetTimer,
    changeMode,
  }
}
