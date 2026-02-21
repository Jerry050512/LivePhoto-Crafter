# LivePhoto Crafter (实况照片转换与提取工具)

## 📌 项目简介

本项目旨在开发一个跨端（Web、桌面、Android）的实况照片（Motion Photo / Live Photo）处理工具。核心功能包括：将普通视频转换为兼容主流设备（小米、Google 相册、Windows 照片）的实况照片，以及从现有的实况照片中无损提取视频与静态封面。

## 🛠 技术栈选型 (多端架构)

为了实现“一次开发，多端覆盖”且保证音视频处理的性能，项目采用**大前端分离架构**，核心媒体处理下沉至底层或 WebAssembly。

* **核心多媒体引擎:** `FFmpeg` (行业标准的音视频处理库)
* **元数据处理:** `ExifTool` (用于提取和重写 XMP 元数据，Web 端可替换为 `piexifjs` 或自定义二进制解析器)
* **Web 端:**
* UI 框架: `Vue 3` 或 `React` (Vite 构建)
* 处理引擎: `ffmpeg.wasm` (浏览器端直接处理，保护隐私，免服务器带宽高压)


* **桌面端 (Windows / macOS):**
* 框架: `Tauri` (Rust + Web UI，包体积极小，性能极高)
* 处理引擎: 桌面原生 `FFmpeg` 二进制调用 (通过 Rust `std::process::Command` 调用，绕过 WASM 性能瓶颈)


* **Android 端:**
* 框架: `React Native` 或 `Flutter`
* 处理引擎: `ffmpeg-kit-react-native` (调用原生设备的硬解码能力)

## 📂 核心数据结构：Google Motion Photo (V2)

主流安卓阵营（如小米）遵循 Google 提出的 Motion Photo 标准。这是一个**单文件**结构：

1. **前端 (JPEG):** 包含标准的 JPEG 图片数据，以及特定的 `XMP` 标签。
2. **后端 (MP4):** 紧跟在 JPEG 文件结束符 (`FF D9`) 之后，直接追加完整的 MP4 视频流。
3. **桥梁 (XMP-GContainer):** JPEG 的头部包含 XMP 扩展元数据，其中最重要的字段是 `DirectoryItemLength`，它标记了文件末尾附带的 MP4 视频的**精确字节大小**。播放器依靠这个大小从后向前截取视频。

## ⚙️ 核心功能实现逻辑

### 功能一：从实况照片提取视频 (Demuxing)

**逻辑梳理：**
不需要重新编码，只需进行二进制切割，实现毫秒级提取。

**具体步骤：**

1. **读取元数据：** 读取文件的 XMP 信息，寻找 `XMP-GContainer:DirectoryItemLength` 的值（例如：`6968796` 字节）。如果存在旧版标签，则寻找 `XMP-GCamera:MicroVideoOffset`。
2. **计算偏移量：** * 如果是 `DirectoryItemLength`，这个值就是视频的文件大小 ()。
* 视频起始字节位置 = 总文件大小 () - 。


3. **文件切割：**
* 从 `0` 到 `(总大小 - 视频大小)` 截取，保存为 `cover.jpg`。
* 从 `(总大小 - 视频大小)` 到 `文件末尾` 截取，保存为 `video.mp4`。

### 功能二：将视频转换为实况照片 (Muxing)

**逻辑梳理：**
需要准备一张封面图 (JPEG) 和一段视频 (MP4)，修改封面图的元数据，然后把两者拼合在一起。

**具体步骤：**

1. **生成封面图 (可选)：** 如果用户没有提供封面图，使用 FFmpeg 从视频中抽取一帧（默认首帧或用户指定时间）。
* *命令:* `ffmpeg -ss <时间戳> -i input.mp4 -vframes 1 cover.jpg`


2. **获取视频大小：** 读取即将被拼接的 `input.mp4` 的准确文件大小（字节数）。
3. **注入 XMP 元数据：** 向 `cover.jpg` 中注入 Google Motion Photo 必须的 XMP 标签。
* `MotionPhoto=1`
* `DirectoryItemMime="image/jpeg, video/mp4"`
* `DirectoryItemLength=<MP4文件的准确字节数>`
* *(可选)* `MotionPhotoPresentationTimestampUs=<封面图对应的视频时间戳，微秒>`

4. **二进制拼合：** 将注入了元数据的 `cover.jpg` 的二进制流与 `input.mp4` 的二进制流合并。
* *伪代码:* `OutputFile = File.read(cover.jpg) + File.read(input.mp4)`

### 功能三：进阶功能 (可选)

通过前置处理 MP4 或修改 XMP 来实现进阶功能：

* **修改封面图：** 让用户上传新图片，或者拖动滑块选择视频的某一帧。记录下该帧的时间戳，转换为微秒并写入 XMP 的 `MotionPhotoPresentationTimestampUs`，然后重新执行**功能二**。
* **静音实况：** 在合并之前，利用 FFmpeg 移除视频流的音轨。
* *命令:* `ffmpeg -i input.mp4 -c:v copy -an muted_video.mp4`，然后将 `muted_video.mp4` 拼接到 JPEG 后面。


* **剪辑时间长度：** 在合并之前，利用 FFmpeg 对视频进行裁剪。
* *命令:* `ffmpeg -i input.mp4 -ss <开始时间> -to <结束时间> -c copy trimmed.mp4`。注意：裁剪后 MP4 文件大小会改变，必须重新计算 `DirectoryItemLength` 再注入 JPEG。

## 🚀 最小可行性产品 (MVP) 开发路线

1. **Phase 1 (脚本验证):** 使用 Node.js 或 Python 写出读取文件、提取 MP4、拼合 MP4 的 CLI 脚本，确保输出的文件能在小米相册正常播放实况。
2. **Phase 2 (Web 基础版):** 搭建 Vue3 界面，引入 `ffmpeg.wasm` 和 `exiftool-vendored` (或纯前端 Exif 库)，实现在浏览器内完成视频转实况照片。
3. **Phase 3 (桌面/移动端适配):** 将核心逻辑迁移至 Tauri (桌面) 和 React Native (Android)，接入原生系统的相册读写权限。
