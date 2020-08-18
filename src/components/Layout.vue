<style lang="scss">
  @import 'bootstrap/scss/bootstrap.scss';
</style>

<template>
  <nav class="navbar navbar-light bg-light">
    <div class="container-fluid">
      <a href="./" class="navbar-brand">TogoStanza</a>
    </div>
  </nav>

  <div :class="[containerClass || 'container']" class="my-3">
    <slot></slot>
  </div>
</template>

<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    props: ['containerClass'],

    setup({containerClass}) {
      return {
        containerClass
      };
    }
  });
</script>
