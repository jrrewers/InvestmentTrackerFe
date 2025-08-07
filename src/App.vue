<template>
  <div class="app">
    <header class="surface-card shadow-2 px-4 py-3 mb-4">
      <div class="flex align-items-center">
        <h1 class="text-2xl font-bold text-primary m-0">Investment Tracker</h1>
        <div class="flex-1"></div>
        <ConnectionStatus />
      </div>
    </header>
    
    <main>
      <RouterView />
    </main>
    
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import Toast from 'primevue/toast'
import ConnectionStatus from './components/ConnectionStatus.vue'
</script>

<style scoped>
.app {
  min-height: 100vh;
  background-color: var(--surface-ground);
}
</style>