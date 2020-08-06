<template>
  <h1 class="page_ttl">
    {{metadata['stanza:label']}}
  </h1>

  <ul class="showcase_icn">
    <li v-if="metadata['stanza:context']">{{metadata['stanza:context']}}</li>
    <li v-if="metadata['stanza:display']">{{metadata['stanza:display']}}</li>
    <li v-if="metadata['stanza:license']">{{metadata['stanza:license']}}</li>
  </ul>

  <div class="showcase_detail">
    <ul class="showcase_id">
      <li v-for="{param, valueRef} in paramFields" :key="param['stanza:key']">
        <dl>
          <dt>{{param['stanza:key']}}</dt>

          <dd>
            <p class="id_box">
              <input type="text" v-model="valueRef.value">
              <span v-if="param['stanza:required']" class="required">required</span>
            </p>

            <p class="eg">
              {{param['stanza:description']}}
            </p>
          </dd>
        </dl>
      </li>
    </ul>

    <ul class="showcase_id">
      <li v-for="{style, valueRef} in styleFields" :key="style['stanza:key']">
        <dl>
          <dt>{{style['stanza:key']}}</dt>

          <dd>
            <p class="id_box">
              <template v-if="style['stanza:choice']">
                <label v-for="choice in style['stanza:choice']" :key="choice">
                  <input :type="style['stanza:type']" :value="choice" v-model="valueRef.value">
                  {{choice}}
                </label>
              </template>

              <input v-else :type="style['stanza:type']" v-model="valueRef.value">
            </p>

            <p class="eg">
              {{style['stanza:description']}}
            </p>
          </dd>
        </dl>
      </li>
    </ul>

    <div class="showcase_code">
      <code style="white-space: pre-wrap">{{combinedSnippet}}</code>
    </div>

    <p class="explain">
      The above snippet will automatically embed the following Stanza in your HTML page.
    </p>

    <div class="showcase_box">
      <div v-html="styleSnippet"></div>
      <div v-html="elementSnippet"></div>
    </div>
  </div>
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
          ${attrs.map(s => ' '.repeat(4) + s).join('\n')}
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
          ${styles.map(s => ' '.repeat(8) + s).join('\n')}
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
        combinedSnippet
      };
    }
  });
</script>
