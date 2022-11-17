<style scoped>
th {
  background-color: var(--bs-light);
  text-align: center;
  white-space: nowrap;
  width: 1%;
}

th,
td {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}
</style>

<template>
  <Layout containerClass="container-fluid">
    <h1 class="display-4">{{ metadata['stanza:label'] }}</h1>
    <p class="lead">{{ metadata['stanza:definition'] }}</p>

    <div class="row">
      <div class="col-lg-6">
        <nav class="nav nav-tabs" role="tablist">
          <a
            class="nav-link active"
            href="#parameters"
            data-bs-toggle="tab"
            role="tab"
            >Parameters</a
          >
          <a class="nav-link" href="#styles" data-bs-toggle="tab" role="tab"
            >Styles</a
          >
          <a class="nav-link" href="#events" data-bs-toggle="tab" role="tab"
            >Events</a
          >
          <a class="nav-link" href="#about" data-bs-toggle="tab" role="tab"
            >About</a
          >
        </nav>

        <div class="tab-content mt-3">
          <div class="tab-pane px-lg-5" id="about" role="tabpanel">
            <table class="table table-borderless border mb-1">
              <tbody>
                <tr>
                  <th>Author</th>

                  <td>
                    <address class="mb-0">
                      {{ metadata['stanza:author'] || '-' }}
                    </address>
                  </td>
                </tr>

                <tr>
                  <th>Contributors</th>

                  <td>
                    <template
                      v-if="
                        metadata['stanza:contributor'] &&
                        metadata['stanza:contributor'].length > 0
                      "
                    >
                      <ul class="list-unstyled mb-0">
                        <li
                          v-for="contributor in metadata['stanza:contributor']"
                          :key="contributor"
                        >
                          {{ contributor }}
                        </li>
                      </ul>
                    </template>

                    <template v-else> - </template>
                  </td>
                </tr>

                <tr>
                  <th>License</th>
                  <td>{{ metadata['stanza:license'] || '-' }}</td>
                </tr>

                <tr>
                  <th>Created</th>
                  <td>{{ metadata['stanza:created'] || '-' }}</td>
                </tr>

                <tr>
                  <th>Updated</th>
                  <td>{{ metadata['stanza:updated'] || '-' }}</td>
                </tr>
              </tbody>
            </table>

            <div class="text-end">
              <a :href="`./${metadata['@id']}/metadata.json`">Download JSON</a>
            </div>

            <div v-html="readme" class="mt-4"></div>
          </div>

          <div class="tab-pane active" id="parameters" role="tabpanel">
            <section>
              <h2 class="my-3">Parameters</h2>

              <div class="d-flex align-items-start">
                <div
                  class="nav flex-column nav-pills me-3"
                  id="v-pills-tab"
                  role="tablist"
                  aria-orientation="vertical"
                >
                  <template
                    v-for="([a, ta], i) in paramTree.entries()"
                    :key="a"
                  >
                    <button
                      :class="
                        `nav-link text-start` +
                        (i === 0 ? ' active' : '') +
                        (paramFieldGroups.has(a) ? '' : ' disabled')
                      "
                      data-bs-toggle="pill"
                      :data-bs-target="`#v-pills-${a}`"
                      type="button"
                      role="tab"
                    >
                      {{ a }}
                    </button>
                    <template v-for="[b, i] in ta.entries()" :key="b">
                      <button
                        :class="
                          `nav-link text-start ps-4` +
                          (i === 0 ? ' active' : '')
                        "
                        data-bs-toggle="pill"
                        :data-bs-target="`#v-pills-${a}-${b}`"
                        type="button"
                        role="tab"
                      >
                        {{ b }}
                      </button>
                    </template>
                  </template>
                </div>

                <div class="tab-content flex-grow-1" id="v-pills-tabContent">
                  <template
                    v-for="([a, ta], i) in paramTree.entries()"
                    :key="a"
                  >
                    <div
                      :class="`tab-pane` + (i === 0 ? ' show active' : '')"
                      :id="`v-pills-${a}`"
                      role="tabpanel"
                      aria-labelledby="v-pills-home-tab"
                      tabindex="0"
                    >
                      <div
                        v-for="{ param, input } in paramFieldGroups.get(a)"
                        :key="param['stanza:key']"
                        class="col"
                      >
                        <FormField
                          :input="input"
                          :name="param['stanza:key']"
                          :type="param['stanza:type']"
                          :choices="param['stanza:choice']"
                          :required="param['stanza:required']"
                          :help-text="param['stanza:description']"
                        ></FormField>
                      </div>
                    </div>
                    <template v-for="[b, tb] in ta.entries()" :key="b">
                      <div
                        class="tab-pane"
                        :id="`v-pills-${a}-${b}`"
                        role="tabpanel"
                        aria-labelledby="v-pills-home-tab"
                        tabindex="0"
                      >
                        <div
                          v-for="{ param, input } in paramFieldGroups.get(
                            `${a}-${b}`
                          )"
                          :key="param['stanza:key']"
                        >
                          <FormField
                            :input="input"
                            :name="param['stanza:key']"
                            :type="param['stanza:type']"
                            :choices="param['stanza:choice']"
                            :required="param['stanza:required']"
                            :help-text="param['stanza:description']"
                          ></FormField>
                        </div>
                      </div>
                    </template>
                  </template>
                </div>
              </div>
            </section>
          </div>

          <div class="tab-pane" id="styles" role="tabpanel">
            <section>
              <h2 class="my-3">Styles</h2>

              <div
                class="row row-cols-1 row-cols-sm-2 row-cols-lg-1 row-cols-xl-2 gx-4 gy-3"
              >
                <div
                  v-for="{ style, input } in styleFields"
                  :key="style['stanza:key']"
                  class="col"
                >
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

          <div class="tab-pane" id="events" role="tabpanel">
            <h2 class="my-3">Outgoing Events</h2>

            <div class="row row-cols-2">
              <div
                v-for="{ name, description } in outgoingEvents"
                :key="name"
                class="col"
              >
                <div>{{ name }}</div>
                <div class="text-muted">{{ description }}</div>
              </div>
            </div>

            <p v-if="outgoingEvents.length === 0" class="fst-italic">
              No events defined.
            </p>

            <h2 class="my-3">Incoming Events</h2>

            <div class="row row-cols-2">
              <div
                v-for="{ name, description } in incomingEvents"
                :key="name"
                class="col"
              >
                <div>{{ name }}</div>
                <div class="text-muted">{{ description }}</div>
              </div>
            </div>

            <p v-if="incomingEvents.length === 0" class="fst-italic">
              No events defined.
            </p>
          </div>
        </div>
      </div>

      <div class="col-lg-6">
        <hr class="d-lg-none mb-4" />

        <StanzaPreviewer
          :metadata="metadata"
          :params="params"
          :styleVars="styleVars"
        ></StanzaPreviewer>
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

