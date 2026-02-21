/**
 * 工具模块入口
 * 导出所有工具功能
 */

const video = require('./video');
const file = require('./file');

module.exports = {
    ...video,
    ...file
};
