<template>
  <label class="form-label">
    <span v-if="required" class="text-danger">*</span>
    {{name}}
  </label>

  <div class="input-group">
    <template v-if="formType === 'single-choice'">
      <select :value="input.ref.value" @change="input.setValue($event.target.value)" class="form-select">
        <option v-for="choice in choices" :value="choice" :key="choice">{{choice}}</option>
      </select>
    </template>

    <template v-else-if="formType === 'boolean'">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" :checked="input.ref.value === 'true'" @change="input.setValue($event.target.checked)" :id="name">
        <label class="form-check-label" :for="name">
          {{helpText}}
        </label>
      </div>
    </template>

    <input v-else :type="formType" :value="input.ref.value" @input="input.setValue($event.target.value)" class="form-control" :class="{'form-control-color': formType === 'color'}">

    <button v-if="input.hasDefault" @click="input.resetToDefault()" :disabled="input.isDefault.value" type="button" class="btn btn-light border">Reset</button>
  </div>

  <small class="form-text text-muted" v-if="formType !== 'boolean'">
    {{helpText}}
  </small>
</template>

<script>
import { computed, defineComponent } from 'vue';

export default defineComponent({
  props: [
    'choices',
    'helpText',
    'input',
    'name',
    'required',
    'type',
  ],

  setup(props) {

    const formType = computed(() => {
      return props.type === "datetime" ? "datetime-local" : props.type;
    });

    return {...props, formType};
  }
});
</script>
