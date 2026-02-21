/**
 * 静音命令
 * 移除视频音轨
 */

const path = require('path');
const { removeAudio } = require('../../utils');
const { ensureDir, fileExists, formatFileSize } = require('../../utils');
const fs = require('fs');

/**
 * 执行静音命令
 * @param {string[]} args - 参数数组 [inputPath, outputPath]
 * @param {Object} options - 选项
 */
function execute(args, options = {}) {
    const inputPath = args[0];
    const outputPath = args[1] || 'output/muted.mp4';
    
    if (!inputPath) {
        throw new Error('请提供视频路径');
    }
    
    // 验证输入文件
    if (!fileExists(inputPath)) {
        throw new Error(`文件不存在: ${inputPath}`);
    }
    
    // 确保输出目录存在
    ensureDir(path.dirname(outputPath));
    
    console.log('========================================');
    console.log('  移除视频音轨');
    console.log('========================================\n');
    
    removeAudio(inputPath, outputPath);
    
    const stats = fs.statSync(outputPath);
    
    console.log('\n========================================');
    console.log('  处理完成!');
    console.log('========================================');
    console.log(`输出文件: ${outputPath}`);
    console.log(`文件大小: ${formatFileSize(stats.size)}`);
    
    return { outputPath, size: stats.size };
}

/**
 * 获取命令帮助
 * @returns {string}
 */
function getHelp() {
    return `
静音命令 - 移除视频音轨

用法:
  node cli.js mute <视频路径> [输出路径]

参数:
  <视频路径>  输入视频文件路径
  [输出路径]  可选，输出文件路径（默认: output/muted.mp4）

示例:
  node cli.js mute test-data/video.mp4
  node cli.js mute test-data/video.mp4 output/muted.mp4
`;
}

module.exports = {
    execute,
    getHelp
};