function buildParameterTree(stanzaParameter) {
  const tree = new Map();

  for (const param of stanzaParameter) {
    const key = param['stanza:key'];
    const tmp = key.split('-', 3);
    const k = tmp.slice(0, Math.max(tmp.length - 1, 1));

    const a = tree.get(k[0]) || new Map();
    tree.set(k[0], a);

    if (k[1]) {
      const b = a.get(k[1]) || new Map();
      a.set(k[1], b);
    }
  }

  return tree;
}

function commonPrefixLength(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) {
    i++;
  }
  return i;
}

function buildParamFieldGroups(tree, paramFields) {
  const placements = new Map();
  for (const param of paramFields) {
    const key = param.param['stanza:key'];
    const k = key.split('-', 3);
    let max = -1;
    let argmaxPath = null;

    const paths = [];
    for (const [a, ta] of tree.entries()) {
      paths.push([a]);
      for (const b of ta.keys()) {
        paths.push([a, b]);
      }
    }

    for (const path of paths) {
      const l = commonPrefixLength(k, path);
      if (l > max) {
        max = l;
        argmaxPath = path;
      }
    }

    const placementKey = argmaxPath.join('-');
    const placement = placements.get(placementKey);
    if (placement) {
      placement.push(param);
    } else {
      placements.set(placementKey, [param]);
    }
  }

  return placements;
}

