<template>
  <div
    class="relative"
    @dragenter.prevent="handleDragEnter"
    @dragleave.prevent="handleDragLeave"
    @dragover.prevent
    @drop.prevent="handleDrop"
  >
    <div
      class="border-2 border-dashed rounded-2xl p-8 transition-all duration-300 text-center"
      :class="[
        isDragging 
          ? 'border-primary-500 bg-primary-50 scale-[1.02]' 
          : 'border-surface-300 hover:border-surface-400 bg-white',
        { 'opacity-50 cursor-not-allowed': disabled }
      ]"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="multiple"
        class="hidden"
        @change="handleFileSelect"
      >
      
      <div class="space-y-4">
        <div 
          class="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-colors"
          :class="isDragging ? 'bg-primary-100' : 'bg-surface-100'"
        >
          <svg 
            class="w-8 h-8 transition-colors"
            :class="isDragging ? 'text-primary-600' : 'text-surface-400'"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        
        <div>
          <p class="text-lg font-medium text-surface-800">
            {{ isDragging ? '松开以上传文件' : '拖拽文件到此处' }}
          </p>
          <p class="text-sm text-surface-500 mt-1">
            或 <button type="button" class="text-primary-600 hover:text-primary-700 font-medium" @click="openFilePicker">点击选择文件</button>
          </p>
        </div>
        
        <p class="text-xs text-surface-400">
          支持 {{ acceptText }} 格式
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  accept?: string
  multiple?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  accept: '*',
  multiple: false,
  disabled: false,
})

const emit = defineEmits<{
  select: [files: File[]]
}>()

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const dragCounter = ref(0)

const acceptText = computed(() => {
  if (props.accept === '*') return '所有'
  return props.accept.split(',').map(t => t.trim().replace('/*', '').toUpperCase()).join('、')
})

function openFilePicker() {
  if (props.disabled) return
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files?.length) {
    emit('select', Array.from(input.files))
    input.value = ''
  }
}

function handleDragEnter() {
  if (props.disabled) return
  dragCounter.value++
  isDragging.value = true
}

function handleDragLeave() {
  if (props.disabled) return
  dragCounter.value--
  if (dragCounter.value === 0) {
    isDragging.value = false
  }
}

function handleDrop(event: DragEvent) {
  if (props.disabled) return
  dragCounter.value = 0
  isDragging.value = false
  
  const files = event.dataTransfer?.files
  if (files?.length) {
    emit('select', Array.from(files))
  }
}
</script>
