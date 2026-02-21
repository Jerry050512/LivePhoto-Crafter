<template>
  <div class="card overflow-hidden">
    <div class="aspect-video bg-surface-900 relative">
      <video
        v-if="src"
        ref="videoRef"
        :src="src"
        class="w-full h-full object-contain"
        @loadedmetadata="onLoadedMetadata"
        @timeupdate="onTimeUpdate"
        @click="togglePlay"
      ></video>
      <div v-else class="w-full h-full flex items-center justify-center">
        <p class="text-surface-500">暂无视频</p>
      </div>
      
      <!-- Play Overlay -->
      <div 
        v-if="src && !isPlaying" 
        class="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
        @click="togglePlay"
      >
        <div class="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <svg class="w-8 h-8 text-surface-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
    </div>
    
    <!-- Controls -->
    <div v-if="src" class="p-4 space-y-3">
      <!-- Progress -->
      <div class="flex items-center gap-3">
        <span class="text-xs text-surface-500 w-12 text-right">{{ formatTime(currentTime) }}</span>
        <input
          type="range"
          min="0"
          :max="duration"
          step="0.1"
          v-model="currentTime"
          class="flex-1 h-1 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
          @input="seek"
        >
        <span class="text-xs text-surface-500 w-12">{{ formatTime(duration) }}</span>
      </div>
      
      <!-- Buttons -->
      <div class="flex items-center justify-center gap-4">
        <button 
          class="p-2 rounded-lg hover:bg-surface-100 text-surface-600"
          @click="skip(-5)"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
          </svg>
        </button>
        
        <button 
          class="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30"
          @click="togglePlay"
        >
          <svg v-if="isPlaying" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
          <svg v-else class="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
        
        <button 
          class="p-2 rounded-lg hover:bg-surface-100 text-surface-600"
          @click="skip(5)"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  src?: string
}

defineProps<Props>()

const emit = defineEmits<{
  timeUpdate: [time: number]
}>()

const videoRef = ref<HTMLVideoElement>()
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

function togglePlay() {
  if (!videoRef.value) return
  if (isPlaying.value) {
    videoRef.value.pause()
  } else {
    videoRef.value.play()
  }
  isPlaying.value = !isPlaying.value
}

function skip(seconds: number) {
  if (!videoRef.value) return
  videoRef.value.currentTime = Math.max(0, Math.min(duration.value, currentTime.value + seconds))
}

function seek() {
  if (!videoRef.value) return
  videoRef.value.currentTime = currentTime.value
}

function onLoadedMetadata() {
  if (!videoRef.value) return
  duration.value = videoRef.value.duration
}

function onTimeUpdate() {
  if (!videoRef.value) return
  currentTime.value = videoRef.value.currentTime
  emit('timeUpdate', currentTime.value)
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

watch(() => videoRef.value?.src, () => {
  isPlaying.value = false
  currentTime.value = 0
  duration.value = 0
})
</script>
