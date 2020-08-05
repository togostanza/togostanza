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
      The above element will automatically embed the following Stanza in your HTML page.
    </p>

    <div class="showcase_box" v-html="snippet">
    </div>
  </div>
</template>

<script>
  import { defineComponent, reactive, ref, computed } from 'vue';

  export default defineComponent({
    props: ['metadata'],

    setup({metadata}) {
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

      const snippet = computed(() => {
        const styles = styleFields.map(({style, value}) => {
          return `        ${style['stanza:key']}: ${value};`;
        });

        const tagName = `togostanza-${metadata['@id']}`;

        const attrs = paramFields.map(({param, value}) => {
          return `    ${param['stanza:key']}=${JSON.stringify(value)}`;
        });

        return '<style>\n'
          + `    ${tagName} {\n`
          + styles.join('\n') + '\n'
          + '    }\n'
          + '</style>\n\n'
          + `<${tagName}\n`
          + attrs.join('\n') + '\n'
          +`></${tagName}>`;
      });

      return {
        metadata,
        paramFields,
        styleFields,
        snippet
      };
    }
  });
</script>
