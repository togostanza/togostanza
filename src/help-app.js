import { createApp } from 'vue';
import Help from './components/Help.vue';

export default function(metadata, readme) {
  return createApp(Help, {metadata, readme})
};
