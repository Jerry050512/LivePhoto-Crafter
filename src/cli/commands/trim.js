/**
 * 剪辑命令
 * 剪辑视频
 */

const path = require('path');
const { trimVideo } = require('../../utils');
const { ensureDir, fileExists, formatFileSize } = require('../../utils');
const fs = require('fs');

/**
 * 执行剪辑命令
 * @param {string[]} args - 参数数组 [inputPath, startTime, endTime, outputPath]
 * @param {Object} options - 选项
 */
function execute(args, options = {}) {
    const inputPath = args[0];
    const startTime = args[1];
    const endTime = args[2];
    const outputPath = args[3] || 'output/trimmed.mp4';
    
    if (!inputPath) {
        throw new Error('请提供视频路径');
    }
    
    if (!startTime || !endTime) {
        throw new Error('请提供开始时间和结束时间');
    }
    
    // 验证输入文件
    if (!fileExists(inputPath)) {
        throw new Error(`文件不存在: ${inputPath}`);
    }
    
    // 确保输出目录存在
    ensureDir(path.dirname(outputPath));
    
    console.log('========================================');
    console.log('  剪辑视频');
    console.log('========================================');
    console.log(`开始时间: ${startTime}`);
    console.log(`结束时间: ${endTime}`);
    console.log('========================================\n');
    
    trimVideo(inputPath, outputPath, startTime, endTime);
    
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
剪辑命令 - 剪辑视频

用法:
  node cli.js trim <视频路径> <开始时间> <结束时间> [输出路径]

参数:
  <视频路径>  输入视频文件路径
  <开始时间>  开始时间，格式如: 00:00:01 或 1.5
  <结束时间>  结束时间，格式如: 00:00:05 或 5.0
  [输出路径]  可选，输出文件路径（默认: output/trimmed.mp4）

示例:
  node cli.js trim test-data/video.mp4 00:00:01 00:00:05
  node cli.js trim test-data/video.mp4 1.5 5.0 output/trimmed.mp4
`;
}

module.exports = {
    execute,
    getHelp
};
