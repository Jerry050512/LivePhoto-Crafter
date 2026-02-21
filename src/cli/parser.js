/**
 * 命令行参数解析模块
 */

/**
 * 解析命令行参数
 * @param {string[]} args - 参数数组
 * @returns {Object} - 解析结果
 */
function parseArgs(args) {
    const result = {
        command: null,
        positional: [],
        options: {}
    };
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        if (arg.startsWith('--')) {
            const key = arg.slice(2);
            const value = args[i + 1];
            if (value && !value.startsWith('--')) {
                result.options[key] = value;
                i++;
            } else {
                result.options[key] = true;
            }
        } else if (!result.command) {
            result.command = arg;
        } else {
            result.positional.push(arg);
        }
    }
    
    return result;
}

module.exports = {
    parseArgs
};
