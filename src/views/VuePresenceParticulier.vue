<template>
  <v-container>
    <!-- Agent Selection -->
    <v-row justify="end" class="mb-4">
      <v-col cols="auto">
        <v-select
          v-model="selectedAgent"
          :items="allAgents"
          item-title="name"
          item-value="id"
          label="Filtrer par agent"
          density="compact"
          variant="outlined"
          style="width: 200px"
          @update:model-value="fetch"
        ></v-select>
      </v-col>
    </v-row>

    <!-- Loading Overlay -->
    <v-overlay
      :model-value="isLoading"
      class="align-center justify-center"
      scrim="#fff"
      persistent
    >
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>

    <template v-if="!isLoading && leaveBalances">
      <v-row>
        <!-- Vertical Summary Table -->
        <v-col cols="3">
          <v-card height="100%">
            <v-table density="compact" height="100%">
              <tbody>
                <tr>
                  <th class="bg-primary text-white text-caption" style="width: 120px">Nb Mois effectué</th>
                  <td class="text-caption">{{ leaveBalances.monthsDone || 'N/A' }}</td>
                </tr>
                <tr>
                  <th class="bg-primary text-white text-caption">SOLDE CONGE</th>
                  <td class="text-caption">{{ leaveBalances.SOLDECONGE || 'N/A' }}</td>
                </tr>
                <tr>
                  <th class="bg-primary text-white text-caption">CONGE PRISE</th>
                  <td class="text-caption bg-warning">{{ leaveBalances.CONGEPRISE || 'N/A' }}</td>
                </tr>
                <tr>
                  <th class="bg-primary text-white text-caption">Sanction</th>
                  <td class="text-caption bg-error">{{ leaveBalances.sanction || 'N/A' }}</td>
                </tr>
                <tr>
                  <th class="bg-primary text-white text-caption">RESTE CONGE</th>
                  <td class="text-caption bg-success-lighten-1">{{ leaveBalances.RESTCONGE || 'N/A' }}</td>
                </tr>
                <tr>
                  <th class="bg-primary text-white text-caption">Rest ancien congé</th>
                  <td class="text-caption">{{ leaveBalances.RESTANCIENCONGE || 'N/A' }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>

        <!-- Conge Data Table -->
        <v-col cols="9">
          <v-card>
            <v-card-title class="d-flex justify-space-between pa-4 bg-secondary-lighten-4">
              <span class="text-caption">Projet: {{ leaveBalances.projects?.[0]?.name || 'N/A' }}</span>
              <span class="text-caption">{{ leaveBalances.name || 'N/A' }}</span>
              <span class="text-caption">Aujourd'hui: {{ currentDate }}</span>
            </v-card-title>
            <v-data-table
  :headers="headers"
  :items="leaveBalances.conges || []"
  density="compact"
  class="elevation-1"
>
  <template v-slot:item.startDate="{ item }">
    {{ formatDate(item.startDate) }}
  </template>
  <template v-slot:item.endDate="{ item }">
    {{ formatDate(item.endDate) }}
  </template>
</v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-row v-else-if="!isLoading && !leaveBalances">
      <v-col>
        <v-alert type="info" text="No leave balance data available."></v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import moment from 'moment';

export default {
  data() {
    return {
      selectedAgent: null,
      currentDate: moment().format('DD/MM/YYYY'),
      headers: [
        {
          title: 'Date début congé',
          key: 'startDate',
          align: 'start',
          sortable: true,
        },
        {
          title: 'Date Fin Congé',
          key: 'endDate',
          align: 'start',
          sortable: true,
        },
        {
          title: 'Nb des jours',
          key: 'nbrDeJour',
          align: 'start',
          sortable: true,
        },
        {
          title: 'Raison',
          key: 'raison',
          align: 'start',
          sortable: false,
        },
      ],
      itemsPerPage: 10,
      totalItems: 0,
    };
  },
  computed: {
    ...mapGetters("agent", ["allAgents"]),
    ...mapGetters("CalculeConge", ["leaveBalances", "loading"]),
    isLoading() {
      return this.loading;
    }
  },
  methods: {
    ...mapActions({
      fetchAllAgents: "agent/fetchAllAgents",
    }),
    ...mapActions("CalculeConge", ["fetchCongeDataUser"]),
    async fetch() {
      if (this.selectedAgent) {
        await this.fetchCongeDataUser({ userId: this.selectedAgent });
      }
    },
    formatDate(dateString) {
      return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
    },
  },
  watch: {
    'leaveBalances.conges'(newVal) {
      if (newVal) {
        this.totalItems = newVal.length;
      }
    }
  },
  async created() {
    await this.fetchAllAgents();
    this.selectedAgent = parseInt(this.$route.params.id);
    if (this.selectedAgent) {
      await this.fetchCongeDataUser({userId: this.selectedAgent});
    }
  },
};
</script>

<style scoped>
.v-data-table ::v-deep th {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
}

/* Adjust table cell padding */
:deep(.v-table .v-table__wrapper > table > tbody > tr > td),
:deep(.v-table .v-table__wrapper > table > tbody > tr > th) {
  padding: 2px 8px !important;
}
</style>