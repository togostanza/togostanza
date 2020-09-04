<style lang="scss">
  @import 'bootstrap/scss/bootstrap.scss';
</style>

<template>
  <nav class="navbar navbar-light bg-light">
    <div class="container-fluid">
      <a href="./" class="navbar-brand">{{repositoryName}}</a>

      <div class="navbar-nav">
        <a v-if="repositoryUrl" :href="repositoryUrl" target="_blank" rel="noopener noreferrer" class="nav-link">
          <span v-html="repoIcon.toSVG({height: 20})"></span>
          Source code
        </a>
      </div>
    </div>
  </nav>

  <div :class="[containerClass || 'container']" class="my-3">
    <slot></slot>
  </div>
</template>

<script>
  import { defineComponent } from 'vue';
  import { repo as repoIcon } from '@primer/octicons';

  import repositoryMetadata from 'package.json';

  export default defineComponent({
    props: ['containerClass'],

    setup({containerClass}) {
      return {
        containerClass,
        repositoryName: repositoryMetadata.name,
        repositoryUrl:  repositoryMetadata.repository,
        repoIcon
      };
    }
  });
</script>
