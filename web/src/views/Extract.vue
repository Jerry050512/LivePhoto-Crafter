<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-surface-900 mb-2">提取实况照片</h1>
      <p class="text-surface-600">从实况照片中提取视频和静态封面图</p>
    </div>

    <div class="space-y-6">
      <!-- File Upload -->
      <div v-if="!hasFiles" class="card p-8">
        <FileUpload
          accept="image/*"
          @select="handleFileSelect"
        />
      </div>

      <template v-else>
        <!-- File List -->
        <div class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-surface-900">已选择的文件</h2>
            <button class="btn-ghost text-sm" @click="clearAll">
              清除全部
            </button>
          </div>
          <FileList :files="files" />
        </div>

        <!-- Preview -->
        <div v-if="selectedFile" class="card p-6">
          <h2 class="text-lg font-semibold text-surface-900 mb-4">预览</h2>
          <div class="aspect-video bg-surface-100 rounded-xl overflow-hidden">
            <img
              :src="selectedFile.url"
              class="w-full h-full object-contain"
              alt="实况照片预览"
            >
          </div>
        </div>

        <!-- Processing Status -->
        <ProcessingStatus 
          v-if="processingState.status !== 'idle'"
          v-bind="processingState"
        />

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4">
          <button
            class="btn-primary flex-1 py-4 text-lg"
            :disabled="isProcessing"
            @click="handleExtract"
          >
            <svg v-if="isProcessing" class="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {{ isProcessing ? '提取中...' : '提取视频和封面' }}
          </button>
        </div>
      </template>
    </div>

    <!-- Result Modal -->
    <div v-if="extractResult" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div class="card max-w-lg w-full p-6 animate-slide-up">
        <div class="text-center mb-6">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-surface-900 mb-2">提取成功！</h3>
          <p class="text-surface-600">检测到格式: {{ extractResult.format }}</p>
        </div>

        <div class="space-y-4">
          <!-- Cover -->
          <div class="flex items-center gap-4 p-4 rounded-xl bg-surface-50">
            <div class="w-16 h-16 rounded-lg bg-white flex items-center justify-center overflow-hidden">
              <img :src="extractResult.coverUrl" class="w-full h-full object-cover" alt="封面">
            </div>
            <div class="flex-1">
              <p class="font-medium text-surface-900">封面图</p>
              <p class="text-sm text-surface-500">{{ formatFileSize(extractResult.coverSize) }}</p>
            </div>
            <a
              :href="extractResult.coverUrl"
              download="cover.jpg"
              class="btn-secondary text-sm py-2 px-4"
            >
              下载
            </a>
          </div>

          <!-- Video -->
          <div class="flex items-center gap-4 p-4 rounded-xl bg-surface-50">
            <div class="w-16 h-16 rounded-lg bg-white flex items-center justify-center">
              <svg class="w-8 h-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-medium text-surface-900">视频</p>
              <p class="text-sm text-surface-500">{{ formatFileSize(extractResult.videoSize) }}</p>
            </div>
            <a
              :href="extractResult.videoUrl"
              download="video.mp4"
              class="btn-secondary text-sm py-2 px-4"
            >
              下载
            </a>
          </div>
        </div>

        <button class="btn-secondary w-full mt-6" @click="resetResult">
          继续提取其他文件
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useFilesStore } from '@/stores/files'
import { useAppStore } from '@/stores/app'
import { useMotionPhoto } from '@/composables/useMotionPhoto'
import FileUpload from '@/components/common/FileUpload.vue'
import FileList from '@/components/common/FileList.vue'
import ProcessingStatus from '@/components/common/ProcessingStatus.vue'

const filesStore = useFilesStore()
const appStore = useAppStore()
const { extractFromMotionPhoto } = useMotionPhoto()

const { files, hasFiles, selectedFile } = storeToRefs(filesStore)
const { processingState, isProcessing } = storeToRefs(appStore)
const { addFile, clearFiles, formatFileSize } = filesStore
const { setProcessingState, resetProcessingState } = appStore

interface ExtractResult {
  coverUrl: string
  videoUrl: string
  coverSize: number
  videoSize: number
  format: string
}

const extractResult = ref<ExtractResult>()

function handleFileSelect(selectedFiles: File[]) {
  const file = selectedFiles[0]
  if (file) {
    addFile(file)
  }
}

function clearAll() {
  resetResult()
  clearFiles()
}

async function handleExtract() {
  if (!selectedFile.value) return

  setProcessingState({
    status: 'processing',
    progress: 50,
    message: '正在提取视频和封面...',
  })

  try {
    const result = await extractFromMotionPhoto(selectedFile.value.file)

    extractResult.value = {
      coverUrl: URL.createObjectURL(result.coverBlob),
      videoUrl: URL.createObjectURL(result.videoBlob),
      coverSize: result.coverSize,
      videoSize: result.videoSize,
      format: result.format,
    }

    setProcessingState({
      status: 'success',
      progress: 100,
      message: '提取完成！',
    })
  } catch (error) {
    console.error('Extraction failed:', error)
    setProcessingState({
      status: 'error',
      progress: 0,
      message: error instanceof Error ? error.message : '提取失败，请确保文件是有效的实况照片',
    })
  }
}

function resetResult() {
  if (extractResult.value) {
    URL.revokeObjectURL(extractResult.value.coverUrl)
    URL.revokeObjectURL(extractResult.value.videoUrl)
  }
  extractResult.value = undefined
  resetProcessingState()
}
</script>
