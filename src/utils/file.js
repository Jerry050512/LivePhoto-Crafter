/**
 * 文件工具模块
 * 提供文件操作辅助功能
 */

const fs = require('fs');
const path = require('path');

/**
 * 确保目录存在
 * @param {string} dirPath - 目录路径
 */
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * 清理临时文件
 * @param {string[]} files - 文件路径数组
 */
function cleanupTempFiles(files) {
    files.forEach(file => {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }
    });
}

/**
 * 获取文件扩展名
 * @param {string} filePath - 文件路径
 * @returns {string} - 扩展名（小写）
 */
function getExtension(filePath) {
    return path.extname(filePath).toLowerCase();
}

/**
 * 检查文件是否存在
 * @param {string} filePath - 文件路径
 * @returns {boolean} - 是否存在
 */
function fileExists(filePath) {
    return fs.existsSync(filePath);
}

/**
 * 获取文件大小（字节）
 * @param {string} filePath - 文件路径
 * @returns {number} - 文件大小
 */
function getFileSize(filePath) {
    const stats = fs.statSync(filePath);
    return stats.size;
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} - 格式化后的字符串
 */
function formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * 生成临时文件路径
 * @param {string} dir - 目录
 * @param {string} prefix - 前缀
 * @param {string} ext - 扩展名
 * @returns {string} - 临时文件路径
 */
function generateTempPath(dir, prefix = 'temp', ext = '.tmp') {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return path.join(dir, `${prefix}_${timestamp}_${random}${ext}`);
}

module.exports = {
    ensureDir,
    cleanupTempFiles,
    getExtension,
    fileExists,
    getFileSize,
    formatFileSize,
    generateTempPath
};
