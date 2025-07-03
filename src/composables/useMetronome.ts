export function useMetronome() {
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

  return {
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
  }
}
