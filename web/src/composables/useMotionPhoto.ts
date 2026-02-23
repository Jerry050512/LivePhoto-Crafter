import { useFFmpeg } from '@/composables/useFFmpeg'
import { generateXmp, injectXmpToJpeg, detectVideoInfo, findJpegEnd, isValidJpeg } from '@/utils/xmp'

export interface CreateOptions {
  timestamp?: number
  videoCodec?: 'h264' | 'hevc' | 'copy'
  coverFile?: File
}

export interface ExtractResult {
  coverBlob: Blob
  videoBlob: Blob
  coverSize: number
  videoSize: number
  format: string
}

/**
 * 将任意图片格式转换为 JPEG Blob
 * @param imageFile 图片文件
 * @returns JPEG 格式的 Blob
 */
async function convertToJpeg(imageFile: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('无法创建 canvas context'))
      return
    }

    const url = URL.createObjectURL(imageFile)

    img.onload = () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      ctx.drawImage(img, 0, 0)

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (blob) {
            console.log(`[ImageConvert] Converted to JPEG: ${blob.size} bytes`)
            resolve(blob)
          } else {
            reject(new Error('图片转换为 JPEG 失败'))
          }
        },
        'image/jpeg',
        0.95
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片加载失败'))
    }

    img.src = url
  })
}

// 使用 Canvas 从视频提取帧
async function extractFrameFromVideo(videoFile: File, timestamp: number = 0): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('无法创建 canvas context'))
      return
    }

    const url = URL.createObjectURL(videoFile)
    video.src = url
    video.muted = true
    video.playsInline = true
    video.crossOrigin = 'anonymous'

    let isResolved = false

    const cleanup = () => {
      if (!isResolved) {
        isResolved = true
        URL.revokeObjectURL(url)
        video.remove()
      }
    }

    video.onloadedmetadata = () => {
      console.log(`[Canvas] Video metadata loaded: ${video.videoWidth}x${video.videoHeight}, duration: ${video.duration}s`)
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // 设置时间戳并等待 seek 完成
      video.currentTime = Math.min(timestamp, video.duration || timestamp)
    }

    video.onseeked = () => {
      console.log(`[Canvas] Video seeked to ${video.currentTime}s, drawing frame...`)

      // 等待一帧确保视频已渲染
      requestAnimationFrame(() => {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                console.log(`[Canvas] Frame extracted: ${blob.size} bytes`)
                cleanup()
                resolve(blob)
              } else {
                cleanup()
                reject(new Error('Canvas 转 Blob 失败'))
              }
            },
            'image/jpeg',
            0.95
          )
        } catch (err) {
          cleanup()
          reject(new Error(`Canvas 绘制失败: ${err}`))
        }
      })
    }

    video.onerror = (e) => {
      console.error('[Canvas] Video error:', e)
      cleanup()
      reject(new Error('视频加载失败'))
    }

    // 开始加载视频
    video.load()

    // 超时处理
    setTimeout(() => {
      if (!isResolved) {
        console.error('[Canvas] Timeout waiting for video')
        cleanup()
        reject(new Error('提取帧超时，请检查视频文件是否有效'))
      }
    }, 15000)
  })
}

