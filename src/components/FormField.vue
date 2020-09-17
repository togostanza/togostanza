<template>
  <label class="form-label">
    <span v-if="required" class="text-danger">*</span>
    {{label}}
  </label>

  <div class="input-group">
    <template v-if="type === 'single-choice'">
      <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)" class="form-select">
        <option v-for="choice in choices" :value="choice" :key="choice">{{choice}}</option>
      </select>
    </template>

    <input v-else :type="type" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" class="form-control">

    <div v-if="defaultValue !== undefined" class="input-group-append">
      <button @click="resetToDefault()" :disabled="modelValue === defaultValue" type="button" class="btn btn-light border">Reset</button>
    </div>
  </div>

  <small class="form-text text-muted">
    {{helpText}}
  </small>
</template>

<script>
import { defineComponent, toRefs } from 'vue';

export default defineComponent({
  props: [
    'choices',
    'defaultValue',
    'helpText',
    'label',
    'modelValue',
    'required',
    'type',
  ],

  setup(props, {emit}) {
    function resetToDefault() {
      emit('update:modelValue', props.defaultValue);
    }

    return {
      resetToDefault,

      ...toRefs(props)
    };
  }
});
</script>
