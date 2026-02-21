/**
 * XMP 元数据处理模块
 * 负责 XMP 数据的生成和注入
 */

const { XMP_TEMPLATE, JpegMarkers } = require('./constants');

/**
 * 生成 XMP 元数据
 * @param {number} videoLength - 视频长度（字节）
 * @param {number} timestampUs - 封面时间戳（微秒）
 * @returns {string} - XMP XML 字符串
 */
function generateXmp(videoLength, timestampUs = 0) {
    if (typeof videoLength !== 'number' || videoLength <= 0) {
        throw new Error('视频长度必须是正数');
    }
    
    return XMP_TEMPLATE
        .replace('{VIDEO_LENGTH}', videoLength.toString())
        .replace('{TIMESTAMP_US}', timestampUs.toString());
}

/**
 * 将 XMP 数据注入到 JPEG 文件中
 * 在 APP1 (EXIF) 段之后插入 XMP APP1 段
 * @param {Buffer} jpegBuffer - JPEG 数据
 * @param {string} xmpData - XMP XML 字符串
 * @returns {Buffer} - 包含 XMP 的 JPEG 数据
 */
function injectXmpToJpeg(jpegBuffer, xmpData) {
    // 验证 JPEG 头
    if (!isValidJpeg(jpegBuffer)) {
        throw new Error('无效的 JPEG 文件：缺少 SOI 标记');
    }
    
    // 查找插入位置 (在 EXIF APP1 段之后，其他段之前)
    const insertPos = findXmpInsertPosition(jpegBuffer);
    
    // 创建 XMP APP1 段
    const xmpSegment = createXmpSegment(xmpData);
    
    // 合并: SOI + 原数据(到insertPos) + XMP段 + 剩余数据
    return Buffer.concat([
        jpegBuffer.slice(0, insertPos),
        xmpSegment,
        jpegBuffer.slice(insertPos)
    ]);
}

/**
 * 验证 JPEG 文件头
 * @param {Buffer} buffer - 数据缓冲区
 * @returns {boolean} - 是否有效
 */
function isValidJpeg(buffer) {
    return buffer.length >= 2 && 
           buffer[0] === 0xFF && 
           buffer[1] === JpegMarkers.SOI;
}

/**
 * 查找 XMP 插入位置
 * @param {Buffer} jpegBuffer - JPEG 数据
 * @returns {number} - 插入位置
 */
function findXmpInsertPosition(jpegBuffer) {
    let pos = 2; // 跳过 SOI 标记 (FF D8)
    
    while (pos < jpegBuffer.length - 4) {
        if (jpegBuffer[pos] === 0xFF) {
            const marker = jpegBuffer[pos + 1];
            
            // 跳过填充字节
            if (marker === 0x00) {
                pos++;
                continue;
            }
            
            // SOI 或 EOI
            if (marker === JpegMarkers.SOI || marker === JpegMarkers.EOI) {
                pos += 2;
                continue;
            }
            
            // APP1 (EXIF 或 XMP)
            if (marker === JpegMarkers.APP1) {
                const length = jpegBuffer.readUInt16BE(pos + 2);
                pos += 2 + length;
            }
            // 其他 APP 段 (APP0, APP2-APP15)
            else if (marker >= JpegMarkers.APP0 && marker <= JpegMarkers.APP15) {
                const length = jpegBuffer.readUInt16BE(pos + 2);
                pos += 2 + length;
            }
            // 图像数据开始 (SOF, DHT, DQT, SOS 等)
            else if (marker >= 0xC0 && marker <= 0xFE) {
                break;
            }
            else {
                pos += 2;
            }
        } else {
            pos++;
        }
    }
    
    return pos;
}

/**
 * 创建 XMP APP1 段
 * @param {string} xmpData - XMP XML 字符串
 * @returns {Buffer} - XMP APP1 段
 */
function createXmpSegment(xmpData) {
    // 格式: FF E1 [长度] "http://ns.adobe.com/xap/1.0/\0" [XMP数据]
    const xmpNamespace = Buffer.from('http://ns.adobe.com/xap/1.0/\x00', 'utf-8');
    const xmpBytes = Buffer.from(xmpData, 'utf-8');
    const segmentLength = 2 + xmpNamespace.length + xmpBytes.length;
    
    const segment = Buffer.allocUnsafe(4 + xmpNamespace.length + xmpBytes.length);
    segment.writeUInt8(0xFF, 0);
    segment.writeUInt8(JpegMarkers.APP1, 1);
    segment.writeUInt16BE(segmentLength, 2);
    xmpNamespace.copy(segment, 4);
    xmpBytes.copy(segment, 4 + xmpNamespace.length);
    
    return segment;
}

/**
 * 从缓冲区中提取 XMP 数据
 * @param {Buffer} buffer - 数据缓冲区
 * @returns {string|null} - XMP XML 字符串或 null
 */
function extractXmpFromBuffer(buffer) {
    const bufferStr = buffer.toString('utf-8', 0, Math.min(buffer.length, 100000));
    
    // 查找 XMP 包的开始和结束
    const xmpStart = bufferStr.indexOf('<?xpacket begin');
    const xmpEnd = bufferStr.indexOf('<?xpacket end', xmpStart);
    
    if (xmpStart === -1 || xmpEnd === -1) {
        return null;
    }
    
    // 找到结束标记的完整字符串
    const endMarkerEnd = bufferStr.indexOf('?>', xmpEnd);
    if (endMarkerEnd === -1) {
        return null;
    }
    
    return bufferStr.substring(xmpStart, endMarkerEnd + 2);
}

module.exports = {
    generateXmp,
    injectXmpToJpeg,
    isValidJpeg,
    findXmpInsertPosition,
    createXmpSegment,
    extractXmpFromBuffer
};
