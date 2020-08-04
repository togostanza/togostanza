import { createApp } from 'vue';
import Help from './Help.vue';

export default function(metadata) {
  console.log(metadata);

  return createApp(Help, {
    metadata
  })
};
