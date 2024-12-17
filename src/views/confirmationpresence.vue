<template>
  <v-container>
    <v-card>
      <v-card-title>
        <div class="d-flex justify-space-between align-center w-100">
          <v-select
            v-model="selectedAgent"
            :items="allAgents"
            item-title="name"
            item-value="id"
            label="Filtrer par agent"
            clearable
            @update:model-value="fetch"
            class="mr-2"
            style="max-width: 200px;"
          ></v-select>
          <v-btn @click="exportToExcel" class="ml-auto" color="green">Export Excel</v-btn>
          <v-btn @click="refreshData" class="ml-2" color="primary">Refresh</v-btn>
        </div>
      </v-card-title>
      <v-data-table-server
        :headers="headers"
        :items="presencesforacceptance"
        :options.sync="options"
        :items-length="totalItems"
        :loading="loading"
        class="elevation-1"
        @update:options="fetch"
      >
        <template v-slot:item.actions="{ item }">
          <v-icon
            color="green"
            @click="confirmStatus(item, 'accept')"
          >
            mdi-check
          </v-icon>
          <v-icon
            color="red"
            @click="confirmStatus(item, 'reject')"
            :disabled="item.overallStatus=='absent'"
          >
            mdi-close
          </v-icon>
        </template>

        <template v-slot:item.entree="{ item }">
          <div
            class="custom-chip"
            :style="{ backgroundColor: statusColors[item.morningEntryStatus] || statusColors.default }"
          >
            {{ item.entree }}
          </div>
        </template>

        <template v-slot:item.sortie="{ item }">
          <div
            class="custom-chip"
            :style="{ backgroundColor: statusColors[item.morningExitStatus] || statusColors.default }"
          >
            {{ item.sortie }}
          </div>
        </template>

        <template v-slot:item.entree1="{ item }">
          <div
            class="custom-chip"
            :style="{ backgroundColor: statusColors[item.afternoonEntryStatus] || statusColors.default }"
          >
            {{ item.entree1 }}
          </div>
        </template>

        <template v-slot:item.sortie1="{ item }">
          <div
            class="custom-chip"
            :style="{ backgroundColor: statusColors[item.afternoonExitStatus] || statusColors.default }"
          >
            {{ item.sortie1 }}
          </div>
        </template>
        <template v-slot:item.overallStatus="{ item }">
  <div
    class="custom-chip"
    :style="{ backgroundColor: statusColors[item.overallStatus] || statusColors.default }"
  >
    {{ item.overallStatus == 'true' ? 'accepté' : item.overallStatus }}
  </div>
</template>
      </v-data-table-server>
    </v-card>

    <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor">
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn color="white" text @click="snackbar = false">Fermer</v-btn>
      </template>
      
    </v-snackbar>
  </v-container>
</template>
 
