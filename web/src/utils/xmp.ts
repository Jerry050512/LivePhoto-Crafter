// XMP 元数据处理模块 (Web 端适配版)

// JPEG 标记
export const JpegMarkers = {
  SOI: 0xD8,
  EOI: 0xD9,
  APP0: 0xE0,
  APP1: 0xE1,
  APP2: 0xE2,
  APP15: 0xEF,
}

// XMP 模板
const XMP_TEMPLATE = `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.1.0-jc003">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
        xmlns:GCamera="http://ns.google.com/photos/1.0/camera/"
        xmlns:Container="http://ns.google.com/photos/1.0/container/"
        xmlns:Item="http://ns.google.com/photos/1.0/container/item/"
      GCamera:MotionPhoto="1"
      GCamera:MotionPhotoVersion="1"
      GCamera:MotionPhotoPresentationTimestampUs="{TIMESTAMP_US}">
      <Container:Directory>
        <rdf:Seq>
          <rdf:li rdf:parseType="Resource">
            <Container:Item
              Item:Mime="image/jpeg"
              Item:Semantic="Primary"/>
          </rdf:li>
          <rdf:li rdf:parseType="Resource">
            <Container:Item
              Item:Mime="video/mp4"
              Item:Semantic="MotionPhoto"
              Item:Length="{VIDEO_LENGTH}"
              Item:Padding="0"/>
          </rdf:li>
        </rdf:Seq>
      </Container:Directory>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`

/**
 * 生成 XMP 元数据
 */
export function generateXmp(videoLength: number, timestampUs: number = 0): string {
  if (typeof videoLength !== 'number' || videoLength <= 0) {
    throw new Error('视频长度必须是正数')
  }
  
  return XMP_TEMPLATE
    .replace('{VIDEO_LENGTH}', videoLength.toString())
    .replace('{TIMESTAMP_US}', timestampUs.toString())
}

/**
 * 验证 JPEG 文件头
 */
export function isValidJpeg(buffer: Uint8Array): boolean {
  return buffer.length >= 2 && 
         buffer[0] === 0xFF && 
         buffer[1] === JpegMarkers.SOI
}

/**
 * 查找 XMP 插入位置
 */
export function findXmpInsertPosition(jpegBuffer: Uint8Array): number {
  let pos = 2
  
  while (pos < jpegBuffer.length - 4) {
    if (jpegBuffer[pos] === 0xFF) {
      const marker = jpegBuffer[pos + 1]
      
      if (marker === 0x00) {
        pos++
        continue
      }
      
      if (marker === JpegMarkers.SOI || marker === JpegMarkers.EOI) {
        pos += 2
        continue
      }
      
      if (marker === JpegMarkers.APP1) {
        const length = (jpegBuffer[pos + 2] << 8) | jpegBuffer[pos + 3]
        pos += 2 + length
      } else if (marker >= JpegMarkers.APP0 && marker <= JpegMarkers.APP15) {
        const length = (jpegBuffer[pos + 2] << 8) | jpegBuffer[pos + 3]
        pos += 2 + length
      } else if (marker >= 0xC0 && marker <= 0xFE) {
        break
      } else {
        pos += 2
      }
    } else {
      pos++
    }
  }
  
  return pos
}

/**
 * 创建 XMP APP1 段
 */
export function createXmpSegment(xmpData: string): Uint8Array {
  const xmpNamespace = new TextEncoder().encode('http://ns.adobe.com/xap/1.0/\x00')
  const xmpBytes = new TextEncoder().encode(xmpData)
  const segmentLength = 2 + xmpNamespace.length + xmpBytes.length
  
  const segment = new Uint8Array(4 + xmpNamespace.length + xmpBytes.length)
  segment[0] = 0xFF
  segment[1] = JpegMarkers.APP1
  segment[2] = (segmentLength >> 8) & 0xFF
  segment[3] = segmentLength & 0xFF
  segment.set(xmpNamespace, 4)
  segment.set(xmpBytes, 4 + xmpNamespace.length)
  
  return segment
}

/**
 * 将 XMP 数据注入到 JPEG 文件中
 */
