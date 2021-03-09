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
          <a class="nav-link active" href="#overview" data-bs-toggle="tab" role="tab">Overview</a>
          <a class="nav-link" href="#customize" data-bs-toggle="tab" role="tab">Customize</a>
          <a class="nav-link" href="#event" data-bs-toggle="tab" role="tab">Event</a>
        </nav>

        <div class="tab-content mt-3">
          <div class="tab-pane active px-lg-5" id="overview" role="tabpanel">
            <table class="table table-borderless border mb-1">
              <tbody>
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

            <div class="text-end">
              <a :href="`./${metadata['@id']}/metadata.json`">Download JSON</a>
            </div>

            <div v-html="readme" class="mt-4"></div>
          </div>

          <div class="tab-pane" id="customize" role="tabpanel">
            <section>
              <h2 class="my-3">Parameters</h2>

              <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-1 row-cols-xl-2 gx-4 gy-3">
                <div v-for="{param, input} in paramFields" :key="param['stanza:key']" class="col">
                  <FormField
                    :input="input"
                    :name="param['stanza:key']"
                    :type="param['stanza:type']"
                    :choices="param['stanza:choice']"
                    :required="param['stanza:required']"
                    :help-text="param['stanza:description']"
                  ></FormField>
                </div>

                <div class="col">
                  <FormField
                    :input="aboutLinkPlacement"
                    name="togostanza-about-link-placement"
                    type="single-choice"
                    :choices="['top-left', 'top-right', 'bottom-left', 'bottom-right', 'none']"
                    :help-text="'Placement of the information icon which links to this page.'"
                  ></FormField>
                </div>
              </div>
            </section>

            <hr class="mt-4 mb-3">

            <section>
              <h2 class="my-3">Styles</h2>

              <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-1 row-cols-xl-2 gx-4 gy-3">
                <div v-for="{style, input} in styleFields" :key="style['stanza:key']" class="col">
                  <FormField
                    :input="input"
                    :name="style['stanza:key']"
                    :type="style['stanza:type']"
                    :choices="style['stanza:choice']"
                    :help-text="style['stanza:description']"
                  ></FormField>
                </div>
              </div>

              <p v-if="styleFields.length === 0" class="fst-italic">
                No styles defined.
              </p>
            </section>
          </div>

          <div class="tab-pane active px-lg-5" id="event" role="tabpanel">
            <h2 class="my-3">Outgoing Events</h2>

            <div class="row row-cols-2">
              <div v-for="{name, description} in outgoingEvents" :key="name" class="col">
                <div>{{name}}</div>
                <div class="text-muted">{{description}}</div>
              </div>
            </div>

            <p v-if="outgoingEvents.length === 0" class="fst-italic">
              No events defined.
            </p>

            <h2 class="my-3">Incoming Events</h2>

            <div class="row row-cols-2">
              <div v-for="{name, description} in incomingEvents" :key="name" class="col">
                <div>{{name}}</div>
                <div class="text-muted">{{description}}</div>
              </div>
            </div>

            <p v-if="incomingEvents.length === 0" class="fst-italic">
              No events defined.
            </p>
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
        input: useInput(param['stanza:example'], param['stanza:type'], false)
      };
    });

    const aboutLinkPlacement = useInput(metadata['stanza:about-link-placement'] || 'bottom-right', 'string');

    const params = computed(() => {
      return [
        ...paramFields.map(({param, input}) => {
          return {
            name: param['stanza:key'],
            type: param['stanza:type'],
            input
          };
        }),
        {
          name:  'togostanza-about-link-placement',
          input: aboutLinkPlacement
        }
      ].filter(({input}) => (
        !input.isDefault.value
      )).map(({name, input, type}) => {
        return {
          name,
          type,
          value: input.valueStr.value
        };
      });
    });

    const styleFields = (metadata['stanza:style'] || []).map((style) => {
      return {
        style,
        input: useInput(style['stanza:default'], style['stanza:type'])
      };
    });

    const styleVars = computed(() => {
      return styleFields.filter(({input}) => (
        !input.isDefault.value
      )).map(({style, input}) => {
        return {
          name:  style['stanza:key'],
          value: input.valueStr.value
        };
      });
    });

    const outgoingEvents = (metadata['stanza:outgoingEvent'] || []).map((event) => {
      return {
        name:        event['stanza:key'],
        description: event['stanza:description']
      };
    });

    const incomingEvents = (metadata['stanza:incomingEvent'] || []).map((event) => {
      return {
        name:        event['stanza:key'],
        description: event['stanza:description']
      };
    });

    return {
      metadata,
      readme,
      paramFields,
      aboutLinkPlacement,
      params,
      styleFields,
      styleVars,
      outgoingEvents,
      incomingEvents
    };
  }
});

function useInput(initValue, type, hasDefault = true) {
  const initValueStr = stringify(initValue, type);
  const valueStr     = ref(initValueStr);
  const valueParsed  = computed(() => parse(valueStr.value, type));
  const isDefault    = computed(() => hasDefault && (valueStr.value === initValueStr));

  function setValueStr(newValStr) {
    valueStr.value = newValStr;
  }

  function resetToDefault() {
    if (!hasDefault) { return; }

    this.setValueStr(initValueStr);
  }

  return {
    valueStr,
    valueParsed,
    setValueStr,
    hasDefault,
    isDefault,
    resetToDefault
  };
}

function stringify(value, type) {
  if (value === null || value === undefined) { return null; }

  switch (type) {
    case 'boolean':
    case 'number':
    case 'json':
      return JSON.stringify(value);
    default: // value is a string (event if type is not a string. e.g. date)
      return value;
  }
}

function parse(valueStr, type) {
  if (valueStr === null || valueStr === undefined) { return null; }

  switch (type) {
    case 'boolean':
    case 'number':
    case 'json':
      return JSON.parse(valueStr);
    case 'date':
    case 'datetime':
      return Date.parse(valueStr);
    default:
      return valueStr;
  }
}
</script>