export function useMotionPhoto() {
  const { convertVideo, writeFile, readFile, deleteFile } = useFFmpeg()

  async function createMotionPhoto(
    videoFile: File,
    options: CreateOptions = {}
  ): Promise<Blob> {
    const videoName = 'input.mp4'
    const processedVideoName = 'processed.mp4'

    console.log('[MotionPhoto] Starting conversion:', {
      fileName: videoFile.name,
      fileSize: videoFile.size,
      options
    })

    try {
      // Write input video
      console.log('[MotionPhoto] Reading video file...')
      const videoData = new Uint8Array(await videoFile.arrayBuffer())
      console.log(`[MotionPhoto] Video data loaded: ${videoData.length} bytes`)

      console.log('[MotionPhoto] Writing video to FFmpeg FS...')
      await writeFile(videoName, videoData)
      console.log('[MotionPhoto] Video written successfully')

      // Process video if needed
      let finalVideoName = videoName
      if (options.videoCodec && options.videoCodec !== 'copy') {
        console.log(`[MotionPhoto] Converting video with codec: ${options.videoCodec}`)
        await convertVideo(videoName, processedVideoName, {
          codec: options.videoCodec
        })
        finalVideoName = processedVideoName
        console.log('[MotionPhoto] Video conversion completed')
      }

      // Get video data
      console.log('[MotionPhoto] Reading processed video...')
      const videoBytes = await readFile(finalVideoName)
      const videoSize = videoBytes.length
      console.log(`[MotionPhoto] Video size: ${videoSize} bytes`)

      // Get or create cover
      let coverBytes: Uint8Array
      if (options.coverFile) {
        console.log('[MotionPhoto] Using custom cover file:', options.coverFile.name, options.coverFile.type)
        let coverArrayBuffer = await options.coverFile.arrayBuffer()
        let coverUint8Array = new Uint8Array(coverArrayBuffer)

        // 检查是否为有效的 JPEG 文件
        if (!isValidJpeg(coverUint8Array)) {
          console.log('[MotionPhoto] Cover is not a valid JPEG, converting...')
          const jpegBlob = await convertToJpeg(options.coverFile)
          coverArrayBuffer = await jpegBlob.arrayBuffer()
          coverUint8Array = new Uint8Array(coverArrayBuffer)
          console.log(`[MotionPhoto] Cover converted to JPEG: ${coverUint8Array.length} bytes`)
        }

        coverBytes = coverUint8Array
      } else {
        const timestamp = options.timestamp || 0
        console.log(`[MotionPhoto] Extracting frame at ${timestamp}s using Canvas`)

        // 使用 Canvas 提取帧而不是 FFmpeg
        const coverBlob = await extractFrameFromVideo(videoFile, timestamp)
        coverBytes = new Uint8Array(await coverBlob.arrayBuffer())
        console.log(`[MotionPhoto] Cover extracted using Canvas: ${coverBytes.length} bytes`)
      }

      // Generate XMP and inject
      console.log('[MotionPhoto] Generating XMP metadata...')
      const xmpData = generateXmp(videoSize, Math.round((options.timestamp || 0) * 1000000))
      console.log('[MotionPhoto] Injecting XMP into JPEG...')
      const jpegWithXmp = injectXmpToJpeg(coverBytes, xmpData)
      console.log(`[MotionPhoto] JPEG with XMP size: ${jpegWithXmp.length} bytes`)

      // Clean up FFmpeg FS to free memory before creating large file
      console.log('[MotionPhoto] Cleaning up temporary files...')
      await deleteFile(videoName)
      await deleteFile(processedVideoName)

      // Create motion photo using Blob instead of Uint8Array to save memory
      console.log('[MotionPhoto] Creating motion photo blob...')
      const jpegBlob = new Blob([jpegWithXmp as unknown as BlobPart], { type: 'image/jpeg' })
      const videoBlob = new Blob([videoBytes as unknown as BlobPart], { type: 'video/mp4' })
      const motionPhotoBlob = new Blob([jpegBlob, videoBlob], { type: 'image/jpeg' })

      console.log(`[MotionPhoto] Motion photo created: ${motionPhotoBlob.size} bytes`)
      return motionPhotoBlob
    } catch (error) {
      console.error('[MotionPhoto] Conversion failed:', error)
      // Cleanup on error
      await deleteFile(videoName)
      await deleteFile(processedVideoName)
      throw error
    }
  }

  async function extractFromMotionPhoto(motionPhotoFile: File): Promise<ExtractResult> {
    console.log('[MotionPhoto] Starting extraction:', {
      fileName: motionPhotoFile.name,
      fileSize: motionPhotoFile.size
    })

    const fileData = new Uint8Array(await motionPhotoFile.arrayBuffer())
    const fileSize = fileData.length

    console.log(`[MotionPhoto] File loaded: ${fileSize} bytes`)

    // Detect video info
    console.log('[MotionPhoto] Detecting video info...')
    const { videoLength, videoStart, format } = detectVideoInfo(fileData, fileSize)

    console.log('[MotionPhoto] Detection result:', { videoLength, videoStart, format })

    if (!videoLength || videoLength <= 0 || videoStart < 0) {
      throw new Error('无法从文件中提取视频信息，可能不是有效的实况照片')
    }

    // Find JPEG end
    console.log('[MotionPhoto] Finding JPEG end...')
    const jpegEnd = findJpegEnd(fileData, videoStart)
    console.log(`[MotionPhoto] JPEG end at: ${jpegEnd} bytes`)

    // Extract cover
    console.log('[MotionPhoto] Extracting cover...')
    const coverBytes = fileData.slice(0, jpegEnd)
    const coverBlob = new Blob([coverBytes], { type: 'image/jpeg' })

    // Extract video
    console.log('[MotionPhoto] Extracting video...')
    const videoBytes = fileData.slice(videoStart)
    const videoBlob = new Blob([videoBytes], { type: 'video/mp4' })

    console.log('[MotionPhoto] Extraction completed')

    return {
      coverBlob,
      videoBlob,
      coverSize: coverBytes.length,
      videoSize: videoBytes.length,
      format,
    }
  }

  return {
    createMotionPhoto,
    extractFromMotionPhoto,
  }
}