export default defineComponent({
  components: {
    FormField,
    Layout,
    StanzaPreviewer,
  },

  props: ['metadata', 'readme'],

  setup({ metadata, readme }) {
    const stanzaParameter = metadata['stanza:parameter'] || [];
    const paramFields = stanzaParameter.map((param) => {
      return {
        param,
        input: useInput(param['stanza:example'], param['stanza:type'], false),
      };
    });
    const menuPlacement = useInput(
      metadata['stanza:menu-placement'] || 'bottom-right',
      'string'
    );
    paramFields.push({
      param: {
        'stanza:key': 'togostanza-menu-placement',
        'stanza:type': 'single-choice',
        'stanza:choice': [
          'top-left',
          'top-right',
          'bottom-left',
          'bottom-right',
          'none',
        ],
        'stanza:description':
          'Placement of the information icon which links to this page.',
      },
      input: menuPlacement,
    });

    const paramTree = buildParameterTree(stanzaParameter);
    paramTree.set('togostanza', new Map());

    const paramFieldGroups = buildParamFieldGroups(paramTree, paramFields);

    const params = computed(() => {
      return [
        ...paramFields.map(({ param, input }) => {
          return {
            name: param['stanza:key'],
            type: param['stanza:type'],
            input,
          };
        }),
        {
          name: 'togostanza-menu-placement',
          input: menuPlacement,
        },
      ]
        .filter(({ input }) => !input.isDefault.value)
        .map(({ name, input, type }) => {
          return {
            name,
            type,
            value: input.valueStr.value,
          };
        });
    });

    const styleFields = (metadata['stanza:style'] || []).map((style) => {
      return {
        style,
        input: useInput(style['stanza:default'], style['stanza:type']),
      };
    });

    const styleVars = computed(() => {
      return styleFields
        .filter(({ input }) => !input.isDefault.value)
        .map(({ style, input }) => {
          return {
            name: style['stanza:key'],
            value: input.valueStr.value,
          };
        });
    });

    const outgoingEvents = (metadata['stanza:outgoingEvent'] || []).map(
      (event) => {
        return {
          name: event['stanza:key'],
          description: event['stanza:description'],
        };
      }
    );

    const incomingEvents = (metadata['stanza:incomingEvent'] || []).map(
      (event) => {
        return {
          name: event['stanza:key'],
          description: event['stanza:description'],
        };
      }
    );

    return {
      metadata,
      readme,
      paramTree,
      paramFieldGroups,
      menuPlacement,
      params,
      styleFields,
      styleVars,
      outgoingEvents,
      incomingEvents,
    };
  },
});

function useInput(initValue, type, hasDefault = true) {
  const initValueStr = stringify(initValue, type);
  const valueStr = ref(initValueStr);
  const valueParsed = computed(() => parse(valueStr.value, type));
  const isDefault = computed(
    () => hasDefault && valueStr.value === initValueStr
  );

  function setValueStr(newValStr) {
    valueStr.value = newValStr;
  }

  function resetToDefault() {
    if (!hasDefault) {
      return;
    }

    this.setValueStr(initValueStr);
  }

  return {
    valueStr,
    valueParsed,
    setValueStr,
    hasDefault,
    isDefault,
    resetToDefault,
  };
}

function stringify(value, type) {
  if (value === null || value === undefined) {
    return null;
  }

  switch (type) {
    case 'boolean':
    case 'number':
    case 'json':
      return JSON.stringify(value);
    default:
      // value is a string (event if type is not a string. e.g. date)
      return value;
  }
}

function parse(valueStr, type) {
  if (valueStr === null || valueStr === undefined) {
    return null;
  }

  switch (type) {
    case 'boolean':
    case 'number':
    case 'json':
      return JSON.parse(valueStr);
    case 'date':
    case 'datetime':
      return new Date(valueStr);
    default:
      return valueStr;
  }
}
</script>
