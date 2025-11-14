<template>
  <div class="toast-container-wrapper">
    <TransitionGroup name="toast-list" tag="div">
      <Toast
        v-for="toast in toasts"
        :key="toast.id"
        :id="toast.id"
        :type="toast.type"
        :title="toast.title"
        :message="toast.message"
        :duration="toast.duration"
        @close="handleClose"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Toast from './Toast.vue'
import { toastService } from '../../core/services/ToastService'

const toasts = computed(() => toastService.getToasts())

const handleClose = (id: string) => {
  toastService.close(id)
}
</script>

<style scoped>
.toast-container-wrapper {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  pointer-events: none;
}

.toast-container-wrapper > * {
  pointer-events: auto;
}

.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s ease;
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-list-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-list-move {
  transition: transform 0.3s ease;
}
</style>