<script>
import { mapActions, mapGetters } from 'vuex';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default {
  data() {
    return {
      headers: [
        { title: "Agent", key: "User", sortable: false },
        { title: "Date", key: "date", sortable: false },
        { title: "Environnement", key: "environnement", sortable: false },
        { title: "Début Matin", key: "entree", sortable: false },
        { title: "Fin Matin", key: "sortie", sortable: false },
        { title: "Début après Midi", key: "entree1", sortable: false },
        { title: "Fin Après Midi", key: "sortie1", sortable: false },
        { title: "Prod", key: "prod", sortable: false },
        { title: "Prod Matin", key: "prodm", sortable: false },
        { title: "Prod Après-Midi", key: "prodam", sortable: false },
        { title: "Retard Total", key: "retardtotal", sortable: false },
        { title: "Retard Matin", key: "retardm", sortable: false },
        { title: "Retard Après-Midi", key: "retardam", sortable: false },
        { title: "staut global", key: "overallStatus", sortable: false },
        { title: "Actions", key: "actions", sortable: false },
      ],
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['date'],
        sortDesc: [true],
      },
      selectedAgent: null,
      snackbar: false,
      snackbarMessage: '',
      snackbarColor: 'success',
      dafield: null,
      absenceModal: false,
    absenceReason: '',
    };
  },
  computed: {
    ...mapGetters("agent", ["allAgents"]),
    ...mapGetters(["presencesforacceptance", "loading"]),
    statusColors() {
      return {
        true: 'green',
        false: 'red',
        default: 'gray'
      };
    },
    totalItems() {
      // Implement logic to get total items from store or API
      return this.presencesforacceptance.length;
    },
  },
  methods: {
    ...mapActions(['getPresences', 'togglePresenceStatus', 'updatePresenceField','updateAllStatuses']),
    ...mapActions({ fetchAllAgents: "agent/fetchAllAgents" }),
    openAbsenceReasonModal(item) {
    this.currentItem = item;
    this.absenceModal = true;
  },
  async confirmStatus(item, action) {
  try {
    const status = action === 'accept' ? 'true' : 'false';
    let currentStep = this.determineCurrentStep(item);

    if (!currentStep) {
      this.showSnackbar('No step to confirm.', 'warning');
      return;
    }

    // Check if the current step is 'overallStatus' and the action is 'reject'
    if (currentStep === 'overallStatus' && action === 'reject') {
      // Redirect to the absence page
      this.$router.push({ name: 'Absence' });
      return;
    }

    // Update the presence field
    await this.updatePresenceField({
      id: item.id,
      field: currentStep,
      status: status,
    });

    // Save progress
    this.saveProgress(item.id, currentStep, status);

    // Show a success snackbar
    this.showSnackbar(`Step ${currentStep} marked as ${status} successfully`, 'success');
  } catch (error) {
    // Show an error snackbar
    this.showSnackbar(`Error marking step as ${error}`, 'error');
  }
},
    determineCurrentStep(item) {
  if (item.morningEntryStatus === null) return 'morningEntryStatus';
  if (item.morningExitStatus === null) return 'morningExitStatus';
  if (item.afternoonEntryStatus === null) return 'afternoonEntryStatus';
  if (item.afternoonExitStatus === null) return 'afternoonExitStatus';
  if (item.overallStatus === null) return 'overallStatus';
  return null;
},
    isAllStepsConfirmed(item) {
      return (
        item.mrniongEntryStatus !== null &&
        item.morningExitStatus !== null &&
        item.afternoonEntryStatus !== null &&
        item.afternoonExitStatus !== null
      );
    },
    saveProgress(presenceId, step, status) {
      const progress = JSON.parse(localStorage.getItem('progress')) || {};
      if (!progress[presenceId]) {
        progress[presenceId] = {};
      }
      progress[presenceId][step] = status;
      localStorage.setItem('progress', JSON.stringify(progress));
    },
    formatMinutesToHoursAndMinutes(minutes) {
      if (!minutes) return '0h 0m';
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    },
    showSnackbar(message, color = 'success') {
      this.snackbarMessage = message;
      this.snackbarColor = color;
      this.snackbar = true;
    },
    async fetch(newOptions) {
      if (newOptions) {
        this.options = newOptions;
      }
      const { page, itemsPerPage, sortBy } = this.options;
      const sortKey = sortBy && sortBy.length > 0 ? sortBy[0].key : 'date';
      const sortOrder = sortBy && sortBy.length > 0 ? sortBy[0].order : 'desc';
      await this.getPresences({
        page,
        limit: itemsPerPage,
        sortBy: sortKey,
        sortOrder,
        agentId: this.selectedAgent,
      });
    },
    async refreshData() {
      await this.fetch(this.options);
    },
    exportToExcel() {
      const modifiedData = this.presencesforacceptance.map(item => ({
        agent: item.User ? item.User.name : 'N/A',
        date: format(new Date(item.date), 'dd/MM/yyyy', { locale: fr }),
        environnement: item.environnement,
        entree: item.entree,
        sortie: item.sortie,
        entree1: item.entree1,
        sortie1: item.sortie1,
        prod: item.prod,
        "prod matin": item.prodm,
        "prod après-midi": item.prodam,
        "retard total": item.retardtotal,
        "retard matin": item.retardm,
        "retard après-midi": item.retardam,
      }));
      const worksheet = XLSX.utils.json_to_sheet(modifiedData);
      const columnWidths = [
        { wch: 20 },
        { wch: 12 },
        { wch: 15 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 12 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
      ];
      worksheet['!cols'] = columnWidths;
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Presences');
      XLSX.writeFile(workbook, 'presences.xlsx');
    },
    applySavedProgress() {
      const progress = JSON.parse(localStorage.getItem('progress')) || {};
      this.presencesforacceptance.forEach((item) => {
        if (progress[item.id]) {
          Object.keys(progress[item.id]).forEach((step) => {
            item[step] = progress[item.id][step];
          });
        }
      });
    },
  },
  async created() {
    await this.fetchAllAgents();
    await this.fetch(this.options);
    this.applySavedProgress();
  },
};
</script>

<style scoped>

.custom-chip {
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  color: white;
  font-size: 14px;
}
</style>