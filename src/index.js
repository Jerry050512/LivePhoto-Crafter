/**
 * LivePhoto Crafter - 主入口
 * 
 * 跨端实况照片（Motion Photo / Live Photo）处理工具
 * 支持将视频转换为兼容主流设备的实况照片
 * 以及从实况照片中无损提取视频与静态封面
 */

const core = require('./core');
const utils = require('./utils');

module.exports = {
    // 核心功能
    ...core,
    
    // 工具函数
    ...utils
};
