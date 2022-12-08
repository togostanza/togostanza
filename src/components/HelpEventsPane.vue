<script setup>
const { metadata } = defineProps({
  metadata: {
    type: Object,
    required: true,
  },
});

const outgoingEvents = (metadata['stanza:outgoingEvent'] || []).map((event) => {
  return {
    name: event['stanza:key'],
    description: event['stanza:description'],
  };
});

const incomingEvents = (metadata['stanza:incomingEvent'] || []).map((event) => {
  return {
    name: event['stanza:key'],
    description: event['stanza:description'],
  };
});
</script>

<template>
  <h2 class="my-3">Outgoing Events</h2>

  <div class="row row-cols-2">
    <div
      v-for="{ name, description } in outgoingEvents"
      :key="name"
      class="col"
    >
      <div>{{ name }}</div>
      <div class="text-muted">{{ description }}</div>
    </div>
  </div>

  <p v-if="outgoingEvents.length === 0" class="fst-italic">
    No events defined.
  </p>

  <h2 class="my-3">Incoming Events</h2>

  <div class="row row-cols-2">
    <div
      v-for="{ name, description } in incomingEvents"
      :key="name"
      class="col"
    >
      <div>{{ name }}</div>
      <div class="text-muted">{{ description }}</div>
    </div>
  </div>

  <p v-if="incomingEvents.length === 0" class="fst-italic">
    No events defined.
  </p>
</template>
