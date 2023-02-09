<script setup>
import FormField from './FormField.vue';

const { styleFieldGroups } = defineProps({
  styleFieldGroups: {
    type: Array,
    required: true,
  },
});
const first = styleFieldGroups.find(
  ([_, styleField]) => styleField && styleField.length > 0
);
const firstActiveStyleFieldGroupPath = first ? first[0].join('-') : null;
</script>

<template>
  <p v-if="styleFieldGroups.length === 0" class="fst-italic">
    No styles defined.
  </p>
  <div v-else class="d-flex align-items-start">
    <div
      class="nav flex-column nav-pills me-3"
      id="styles-pills-tab"
      role="tablist"
      aria-orientation="vertical"
    >
      <template
        v-for="[path, styles] in styleFieldGroups"
        :key="path.join('-')"
      >
        <button
          :class="
            `nav-link text-start` +
            (path.join('-') === firstActiveStyleFieldGroupPath
              ? ' active'
              : '') +
            (styles ? '' : ' disabled')
          "
          data-bs-toggle="pill"
          :data-bs-target="`#styles-pills-${path.join('-')}`"
          type="button"
          role="tab"
          :style="{ 'padding-left': `${path.length * 2}rem` }"
        >
          {{ path[path.length - 1] }}
        </button>
      </template>
    </div>
    <div class="tab-content flex-grow-1" id="styles-pills-tabContent">
      <template
        v-for="[path, styles] in styleFieldGroups"
        :key="path.join('-')"
      >
        <div
          :class="
            `tab-pane` +
            (path.join('-') === firstActiveStyleFieldGroupPath
              ? ' show active'
              : '')
          "
          :id="`styles-pills-${path.join('-')}`"
          role="tabpanel"
          tabindex="0"
        >
          <div
            v-for="{ style, input } in styles"
            :key="style['stanza:key']"
            class="col mb-2"
          >
            <FormField
              :input="input"
              :path-prefix="'--togostanza-' + path.join('-') + '-'"
              :name="style['stanza:key']"
              :type="style['stanza:type']"
              :choices="style['stanza:choice']"
              :required="style['stanza:required']"
              :help-text="style['stanza:description']"
              :label="style['stanza:label']"
            ></FormField>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
