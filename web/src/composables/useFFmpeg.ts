import { ref } from 'vue'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import { useAppStore } from '@/stores/app'

let ffmpegInstance: FFmpeg | null = null
const isLoaded = ref(false)

function getFFmpeg(): FFmpeg {
  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg()
  }
  return ffmpegInstance
}

export function useFFmpeg() {
  const appStore = useAppStore()
  const ffmpeg = getFFmpeg()

  async function loadFFmpeg(): Promise<boolean> {
    if (isLoaded.value) return true

    appStore.setProcessingState({
      status: 'loading',
      progress: 0,
      message: '正在加载 FFmpeg...',
    })

    try {
      // Set up event listeners only once
      ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]', message)
      })

      ffmpeg.on('progress', ({ progress }) => {
        appStore.setProcessingState({
          progress: Math.round(progress * 100),
        })
      })

      // 使用多个 CDN 源，提高加载成功率
      const cdnUrls = [
        'https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm',
        'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.4/dist/esm',
      ]

      let lastError: Error | null = null

      for (const baseURL of cdnUrls) {
        try {
          console.log(`[FFmpeg] Trying to load from: ${baseURL}`)

          const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript')
          const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')

          await ffmpeg.load({
            coreURL,
            wasmURL,
          })

          isLoaded.value = true
          appStore.setFfmpegLoaded(true)
          appStore.resetProcessingState()
          console.log(`[FFmpeg] Loaded successfully from: ${baseURL}`)

          return true
        } catch (error) {
          console.warn(`[FFmpeg] Failed to load from ${baseURL}:`, error)
          lastError = error as Error
          continue
        }
      }

      throw lastError || new Error('All CDN sources failed')
    } catch (error) {
      console.error('Failed to load FFmpeg:', error)
      appStore.setProcessingState({
        status: 'error',
        message: '加载 FFmpeg 失败，请检查网络连接后刷新页面重试',
      })
      return false
    }
  }

  async function extractFrame(videoName: string, outputName: string, timestamp: number = 0): Promise<void> {
    console.log(`[FFmpeg] Extracting frame at ${timestamp}s from ${videoName}`)
    
    try {
      // 先删除可能存在的旧文件
      try {
        await ffmpeg.deleteFile(outputName)
      } catch {
        // Ignore
      }
      
      // 使用更安全的参数组合
      await ffmpeg.exec([
        '-ss', timestamp.toString(),
        '-i', videoName,
        '-vframes', '1',
        '-q:v', '2',
        '-pix_fmt', 'yuv420p',
        outputName,
      ])
      
      // 验证文件是否成功创建
      try {
        const data = await ffmpeg.readFile(outputName)
        if (!data || (typeof data === 'string' && data.length === 0) || 
            (data instanceof Uint8Array && data.length === 0)) {
          throw new Error('Extracted frame is empty')
        }
        console.log(`[FFmpeg] Frame extracted successfully to ${outputName}, size: ${data instanceof Uint8Array ? data.length : data.length} bytes`)
      } catch (verifyError) {
        console.error(`[FFmpeg] Frame extraction verification failed:`, verifyError)
        throw new Error('帧提取失败，请尝试使用不同的视频文件或时间戳')
      }
    } catch (error) {
      console.error(`[FFmpeg] Failed to extract frame:`, error)
      throw error
    }
  }

  async function convertVideo(
    inputName: string,
    outputName: string,
    options: {
      codec?: string
      startTime?: number
      endTime?: number
      removeAudio?: boolean
    } = {}
  ): Promise<void> {
    console.log(`[FFmpeg] Converting video: ${inputName} -> ${outputName}`, options)
    
    const args: string[] = []
    
    // Input seeking for faster processing
    if (options.startTime !== undefined && options.startTime > 0) {
      args.push('-ss', options.startTime.toString())
    }
    
    args.push('-i', inputName)
    
    // Output seeking
    if (options.endTime !== undefined) {
      const duration = options.endTime - (options.startTime || 0)
      if (duration > 0) {
        args.push('-t', duration.toString())
      }
    }

    // Video codec
    if (options.codec && options.codec !== 'copy') {
      args.push('-c:v', options.codec === 'hevc' ? 'libx265' : 'libx264')
      args.push('-preset', 'ultrafast')
      args.push('-crf', '28')
      args.push('-pix_fmt', 'yuv420p')
    } else if (options.codec === 'copy') {
      args.push('-c:v', 'copy')
    }

    // Audio
    if (options.removeAudio) {
      args.push('-an')
    } else {
      args.push('-c:a', 'aac', '-b:a', '128k')
    }

    args.push('-movflags', '+faststart')
    args.push('-y', outputName)

    console.log(`[FFmpeg] Command: ffmpeg ${args.join(' ')}`)

    try {
      await ffmpeg.exec(args)
      console.log(`[FFmpeg] Video converted successfully`)
    } catch (error) {
      console.error(`[FFmpeg] Failed to convert video:`, error)
      throw error
    }
  }

  async function writeFile(name: string, data: Uint8Array): Promise<void> {
    console.log(`[FFmpeg] Writing file: ${name} (${data.length} bytes)`)
    try {
      await ffmpeg.writeFile(name, data)
      console.log(`[FFmpeg] File written successfully`)
    } catch (error) {
      console.error(`[FFmpeg] Failed to write file:`, error)
      throw error
    }
  }

  async function readFile(name: string): Promise<Uint8Array> {
    console.log(`[FFmpeg] Reading file: ${name}`)
    try {
      const data = await ffmpeg.readFile(name)
      console.log(`[FFmpeg] File read successfully`)
      
      // Handle both string and Uint8Array returns
      if (typeof data === 'string') {
        return new Uint8Array(data.split('').map(c => c.charCodeAt(0)))
      }
      return data as Uint8Array
    } catch (error) {
      console.error(`[FFmpeg] Failed to read file:`, error)
      throw error
    }
  }

  async function deleteFile(name: string): Promise<void> {
    try {
      await ffmpeg.deleteFile(name)
      console.log(`[FFmpeg] Deleted file: ${name}`)
    } catch {
      // Ignore errors
    }
  }

  async function listFiles(): Promise<string[]> {
    try {
      const files = await ffmpeg.listDir('/')
      return files.map(f => f.name)
    } catch {
      return []
    }
  }

  return {
    ffmpeg,
    isLoaded,
    loadFFmpeg,
    extractFrame,
    convertVideo,
    writeFile,
    readFile,
    deleteFile,
    listFiles,
  }
}
