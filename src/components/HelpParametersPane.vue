<script setup>
import FormField from './FormField.vue';

const { paramFieldGroups } = defineProps({
  paramFieldGroups: {
    type: Array,
    required: true,
  },
});

// paramFieldGroups:
//   [['data', [ParamField, ParamField, ...]], ['axis', undefined], ...]

const firstActiveParamFieldGroupPath = paramFieldGroups
  .find(([_, parameters]) => parameters && parameters.length > 0)[0]
  .join('-');
</script>

<template>
  <div class="d-flex align-items-start">
    <div
      class="nav flex-column nav-pills me-3"
      id="v-pills-tab"
      role="tablist"
      aria-orientation="vertical"
    >
      <template
        v-for="[path, params] in paramFieldGroups"
        :key="path.join('-')"
      >
        <button
          :class="
            `nav-link text-start` +
            (path.join('-') === firstActiveParamFieldGroupPath
              ? ' active'
              : '') +
            (params ? '' : ' disabled')
          "
          data-bs-toggle="pill"
          :data-bs-target="`#v-pills-${path.join('-')}`"
          type="button"
          role="tab"
          :style="{ 'padding-left': `${path.length * 2}rem` }"
        >
          {{ path[path.length - 1] }}
        </button>
      </template>
    </div>
    <div class="tab-content flex-grow-1" id="v-pills-tabContent">
      <template
        v-for="[path, params] in paramFieldGroups"
        :key="path.join('-')"
      >
        <div
          :class="
            `tab-pane` +
            (path.join('-') === firstActiveParamFieldGroupPath
              ? ' show active'
              : '')
          "
          :id="`v-pills-${path.join('-')}`"
          role="tabpanel"
          aria-labelledby="v-pills-home-tab"
          tabindex="0"
        >
          <div
            v-for="{ param, input } in params"
            :key="param['stanza:key']"
            class="col mb-2"
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
    </div>
  </div>
</template>
