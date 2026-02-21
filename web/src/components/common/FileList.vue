<template>
  <div class="space-y-3">
    <div
      v-for="file in files"
      :key="file.id"
      class="group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer"
      :class="[
        selectedFileId === file.id
          ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
          : 'border-surface-200 bg-white hover:border-surface-300'
      ]"
      @click="selectFile(file.id)"
    >
      <!-- Thumbnail -->
      <div class="w-12 h-12 rounded-lg bg-surface-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
        <img
          v-if="file.type.startsWith('image/')"
          :src="file.url"
          class="w-full h-full object-cover"
          alt=""
        >
        <svg v-else class="w-6 h-6 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <!-- Info -->
      <div class="flex-1 min-w-0">
        <p class="font-medium text-surface-800 truncate">{{ file.name }}</p>
        <p class="text-sm text-surface-500">{{ formatFileSize(file.size) }}</p>
      </div>
      
      <!-- Actions -->
      <button
        class="p-2 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
        @click.stop="removeFile(file.id)"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFilesStore, type FileInfo } from '@/stores/files'
import { storeToRefs } from 'pinia'

const filesStore = useFilesStore()
const { selectedFileId } = storeToRefs(filesStore)
const { removeFile, selectFile, formatFileSize } = filesStore

defineProps<{
  files: FileInfo[]
}>()
</script>
