/**
 * 创建命令
 * 将视频转换为实况照片
 */

const path = require('path');
const { createMotionPhoto, VideoCodec, VideoCodecDescription } = require('../../core');
const { ensureDir, fileExists, formatFileSize } = require('../../utils');

/**
 * 执行创建命令
 * @param {string[]} args - 参数数组 [videoPath, outputPath]
 * @param {Object} options - 选项
 */
function execute(args, options = {}) {
    const videoPath = args[0];
    const outputPath = args[1] || 'output/motion-photo.jpg';
    
    if (!videoPath) {
        throw new Error('请提供视频路径');
    }
    
    // 验证输入文件
    if (!fileExists(videoPath)) {
        throw new Error(`视频文件不存在: ${videoPath}`);
    }
    
    // 验证编码格式
    const codec = options.codec || VideoCodec.H264;
    if (!Object.values(VideoCodec).includes(codec)) {
        throw new Error(
            `不支持的编码格式: ${codec}\n` +
            `支持的格式: ${Object.values(VideoCodec).join(', ')}`
        );
    }
    
    // 验证自定义封面
    if (options.cover && !fileExists(options.cover)) {
        throw new Error(`封面文件不存在: ${options.cover}`);
    }
    
    // 确保输出目录存在
    ensureDir(path.dirname(outputPath));
    
    console.log('========================================');
    console.log('  创建实况照片');
    console.log('========================================');
    console.log(`编码格式: ${codec}`);
    console.log(`  ${VideoCodecDescription[codec]}`);
    if (options.cover) console.log(`自定义封面: ${options.cover}`);
    console.log(`封面时间戳: ${options.timestamp || '00:00:00.000'}`);
    console.log('========================================\n');
    
    const result = createMotionPhoto(videoPath, options.cover || null, outputPath, {
        videoCodec: codec,
        timestamp: options.timestamp || '00:00:00.000'
    });
    
    console.log('\n========================================');
    console.log('  创建完成!');
    console.log('========================================');
    console.log(`输出文件: ${result.outputPath}`);
    console.log(`总大小: ${formatFileSize(result.totalSize)}`);
    console.log(`封面大小: ${formatFileSize(result.coverSize)}`);
    console.log(`视频大小: ${formatFileSize(result.videoSize)}`);
    console.log(`视频编码: ${result.videoCodec}`);
    
    return result;
}

/**
 * 获取命令帮助
 * @returns {string}
 */
function getHelp() {
    return `
创建命令 - 将视频转换为实况照片

用法:
  node cli.js create <视频路径> [选项] [输出路径]

参数:
  <视频路径>  输入视频文件路径
  [输出路径]  可选，输出文件路径（默认: output/motion-photo.jpg）

选项:
  --codec <格式>     视频编码格式: h264 (默认), hevc, copy
                     h264 - H.264/AVC，兼容性最好，支持所有设备
                     hevc - H.265/HEVC，更好的压缩率，但兼容性较差
                     copy - 不重新编码，直接复制原视频
  --cover <路径>     指定封面图路径（默认从视频提取首帧）
  --timestamp <时间> 封面时间戳，如 "00:00:01.500"（默认 00:00:00.000）

示例:
  # 使用 H.264 编码（推荐，兼容性最好）
  node cli.js create test-data/video.mp4 output/live.jpg

  # 使用 HEVC 编码（文件更小）
  node cli.js create test-data/video.mp4 --codec hevc output/live-hevc.jpg

  # 不重新编码
  node cli.js create test-data/video.mp4 --codec copy output/live-copy.jpg

  # 使用自定义封面
  node cli.js create test-data/video.mp4 --codec h264 --cover my-cover.jpg output/live.jpg

  # 指定封面时间戳
  node cli.js create test-data/video.mp4 --codec h264 --timestamp 00:00:01.500 output/live.jpg
`;
}

module.exports = {
    execute,
    getHelp
};
