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
                <div v-for="{param, valueRef} in paramFields" :key="param['stanza:key']" class="col-sm-6 col-lg-12 col-xl-6 mb-3">
                  <label class="form-label">
                    <span v-if="param['stanza:required']" class="text-danger">*</span>
                    {{param['stanza:key']}}
                  </label>

                  <input type="text" v-model="valueRef.value" class="form-control">

                  <small class="form-text text-muted">
                    {{param['stanza:description']}}
                  </small>
                </div>

                <div class="col-sm-6 col-lg-12 col-xl-6 mb-3">
                  <label class="form-label">
                    togostanza-about-link-placement
                  </label>

                  <select v-model="aboutLinkPlacementValueRef" class="form-select">
                    <option value="top-left">top-left</option>
                    <option value="top-right">top-right</option>
                    <option value="bottom-left">bottom-left</option>
                    <option value="bottom-right">bottom-right</option>
                    <option value="none">none</option>
                  </select>

                  <small class="form-text text-muted">
                    Placement of the information icon which links to this page.
                  </small>
                </div>
              </div>
            </section>

            <hr>

            <section>
              <h2>Styles</h2>

              <div class="row mt-3">
                <div v-for="{style, valueRef, defaultValue, resetToDefault} in styleFields" :key="style['stanza:key']" class="col-sm-6 col-lg-12 col-xl-6 mb-3">
                  <label class="form-label">
                    {{style['stanza:key']}}
                  </label>

                  <div class="input-group">
                    <template v-if="style['stanza:type'] === 'single-choice'">
                      <select v-model="valueRef.value" class="form-select">
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
  import outdent from 'outdent';
  import { defineComponent, ref, computed } from 'vue';
  import 'bootstrap/js/dist/tab.js';
  import * as commonmark from 'commonmark';

  import Layout from './Layout.vue';
  import StanzaPreviewer from './StanzaPreviewer.vue';

  export default defineComponent({
    components: {
      Layout,
      StanzaPreviewer
    },

    props: ['metadata', 'readme'],

    setup({metadata, readme}) {
      const id      = metadata['@id'];
      const tagName = `togostanza-${id}`;

      const paramFields = (metadata['stanza:parameter'] || []).map((param) => {
        return {
          param,
          valueRef: ref(param['stanza:example'])
        };
      });

      const aboutLinkPlacementDefault  = metadata['stanza:about-link-placement'] || 'bottom-right';
      const aboutLinkPlacementValueRef = ref(aboutLinkPlacementDefault);

      const params = computed(() => {
        return paramFields
          .map(({param, valueRef}) => (
            {
              name:  param['stanza:key'],
              value: valueRef.value
            }
          ))
          .concat(
            aboutLinkPlacementValueRef.value === aboutLinkPlacementDefault ? [] : [
              {
                name:  'togostanza-about-link-placement',
                value: aboutLinkPlacementValueRef.value
              }
            ]
          );
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

      const styleVars = computed(() => {
        return styleFields
          .filter(({style, valueRef}) => valueRef.value !== style['stanza:default'])
          .map(({style, valueRef}) => (
            {
              name:  style['stanza:key'],
              value: valueRef.value
            }
          ));
      });

      return {
        metadata,
        readmeHtml: renderMarkdown(readme),
        paramFields,
        aboutLinkPlacementValueRef,
        params,
        styleFields,
        styleVars
      };
    }
  });

  function renderMarkdown(md) {
    if (!md) { return ''; }

    const parser   = new commonmark.Parser();
    const renderer = new commonmark.HtmlRenderer();

    return renderer.render(parser.parse(md));
  }
</script>
