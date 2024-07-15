<template>
  <button
      class="btn"
      :class="{ 'btn-primary': primary, 'btn-loading': loading }"
      :disabled="disabled || loading"
      v-bind="$attrs"
  >
    <span v-if="!loading">
      <slot></slot>
    </span>
    <span v-else class="loading-spinner"></span>
  </button>
</template>

<script setup>
defineProps({
  primary: {type: Boolean, default: true},
  loading: {type: Boolean, default: false},
  disabled: {type: Boolean, default: false}
});
</script>

<style scoped>
.btn {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-color-dark);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-loading {
  position: relative;
  color: transparent;
}

.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  transform: translate(-50%, -50%);
}

@keyframes spin {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
</style>