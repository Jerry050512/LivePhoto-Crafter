#!/usr/bin/env node
/**
 * CLI 入口
 * LivePhoto Crafter 命令行工具
 */

const { parseArgs } = require('./parser');
const { getAvailableCommands, executeCommand, getCommandHelp } = require('./commands');
const { isFFmpegAvailable, isFFprobeAvailable } = require('../utils');

/**
 * 显示主帮助信息
 */
function showHelp() {
    console.log(`
LivePhoto Crafter - 实况照片处理工具

用法:
  node cli.js <命令> [参数] [选项]

命令:
  extract <实况照片路径> [输出目录]     从实况照片提取视频和封面
  create <视频路径> [选项] [输出路径]   将视频转换为实况照片
  mute <视频路径> [输出路径]            移除视频音轨
  trim <视频路径> <开始时间> <结束时间> [输出路径]  剪辑视频

全局选项:
  --help, -h    显示帮助信息

查看具体命令帮助:
  node cli.js <命令> --help

示例:
  # 提取实况照片
  node cli.js extract test-data/live-photo.jpg output/

  # 创建实况照片（默认使用 H.264 编码）
  node cli.js create test-data/video.mp4 output/live.jpg

  # 创建实况照片（使用 HEVC 编码）
  node cli.js create test-data/video.mp4 --codec hevc output/live-hevc.jpg

  # 移除音轨
  node cli.js mute test-data/video.mp4 output/muted.mp4

  # 剪辑视频
  node cli.js trim test-data/video.mp4 00:00:01 00:00:05 output/trimmed.mp4
`);
}

/**
 * 检查依赖
 */
function checkDependencies() {
    const errors = [];
    
    if (!isFFmpegAvailable()) {
        errors.push('FFmpeg 未安装或不在 PATH 中');
    }
    
    if (!isFFprobeAvailable()) {
        errors.push('FFprobe 未安装或不在 PATH 中');
    }
    
    if (errors.length > 0) {
        console.error('错误: 缺少必要的依赖\n');
        errors.forEach(err => console.error(`  - ${err}`));
        console.error('\n请安装 FFmpeg 并确保它在系统 PATH 中。');
        console.error('下载地址: https://ffmpeg.org/download.html');
        process.exit(1);
    }
}

/**
 * 主函数
 */
function main() {
    const args = process.argv.slice(2);
    
    // 显示帮助
    if (args.length < 1 || args[0] === '--help' || args[0] === '-h') {
        showHelp();
        process.exit(0);
    }
    
    // 检查依赖
    checkDependencies();
    
    // 解析参数
    const parsed = parseArgs(args);
    const command = parsed.command;
    
    // 检查命令
    const availableCommands = getAvailableCommands();
    if (!availableCommands.includes(command)) {
        console.error(`错误: 未知命令: ${command}`);
        console.error(`可用命令: ${availableCommands.join(', ')}`);
        console.error('\n使用 --help 查看帮助');
        process.exit(1);
    }
    
    // 显示命令帮助
    if (parsed.options.help || parsed.options.h) {
        console.log(getCommandHelp(command));
        process.exit(0);
    }
    
    // 执行命令
    try {
        executeCommand(command, parsed.positional, parsed.options);
    } catch (error) {
        console.error('\n错误:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此文件
if (require.main === module) {
    main();
}

module.exports = {
    main,
    showHelp,
    checkDependencies
};
