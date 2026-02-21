import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export type ProcessingStatus = 'idle' | 'loading' | 'processing' | 'success' | 'error'

export interface ProcessingState {
  status: ProcessingStatus
  progress: number
  message: string
  error?: string
}

export const useAppStore = defineStore('app', () => {
  // State
  const ffmpegLoaded = ref(false)
  const processingState = ref<ProcessingState>({
    status: 'idle',
    progress: 0,
    message: '',
  })

  // Getters
  const isProcessing = computed(() => 
    processingState.value.status === 'processing' || processingState.value.status === 'loading'
  )
  
  const canProcess = computed(() => ffmpegLoaded.value && !isProcessing.value)

  // Actions
  function setFfmpegLoaded(loaded: boolean) {
    ffmpegLoaded.value = loaded
  }

  function setProcessingState(state: Partial<ProcessingState>) {
    processingState.value = { ...processingState.value, ...state }
  }

  function resetProcessingState() {
    processingState.value = {
      status: 'idle',
      progress: 0,
      message: '',
    }
  }

  return {
    ffmpegLoaded,
    processingState,
    isProcessing,
    canProcess,
    setFfmpegLoaded,
    setProcessingState,
    resetProcessingState,
  }
})
