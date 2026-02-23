/**
 * 实况照片创建模块
 * 负责将视频和封面图合成为实况照片
 */

const fs = require('fs');
const path = require('path');
const { generateXmp, injectXmpToJpeg, isValidJpeg } = require('./xmp');
const { VideoCodec } = require('./constants');

/**
 * 创建选项
 * @typedef {Object} CreateOptions
 * @property {number} timestampUs - 封面时间戳（微秒）
 * @property {string} timestamp - 提取封面的时间戳（如 "00:00:00.000"）
 * @property {string} videoCodec - 视频编码格式 (h264, hevc, copy)
 * @property {boolean} keepTemp - 是否保留临时文件
 */

/**
 * 创建结果
 * @typedef {Object} CreateResult
 * @property {string} outputPath - 输出文件路径
 * @property {number} totalSize - 总大小
 * @property {number} coverSize - 封面大小
 * @property {number} videoSize - 视频大小
 * @property {string} videoCodec - 视频编码格式
 */

/**
 * 将视频转换为实况照片 (Google Motion Photo V2 格式)
 * @param {string} videoPath - 视频路径
 * @param {string} coverPath - 封面图路径 (可选)
 * @param {string} outputPath - 输出实况照片路径
 * @param {CreateOptions} options - 配置选项
 * @returns {CreateResult} - 输出文件信息
 */
function createMotionPhoto(videoPath, coverPath, outputPath, options = {}) {
    const outputDir = path.dirname(outputPath);
    const tempFiles = [];
    
    try {
        // 1. 处理视频编码
        let processedVideoPath = videoPath;
        const videoCodec = options.videoCodec || VideoCodec.H264;
        
        if (videoCodec !== VideoCodec.COPY) {
            const tempVideoPath = path.join(outputDir, `temp_video_${Date.now()}.mp4`);
            processedVideoPath = convertVideoCodec(videoPath, tempVideoPath, videoCodec);
            tempFiles.push(tempVideoPath);
        }
        
        // 获取视频文件大小
        const videoStats = fs.statSync(processedVideoPath);
        const videoSize = videoStats.size;
        
        // 2. 处理封面图
        let finalCoverPath = coverPath;
        if (!finalCoverPath) {
            const tempCoverPath = path.join(outputDir, `temp_cover_${Date.now()}.jpg`);
            finalCoverPath = extractCoverFromVideo(processedVideoPath, tempCoverPath, options.timestamp);
            tempFiles.push(tempCoverPath);
        }
        
        // 读取封面图
        let coverBuffer = fs.readFileSync(finalCoverPath);
        
        // 检查是否为有效的 JPEG 文件，如果不是则转换
        if (!isValidJpeg(coverBuffer)) {
            console.log(`[CLI] 封面图不是有效的 JPEG 格式，正在转换...`);
            const convertedCoverPath = path.join(outputDir, `temp_cover_converted_${Date.now()}.jpg`);
            convertImageToJpeg(finalCoverPath, convertedCoverPath);
            coverBuffer = fs.readFileSync(convertedCoverPath);
            tempFiles.push(convertedCoverPath);
            console.log(`[CLI] 封面图转换完成: ${convertedCoverPath}`);
        }
        
        // 3. 生成 XMP 元数据并注入
        const timestampUs = options.timestampUs || 0;
        const xmpData = generateXmp(videoSize, timestampUs);
        const jpegWithXmp = injectXmpToJpeg(coverBuffer, xmpData);
        
        // 4. 读取视频数据
        const videoBuffer = fs.readFileSync(processedVideoPath);
        
        // 5. 合并: JPEG(含XMP) + MP4
        const motionPhotoBuffer = Buffer.concat([jpegWithXmp, videoBuffer]);
        
        // 6. 写入输出文件
        fs.writeFileSync(outputPath, motionPhotoBuffer);
        
        return {
            outputPath,
            totalSize: motionPhotoBuffer.length,
            coverSize: jpegWithXmp.length,
            videoSize: videoBuffer.length,
            videoCodec
        };
    } finally {
        // 清理临时文件
        if (!options.keepTemp) {
            tempFiles.forEach(file => {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            });
        }
    }
}

/**
 * 转换视频编码格式
 * @param {string} inputPath - 输入视频路径
 * @param {string} outputPath - 输出视频路径
 * @param {string} codec - 编码格式 (h264, hevc, copy)
 * @returns {string} - 输出视频路径
 */
function convertVideoCodec(inputPath, outputPath, codec = VideoCodec.H264) {
    const { execSync } = require('child_process');
    
    let cmd;
    switch (codec) {
        case VideoCodec.H264:
            cmd = `ffmpeg -y -i "${inputPath}" -c:v libx264 -preset fast -crf 23 -c:a copy -movflags +faststart "${outputPath}"`;
            break;
        case VideoCodec.HEVC:
            cmd = `ffmpeg -y -i "${inputPath}" -c:v libx265 -preset fast -crf 28 -c:a copy -movflags +faststart -tag:v hvc1 "${outputPath}"`;
            break;
        case VideoCodec.COPY:
            cmd = `ffmpeg -y -i "${inputPath}" -c copy -movflags +faststart "${outputPath}"`;
            break;
        default:
            throw new Error(`不支持的编码格式: ${codec}`);
    }
    
    try {
        execSync(cmd, { stdio: 'pipe' });
        return outputPath;
    } catch (error) {
        throw new Error(`视频转码失败: ${error.message}`);
    }
}

/**
 * 从视频中提取封面帧
 * @param {string} videoPath - 视频路径
 * @param {string} outputPath - 输出封面路径
 * @param {string} timestamp - 时间戳 (如 "00:00:00.000")
 * @returns {string} - 输出封面路径
 */
function extractCoverFromVideo(videoPath, outputPath, timestamp = '00:00:00.000') {
    const { execSync } = require('child_process');
    
    const cmd = `ffmpeg -y -ss ${timestamp} -i "${videoPath}" -vframes 1 -q:v 2 "${outputPath}"`;
    
    try {
        execSync(cmd, { stdio: 'pipe' });
        return outputPath;
    } catch (error) {
        throw new Error(`提取封面失败: ${error.message}`);
    }
}

/**
 * 将任意图片格式转换为 JPEG
 * @param {string} inputPath - 输入图片路径
 * @param {string} outputPath - 输出 JPEG 路径
 * @returns {string} - 输出路径
 */
function convertImageToJpeg(inputPath, outputPath) {
    const { execSync } = require('child_process');
    
    const cmd = `ffmpeg -y -i "${inputPath}" -q:v 2 "${outputPath}"`;
    
    try {
        execSync(cmd, { stdio: 'pipe' });
        return outputPath;
    } catch (error) {
        throw new Error(`图片转换为 JPEG 失败: ${error.message}`);
    }
}

module.exports = {
    createMotionPhoto,
    convertVideoCodec,
    extractCoverFromVideo,
    convertImageToJpeg
};
