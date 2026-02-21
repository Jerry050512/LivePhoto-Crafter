<template>
  <div class="card p-6">
    <div class="flex items-center gap-4">
      <!-- Status Icon -->
      <div 
        class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        :class="iconClass"
      >
        <svg v-if="status === 'loading'" class="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else-if="status === 'processing'" class="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <svg v-else-if="status === 'success'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else-if="status === 'error'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <!-- Text -->
      <div class="flex-1">
        <p class="font-medium text-surface-800">{{ title }}</p>
        <p v-if="message" class="text-sm text-surface-500">{{ message }}</p>
      </div>
    </div>
    
    <!-- Progress Bar -->
    <div v-if="showProgress" class="mt-4">
      <div class="h-2 bg-surface-100 rounded-full overflow-hidden">
        <div 
          class="h-full bg-primary-500 rounded-full transition-all duration-300"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
      <p class="text-right text-xs text-surface-400 mt-1">{{ progress }}%</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProcessingStatus } from '@/stores/app'

interface Props {
  status: ProcessingStatus
  progress?: number
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0,
  message: '',
})

const iconClass = computed(() => {
  switch (props.status) {
    case 'loading':
      return 'bg-primary-100 text-primary-600'
    case 'processing':
      return 'bg-amber-100 text-amber-600'
    case 'success':
      return 'bg-green-100 text-green-600'
    case 'error':
      return 'bg-red-100 text-red-600'
    default:
      return 'bg-surface-100 text-surface-400'
  }
})

const title = computed(() => {
  switch (props.status) {
    case 'loading':
      return '正在加载...'
    case 'processing':
      return '处理中...'
    case 'success':
      return '处理完成'
    case 'error':
      return '处理失败'
    default:
      return '准备就绪'
  }
})

const showProgress = computed(() => 
  props.status === 'loading' || props.status === 'processing'
)
</script>
