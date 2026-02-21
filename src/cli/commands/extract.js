/**
 * 提取命令
 * 从实况照片中提取视频和封面图
 */

const { extractFromMotionPhoto } = require('../../core');
const { ensureDir, fileExists, formatFileSize } = require('../../utils');

/**
 * 执行提取命令
 * @param {string[]} args - 参数数组 [inputPath, outputDir]
 * @param {Object} options - 选项
 */
function execute(args, options = {}) {
    const inputPath = args[0];
    const outputDir = args[1] || 'output';
    
    if (!inputPath) {
        throw new Error('请提供实况照片路径');
    }
    
    // 验证输入文件
    if (!fileExists(inputPath)) {
        throw new Error(`文件不存在: ${inputPath}`);
    }
    
    // 确保输出目录存在
    ensureDir(outputDir);
    
    console.log('========================================');
    console.log('  实况照片提取功能');
    console.log('========================================\n');
    
    const result = extractFromMotionPhoto(inputPath, outputDir);
    
    console.log('\n========================================');
    console.log('  提取完成!');
    console.log('========================================');
    console.log(`封面图: ${result.coverPath}`);
    console.log(`  大小: ${formatFileSize(result.coverSize)}`);
    console.log(`视频: ${result.videoPath}`);
    console.log(`  大小: ${formatFileSize(result.videoSize)}`);
    console.log(`格式: ${result.format}`);
    
    return result;
}

/**
 * 获取命令帮助
 * @returns {string}
 */
function getHelp() {
    return `
提取命令 - 从实况照片中提取视频和封面图

用法:
  node cli.js extract <实况照片路径> [输出目录]

参数:
  <实况照片路径>  要提取的实况照片文件路径
  [输出目录]      可选，输出目录（默认: output）

示例:
  node cli.js extract test-data/live-photo.jpg
  node cli.js extract test-data/live-photo.jpg output/
`;
}

module.exports = {
    execute,
    getHelp
};
