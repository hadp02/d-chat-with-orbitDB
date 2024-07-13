<template>
  <p v-if="error" class="error">Error: {{ error }}</p>
</template>

<script setup>
defineProps({
  error: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.error {
  color: red;
  font-weight: bold;
}
</style>