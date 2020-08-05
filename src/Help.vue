<template>
  <h1 class="page_ttl">
    {{metadata['stanza:label']}}
  </h1>

  <ul class="showcase_icn">
    <li v-if="metadata['stanza:context']">{{metadata['stanza:context']}}</li>
    <li v-if="metadata['stanza:display']">{{metadata['stanza:display']}}</li>
    <li v-if="metadata['stanza:license']">{{metadata['stanza:license']}}</li>
  </ul>

  <p class="lead">
    {{metadata['stanza:usage']}}
  </p>

  <div class="showcase_detail">
    <ul class="showcase_id">
      <li v-for="field in paramFields">
        <dl>
          <dt>{{field.param['stanza:key']}}</dt>

          <dd>
            <p class="id_box">
              <input type="text" v-model="field.value">
              <span v-if="field.param['stanza:required']" class="required">required</span>
            </p>

            <p class="eg">
              {{field.param['stanza:description']}}
            </p>
          </dd>
        </dl>
      </li>
    </ul>

    <ul class="showcase_id">
      <li>Styling</li>

      <li v-for="field in styleFields">
        <dl>
          <dt>{{field.style['stanza:key']}}</dt>

          <dd>
            <p class="id_box">
              <template v-if="field.style['stanza:choice']">
                <label v-for="choice in field.style['stanza:choice']">
                  <input :type="field.style['stanza:type']" :value="choice" v-model="field.value">
                  {{choice}}
                </label>
              </template>

              <input v-else :type="field.style['stanza:type']" v-model="field.value">
            </p>

            <p class="eg">
              {{field.style['stanza:description']}}
            </p>
          </dd>
        </dl>
      </li>
    </ul>

    <div class="showcase_code">
      <code style="white-space: pre-wrap">{{snippet}}</code>
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
  import { defineComponent, reactive, computed } from 'vue';
  import outdent from 'outdent';

  export default defineComponent({
    props: ['metadata'],

    setup({metadata}) {
      const id      = metadata['@id'];
      const tagName = `togostanza-${id}`;

      const paramFields = metadata['stanza:parameter'].map((param) => {
        return reactive({
          param,
          value: param['stanza:example']
        });
      });

      const styleFields = metadata['stanza:style'].map((style) => {
        return reactive({
          style,
          value: style['stanza:default']
        });
      });

      const elementSnippet = computed(() => {
        const attrs = paramFields
          .map(({param, value}) => `${param['stanza:key']}=${JSON.stringify(value)}`);

        return outdent`
          <${tagName}
          ${attrs.map(s => '    ' + s).join('\n')}
          ></${tagName}>
        `;
      });

      const styleSnippet = computed(() => {
        const styles = styleFields
          .filter(({style, value}) => value !== style['stanza:default'])
          .map(({style, value}) => `${style['stanza:key']}: ${value};`);

        return styles.length === 0 ? null : outdent`
          <style>
              ${tagName} {
          ${styles.map(s => '        ' + s).join('\n')}
              }
          </style>
        `;
      });

      const scriptSrc = new URL(`./${id}.js`, location.href).href;

      const snippet = computed(() => {
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
        snippet
      };
    }
  });
</script>
