<template>
  <div class="relative flex flex-col items-center text-center">
    <!-- Step Number -->
    <div class="w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-primary-500/30">
      {{ step }}
    </div>
    
    <!-- Connector Line -->
    <div v-if="step < 3" class="hidden md:block absolute top-7 left-[60%] w-[calc(100%-2rem)] h-0.5 bg-surface-200"></div>
    
    <h3 class="text-xl font-semibold text-surface-900 mb-3">{{ title }}</h3>
    <p class="text-surface-600">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  step: number
  title: string
  description: string
}

defineProps<Props>()
</script>
