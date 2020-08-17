<template>
  <Layout containerClass="container-fluid">
    <h1>{{metadata['stanza:label']}}</h1>

    <ul class="list-inline">
      <li v-for="badge in badges" :key="badge" class="list-inline-item">
        <span class="badge badge-pill badge-secondary">{{badge}}</span>
      </li>
    </ul>

    <hr>

    <div class="row">
      <div class="col-lg-6">
        <section>
          <h2>Parameters</h2>

          <div class="form-row mt-3">
            <div v-for="{param, valueRef} in paramFields" :key="param['stanza:key']" class="form-group col-sm-6 col-lg-12 col-xl-6">
              <label>
                <span v-if="param['stanza:required']" class="text-danger">*</span>
                {{param['stanza:key']}}
              </label>

              <input type="text" v-model="valueRef.value" class="form-control">

              <small class="form-text text-muted">
                {{param['stanza:description']}}
              </small>
            </div>
          </div>

          <p v-if="paramFields.length === 0" class="font-italic">
            No parameters defined.
          </p>
        </section>

        <hr>

        <section>
          <h2>Styles</h2>

          <div class="form-row mt-3">
            <div v-for="{style, valueRef, defaultValue, resetToDefault} in styleFields" :key="style['stanza:key']" class="form-group col-sm-6 col-lg-12 col-xl-6">
              <label>
                {{style['stanza:key']}}
              </label>

              <div class="input-group">
                <template v-if="style['stanza:type'] === 'single-choice'">
                  <select v-model="valueRef.value" class="form-control">
                    <option v-for="choice in style['stanza:choice']" :value="choice" :key="choice">{{choice}}</option>
                  </select>
                </template>

                <input v-else :type="style['stanza:type']" v-model="valueRef.value" class="form-control">

                <div class="input-group-append">
                  <button @click="resetToDefault()" :disabled="valueRef.value === defaultValue" type="button" class="btn btn-light border">Reset</button>
                </div>
              </div>

              <small class="form-text text-muted">
                {{style['stanza:description']}}
              </small>
            </div>
          </div>

          <p v-if="styleFields.length === 0" class="font-italic">
            No styles defined.
          </p>
        </section>
      </div>

      <div class="col-lg-6">
        <hr class="d-lg-none mb-4">

        <div class="bg-dark">
          <div class="text-right p-2">
            <button @click="copyCombinedSnippetToClipboard()" type="button" class="btn btn-sm btn-light">
              Copy to clipboard
            </button>
          </div>

          <pre class="overflow-auto p-3 mt-n3 text-white"><code>{{combinedSnippet}}</code></pre>
        </div>

        <p>The above snippet will automatically embed the following Stanza in your HTML page.</p>

        <div class="overflow-auto p-3 bg-light">
          <div v-html="styleSnippet"></div>
          <div v-html="elementSnippet"></div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
  import outdent from 'outdent';
  import { defineComponent, ref, computed } from 'vue';

  import Layout from './Layout.vue';

  export default defineComponent({
    components: {
      Layout
    },

    props: ['metadata'],

    setup({metadata}) {
      const id      = metadata['@id'];
      const tagName = `togostanza-${id}`;
      const badges  = ['stanza:context', 'stanza:display', 'stanza:license'].map(k => metadata[k]).filter(Boolean);

      const paramFields = (metadata['stanza:parameter'] || []).map((param) => {
        return {
          param,
          valueRef: ref(param['stanza:example'])
        };
      });

      const styleFields = (metadata['stanza:style'] || []).map((style) => {
        const defaultValue = style['stanza:default'];
        const valueRef     = ref(defaultValue);

        return {
          style,
          valueRef,
          defaultValue,

          resetToDefault() {
            valueRef.value = defaultValue;
          }
        };
      });

      const elementSnippet = computed(() => {
        const attrs = paramFields
          .map(({param, valueRef}) => `${param['stanza:key']}=${JSON.stringify(valueRef.value)}`);

        return attrs.length === 0 ? `<${tagName}></${tagName}>` : outdent`
          <${tagName}
          ${attrs.map(s => ' '.repeat(2) + s).join('\n')}
          ></${tagName}>
        `;
      });

      const styleSnippet = computed(() => {
        const styles = styleFields
          .filter(({style, valueRef}) => valueRef.value !== style['stanza:default'])
          .map(({style, valueRef}) => `${style['stanza:key']}: ${valueRef.value};`);

        return styles.length === 0 ? null : outdent`
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

      function copyCombinedSnippetToClipboard() {
        navigator.clipboard.writeText(combinedSnippet.value);
      }

      return {
        metadata,
        badges,
        paramFields,
        styleFields,
        elementSnippet,
        styleSnippet,
        combinedSnippet,
        copyCombinedSnippetToClipboard
      };
    }
  });
</script>
