<style scoped>
th {
  background-color: var(--bs-light);
  text-align: center;
  white-space: nowrap;
  width: 1%;
}

th, td {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}
</style>

<template>
  <Layout containerClass="container-fluid">
    <h1 class="display-4">{{metadata['stanza:label']}}</h1>
    <p class="lead">{{metadata['stanza:definition']}}</p>

    <div class="row">
      <div class="col-lg-6">
        <nav class="nav nav-tabs" role="tablist">
          <a class="nav-link active" href="#overview" data-toggle="tab" role="tab">Overview</a>
          <a class="nav-link" href="#customize" data-toggle="tab" role="tab">Customize</a>
        </nav>

        <div class="tab-content mt-3">
          <div class="tab-pane active px-lg-5" id="overview" role="tabpanel">
            <table class="table table-borderless border">
              <tbody>
                <tr>
                  <th>Context</th>
                  <td>{{metadata['stanza:context'] || '-'}}</td>
                </tr>

                <tr>
                  <th>Display</th>
                  <td>{{metadata['stanza:display'] || '-'}}</td>
                </tr>

                <tr>
                  <th>Type</th>
                  <td>{{metadata['stanza:type'] || '-'}}</td>
                </tr>

                <tr>
                  <th>Provider</th>
                  <td>{{metadata['stanza:provider'] || '-'}}</td>
                </tr>

                <tr>
                  <th>Author</th>

                  <td>
                    <address class="mb-0">
                      {{metadata['stanza:author'] || '-'}}

                      <template v-if="metadata['stanza:address']">
                        &lt;<a :href="`mailto:${metadata['stanza:address']}`">{{metadata['stanza:address']}}</a>&gt;
                      </template>
                    </address>
                  </td>
                </tr>

                <tr>
                  <th>Contributors</th>

                  <td>
                    <template v-if="metadata['stanza:contributor'] && metadata['stanza:contributor'].length > 0">
                      <ul class="list-unstyled mb-0">
                        <li v-for="contributor in metadata['stanza:contributor']" :key="contributor">
                          {{contributor}}
                        </li>
                      </ul>
                    </template>

                    <template v-else>
                      -
                    </template>
                  </td>
                </tr>

                <tr>
                  <th>License</th>
                  <td>{{metadata['stanza:license'] || '-'}}</td>
                </tr>

                <tr>
                  <th>Created</th>
                  <td>{{metadata['stanza:created'] || '-'}}</td>
                </tr>

                <tr>
                  <th>Updated</th>
                  <td>{{metadata['stanza:updated'] || '-'}}</td>
                </tr>
              </tbody>
            </table>

            <div v-html="readmeHtml" class="mt-4"></div>
          </div>

          <div class="tab-pane" id="customize" role="tabpanel">
            <section>
              <h2>Parameters</h2>

              <div class="row mt-3">
                <div v-for="{param, input} in paramFields" :key="param['stanza:key']" class="col-sm-6 col-lg-12 col-xl-6 mb-3">
                  <FormField
                    :input="input"
                    :label="param['stanza:key']"
                    :required="param['stanza:required']"
                    :help-text="param['stanza:description']"
                  ></FormField>
                </div>

                <div class="col-sm-6 col-lg-12 col-xl-6 mb-3">
                  <FormField
                    :input="aboutLinkPlacement"
                    :label="'togostanza-about-link-placement'"
                    :type="'single-choice'"
                    :choices="['top-left', 'top-right', 'bottom-left', 'bottom-right', 'none']"
                    :help-text="'Placement of the information icon which links to this page.'"
                  ></FormField>
                </div>
              </div>
            </section>

            <hr>

            <section>
              <h2>Styles</h2>

              <div class="row mt-3">
                <div v-for="{style, input} in styleFields" :key="style['stanza:key']" class="col-sm-6 col-lg-12 col-xl-6 mb-3">
                  <FormField
                    :input="input"
                    :label="style['stanza:key']"
                    :type="style['stanza:type']"
                    :choices="style['stanza:choice']"
                    :help-text="style['stanza:description']"
                  ></FormField>
                </div>
              </div>

              <p v-if="styleFields.length === 0" class="font-italic">
                No styles defined.
              </p>
            </section>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <hr class="d-lg-none mb-4">

        <StanzaPreviewer :metadata="metadata" :params="params" :styleVars="styleVars"></StanzaPreviewer>
      </div>
    </div>
  </Layout>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';

import 'bootstrap/js/dist/tab.js';
import * as commonmark from 'commonmark';

import FormField from './FormField.vue';
import Layout from './Layout.vue';
import StanzaPreviewer from './StanzaPreviewer.vue';

export default defineComponent({
  components: {
    FormField,
    Layout,
    StanzaPreviewer
  },

  props: ['metadata', 'readme'],

  setup({metadata, readme}) {
    const paramFields = (metadata['stanza:parameter'] || []).map((param) => {
      return {
        param,
        input: useInput(param['stanza:example'], false)
      };
    });

    const aboutLinkPlacement = useInput(metadata['stanza:about-link-placement'] || 'bottom-right');

    const params = computed(() => {
      return [
        ...paramFields.map(({param, input}) => {
          return {
            name: param['stanza:key'],
            input
          };
        }),
        {
          name:  'togostanza-about-link-placement',
          input: aboutLinkPlacement
        }
      ].filter(({input}) => (
        !input.isDefault.value
      )).map(({name, input}) => {
        return {
          name,
          value: input.ref.value
        };
      });
    });

    const styleFields = (metadata['stanza:style'] || []).map((style) => {
      return {
        style,
        input: useInput(style['stanza:default'])
      };
    });

    const styleVars = computed(() => {
      return styleFields.filter(({input}) => (
        !input.isDefault.value
      )).map(({style, input}) => {
        return {
          name:  style['stanza:key'],
          value: input.ref.value
        };
      });
    });

    return {
      metadata,
      readmeHtml: renderMarkdown(readme),
      paramFields,
      aboutLinkPlacement,
      params,
      styleFields,
      styleVars
    };
  }
});

function useInput(initValue, hasDefault = true) {
  const _ref      = ref(initValue);
  const isDefault = computed(() => hasDefault && (_ref.value === initValue));

  function setValue(newVal) {
    _ref.value = newVal;
  }

  function resetToDefault() {
    if (!hasDefault) { return; }

    _ref.value = initValue
  }

  return {
    ref: _ref,
    setValue,
    hasDefault,
    isDefault,
    resetToDefault
  };
}

function renderMarkdown(md) {
  if (!md) { return ''; }

  const parser   = new commonmark.Parser();
  const renderer = new commonmark.HtmlRenderer();

  return renderer.render(parser.parse(md));
}
</script>
