import { createApp } from 'vue';
import Help from './Help.vue';

export default function(metadata) {
  return createApp(Help, {metadata})
};
