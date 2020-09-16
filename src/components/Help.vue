<template>
  <Layout containerClass="container-fluid">
    <h1>{{metadata['stanza:label']}}</h1>

    <ul class="list-inline">
      <li v-for="badge in badges" :key="badge" class="list-inline-item">
        <span class="badge rounded-pill bg-secondary">{{badge}}</span>
      </li>
    </ul>

    <div class="bg-white position-sticky pt-1 mb-3" style="top: 0">
      <nav class="nav nav-tabs" role="tablist">
        <a class="nav-link active" href="#overview" data-toggle="tab" role="tab">Overview</a>
        <a class="nav-link" href="#how-to-use" data-toggle="tab" role="tab">How to use</a>
      </nav>
    </div>

    <div class="row">
      <div class="col">
        <div class="tab-content">
          <div class="tab-pane active" id="overview" role="tabpanel">
            Overview
          </div>

          <div class="tab-pane" id="how-to-use" role="tabpanel">
            <StanzaTuner :metadata="metadata"></StanzaTuner>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
  import { defineComponent, ref, computed } from 'vue';
  import 'bootstrap/js/dist/tab.js';

  import Layout from './Layout.vue';
  import StanzaTuner from './StanzaTuner.vue';

  export default defineComponent({
    components: {
      Layout,
      StanzaTuner
    },

    props: ['metadata'],

    setup({metadata}) {
      const badges  = ['stanza:context', 'stanza:display', 'stanza:license'].map(k => metadata[k]).filter(Boolean);

      return {
        metadata,
        badges
      };
    }
  });
</script>
