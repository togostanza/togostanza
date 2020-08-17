import { createApp } from 'vue';
import Help from './components/Help.vue';

export default function(metadata) {
  return createApp(Help, {metadata})
};
