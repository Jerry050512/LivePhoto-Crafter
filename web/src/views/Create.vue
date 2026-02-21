<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-surface-900 mb-2">视频转实况照片</h1>
      <p class="text-surface-600">将普通视频转换为兼容主流设备的实况照片格式</p>
    </div>

    <!-- FFmpeg Loading -->
    <ProcessingStatus 
      v-if="!ffmpegLoaded && processingState.status !== 'idle'"
      v-bind="processingState"
      class="mb-6"
    />

    <div v-else class="space-y-6">
      <!-- File Upload -->
      <div v-if="!hasFiles" class="card p-8">
        <FileUpload
          accept="video/*"
          @select="handleVideoSelect"
        />
      </div>

      <template v-else>
        <!-- File List -->
        <div class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-surface-900">已选择的文件</h2>
            <button class="btn-ghost text-sm" @click="clearFiles">
              清除全部
            </button>
          </div>
          <FileList :files="files" />
        </div>

        <!-- Video Preview -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-surface-900 mb-4">视频预览</h2>
          <VideoPreview 
            :src="selectedFile?.url" 
            @time-update="handleTimeUpdate"
          />
        </div>

        <!-- Options -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-surface-900 mb-6">转换选项</h2>
          
          <div class="space-y-6">
            <!-- Video Codec -->
            <div>
              <label class="label">视频编码格式</label>
              <div class="grid sm:grid-cols-3 gap-3">
                <label
                  v-for="codec in videoCodecs"
                  :key="codec.value"
                  class="relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all"
                  :class="selectedCodec === codec.value ? 'border-primary-500 bg-primary-50' : 'border-surface-200 hover:border-surface-300'"
                >
                  <input
                    v-model="selectedCodec"
                    type="radio"
                    :value="codec.value"
                    class="sr-only"
                  >
                  <span class="font-medium text-surface-900">{{ codec.label }}</span>
                  <span class="text-xs text-surface-500 mt-1">{{ codec.description }}</span>
                  <svg
                    v-if="selectedCodec === codec.value"
                    class="absolute top-3 right-3 w-5 h-5 text-primary-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </label>
              </div>
            </div>

            <!-- Cover Timestamp -->
            <div>
              <label class="label">
                封面时间戳
                <span class="text-surface-400 font-normal">（{{ formatTime(coverTimestamp) }}）</span>
              </label>
              <input
                v-model.number="coverTimestamp"
                type="range"
                min="0"
                max="10"
                step="0.1"
                class="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              >
              <p class="text-xs text-surface-500 mt-2">
                拖动滑块选择实况照片的封面帧，或在上方视频播放器中点击目标位置
              </p>
            </div>

            <!-- Custom Cover -->
            <div>
              <label class="label">自定义封面（可选）</label>
              <div class="flex items-center gap-4">
                <button
                  type="button"
                  class="btn-secondary"
                  @click="coverInput?.click()"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  选择图片
                </button>
                <input
                  ref="coverInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleCoverSelect"
                >
                <span v-if="customCover" class="text-sm text-surface-600">
                  {{ customCover.name }}
                  <button class="text-red-500 hover:text-red-600 ml-2" @click="customCover = null">移除</button>
                </span>
                <span v-else class="text-sm text-surface-400">使用视频帧作为封面</span>
              </div>
            </div>
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
            @click="handleConvert"
          >
            <svg v-if="isProcessing" class="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ isProcessing ? '处理中...' : '开始转换' }}
          </button>
        </div>
      </template>
    </div>

    <!-- Result Modal -->
    <div v-if="resultUrl" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div class="card max-w-md w-full p-6 animate-slide-up">
        <div class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-surface-900 mb-2">转换成功！</h3>
          <p class="text-surface-600 mb-6">您的实况照片已准备好下载</p>
          <div class="flex flex-col gap-3">
            <a
              :href="resultUrl"
              download="motion-photo.jpg"
              class="btn-primary"
            >
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              下载实况照片
            </a>
            <button class="btn-secondary" @click="resetResult">
              继续转换其他视频
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useFilesStore } from '@/stores/files'
import { useAppStore } from '@/stores/app'
import { useFFmpeg } from '@/composables/useFFmpeg'
import { useMotionPhoto } from '@/composables/useMotionPhoto'
import FileUpload from '@/components/common/FileUpload.vue'
import FileList from '@/components/common/FileList.vue'
import VideoPreview from '@/components/common/VideoPreview.vue'
import ProcessingStatus from '@/components/common/ProcessingStatus.vue'

const filesStore = useFilesStore()
const appStore = useAppStore()
const { loadFFmpeg } = useFFmpeg()
const { createMotionPhoto } = useMotionPhoto()

const { files, hasFiles, selectedFile } = storeToRefs(filesStore)
const { processingState, ffmpegLoaded, isProcessing } = storeToRefs(appStore)
const { addFile, clearFiles, formatFileSize } = filesStore
const { setProcessingState, resetProcessingState, setFfmpegLoaded } = appStore

const coverInput = ref<HTMLInputElement>()
const coverTimestamp = ref(0)
const customCover = ref<File | null>(null)
const selectedCodec = ref<'h264' | 'hevc' | 'copy'>('h264')
const resultUrl = ref<string>()

const videoCodecs = [
  { value: 'h264', label: 'H.264', description: '兼容性最好' },
  { value: 'hevc', label: 'HEVC', description: '文件更小' },
  { value: 'copy', label: '不编码', description: '速度最快' },
]

onMounted(async () => {
  if (!ffmpegLoaded.value) {
    const loaded = await loadFFmpeg()
    setFfmpegLoaded(loaded)
  }
})

function handleVideoSelect(selectedFiles: File[]) {
  const videoFile = selectedFiles[0]
  if (videoFile) {
    addFile(videoFile)
  }
}

function handleCoverSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files?.[0]) {
    customCover.value = input.files[0]
  }
}

function handleTimeUpdate(time: number) {
  coverTimestamp.value = Math.round(time * 10) / 10
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}

async function handleConvert() {
  if (!selectedFile.value) return

  setProcessingState({
    status: 'processing',
    progress: 0,
    message: '正在转换视频...',
  })

  try {
    const result = await createMotionPhoto(selectedFile.value.file, {
      timestamp: coverTimestamp.value,
      videoCodec: selectedCodec.value,
      coverFile: customCover.value || undefined,
    })

    resultUrl.value = URL.createObjectURL(result)
    
    setProcessingState({
      status: 'success',
      progress: 100,
      message: '转换完成！',
    })
  } catch (error) {
    console.error('Conversion failed:', error)
    setProcessingState({
      status: 'error',
      progress: 0,
      message: error instanceof Error ? error.message : '转换失败，请重试',
    })
  }
}

function resetResult() {
  if (resultUrl.value) {
    URL.revokeObjectURL(resultUrl.value)
  }
  resultUrl.value = undefined
  resetProcessingState()
}
</script>
