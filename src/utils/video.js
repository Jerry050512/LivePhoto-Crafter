/**
 * 视频工具模块
 * 提供视频处理辅助功能
 */

const { execSync } = require('child_process');
const fs = require('fs');

/**
 * 获取视频信息
 * @param {string} videoPath - 视频路径
 * @returns {Object} - 视频信息
 */
function getVideoInfo(videoPath) {
    const cmd = `ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,duration,r_frame_rate -show_entries format=size,duration -of json "${videoPath}"`;
    
    try {
        const output = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
        const info = JSON.parse(output);
        
        const stream = info.streams[0];
        const format = info.format;
        
        return {
            codec: stream.codec_name,
            width: stream.width,
            height: stream.height,
            duration: parseFloat(stream.duration || format.duration),
            frameRate: eval(stream.r_frame_rate),
            size: parseInt(format.size)
        };
    } catch (error) {
        throw new Error(`获取视频信息失败: ${error.message}`);
    }
}

/**
 * 移除视频音轨
 * @param {string} inputPath - 输入视频路径
 * @param {string} outputPath - 输出视频路径
 * @returns {string} - 输出视频路径
 */
function removeAudio(inputPath, outputPath) {
    const cmd = `ffmpeg -y -i "${inputPath}" -c:v copy -an "${outputPath}"`;
    
    try {
        execSync(cmd, { stdio: 'pipe' });
        return outputPath;
    } catch (error) {
        throw new Error(`移除音轨失败: ${error.message}`);
    }
}

/**
 * 剪辑视频
 * @param {string} inputPath - 输入视频路径
 * @param {string} outputPath - 输出视频路径
 * @param {string} startTime - 开始时间
 * @param {string} endTime - 结束时间
 * @returns {string} - 输出视频路径
 */
function trimVideo(inputPath, outputPath, startTime, endTime) {
    const cmd = `ffmpeg -y -i "${inputPath}" -ss ${startTime} -to ${endTime} -c copy "${outputPath}"`;
    
    try {
        execSync(cmd, { stdio: 'pipe' });
        return outputPath;
    } catch (error) {
        throw new Error(`剪辑视频失败: ${error.message}`);
    }
}

/**
 * 检查 FFmpeg 是否可用
 * @returns {boolean} - 是否可用
 */
function isFFmpegAvailable() {
    try {
        execSync('ffmpeg -version', { stdio: 'pipe' });
        return true;
    } catch {
        return false;
    }
}

/**
 * 检查 FFprobe 是否可用
 * @returns {boolean} - 是否可用
 */
function isFFprobeAvailable() {
    try {
        execSync('ffprobe -version', { stdio: 'pipe' });
        return true;
    } catch {
        return false;
    }
}

module.exports = {
    getVideoInfo,
    removeAudio,
    trimVideo,
    isFFmpegAvailable,
    isFFprobeAvailable
};
