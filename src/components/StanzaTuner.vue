<template>
  <div class="row">
    <div class="col-lg-6">
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

    <div class="col-lg-6">
      <hr class="d-lg-none mb-4">

      <StanzaPreviewer :metadata="metadata" :params="params" :styleVars="styleVars"></StanzaPreviewer>
    </div>
  </div>
</template>

<script>
  import outdent from 'outdent';
  import { defineComponent, ref, computed } from 'vue';

  import StanzaPreviewer from './StanzaPreviewer.vue';

  export default defineComponent({
    components: {
      StanzaPreviewer
    },

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

      const aboutLinkPlacementDefault  = metadata['stanza:about-link-placement'] || 'bottom-right';
      const aboutLinkPlacementValueRef = ref(aboutLinkPlacementDefault);

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

      const params = computed(() => {
        return paramFields
          .map(({param, valueRef}) => (
            {
              name:  param['stanza:key'],
              value: valueRef.value
            }
          ))
          .concat(
            aboutLinkPlacementValueRef.value === aboutLinkPlacementDefault ? [] : [{
              name:  'togostanza-about-link-placement',
              value: aboutLinkPlacementValueRef.value
            }]
          );
      });

      const styleVars = computed(() => {
        return styleFields
          .filter(({style, valueRef}) => valueRef.value !== style['stanza:default'])
          .map(({style, valueRef}) => ({name: style['stanza:key'], value: valueRef.value}));
      });

      return {
        metadata,
        paramFields,
        aboutLinkPlacementValueRef,
        styleFields,
        params,
        styleVars
      };
    }
  });
</script>
