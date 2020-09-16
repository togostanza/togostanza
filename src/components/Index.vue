<template>
  <Layout>
    <h1 class="display-4">List of Stanzas</h1>

    <div class="list-group mt-3">
      <a v-for="metadata in allMetadata" :key="metadata['@id']" :href="`./${metadata['@id']}.html`" class="list-group-item list-group-item-action py-3">
        <div>{{metadata['stanza:label']}}</div>
        <p class="small text-muted text-truncate mt-1 mb-0">{{metadata['stanza:definition']}}</p>
      </a>
    </div>
  </Layout>
</template>

<script>
  import { defineComponent } from 'vue';

  import Layout from './Layout.vue';

  export default defineComponent({
    components: {
      Layout
    },

    props: ['allMetadata'],

    setup({allMetadata}) {
      return {
        allMetadata
      };
    }
  });
</script>
