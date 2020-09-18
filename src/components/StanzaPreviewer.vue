<template>
  <div class="bg-dark">
    <div class="text-right p-2">
      <CopyButton :value="snippetWithLoader" class="btn btn-sm btn-light"></CopyButton>
    </div>

    <pre class="overflow-auto p-3 pt-0 text-white"><code>{{snippetWithLoader}}</code></pre>
  </div>

  <div class="overflow-auto p-3 bg-light">
    <div v-html="snippetWithoutLoader"></div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';

import escape from 'lodash.escape';
import outdent from 'outdent';

import CopyButton from './CopyButton.vue';

export default defineComponent({
  props: ['metadata', 'params', 'styleVars'],

  components: {
    CopyButton
  },

  setup(props) {
    const id      = props.metadata['@id'];
    const tagName = `togostanza-${id}`;

    const snippetWithoutLoader = computed(() => {
      return [
        styleElementSnippet(tagName, props.styleVars),
        stanzaElementSnippet(tagName, props.params)
      ].filter(Boolean).join('\n\n');
    });

    const scriptSrc = new URL(`./${id}.js`, location.href).href;
    const loader    = `<script type="module" src="${escape(scriptSrc)}" async><\/script>`;

    const snippetWithLoader = computed(() => {
      return outdent`
        ${loader}

        ${snippetWithoutLoader.value}
      `;
    });

    return {
      snippetWithoutLoader,
      snippetWithLoader
    };
  }
});

function styleElementSnippet(tagName, styleVars) {
  if (styleVars.length === 0) { return null; }

  const lines = styleVars.map(({name, value}) => `${name}: ${value};`);

  return outdent`
    <style>
      ${tagName} {
    ${lines.map(line => ' '.repeat(4) + line).join('\n')}
      }
    </style>
  `;
}

function stanzaElementSnippet(tagName, params) {
  if (params.length === 0) { return `<${tagName}></${tagName}>`; }

  const lines = params.map(({name, value}) => `${escape(name)}="${escape(value)}"`);

  return outdent`
    <${tagName}
    ${lines.map(line => ' '.repeat(2) + line).join('\n')}
    ></${tagName}>
  `;
}
</script>
