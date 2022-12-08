<script setup>
import FormField from './FormField.vue';

defineProps({
  styleFields: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div
    class="row row-cols-1 row-cols-sm-2 row-cols-lg-1 row-cols-xl-2 gx-4 gy-3"
  >
    <div
      v-for="{ style, input } in styleFields"
      :key="style['stanza:key']"
      class="col"
    >
      <FormField
        :input="input"
        :name="style['stanza:key']"
        :type="style['stanza:type']"
        :choices="style['stanza:choice']"
        :help-text="style['stanza:description']"
      ></FormField>
    </div>
  </div>

  <p v-if="styleFields.length === 0" class="fst-italic">No styles defined.</p>
</template>
