<template>
  <div class="bg-dark">
    <div class="text-right p-2">
      <CopyButton :value="combinedSnippet" class="btn btn-sm btn-light"></CopyButton>
    </div>

    <pre class="overflow-auto p-3 pt-0 text-white"><code>{{combinedSnippet}}</code></pre>
  </div>

  <div class="overflow-auto p-3 bg-light">
    <div v-html="styleSnippet"></div>
    <div v-html="elementSnippet"></div>
  </div>
</template>

<script>
import outdent from 'outdent';
import { defineComponent, ref, computed } from 'vue';

import CopyButton from './CopyButton.vue';

export default defineComponent({
  props: ['metadata', 'params', 'styleVars'],

  components: {
    CopyButton
  },

  setup(props) {
    const id      = props.metadata['@id'];
    const tagName = `togostanza-${id}`;

    const elementSnippet = computed(() => {
      if (props.params.length === 0) { return `<${tagName}></${tagName}>`; }

      const attrs = props.params.map(({name, value}) => `${name}=${JSON.stringify(value)}`)

      return outdent`
        <${tagName}
        ${attrs.map(s => ' '.repeat(2) + s).join('\n')}
        ></${tagName}>
      `;
    });

    const styleSnippet = computed(() => {
      if (props.styleVars.length === 0) { return null; }

      const styles = props.styleVars.map(({name, value}) => `${name}: ${value};`);

      return outdent`
        <style>
          ${tagName} {
        ${styles.map(s => ' '.repeat(4) + s).join('\n')}
          }
        </style>
      `;
    });

    const scriptSrc = new URL(`./${id}.js`, location.href).href;

    const combinedSnippet = computed(() => {
      return [
        `<script type="module" src="${scriptSrc}" async><\/script>`,
        styleSnippet.value,
        elementSnippet.value
      ].filter(Boolean).join('\n\n');
    });

    return {
      elementSnippet,
      styleSnippet,
      combinedSnippet
    };
  }
});
</script>
