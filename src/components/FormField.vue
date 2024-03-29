<template>
  <label class="form-label d-flex">
    <span class="me-auto">
      <span v-if="required" class="text-danger">*</span>
      <span class="text-muted">{{ prefix }}</span
      ><span class="fs-5">{{ shortName }} </span>
    </span>
    <small class="text-muted">{{ type || 'string' }}</small>
  </label>

  <div class="input-group">
    <template v-if="formType === 'single-choice'">
      <select
        :value="input.valueStr.value"
        @change="input.setValueStr($event.target.value)"
        class="form-select"
      >
        <option v-for="choice in choices" :value="choice" :key="choice">
          {{ choice }}
        </option>
      </select>
    </template>

    <template v-else-if="formType === 'boolean'">
      <div class="input-group-text">
        <input
          class="form-check-input mt-0"
          type="checkbox"
          :checked="input.valueParsed.value"
          @change="input.setValueStr($event.target.checked.toString())"
          :id="name"
        />
      </div>

      <label class="input-group-text flex-fill bg-body" :for="name">
        {{ label }}
      </label>
    </template>

    <input
      v-else
      :type="formType"
      :value="input.valueStr.value"
      @input="input.setValueStr($event.target.value)"
      class="form-control mw-100"
      :class="{ 'form-control-color': formType === 'color' }"
    />

    <button
      v-if="input.hasDefault"
      @click="input.resetToDefault()"
      :disabled="input.isDefault.value"
      type="button"
      class="btn btn-light border"
    >
      Reset
    </button>
  </div>

  <small class="form-text text-muted">
    {{ helpText }}
  </small>
</template>

<script>
import { computed, defineComponent } from 'vue';

function removePrefix(str, prefix) {
  if (prefix === str) {
    return '';
  } else if (str.startsWith(prefix + '-')) {
    return str.slice(prefix.length + 1);
  }
  return str;
}

export default defineComponent({
  props: [
    'choices',
    'helpText',
    'input',
    'name',
    'required',
    'type',
    'label',
    'pathPrefix',
  ],
  setup(props) {
    const shortName = computed(() => {
      return removePrefix(props.name, props.pathPrefix);
    });
    const prefix = computed(() => {
      return props.name === props.pathPrefix
        ? props.pathPrefix
        : props.pathPrefix + '-';
    });
    const formType = computed(() => {
      return props.type === 'datetime' ? 'datetime-local' : props.type;
    });
    return { ...props, formType, shortName, prefix };
  },
});
</script>
