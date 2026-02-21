# LivePhoto Crafter 测试文档

## 简介

本项目使用 [Jest](https://jestjs.io/) 作为测试框架，提供全面的单元测试覆盖。

## 测试结构

```
tests/
├── setup.js              # 测试设置文件
├── fixtures/             # 测试夹具（测试数据）
├── unit/                 # 单元测试
│   ├── constants.test.js # 常量模块测试
│   ├── xmp.test.js       # XMP 处理模块测试
│   ├── extractor.test.js # 提取功能模块测试
│   ├── file.test.js      # 文件工具模块测试
│   └── parser.test.js    # 参数解析模块测试
└── integration/          # 集成测试（待添加）
```

## 运行测试

### 运行所有测试

```bash
npm test
```

### 运行测试并监视文件变化

```bash
npm run test:watch
```

### 生成覆盖率报告

```bash
npm run test:coverage
```

覆盖率报告将生成在 `coverage/` 目录中。

## 测试模块说明

### 1. constants.test.js

测试常量定义模块。

**测试内容:**
- `XMP_TEMPLATE` - 验证 XMP 模板包含必要的占位符和命名空间
- `MICROVIDEO_TEMPLATE` - 验证 MicroVideo 模板
- `VideoCodec` - 验证视频编码格式常量
- `VideoCodecDescription` - 验证编码格式描述
- `JpegMarkers` - 验证 JPEG 标记常量
- `Mp4Boxes` - 验证 MP4 Box 类型常量

### 2. xmp.test.js

测试 XMP 元数据处理模块。

**测试内容:**
- `generateXmp()` - 生成 XMP 数据
  - 正确生成带视频长度和时间戳的 XMP
  - 对无效视频长度抛出错误
  - 默认时间戳为 0
  
- `isValidJpeg()` - 验证 JPEG 文件头
  - 正确识别有效的 JPEG
  - 正确识别无效的 JPEG
  - 处理空缓冲区
  
- `findXmpInsertPosition()` - 查找 XMP 插入位置
  - 在 SOI 后找到正确位置
  - 处理最小 JPEG
  
- `createXmpSegment()` - 创建 XMP APP1 段
  - 创建有效的 XMP 段
  - 包含 XMP 命名空间
  
- `injectXmpToJpeg()` - 注入 XMP 到 JPEG
  - 对无效 JPEG 抛出错误
  - 成功注入 XMP
  
- `extractXmpFromBuffer()` - 从缓冲区提取 XMP
  - 成功提取 XMP 数据
  - 无 XMP 时返回 null
  - 不完整 XMP 返回 null

### 3. extractor.test.js

测试实况照片提取模块。

**测试内容:**
- `detectVideoInfo()` - 检测视频信息
  - 检测 Google Motion Photo V2 格式
  - 检测旧版 Google 格式
  - 检测 MicroVideo 格式
  - 检测 MicroVideoOffset 格式
  - 通过 MP4 头检测
  - 无效数据返回 null
  
- `findJpegEnd()` - 查找 JPEG 结束位置
  - 找到 EOI 标记
  - 无 EOI 时返回 maxPos
  - EOI 超出范围时返回 maxPos
  
- `findMp4Start()` - 查找 MP4 开始位置
  - 找到 ftyp 头
  - 找到偏移位置的 ftyp
  - 无 ftyp 时返回 -1
  - 空缓冲区返回 -1

### 4. file.test.js

测试文件工具模块。

**测试内容:**
- `ensureDir()` - 确保目录存在
  - 创建不存在的目录
  - 目录已存在时不抛出错误
  - 创建嵌套目录
  
- `cleanupTempFiles()` - 清理临时文件
  - 删除存在的文件
  - 不存在的文件不抛出错误
  - 处理空数组
  
- `getExtension()` - 获取文件扩展名
  - 返回小写扩展名
  - 无扩展名返回空字符串
  - 处理带目录的路径
  
- `fileExists()` - 检查文件是否存在
  - 存在的文件返回 true
  - 不存在的文件返回 false
  - 存在的目录返回 true
  
- `getFileSize()` - 获取文件大小
  - 返回正确的文件大小
  - 不存在的文件抛出错误
  
- `formatFileSize()` - 格式化文件大小
  - 格式化字节
  - 格式化 KB
  - 格式化 MB
  - 格式化 GB
  
- `generateTempPath()` - 生成临时文件路径
  - 生成唯一路径
  - 包含指定目录
  - 包含前缀
  - 包含扩展名

### 5. parser.test.js

测试命令行参数解析模块。

**测试内容:**
- `parseArgs()` - 解析参数
  - 解析命令
  - 解析多个位置参数
  - 解析带值的选项
  - 解析无值的选项（布尔值）
  - 解析混合参数
  - 处理空参数
  - 处理只有选项
  - 处理选项在末尾
  - 处理选项在位置参数之间

## 编写新测试

### 测试文件模板

```javascript
/**
 * 模块名称单元测试
 */

const moduleName = require('../../src/path/to/module');

describe('Module Name', () => {
    describe('functionName', () => {
        it('should do something', () => {
            // Arrange
            const input = 'test';
            
            // Act
            const result = moduleName.functionName(input);
            
            // Assert
            expect(result).toBe('expected');
        });

        it('should throw error for invalid input', () => {
            expect(() => {
                moduleName.functionName(null);
            }).toThrow('错误信息');
        });
    });
});
```

### 测试最佳实践

1. **每个测试只测试一个概念**
   ```javascript
   // 好的做法
   it('should return true for valid JPEG', () => { ... });
   it('should return false for invalid JPEG', () => { ... });
   
   // 避免
   it('should handle JPEG validation', () => {
       // 测试多个概念
   });
   ```

2. **使用描述性的测试名称**
   ```javascript
   // 好的做法
   it('should generate XMP with video length', () => { ... });
   
   // 避免
   it('test generateXmp', () => { ... });
   ```

3. **Arrange-Act-Assert 模式**
   ```javascript
   it('should do something', () => {
       // Arrange - 设置测试数据
       const input = 'test';
       
       // Act - 执行被测试的操作
       const result = functionUnderTest(input);
       
       // Assert - 验证结果
       expect(result).toBe('expected');
   });
   ```

4. **清理测试数据**
   ```javascript
   describe('File Utils', () => {
       let tempDir;
       
       beforeEach(() => {
           tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-'));
       });
       
       afterEach(() => {
           // 清理测试数据
           fs.rmSync(tempDir, { recursive: true, force: true });
       });
       
       // 测试用例...
   });
   ```

## 测试覆盖率

当前测试覆盖率:

| 模块 | 覆盖率 |
|------|--------|
| constants.js | 100% |
| xmp.js | 100% |
| extractor.js | 100% |
| file.js | 100% |
| parser.js | 100% |

## 持续集成

建议在 CI/CD 流程中运行测试:

```yaml
# .github/workflows/test.yml 示例
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install FFmpeg
      run: sudo apt-get install ffmpeg
    
    - name: Install dependencies
      run: npm install
    
    - name: Run tests
      run: npm test
    
    - name: Generate coverage report
      run: npm run test:coverage
```

## 故障排除

### 测试超时

如果测试超时，可以增加超时时间:

```javascript
// 单个测试
test('slow test', async () => {
    // 测试代码
}, 10000); // 10秒超时

// 整个文件
jest.setTimeout(30000); // 30秒超时
```

### 异步测试

```javascript
// Promise
it('should resolve with data', () => {
    return expect(fetchData()).resolves.toBe('data');
});

// async/await
it('should resolve with data', async () => {
    const data = await fetchData();
    expect(data).toBe('data');
});
```

## 相关文档

- [CLI 文档](./CLI.md) - 命令行工具使用说明
- [API 文档](./API.md) - 程序化使用接口
