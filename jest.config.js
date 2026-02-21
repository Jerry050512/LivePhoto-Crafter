/**
 * Jest 配置文件
 */

module.exports = {
    // 测试环境
    testEnvironment: 'node',
    
    // 测试文件匹配模式
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    
    // 覆盖率收集目录
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/cli/index.js', // CLI 入口不测试
        '!**/node_modules/**'
    ],
    
    // 覆盖率报告目录
    coverageDirectory: 'coverage',
    
    // 覆盖率报告格式
    coverageReporters: [
        'text',
        'text-summary',
        'lcov',
        'html'
    ],
    
    // 测试超时时间（毫秒）
    testTimeout: 30000,
    
    // 模块路径别名
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    
    // 设置文件
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    
    // 忽略模式
    testPathIgnorePatterns: [
        '/node_modules/',
        '/output/',
        '/test-data/'
    ],
    
    // 详细输出
    verbose: true,
    
    // 失败时停止
    bail: 0,
    
    // 缓存目录
    cacheDirectory: '.jest-cache'
};
