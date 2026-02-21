/**
 * 实况照片提取模块
 * 负责从实况照片中提取视频和封面图
 */

const fs = require('fs');
const path = require('path');
const { MICROVIDEO_TEMPLATE } = require('./constants');

/**
 * 提取结果
 * @typedef {Object} ExtractionResult
 * @property {string} coverPath - 封面图路径
 * @property {string} videoPath - 视频路径
 * @property {number} coverSize - 封面图大小
 * @property {number} videoSize - 视频大小
 * @property {string} format - 检测到的格式 ('google-v2' | 'google-old' | 'microvideo' | 'unknown')
 */

/**
 * 从实况照片中提取视频和封面图
 * @param {string} inputPath - 实况照片路径
 * @param {string} outputDir - 输出目录
 * @returns {ExtractionResult} - 提取的文件路径
 */
function extractFromMotionPhoto(inputPath, outputDir) {
    const buffer = fs.readFileSync(inputPath);
    const fileSize = buffer.length;
    
    // 检测格式并提取视频信息
    const { videoLength, videoStart, format } = detectVideoInfo(buffer, fileSize);
    
    if (!videoLength || videoLength <= 0 || videoStart < 0) {
        throw new Error('无法从文件中提取视频长度信息，可能不是有效的实况照片');
    }
    
    // 查找 JPEG 结束标记
    const jpegEnd = findJpegEnd(buffer, videoStart);
    
    // 提取封面图
    const coverBuffer = buffer.slice(0, jpegEnd);
    const coverPath = path.join(outputDir, 'extracted_cover.jpg');
    fs.writeFileSync(coverPath, coverBuffer);
    
    // 提取视频
    const videoBuffer = buffer.slice(videoStart);
    const videoPath = path.join(outputDir, 'extracted_video.mp4');
    fs.writeFileSync(videoPath, videoBuffer);
    
    return {
        coverPath,
        videoPath,
        coverSize: coverBuffer.length,
        videoSize: videoBuffer.length,
        format
    };
}

/**
 * 检测视频信息
 * @param {Buffer} buffer - 文件缓冲区
 * @param {number} fileSize - 文件大小
 * @returns {Object} - 视频信息
 */
function detectVideoInfo(buffer, fileSize) {
    const bufferStr = buffer.toString('utf-8', 0, Math.min(buffer.length, 100000));
    
    // 1. 尝试查找 Google Motion Photo V2 格式 (Item:Length)
    const xmpMatch = bufferStr.match(/Item:Length="(\d+)"/);
    if (xmpMatch) {
        const videoLength = parseInt(xmpMatch[1], 10);
        return {
            videoLength,
            videoStart: fileSize - videoLength,
            format: 'google-v2'
        };
    }
    
    // 2. 尝试查找旧版 GContainer:Length 格式
    // 格式: GContainer:Mime="video/mp4" ... GContainer:Length="xxx"
    const gcontainerMatch = bufferStr.match(/GContainer:Length="(\d+)"[^>]*GContainer:Mime="video\/mp4"/) ||
                           bufferStr.match(/GContainer:Mime="video\/mp4"[^>]*GContainer:Length="(\d+)"/);
    if (gcontainerMatch) {
        const videoLength = parseInt(gcontainerMatch[1], 10);
        return {
            videoLength,
            videoStart: fileSize - videoLength,
            format: 'google-old'
        };
    }
    
    // 3. 尝试查找小米/三星 MicroVideo 格式
    const microMatch = bufferStr.match(/["']?offset["']?:(\d+)/);
    if (microMatch) {
        const videoStart = parseInt(microMatch[1], 10);
        return {
            videoLength: fileSize - videoStart,
            videoStart,
            format: 'microvideo'
        };
    }
    
    // 4. 尝试查找旧版 MicroVideoOffset
    const offsetMatch = bufferStr.match(/MicroVideoOffset="(\d+)"/);
    if (offsetMatch) {
        const videoLength = parseInt(offsetMatch[1], 10);
        return {
            videoLength,
            videoStart: fileSize - videoLength,
            format: 'microvideo'
        };
    }
    
    // 5. 通过查找 MP4 头来定位视频
    const mp4Start = findMp4Start(buffer);
    if (mp4Start !== -1) {
        return {
            videoLength: fileSize - mp4Start,
            videoStart: mp4Start,
            format: 'unknown'
        };
    }
    
    return { videoLength: null, videoStart: -1, format: null };
}

/**
 * 查找 JPEG 结束标记位置
 * @param {Buffer} buffer - 数据缓冲区
 * @param {number} maxPos - 最大搜索位置
 * @returns {number} - JPEG 结束位置
 */
function findJpegEnd(buffer, maxPos) {
    let jpegEnd = -1;
    const searchEnd = Math.min(maxPos + 1000, buffer.length - 1);
    
    for (let i = 0; i < searchEnd; i++) {
        if (buffer[i] === 0xFF && buffer[i + 1] === 0xD9) {
            jpegEnd = i + 2;
        }
    }
    
    // 如果没找到或超出范围，使用计算值
    if (jpegEnd === -1 || jpegEnd > maxPos) {
        return maxPos;
    }
    
    return jpegEnd;
}

/**
 * 查找 MP4 开始位置
 * @param {Buffer} buffer - 数据缓冲区
 * @returns {number} - MP4 开始位置，未找到返回 -1
 */
function findMp4Start(buffer) {
    for (let i = 0; i < buffer.length - 8; i++) {
        // 查找 ftyp 标记
        if (buffer[i] === 0x66 && buffer[i+1] === 0x74 && 
            buffer[i+2] === 0x79 && buffer[i+3] === 0x70) {
            const boxSize = buffer.readUInt32BE(i - 4);
            if (boxSize > 0 && boxSize < buffer.length) {
                return i - 4;
            }
        }
    }
    return -1;
}

module.exports = {
    extractFromMotionPhoto,
    detectVideoInfo,
    findJpegEnd,
    findMp4Start
};
