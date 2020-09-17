<template>
  <label class="form-label">
    <span v-if="required" class="text-danger">*</span>
    {{label}}
  </label>

  <div class="input-group">
    <template v-if="type === 'single-choice'">
      <select :value="input.ref.value" @change="input.setValue($event.target.value)" class="form-select">
        <option v-for="choice in choices" :value="choice" :key="choice">{{choice}}</option>
      </select>
    </template>

    <input v-else :type="type" :value="input.ref.value" @input="input.setValue($event.target.value)" class="form-control">

    <div v-if="input.hasDefault" class="input-group-append">
      <button @click="input.resetToDefault()" :disabled="input.isDefault.value" type="button" class="btn btn-light border">Reset</button>
    </div>
  </div>

  <small class="form-text text-muted">
    {{helpText}}
  </small>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  props: [
    'choices',
    'helpText',
    'input',
    'label',
    'required',
    'type',
  ],

  setup(props) {
    return props;
  }
});
</script>
