import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface FileInfo {
  file: File
  id: string
  name: string
  size: number
  type: string
  url: string
}

export const useFilesStore = defineStore('files', () => {
  // State
  const files = ref<FileInfo[]>([])
  const selectedFileId = ref<string | null>(null)

  // Getters
  const selectedFile = computed(() => 
    files.value.find(f => f.id === selectedFileId.value) || null
  )
  
  const hasFiles = computed(() => files.value.length > 0)
  
  const totalSize = computed(() => 
    files.value.reduce((sum, f) => sum + f.size, 0)
  )

  // Actions
  function addFile(file: File): FileInfo {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const fileInfo: FileInfo = {
      file,
      id,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }
    files.value.push(fileInfo)
    if (!selectedFileId.value) {
      selectedFileId.value = id
    }
    return fileInfo
  }

  function removeFile(id: string) {
    const index = files.value.findIndex(f => f.id === id)
    if (index > -1) {
      URL.revokeObjectURL(files.value[index].url)
      files.value.splice(index, 1)
      if (selectedFileId.value === id) {
        selectedFileId.value = files.value[0]?.id || null
      }
    }
  }

  function selectFile(id: string) {
    selectedFileId.value = id
  }

  function clearFiles() {
    files.value.forEach(f => URL.revokeObjectURL(f.url))
    files.value = []
    selectedFileId.value = null
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    files,
    selectedFileId,
    selectedFile,
    hasFiles,
    totalSize,
    addFile,
    removeFile,
    selectFile,
    clearFiles,
    formatFileSize,
  }
})
