# LivePhoto Crafter - 项目结构

## 项目概述

本项目采用**大前端分离架构**，核心媒体处理逻辑下沉至共享层，UI层根据不同平台分别实现。

```
LivePhoto Crafter/
├── shared/                     # 共享核心逻辑（跨平台复用）
│   └── core/                   # 核心处理模块
│       ├── constants.js        # 常量定义（XMP模板、编码格式等）
│       ├── xmp.js              # XMP元数据处理
│       ├── extractor.js        # 实况照片提取逻辑
│       └── creator.js          # 实况照片创建逻辑
│
├── cli/                        # 命令行工具（Node.js）
│   └── ...                     # 现有CLI实现
│
├── web/                        # Web端（Vue3 + Vite + ffmpeg.wasm）
│   ├── src/
│   │   ├── components/         # Vue组件
│   │   │   ├── common/         # 通用组件
│   │   │   ├── home/           # 首页组件
│   │   │   └── layout/         # 布局组件
│   │   ├── composables/        # 组合式函数
│   │   ├── router/             # 路由配置
│   │   ├── stores/             # Pinia状态管理
│   │   ├── utils/              # 工具函数
│   │   ├── views/              # 页面视图
│   │   ├── App.vue
│   │   ├── main.ts
│   │   └── styles/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
│
├── desktop/                    # 桌面端（Tauri + Rust）
│   └── ...                     # 待开发
│
├── mobile/                     # 移动端（React Native / Flutter）
│   └── ...                     # 待开发
│
└── docs/                       # 文档
    ├── CLI.md
    └── TESTING.md
```

## 技术栈

### Web端
- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **状态管理**: Pinia
- **路由**: Vue Router
- **视频处理**: ffmpeg.wasm (浏览器端FFmpeg)

### 核心处理逻辑
- **XMP处理**: 纯JavaScript/TypeScript实现，跨平台复用
- **二进制操作**: Uint8Array处理，兼容浏览器和Node.js

## 功能模块

### 1. 视频转实况照片 (`/create`)
- 上传视频文件
- 选择编码格式（H.264/HEVC/不编码）
- 设置封面时间戳
- 可选自定义封面图
- 生成兼容Google Motion Photo V2格式的实况照片

### 2. 提取实况照片 (`/extract`)
- 上传实况照片文件
- 自动检测格式（Google V2/旧版/MicroVideo）
- 提取视频和封面图
- 分别下载

### 3. 视频编辑 (`/edit`)
- 剪辑视频时长
- 移除音轨
- 转换编码格式

## 开发计划

### Phase 1: Web端 MVP ✅
- [x] 项目架构搭建
- [x] 核心XMP处理逻辑（浏览器适配）
- [x] FFmpeg.wasm集成
- [x] UI组件开发
- [x] 视频转实况照片
- [x] 实况照片提取
- [x] 视频编辑功能

### Phase 2: 桌面端
- [ ] Tauri项目搭建
- [ ] 调用原生FFmpeg
- [ ] 共享核心逻辑复用

### Phase 3: 移动端
- [ ] React Native/Flutter项目搭建
- [ ] ffmpeg-kit集成
- [ ] 移动端UI适配

## 运行Web端

```bash
cd web
npm install
npm run dev
```

## 构建

```bash
cd web
npm run build
```
