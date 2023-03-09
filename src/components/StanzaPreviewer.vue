<template>
  <div class="p-3 bg-light">
    <div v-html="styleSnippet"></div>

    <div ref="stanzaContainer">
      <component :is="tagName" v-bind="props"></component>
    </div>
  </div>

  <div class="bg-dark mt-3">
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
</template>

<script>
import { defineComponent, computed, ref, watch } from 'vue';

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

    const stanzaContainer = ref();

    watch(styleSnippet, () => {
      const stanzaElement = stanzaContainer.value.childNodes[0];
      stanzaElement.render();
    });

    return {
      tagName,
      props: stanzaProps,
      styleSnippet,
      stanzaSnippet,
      combinedSnippet,
      stanzaContainer,
    };
  },
});
</script>
