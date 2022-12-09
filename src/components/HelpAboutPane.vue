<script setup>
defineProps({
  metadata: {
    type: Object,
    required: true,
  },
  readme: String,
});
</script>

<style scoped>
th {
  background-color: var(--bs-light);
  text-align: center;
  white-space: nowrap;
  width: 1%;
}

th,
td {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}
</style>

<template>
  <table class="table table-borderless border mb-1">
    <tbody>
      <tr>
        <th>Author</th>

        <td>
          <address class="mb-0">
            {{ metadata['stanza:author'] || '-' }}
          </address>
        </td>
      </tr>

      <tr>
        <th>Contributors</th>

        <td>
          <template
            v-if="
              metadata['stanza:contributor'] &&
              metadata['stanza:contributor'].length > 0
            "
          >
            <ul class="list-unstyled mb-0">
              <li
                v-for="contributor in metadata['stanza:contributor']"
                :key="contributor"
              >
                {{ contributor }}
              </li>
            </ul>
          </template>

          <template v-else> - </template>
        </td>
      </tr>

      <tr>
        <th>License</th>
        <td>{{ metadata['stanza:license'] || '-' }}</td>
      </tr>

      <tr>
        <th>Created</th>
        <td>{{ metadata['stanza:created'] || '-' }}</td>
      </tr>

      <tr>
        <th>Updated</th>
        <td>{{ metadata['stanza:updated'] || '-' }}</td>
      </tr>
    </tbody>
  </table>

  <div class="text-end">
    <a :href="`./${metadata['@id']}/metadata.json`">Download JSON</a>
  </div>

  <div v-html="readme" class="mt-4"></div>
</template>
