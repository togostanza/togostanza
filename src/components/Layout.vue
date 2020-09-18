<template>
  <nav class="navbar navbar-light bg-light">
    <div class="container-fluid">
      <a href="./" class="navbar-brand">{{repositoryName || 'TogoStanza'}}</a>

      <div class="navbar-nav">
        <a v-if="repositoryUrl" :href="repositoryUrl" target="_blank" rel="noopener noreferrer" class="nav-link">
          <span v-html="repoIcon.toSVG({height: 20})"></span>
          Source code
        </a>
      </div>

      <a href="http://togostanza.org" target="_blank" rel="noopener noreferrer" class="navbar-text ml-auto">
        <svg version="1.1" x="0px" y="0px" viewBox="0 0 72 46" enable-background="new 0 0 72 46" height="30">
          <title>TogoStanza</title>

          <g>
            <g>
              <g>
                <path fill="#F39800" d="M35.4,26.8c-4.3,0-6.5,3.2-14,3.2c-9,0-16.3-5.7-16.3-15c0-9.3,7.3-15,16.3-15c7.4,0,9.7,3.2,14,3.2 c4.3,0,6.5-3.2,14-3.2c9,0,16.3,5.7,16.3,15c0,9.3-7.3,15-16.3,15C41.9,30.1,39.7,26.8,35.4,26.8z"/>
              </g>
              <ellipse fill="#EB7900" cx="35.4" cy="15.1" rx="10.2" ry="11.7"/>
              <g>
                <path fill="#FFFFFF" d="M15.5,20.7h-2.9v-8.8h-2.4V9.4H18v2.5h-2.4V20.7z"/>
                <path fill="#FFFFFF" d="M32.5,14.9c0,3.7-2.6,6.3-6.3,6.3c-3.6,0-6.3-2.6-6.3-6.3c0-3.4,3-5.8,6.3-5.8 C29.5,9,32.5,11.4,32.5,14.9z"/>
                <path fill="#FFFFFF" d="M46.7,14.4c0,1.7-0.1,3.1-1.2,4.5c-1.1,1.5-2.8,2.2-4.7,2.2c-3.6,0-6-2.4-6-6c0-3.7,2.5-6.1,6.1-6.1 c2.3,0,4.1,1.1,5.1,3.2l-2.8,1.2c-0.4-1.1-1.3-1.8-2.4-1.8c-1.9,0-2.9,1.8-2.9,3.6c0,1.8,1.1,3.5,3,3.5c1.3,0,2.3-0.7,2.4-2h-2.4 v-2.3H46.7z"/>
                <path fill="#FFFFFF" d="M61.5,14.9c0,3.7-2.6,6.3-6.3,6.3c-3.6,0-6.3-2.6-6.3-6.3c0-3.4,3-5.8,6.3-5.8 C58.5,9,61.5,11.4,61.5,14.9z"/>
              </g>
            </g>
            <g>
              <path fill="#444444" d="M7,37.3c-0.5-0.5-1.2-0.8-2-0.8c-0.5,0-1.3,0.3-1.3,0.9c0,0.7,0.8,0.9,1.3,1.1l0.8,0.2 c1.6,0.5,2.8,1.3,2.8,3.1c0,1.1-0.3,2.3-1.2,3.1C6.5,45.7,5.3,46,4.2,46c-1.4,0-2.8-0.5-4-1.3l1.3-2.4c0.7,0.6,1.6,1.2,2.6,1.2 c0.7,0,1.4-0.3,1.4-1.1c0-0.8-1.2-1.1-1.8-1.3c-1.9-0.5-3.1-1-3.1-3.2c0-2.3,1.6-3.8,3.9-3.8c1.1,0,2.5,0.4,3.5,0.9L7,37.3z"/>
              <path fill="#444444" d="M16,45.7h-2.9v-8.8h-2.4v-2.5h7.8v2.5H16V45.7z"/>
              <path fill="#444444" d="M23.9,43.7l-0.8,2H20l4.4-11.3h3.2l4.3,11.3h-3.1l-0.7-2H23.9z M26,37.9L26,37.9l-1.2,3.6h2.5L26,37.9z"/>
              <path fill="#444444" d="M34.3,34.4h2.9l5.4,6.9h0v-6.9h2.9v11.3h-2.9l-5.4-6.9h0v6.9h-2.9V34.4z"/>
              <path fill="#444444" d="M58,43.2v2.5h-9.7l5.4-8.8h-4.5v-2.5h9.4l-5.3,8.8H58z"/>
              <path fill="#444444" d="M64.1,43.7l-0.8,2h-3.1l4.4-11.3h3.2L72,45.7h-3.1l-0.7-2H64.1z M66.1,37.9L66.1,37.9l-1.2,3.6h2.5 L66.1,37.9z"/>
            </g>
          </g>
        </svg>
      </a>
    </div>
  </nav>

  <div :class="[containerClass || 'container']" class="my-3">
    <slot></slot>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { repo as repoIcon } from '@primer/octicons';

import '@primer/octicons/index.scss';
import 'bootstrap/scss/bootstrap.scss';

import repositoryMetadata from '-repository/package.json';

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
