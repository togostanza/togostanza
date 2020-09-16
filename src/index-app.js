import { createApp } from 'vue';

import Index from './components/Index.vue';
import allMetadata from '-repository/all-metadata';

createApp(Index, {allMetadata}).mount('body');
