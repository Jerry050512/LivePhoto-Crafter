/**
 * 核心模块入口
 * 导出所有核心功能
 */

const constants = require('./constants');
const xmp = require('./xmp');
const extractor = require('./extractor');
const creator = require('./creator');

module.exports = {
    // 常量
    ...constants,
    
    // XMP 处理
    ...xmp,
    
    // 提取功能
    ...extractor,
    
    // 创建功能
    ...creator
};
