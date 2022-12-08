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
            <HelpAboutPane :metadata="metadata" :readme="readme" />
          </div>

          <div class="tab-pane active" id="parameters" role="tabpanel">
            <HelpParametersPane
              :paramTree="paramTree"
              :paramFieldGroups="paramFieldGroups"
            />
          </div>

          <div class="tab-pane" id="styles" role="tabpanel">
            <HelpStylesPane :styleFields="styleFields" />
          </div>

          <div class="tab-pane" id="events" role="tabpanel">
            <HelpEventsPane :metadata="metadata" />
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
import HelpAboutPane from './HelpAboutPane.vue';
import HelpParametersPane from './HelpParametersPane.vue';
import HelpStylesPane from './HelpStylesPane.vue';
import HelpEventsPane from './HelpEventsPane.vue';

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
    HelpAboutPane,
    HelpParametersPane,
    HelpStylesPane,
    HelpEventsPane,
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

    return {
      metadata,
      readme,
      paramTree,
      paramFieldGroups,
      menuPlacement,
      params,
      styleFields,
      styleVars,
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
