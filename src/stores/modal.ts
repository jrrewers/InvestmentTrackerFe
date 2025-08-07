import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Position } from '@/types/api'

export type ModalType = 'position' | 'settings' | 'alert' | 'confirmation'

export interface ModalState {
  type: ModalType | null
  data: any
  activeTab?: number
  options?: Record<string, any>
}

export const useModalStore = defineStore('modal', () => {
  // State
  const currentModal = ref<ModalState>({
    type: null,
    data: null,
    activeTab: 0,
    options: {}
  })

  // Getters
  const isModalVisible = computed(() => !!currentModal.value.type)
  const isPositionModalVisible = computed(() => currentModal.value.type === 'position')
  const selectedPositionSymbol = computed(() => 
    currentModal.value.type === 'position' ? currentModal.value.data : null
  )
  
  // Generic modal actions
  function openModal(type: ModalType, data: any = null, options: Record<string, any> = {}) {
    currentModal.value = {
      type,
      data,
      activeTab: options.activeTab ?? 0,
      options
    }
  }

  function closeModal() {
    currentModal.value = {
      type: null,
      data: null,
      activeTab: 0,
      options: {}
    }
  }

  function setActiveTab(tabIndex: number) {
    if (currentModal.value.type) {
      currentModal.value.activeTab = tabIndex
    }
  }

  function updateModalData(data: any) {
    if (currentModal.value.type) {
      currentModal.value.data = data
    }
  }

  // Specific modal helpers
  function openPositionModal(symbol: string, tabIndex = 0) {
    openModal('position', symbol, { activeTab: tabIndex })
  }

  function openPosition(position: Position, tabIndex = 0) {
    openPositionModal(position.symbol, tabIndex)
  }

  function openSettingsModal() {
    openModal('settings')
  }

  function openAlertModal(message: string, options: Record<string, any> = {}) {
    openModal('alert', { message }, options)
  }

  function openConfirmationModal(
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void
  ) {
    openModal('confirmation', {
      title,
      message,
      onConfirm,
      onCancel
    })
  }

  return {
    // State
    currentModal,
    
    // Getters
    isModalVisible,
    isPositionModalVisible,
    selectedPositionSymbol,
    
    // Generic actions
    openModal,
    closeModal,
    setActiveTab,
    updateModalData,
    
    // Specific modal actions
    openPositionModal,
    openPosition,
    openSettingsModal,
    openAlertModal,
    openConfirmationModal
  }
})