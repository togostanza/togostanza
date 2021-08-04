<template>
  <div class="bg-dark">
    <div class="text-end p-2">
      <CopyButton
        :value="combinedSnippet"
        class="btn btn-sm btn-light"
      ></CopyButton>
    </div>

    <pre
      class="overflow-auto p-3 pt-0 text-white"
    ><code>{{combinedSnippet}}</code></pre>
  </div>

  <div class="overflow-auto p-3 bg-light">
    <div v-html="styleSnippet"></div>

    <component :is="tagName" v-bind="props"></component>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';

import CopyButton from './CopyButton.vue';
import styleSnippetTemplate from './style-snippet.html.hbs';
import stanzaSnippetTemplate from './stanza-snippet.html.hbs';
import loaderSnippetTemplate from './loader-snippet.html.hbs';

export default defineComponent({
  props: ['metadata', 'params', 'styleVars'],

  components: {
    CopyButton,
  },

  setup(props) {
    const id = props.metadata['@id'];
    const tagName = `togostanza-${id}`;

    const stanzaProps = computed(() => {
      return props.params.reduce((acc, param) => {
        return param.type === 'boolean' && param.value === 'false'
          ? acc
          : {
              ...acc,
              [param.name]: param.value,
            };
      }, {});
    });

    const stanzaSnippet = computed(() => {
      return stanzaSnippetTemplate({
        tagName,
        params: props.params,
      });
    });

    const styleSnippet = computed(() => {
      return styleSnippetTemplate({
        tagName,
        styleVars: props.styleVars,
      });
    });

    const scriptSrc = new URL(`./${id}.js`, location.href).href;
    const loaderSnippet = loaderSnippetTemplate({ scriptSrc });

    const combinedSnippet = computed(() => {
      return [loaderSnippet, styleSnippet.value, stanzaSnippet.value]
        .filter(Boolean)
        .join('\n');
    });

    return {
      tagName,
      props: stanzaProps,
      styleSnippet,
      stanzaSnippet,
      combinedSnippet,
    };
  },
});
</script>