export function injectXmpToJpeg(jpegBuffer: Uint8Array, xmpData: string): Uint8Array {
  if (!isValidJpeg(jpegBuffer)) {
    throw new Error('无效的 JPEG 文件：缺少 SOI 标记')
  }
  
  const insertPos = findXmpInsertPosition(jpegBuffer)
  const xmpSegment = createXmpSegment(xmpData)
  
  const result = new Uint8Array(jpegBuffer.length + xmpSegment.length)
  result.set(jpegBuffer.slice(0, insertPos), 0)
  result.set(xmpSegment, insertPos)
  result.set(jpegBuffer.slice(insertPos), insertPos + xmpSegment.length)
  
  return result
}

/**
 * 从缓冲区中提取 XMP 数据
 */
export function extractXmpFromBuffer(buffer: Uint8Array): string | null {
  const decoder = new TextDecoder('utf-8')
  const bufferStr = decoder.decode(buffer.slice(0, Math.min(buffer.length, 100000)))
  
  const xmpStart = bufferStr.indexOf('<?xpacket begin')
  const xmpEnd = bufferStr.indexOf('<?xpacket end', xmpStart)
  
  if (xmpStart === -1 || xmpEnd === -1) {
    return null
  }
  
  const endMarkerEnd = bufferStr.indexOf('?>', xmpEnd)
  if (endMarkerEnd === -1) {
    return null
  }
  
  return bufferStr.substring(xmpStart, endMarkerEnd + 2)
}

/**
 * 检测视频信息
 */
export function detectVideoInfo(buffer: Uint8Array, fileSize: number): {
  videoLength: number
  videoStart: number
  format: string
} {
  const decoder = new TextDecoder('utf-8')
  const bufferStr = decoder.decode(buffer.slice(0, Math.min(buffer.length, 100000)))
  
  // 1. Google Motion Photo V2
  const xmpMatch = bufferStr.match(/Item:Length="(\d+)"/)
  if (xmpMatch) {
    const videoLength = parseInt(xmpMatch[1], 10)
    return {
      videoLength,
      videoStart: fileSize - videoLength,
      format: 'google-v2'
    }
  }
  
  // 2. 旧版 GContainer
  const gcontainerMatch = bufferStr.match(/GContainer:Length="(\d+)"[^>]*GContainer:Mime="video\/mp4"/) ||
                         bufferStr.match(/GContainer:Mime="video\/mp4"[^>]*GContainer:Length="(\d+)"/)
  if (gcontainerMatch) {
    const videoLength = parseInt(gcontainerMatch[1], 10)
    return {
      videoLength,
      videoStart: fileSize - videoLength,
      format: 'google-old'
    }
  }
  
  // 3. MicroVideo 格式
  const microMatch = bufferStr.match(/["']?offset["']?:(\d+)/)
  if (microMatch) {
    const videoStart = parseInt(microMatch[1], 10)
    return {
      videoLength: fileSize - videoStart,
      videoStart,
      format: 'microvideo'
    }
  }
  
  // 4. 通过 MP4 头检测
  const mp4Start = findMp4Start(buffer)
  if (mp4Start > 0) {
    return {
      videoLength: fileSize - mp4Start,
      videoStart: mp4Start,
      format: 'mp4-detected'
    }
  }
  
  return {
    videoLength: 0,
    videoStart: -1,
    format: 'unknown'
  }
}

/**
 * 查找 JPEG 结束位置
 */
export function findJpegEnd(buffer: Uint8Array, maxPos: number = buffer.length): number {
  for (let i = 0; i < Math.min(buffer.length - 1, maxPos); i++) {
    if (buffer[i] === 0xFF && buffer[i + 1] === JpegMarkers.EOI) {
      return i + 2
    }
  }
  return maxPos
}

/**
 * 查找 MP4 开始位置
 */
export function findMp4Start(buffer: Uint8Array): number {
  const ftypSignature = new TextEncoder().encode('ftyp')
  
  for (let i = 0; i < buffer.length - 8; i++) {
    if (buffer[i + 4] === ftypSignature[0] &&
        buffer[i + 5] === ftypSignature[1] &&
        buffer[i + 6] === ftypSignature[2] &&
        buffer[i + 7] === ftypSignature[3]) {
      return i
    }
  }
  
  return -1
}
