# LivePhoto Crafter CLI 文档

## 简介

LivePhoto Crafter CLI 是一个命令行工具，用于处理实况照片（Motion Photo / Live Photo）。支持将视频转换为实况照片，以及从实况照片中提取视频和封面图。

## 安装

### 环境要求

- Node.js >= 14.0.0
- FFmpeg（必须安装并添加到系统 PATH）

### 安装 FFmpeg

**Windows:**
1. 下载 FFmpeg: https://ffmpeg.org/download.html
2. 解压并添加到系统 PATH
3. 验证安装: `ffmpeg -version`

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

### 安装 CLI 工具

```bash
# 克隆仓库
git clone <repository-url>
cd livephoto-crafter

# 安装依赖
npm install
```

## 使用方法

### 基本语法

```bash
node src/cli/index.js <命令> [参数] [选项]
```

### 全局选项

- `--help, -h` - 显示帮助信息

### 可用命令

#### 1. extract - 提取实况照片

从实况照片中提取视频和封面图。

**语法:**
```bash
node cli.js extract <实况照片路径> [输出目录]
```

**参数:**
- `<实况照片路径>` - 要提取的实况照片文件路径（必需）
- `[输出目录]` - 输出目录（可选，默认: output）

**示例:**
```bash
# 提取到默认目录
node src/cli/index.js extract test-data/live-photo.jpg

# 指定输出目录
node src/cli/index.js extract test-data/live-photo.jpg output/
```

**输出:**
- `extracted_cover.jpg` - 提取的封面图
- `extracted_video.mp4` - 提取的视频

#### 2. create - 创建实况照片

将视频转换为实况照片。

**语法:**
```bash
node cli.js create <视频路径> [选项] [输出路径]
```

**参数:**
- `<视频路径>` - 输入视频文件路径（必需）
- `[输出路径]` - 输出文件路径（可选，默认: output/motion-photo.jpg）

**选项:**
- `--codec <格式>` - 视频编码格式（可选，默认: h264）
  - `h264` - H.264/AVC，兼容性最好，支持所有设备
  - `hevc` - H.265/HEVC，更好的压缩率，但兼容性较差
  - `copy` - 不重新编码，直接复制原视频
- `--cover <路径>` - 指定封面图路径（可选，默认从视频提取首帧）
- `--timestamp <时间>` - 封面时间戳（可选，默认: 00:00:00.000）

**示例:**
```bash
# 使用 H.264 编码（推荐，兼容性最好）
node src/cli/index.js create test-data/video.mp4 output/live.jpg

# 使用 HEVC 编码（文件更小）
node src/cli/index.js create test-data/video.mp4 --codec hevc output/live-hevc.jpg

# 不重新编码
node src/cli/index.js create test-data/video.mp4 --codec copy output/live-copy.jpg

# 使用自定义封面
node src/cli/index.js create test-data/video.mp4 --codec h264 --cover my-cover.jpg output/live.jpg

# 指定封面时间戳
node src/cli/index.js create test-data/video.mp4 --codec h264 --timestamp 00:00:01.500 output/live.jpg
```

#### 3. mute - 移除音轨

移除视频的音轨。

**语法:**
```bash
node cli.js mute <视频路径> [输出路径]
```

**参数:**
- `<视频路径>` - 输入视频文件路径（必需）
- `[输出路径]` - 输出文件路径（可选，默认: output/muted.mp4）

**示例:**
```bash
node src/cli/index.js mute test-data/video.mp4
node src/cli/index.js mute test-data/video.mp4 output/muted.mp4
```

#### 4. trim - 剪辑视频

剪辑视频的指定时间段。

**语法:**
```bash
node cli.js trim <视频路径> <开始时间> <结束时间> [输出路径]
```

**参数:**
- `<视频路径>` - 输入视频文件路径（必需）
- `<开始时间>` - 开始时间，格式如: `00:00:01` 或 `1.5`
- `<结束时间>` - 结束时间，格式如: `00:00:05` 或 `5.0`
- `[输出路径]` - 输出文件路径（可选，默认: output/trimmed.mp4）

**示例:**
```bash
# 使用时分秒格式
node src/cli/index.js trim test-data/video.mp4 00:00:01 00:00:05

# 使用秒数格式
node src/cli/index.js trim test-data/video.mp4 1.5 5.0 output/trimmed.mp4
```

## 编码格式说明

### H.264 (默认)

- **优点:** 兼容性最好，支持所有设备和平台
- **缺点:** 文件相对较大
- **适用场景:** 需要最大兼容性的情况

### HEVC (H.265)

- **优点:** 更好的压缩率，文件更小
- **缺点:** 兼容性较差，某些设备可能无法播放
- **适用场景:** 手机设备，文件大小敏感的情况

### COPY

- **优点:** 不重新编码，速度最快，无质量损失
- **缺点:** 兼容性取决于原视频编码
- **适用场景:** 原视频已经是兼容编码格式

## 常见问题

### 1. FFmpeg 未找到

**错误信息:**
```
错误: 缺少必要的依赖
  - FFmpeg 未安装或不在 PATH 中
```

**解决方案:**
- 安装 FFmpeg 并确保它在系统 PATH 中
- 重新打开终端使 PATH 更改生效

### 2. 视频编码不支持

**错误信息:**
```
错误: 不支持的编码格式: xxx
```

**解决方案:**
- 使用支持的编码格式: `h264`, `hevc`, `copy`

### 3. 文件不存在

**错误信息:**
```
错误: 文件不存在: xxx
```

**解决方案:**
- 检查文件路径是否正确
- 使用绝对路径或相对于当前工作目录的相对路径

## 使用示例

### 完整工作流程

```bash
# 1. 从实况照片提取视频
node src/cli/index.js extract test-data/live-photo.jpg output/

# 2. 剪辑提取的视频
node src/cli/index.js trim output/extracted_video.mp4 00:00:01 00:00:05 output/trimmed.mp4

# 3. 创建新的实况照片
node src/cli/index.js create output/trimmed.mp4 output/new-live-photo.jpg

# 4. 验证创建的实况照片
node src/cli/index.js extract output/new-live-photo.jpg output/verify/
```

## 退出代码

- `0` - 成功
- `1` - 错误（参数错误、文件不存在、处理失败等）

## 相关文档

- [API 文档](./API.md) - 程序化使用接口
- [测试文档](./TESTING.md) - 单元测试说明
