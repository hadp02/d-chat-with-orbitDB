<template>
  <div class="input-group">
    <label :for="id">{{ label }}</label>
    <input
        :id="id"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="input"
        v-bind="$attrs"
    >
  </div>
</template>

<script setup>
defineProps({
  id: String,
  label: String,
  modelValue: String,
  type: {type: String, default: 'text'}
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.input-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
}

.input {
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 16px;
}

.input:focus {
  outline: none;
  border-color: var(--primary-color);
}
</style>