<template>
  <nav class="navbar navbar-light bg-light">
    <a href="./" class="navbar-brand">TogoStanza</a>
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
