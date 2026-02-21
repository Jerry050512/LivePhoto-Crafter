<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-surface-900 mb-2">视频编辑</h1>
      <p class="text-surface-600">剪辑视频时长、移除音轨等预处理操作</p>
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
          <VideoPreview :src="selectedFile?.url" />
        </div>

        <!-- Edit Options -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-surface-900 mb-6">编辑选项</h2>
          
          <div class="space-y-6">
            <!-- Trim -->
            <div class="p-4 rounded-xl bg-surface-50">
              <label class="flex items-center gap-3 mb-4 cursor-pointer">
                <input
                  v-model="enableTrim"
                  type="checkbox"
                  class="w-5 h-5 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                >
                <span class="font-medium text-surface-900">剪辑视频</span>
              </label>
              
              <div v-if="enableTrim" class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label class="label">开始时间（秒）</label>
                  <input
                    v-model.number="startTime"
                    type="number"
                    min="0"
                    step="0.1"
                    class="input"
                    placeholder="0"
                  >
                </div>
                <div>
                  <label class="label">结束时间（秒）</label>
                  <input
                    v-model.number="endTime"
                    type="number"
                    min="0"
                    step="0.1"
                    class="input"
                    placeholder="视频时长"
                  >
                </div>
              </div>
            </div>

            <!-- Mute -->
            <div class="p-4 rounded-xl bg-surface-50">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  v-model="removeAudio"
                  type="checkbox"
                  class="w-5 h-5 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                >
                <span class="font-medium text-surface-900">移除音轨</span>
                <span class="text-sm text-surface-500">（生成静音视频）</span>
              </label>
            </div>

            <!-- Video Codec -->
            <div>
              <label class="label">输出编码格式</label>
              <select v-model="selectedCodec" class="input">
                <option value="h264">H.264 - 兼容性最好</option>
                <option value="hevc">HEVC - 文件更小</option>
                <option value="copy">不重新编码 - 速度最快</option>
              </select>
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
            :disabled="isProcessing || (!enableTrim && !removeAudio)"
            @click="handleProcess"
          >
            <svg v-if="isProcessing" class="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            {{ isProcessing ? '处理中...' : '开始处理' }}
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
          <h3 class="text-xl font-bold text-surface-900 mb-2">处理成功！</h3>
          <p class="text-surface-600 mb-6">您的视频已准备好下载</p>
          <div class="flex flex-col gap-3">
            <a
              :href="resultUrl"
              download="edited-video.mp4"
              class="btn-primary"
            >
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              下载视频
            </a>
            <button class="btn-secondary" @click="resetResult">
              继续处理其他视频
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
import FileUpload from '@/components/common/FileUpload.vue'
import FileList from '@/components/common/FileList.vue'
import VideoPreview from '@/components/common/VideoPreview.vue'
import ProcessingStatus from '@/components/common/ProcessingStatus.vue'

const filesStore = useFilesStore()
const appStore = useAppStore()
const { loadFFmpeg, writeFile, readFile, deleteFile, convertVideo } = useFFmpeg()

const { files, hasFiles, selectedFile } = storeToRefs(filesStore)
const { processingState, ffmpegLoaded, isProcessing } = storeToRefs(appStore)
const { addFile, clearFiles } = filesStore
const { setProcessingState, resetProcessingState, setFfmpegLoaded } = appStore

const enableTrim = ref(false)
const startTime = ref(0)
const endTime = ref<number>()
const removeAudio = ref(false)
const selectedCodec = ref<'h264' | 'hevc' | 'copy'>('h264')
const resultUrl = ref<string>()

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

async function handleProcess() {
  if (!selectedFile.value) return

  setProcessingState({
    status: 'processing',
    progress: 0,
    message: '正在处理视频...',
  })

  const inputName = 'input.mp4'
  const outputName = 'output.mp4'

  try {
    // Write input
    const videoData = new Uint8Array(await selectedFile.value.file.arrayBuffer())
    await writeFile(inputName, videoData)

    // Process
    await convertVideo(inputName, outputName, {
      codec: selectedCodec.value,
      startTime: enableTrim.value ? startTime.value : undefined,
      endTime: enableTrim.value ? endTime.value : undefined,
      removeAudio: removeAudio.value,
    })

    // Read output
    const outputData = await readFile(outputName)
    resultUrl.value = URL.createObjectURL(new Blob([outputData], { type: 'video/mp4' }))

    setProcessingState({
      status: 'success',
      progress: 100,
      message: '处理完成！',
    })
  } catch (error) {
    console.error('Processing failed:', error)
    setProcessingState({
      status: 'error',
      progress: 0,
      message: error instanceof Error ? error.message : '处理失败，请重试',
    })
  } finally {
    await deleteFile(inputName)
    await deleteFile(outputName)
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
