<template>
  <div class="flex align-items-center gap-2">
    <Tag
      :value="statusText"
      :severity="statusSeverity"
      :icon="statusIcon"
      class="pl-2"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Tag from 'primevue/tag'
import { useIBKRStatus } from '@/composables/usePortfolio'

const { data: status, isLoading, isError } = useIBKRStatus()

const statusText = computed(() => {
  if (isLoading.value) return 'Checking...'
  if (isError.value) return 'Error'
  if (status.value?.connected) return 'IBKR Connected'
  return 'IBKR Disconnected'
})

const statusSeverity = computed(() => {
  if (isLoading.value) return 'info'
  if (isError.value) return 'danger'
  if (status.value?.connected) return 'success'
  return 'warning'
})

const statusIcon = computed(() => {
  if (isLoading.value) return 'pi pi-spin pi-spinner'
  if (isError.value) return 'pi pi-times'
  if (status.value?.connected) return 'pi pi-check'
  return 'pi pi-exclamation-triangle'
})
</script>