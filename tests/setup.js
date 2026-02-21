/**
 * Jest 测试设置文件
 * 在所有测试运行前执行
 */

// 设置测试环境变量
process.env.NODE_ENV = 'test';

// 全局测试超时
jest.setTimeout(30000);

// 模拟 console 方法以控制输出
global.console = {
    ...console,
    // 在测试中保留错误和警告，但忽略日志
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: console.warn,
    error: console.error,
};
