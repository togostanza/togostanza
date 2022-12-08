<script setup>
import FormField from './FormField.vue';

defineProps({
  paramTree: {
    type: Object,
    required: true,
  },
  paramFieldGroups: {
    type: Object,
    required: true,
  },
  firstActiveParamFieldGroupPath: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="d-flex align-items-start">
    <div
      class="nav flex-column nav-pills me-3"
      id="v-pills-tab"
      role="tablist"
      aria-orientation="vertical"
    >
      <template v-for="[a, ta] in paramTree.entries()" :key="a">
        <button
          :class="
            `nav-link text-start` +
            (a === firstActiveParamFieldGroupPath ? ' active' : '') +
            (paramFieldGroups.has(a) ? '' : ' disabled')
          "
          data-bs-toggle="pill"
          :data-bs-target="`#v-pills-${a}`"
          type="button"
          role="tab"
        >
          {{ a }}
        </button>
        <template v-for="b in ta.keys()" :key="b">
          <button
            :class="
              `nav-link text-start` +
              (`${a}-${b}` === firstActiveParamFieldGroupPath ? ' active' : '')
            "
            data-bs-toggle="pill"
            :data-bs-target="`#v-pills-${a}-${b}`"
            type="button"
            role="tab"
            style="padding-left: 2rem"
          >
            {{ b }}
          </button>
        </template>
      </template>
    </div>

    <div class="tab-content flex-grow-1" id="v-pills-tabContent">
      <template v-for="[a, ta] in paramTree.entries()" :key="a">
        <div
          :class="
            `tab-pane` +
            (a === firstActiveParamFieldGroupPath ? ' show active' : '')
          "
          :id="`v-pills-${a}`"
          role="tabpanel"
          aria-labelledby="v-pills-home-tab"
          tabindex="0"
        >
          <div
            v-for="{ param, input } in paramFieldGroups.get(a)"
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
        <template v-for="b in ta.keys()" :key="b">
          <div
            :class="
              'tab-pane' +
              (`${a}-${b}` === firstActiveParamFieldGroupPath ? ' active' : '')
            "
            :id="`v-pills-${a}-${b}`"
            role="tabpanel"
            aria-labelledby="v-pills-home-tab"
            tabindex="0"
          >
            <div
              v-for="{ param, input } in paramFieldGroups.get(`${a}-${b}`)"
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
      </template>
    </div>
  </div>
</template>
