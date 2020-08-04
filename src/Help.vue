<template>
  <h1 class="page_ttl">
    {{metadata['stanza:label']}}
  </h1>

  <ul class="showcase_icn">
    <li v-if="metadata['stanza:context']">{{metadata['stanza:context']}}</li>
    <li v-if="metadata['stanza:display']">{{metadata['stanza:display']}}</li>
    <li v-if="metadata['stanza:license']">{{metadata['stanza:license']}}</li>
  </ul>

  <p class="lead">
    {{metadata['stanza:usage']}}
  </p>
</template>

<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    props: ['metadata'],

    setup({metadata}) {
      return {
        metadata
      };
    }
  });
</script>
