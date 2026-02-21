/**
 * 命令模块入口
 * 导出所有 CLI 命令
 */

const extract = require('./extract');
const create = require('./create');
const mute = require('./mute');
const trim = require('./trim');

const commands = {
    extract,
    create,
    mute,
    trim
};

/**
 * 获取所有可用命令
 * @returns {string[]}
 */
function getAvailableCommands() {
    return Object.keys(commands);
}

/**
 * 执行命令
 * @param {string} command - 命令名称
 * @param {string[]} args - 位置参数
 * @param {Object} options - 选项
 */
function executeCommand(command, args, options) {
    if (!commands[command]) {
        throw new Error(`未知命令: ${command}`);
    }
    
    return commands[command].execute(args, options);
}

/**
 * 获取命令帮助
 * @param {string} command - 命令名称
 * @returns {string}
 */
function getCommandHelp(command) {
    if (!commands[command]) {
        return `未知命令: ${command}\n可用命令: ${getAvailableCommands().join(', ')}`;
    }
    
    return commands[command].getHelp();
}

module.exports = {
    ...commands,
    getAvailableCommands,
    executeCommand,
    getCommandHelp
};
