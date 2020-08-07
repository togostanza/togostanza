<template>
  <h1>{{metadata['stanza:label']}}</h1>

  <ul class="list-inline">
    <li v-for="tag in tags" :key="tag" class="list-inline-item">
      <span class="badge badge-secondary">{{tag}}</span>
    </li>
  </ul>

  <form>
    <fieldset>
      <legend>Parameters</legend>

      <div v-for="{param, valueRef} in paramFields" :key="param['stanza:key']" class="form-group row">
        <label class="col-form-label col-3 text-right">
          <span v-if="param['stanza:required']" class="text-danger">*</span>
          {{param['stanza:key']}}
        </label>

        <div class="col-3">
          <input type="text" v-model="valueRef.value" class="form-control">
        </div>

        <div class="col text-muted">
          {{param['stanza:description']}}
        </div>
      </div>

      <div v-if="paramFields.length === 0">
        <p><i>No parameters defined</i></p>
      </div>
    </fieldset>

    <fieldset>
      <legend>Styles</legend>

      <div v-for="{style, valueRef} in styleFields" :key="style['stanza:key']" class="form-group row">
        <label class="col-form-label col-3 text-right">
          {{style['stanza:key']}}
        </label>

        <div class="col-3">
          <template v-if="style['stanza:type'] === 'single-choice'">
            <select v-model="valueRef.value" class="form-control">
              <option v-for="choice in style['stanza:choice']" :value="choice" :key="choice">{{choice}}</option>
            </select>
          </template>

          <input v-else :type="style['stanza:type']" v-model="valueRef.value" class="form-control">
        </div>

        <div class="col text-muted">
          {{style['stanza:description']}}
        </div>
      </div>

      <div v-if="styleFields.length === 0">
        <p><i>No styles defined</i></p>
      </div>
    </fieldset>

    <pre class="bg-dark text-white p-3"><code>{{combinedSnippet}}</code></pre>

    <p>The above snippet will automatically embed the following Stanza in your HTML page.</p>

    <div class="bg-light p-3">
      <div v-html="styleSnippet"></div>
      <div v-html="elementSnippet"></div>
    </div>
  </form>
</template>

<script>
  import { defineComponent, ref, computed } from 'vue';
  import outdent from 'outdent';

  export default defineComponent({
    props: ['metadata'],

    setup({metadata}) {
      const id      = metadata['@id'];
      const tagName = `togostanza-${id}`;

      const paramFields = (metadata['stanza:parameter'] || []).map((param) => {
        return {
          param,
          valueRef: ref(param['stanza:example'])
        };
      });

      const styleFields = (metadata['stanza:style'] || []).map((style) => {
        return {
          style,
          valueRef: ref(style['stanza:default'])
        };
      });

      const elementSnippet = computed(() => {
        const attrs = paramFields
          .map(({param, valueRef}) => `${param['stanza:key']}=${JSON.stringify(valueRef.value)}`);

        return outdent`
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

      return {
        metadata,
        paramFields,
        styleFields,
        elementSnippet,
        styleSnippet,
        combinedSnippet,

        tags: ['stanza:context', 'stanza:display', 'stanza:license'].map(k => metadata[k]).filter(Boolean)
      };
    }
  });
</script>
