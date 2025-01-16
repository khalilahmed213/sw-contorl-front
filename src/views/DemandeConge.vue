<template>
  <v-container>
    <v-card>
      <!-- Filters and Actions -->
      <v-card-title class="d-flex align-center">
        <!-- Agent Filter -->
        <v-select
          v-model="selectedAgent"
          :items="allAgents"
          item-title="name"
          item-value="id"
          label="Filtrer par agent"
          clearable
          @update:modelValue="fetch"
          class="mr-4"
          style="max-width: 200px;"
          density="compact"
          variant="outlined"
        ></v-select>

        <!-- Date Filter -->
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-text-field
              :model-value="options.selectedDate ? formatDateForDisplay(options.selectedDate) : ''"
              label="Filtrer par date"
              readonly
              v-bind="props"
              clearable
              @click:clear="clearDate"
              class="mr-4"
              style="max-width: 200px;"
              density="compact"
              variant="outlined"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="options.selectedDate"
            @update:model-value="fetch"
            locale="fr-FR"
          ></v-date-picker>
        </v-menu>

        <!-- Spacer to push buttons to the right -->
        <v-spacer></v-spacer>

        <!-- Export and Refresh Buttons -->
        <v-btn color="success" @click="exportToExcel" class="ml-2">
          <v-icon left>mdi-file-excel</v-icon>
          Exporter Excel
        </v-btn>
        <v-btn color="blue" @click="refresh" class="ml-2">
          Actualiser
        </v-btn>
      </v-card-title>

      <!-- Data Table -->
      <v-data-table-server
        :headers="headers"
        :items="conges"
        v-model:options="options"
        :items-length="totalItems"
        :loading="loading"
        class="elevation-1"
        @update:options="fetch"
      >
        <!-- Table Templates -->
        <template v-slot:item.actions="{ item }">
          <v-icon
            color="green"
            @click="toggleStatus(item, 'accepté')"
            :disabled="item.status !== 'en attente'"
          >
            mdi-check
          </v-icon>
          <v-icon
            color="red"
            @click="toggleStatus(item, 'rejeté')"
            :disabled="item.status !== 'en attente'"
          >
            mdi-close
          </v-icon>
        </template>
        <template v-slot:item.startDate="{ item }">
          {{ formatDate(item.startDate) }}
        </template>
        <template v-slot:item.endDate="{ item }">
          {{ formatDate(item.endDate) }}
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" dark>{{ item.status }}</v-chip>
        </template>
      </v-data-table-server>
    </v-card>
  </v-container>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import * as XLSX from 'xlsx';

export default {
  data() {
    return {
      headers: [
        { title: "Référence", key: "reference", sortable: true },
        { title: "Agent", key: "User.name", sortable: true },
        { title: "Date Début", key: "startDate", sortable: true },
        { title: "Date Fin", key: "endDate", sortable: true },
        { title: "Nbr de Jour", key: "nbrDeJour", sortable: true },
        { title: "Status", key: "status", sortable: true },
        { title: "Action", key: "actions", sortable: false },
      ],
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: [],
        sortDesc: [],
        selectedDate: null,
      },
      selectedAgent: null,
    };
  },
  computed: {
    ...mapState('conge', ['conges', 'totalItems', 'loading']),
    ...mapGetters("agent", ["allAgents"]),
  },
  methods: {
    ...mapActions('conge', ['fetchConges', 'toggleCongeStatus']),
    ...mapActions({
      fetchAllAgents: "agent/fetchAllAgents"
    }),
    async toggleStatus(item, newStatus) {
      await this.toggleCongeStatus({ id: item.id, newStatus });
      await this.fetch(this.options);
    },
    async fetch(newOptions) {
      if (newOptions) {
        this.options = {
          ...this.options,
          ...newOptions,
        };
      }

      const { page, itemsPerPage, sortBy, selectedDate } = this.options;
      const sortKey = sortBy && sortBy.length > 0 ? sortBy[0].key : 'reference';
      const sortOrder = sortBy && sortBy.length > 0 ? sortBy[0].order : 'asc';

      await this.fetchConges({
        page,
        limit: itemsPerPage,
        sortBy: sortKey,
        sortOrder,
        UserId: this.selectedAgent,
        date: selectedDate,
      });
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR');
    },
    async exportToExcel() {
      const worksheet = XLSX.utils.json_to_sheet(this.conges.map(({ id, ...rest }) => rest));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Congés');
      XLSX.writeFile(workbook, 'conges.xlsx');
    },
    clearDate() {
      this.options.selectedDate = null;
      this.fetch();
    },
    async refresh() {
      this.options = {
        page: 1,
        itemsPerPage: 10,
        sortBy: [],
        sortDesc: [],
        selectedDate: null,
      };
      await this.fetch();
    },
    getStatusColor(status) {
      switch (status) {
        case "accepté": return "green";
        case "rejeté": return "red";
        case "en attente": return "orange";
        default: return "grey";
      }
    },
    formatDateForDisplay(date) {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },
  },
  async created() {
    await this.fetchAllAgents();
  },
};
</script>

<style scoped>
/* Add custom styles if needed */
</style>