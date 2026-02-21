<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-surface-50"></div>
      <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-100/50 to-transparent"></div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-8 animate-fade-in">
            <span class="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
            完全本地处理，保护您的隐私
          </div>
          
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-surface-900 mb-6 leading-tight animate-slide-up">
            实况照片
            <span class="text-gradient">转换与提取</span>
          </h1>
          
          <p class="text-lg sm:text-xl text-surface-600 mb-10 animate-slide-up" style="animation-delay: 0.1s">
            将普通视频转换为兼容主流设备的实况照片，<br class="hidden sm:block">
            或从实况照片中无损提取视频与静态封面。
          </p>
          
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style="animation-delay: 0.2s">
            <router-link to="/create" class="btn-primary w-full sm:w-auto text-lg px-8 py-4">
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              视频转实况照片
            </router-link>
            <router-link to="/extract" class="btn-secondary w-full sm:w-auto text-lg px-8 py-4">
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              提取视频与封面
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 lg:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-surface-900 mb-4">核心功能</h2>
          <p class="text-surface-600">简洁高效的实况照片处理工具</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <FeatureCard
            v-for="(feature, index) in features"
            :key="feature.title"
            v-bind="feature"
            :delay="index * 0.1"
          />
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-16 lg:py-24 bg-surface-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-surface-900 mb-4">如何使用</h2>
          <p class="text-surface-600">简单三步，轻松处理实况照片</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <StepCard
            v-for="(step, index) in steps"
            :key="step.title"
            :step="index + 1"
            v-bind="step"
          />
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 lg:py-24">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="card p-8 lg:p-12 text-center bg-gradient-to-br from-primary-600 to-primary-700 text-white border-0">
          <h2 class="text-3xl font-bold mb-4">开始处理您的实况照片</h2>
          <p class="text-primary-100 mb-8 text-lg">
            无需安装软件，无需上传服务器，所有处理都在浏览器本地完成
          </p>
          <router-link to="/create" class="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-colors shadow-lg">
            立即开始
            <svg class="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import FeatureCard from '@/components/home/FeatureCard.vue'
import StepCard from '@/components/home/StepCard.vue'

const features = [
  {
    icon: 'Video',
    title: '视频转实况',
    description: '将普通 MP4 视频转换为兼容小米、Google 相册的实况照片格式',
  },
  {
    icon: 'Download',
    title: '无损提取',
    description: '从实况照片中提取原始视频和静态封面，保持最佳画质',
  },
  {
    icon: 'Shield',
    title: '隐私保护',
    description: '所有处理在浏览器本地完成，文件不会上传到任何服务器',
  },
]

const steps = [
  {
    title: '选择文件',
    description: '上传您要处理的视频或实况照片文件',
  },
  {
    title: '配置选项',
    description: '选择编码格式、封面时间戳等参数',
  },
  {
    title: '下载结果',
    description: '处理完成后直接下载到本地',
  },
]
</script>
