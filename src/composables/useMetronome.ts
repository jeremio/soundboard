import { onUnmounted, ref, watch } from 'vue'

interface TimeSignature {
  beats: number
  unit: number
}

interface ScheduledBeat {
  osc: OscillatorNode
  gain: GainNode
}

const timeSignatures: TimeSignature[] = [
  { beats: 2, unit: 4 },
  { beats: 3, unit: 4 },
  { beats: 4, unit: 4 },
  { beats: 5, unit: 4 },
  { beats: 6, unit: 8 },
  { beats: 7, unit: 8 },
]

const subdivisionOptions = [
  { value: 1, label: 'Noires' },
  { value: 2, label: 'Croches' },
  { value: 3, label: 'Triolets' },
  { value: 4, label: 'Doubles croches' },
]

export function useMetronome() {
  const bpm = ref<number>(60)
  const isRunning = ref<boolean>(false)
  const showVisualBeat = ref<boolean>(false)
  const showAccentBeat = ref<boolean>(false)
  const errorMessage = ref<string>('')
  const timeSignature = ref<TimeSignature>(timeSignatures[2])
  const subdivision = ref<number>(1)
  const volume = ref<number>(0.5)
  const currentBeat = ref<number>(0)

  let audioContext: AudioContext | null = null
  let timerId: number | null = null
  let nextNoteTime: number = 0
  let beatIndex: number = 0
  let subdivisionIndex: number = 0
  let scheduled: ScheduledBeat[] = []

  const scheduleAheadTime = 0.1
  const lookahead = 25.0

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
    bpm.value = value
  }

  function isActivePreset(presetBpm: number): boolean {
    return Math.abs(bpm.value - presetBpm) <= 2
  }

  watch(timeSignature, () => {
    if (isRunning.value) {
      beatIndex = 0
      subdivisionIndex = 0
      currentBeat.value = 0
    }
  })

  watch(subdivision, () => {
    if (isRunning.value) {
      subdivisionIndex = 0
    }
  })

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

  async function start() {
    if (isRunning.value)
      return

    const bpmValue = Number(bpm.value)
    if (!Number.isFinite(bpmValue) || bpmValue < 2 || bpmValue > 300) {
      errorMessage.value = 'Veuillez entrer une valeur de BPM valide entre 2 et 300.'
      return
    }
    errorMessage.value = ''

    try {
      if (!audioContext) {
        audioContext = await createAudioContext()
      }

      nextNoteTime = audioContext.currentTime + 0.05
      beatIndex = 0
      subdivisionIndex = 0
      currentBeat.value = 0
      isRunning.value = true
      scheduler()
    }
    catch (error) {
      errorMessage.value = 'Erreur lors du démarrage du métronome. Veuillez réessayer.'
      console.error(error)
    }
  }

  function scheduleBeat(beatTime: number, kind: 'accent' | 'beat' | 'sub') {
    if (!audioContext)
      return

    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()

    osc.connect(gain)
    gain.connect(audioContext.destination)

    let frequency: number
    let amplitude: number
    let waveform: OscillatorType

    switch (kind) {
      case 'accent':
        frequency = 880
        amplitude = volume.value
        waveform = 'triangle'
        break
      case 'beat':
        frequency = 440
        amplitude = volume.value * 0.85
        waveform = 'sine'
        break
      case 'sub':
        frequency = 660
        amplitude = volume.value * 0.4
        waveform = 'sine'
        break
    }

    osc.type = waveform
    osc.frequency.setValueAtTime(frequency, beatTime)
    gain.gain.setValueAtTime(amplitude, beatTime)
    gain.gain.exponentialRampToValueAtTime(0.00001, beatTime + 0.05)

    osc.start(beatTime)
    osc.stop(beatTime + 0.06)

    const ref: ScheduledBeat = { osc, gain }
    scheduled.push(ref)

    osc.onended = () => {
      try {
        gain.disconnect()
        osc.disconnect()
      }
      catch {}
      scheduled = scheduled.filter(s => s !== ref)
    }

    const delayMs = Math.max(0, (beatTime - audioContext.currentTime) * 1000)
    setTimeout(() => {
      if (!isRunning.value)
        return
      if (kind !== 'sub') {
        showVisualBeat.value = !showVisualBeat.value
      }
      if (kind === 'accent') {
        showAccentBeat.value = true
        setTimeout(() => {
          showAccentBeat.value = false
        }, Math.min(200, (60_000 / bpm.value) * 0.4))
      }
    }, delayMs)
  }

  function scheduler() {
    if (!audioContext || !isRunning.value)
      return

    const sub = Math.max(1, subdivision.value)
    const secondsPerBeat = 60.0 / bpm.value
    const secondsPerTick = secondsPerBeat / sub

    while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
      let kind: 'accent' | 'beat' | 'sub'

      if (subdivisionIndex === 0) {
        if (beatIndex === 0) {
          kind = 'accent'
        }
        else {
          kind = 'beat'
        }
        currentBeat.value = beatIndex
      }
      else {
        kind = 'sub'
      }

      scheduleBeat(nextNoteTime, kind)

      nextNoteTime += secondsPerTick
      subdivisionIndex = (subdivisionIndex + 1) % sub
      if (subdivisionIndex === 0) {
        beatIndex = (beatIndex + 1) % timeSignature.value.beats
      }
    }

    timerId = window.setTimeout(scheduler, lookahead)
  }

  function stop() {
    if (!isRunning.value)
      return
    isRunning.value = false
    if (timerId !== null) {
      clearTimeout(timerId)
      timerId = null
    }
    if (audioContext) {
      const now = audioContext.currentTime
      for (const s of scheduled) {
        try {
          s.gain.gain.cancelScheduledValues(now)
          s.gain.gain.setValueAtTime(0, now)
          s.osc.stop(now)
        }
        catch {}
      }
    }
    scheduled = []
    showVisualBeat.value = false
    showAccentBeat.value = false
    currentBeat.value = 0
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
    if (!Number.isFinite(newValue)) {
      bpm.value = 60
      return
    }
    if (newValue < 2) {
      bpm.value = 2
      return
    }
    if (newValue > 300) {
      bpm.value = 300
      return
    }
    if (isRunning.value && audioContext) {
      const sub = Math.max(1, subdivision.value)
      const secondsPerTick = 60.0 / newValue / sub
      nextNoteTime = audioContext.currentTime + secondsPerTick
    }
  })

  onUnmounted(() => {
    stop()
    if (audioContext) {
      audioContext.close().catch(() => {})
      audioContext = null
    }
  })

  return {
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
  }
}
