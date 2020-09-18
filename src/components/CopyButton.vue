<template>
  <button type="button" @click="copyToClipboard()" v-bind="$attrs">
    <template v-if="isCopiedShown">
      <span v-html="checkIcon.toSVG({height: 19})"></span>
      Copied
    </template>

    <template v-else>
      Copy to clipboard
    </template>
  </button>
</template>

<script>
import { defineComponent, ref } from 'vue';

import debounce from 'lodash.debounce';
import { check as checkIcon } from '@primer/octicons';

export default defineComponent({
  props: ['value'],

  setup(props) {
    const isCopiedShown = ref(false);

    const hideCopiedDebounced = debounce(() => {
      isCopiedShown.value = false;
    }, 1_500);

    async function copyToClipboard() {
      await navigator.clipboard.writeText(props.value);

      isCopiedShown.value = true;
      hideCopiedDebounced();
    }

    return {
      isCopiedShown,
      copyToClipboard,
      checkIcon
    };
  }
});
</script>
