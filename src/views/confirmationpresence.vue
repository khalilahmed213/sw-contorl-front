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
          <v-btn @click="acceptAllStatus" class="ml-2" color="success" :disabled="isAcceptAllDisabled" >Accept All</v-btn>
        </div>
      </v-card-title>
      <v-data-table-server
        :headers="!bool ? headers : headersnonrecuring"
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
        <template v-slot:item.prodm="{ item }">
          <div>{{ formatTime(item.prodm) }}</div>
        </template>

        <template v-slot:item.retardm="{ item }">
          <div>{{ formatTime(item.retardm) }}</div>
        </template>

        <template v-slot:item.prodam="{ item }">
          <div>{{ formatTime(item.prodam) }}</div>
        </template>

        <template v-slot:item.retardam="{ item }">
          <div>{{ formatTime(item.retardam) }}</div>
        </template>

       

        <template v-slot:item.retardtotal="{ item }">
          <div>{{ formatTime(item.retardtotal) }}</div>
        </template>
        <template v-slot:item.overallStatus="{ item }">
  <div
    class="custom-chip"
    :style="{ backgroundColor: statusColors[item.overallStatus] || statusColors.default }"
  >
    {{ item.overallStatus == true ? 'accepté' : item.overallStatus }}
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
import axios from 'axios';

export default {
  data() {
    return {
      headers: [
        { title: "Agent", key: "User", sortable: false },
        { title: "Environnement", key: "environnement", sortable: false },
        { title: "Début Matin", key: "entree", sortable: false },
        { title: "Fin Matin", key: "sortie", sortable: false },
        { title: "Prod Matin", key: "prodm", sortable: false },
        { title: "Retard Matin", key: "retardm", sortable: false },
        { title: "Début Après-Midi", key: "entree1", sortable: false },
        { title: "Fin Après-Midi", key: "sortie1", sortable: false },
        { title: "Prod Après-Midi", key: "prodam", sortable: false },
        { title: "Retard Après-Midi", key: "retardam", sortable: false },
        { title: "Prod", key: "prod", sortable: false },
        { title: "Retard Total", key: "retardtotal", sortable: false },        
        { title: "Actions", key: "actions", sortable: false },
      ],
      headersnonrecuring: [
        { title: "Agent", key: "User", sortable: false },
        { title: "Environnement", key: "environnement", sortable: false },
        { title: "Statut Global", key: "overallStatus", sortable: false },
        { title: "Début Matin", key: "entree", sortable: false },
        { title: "Fin Journée", key: "sortie", sortable: false },
        { title: "Prod", key: "prod", sortable: false },
        { title: "Retard Total", key: "retardtotal", sortable: false },
      
        { title: "Actions", key: "actions", sortable: false },
      ],
      options: {
      page: 1,
      itemsPerPage: 10,
    },
      bool: null,
      selectedAgent:1,
      snackbar: false,
      snackbarMessage: '',
      snackbarColor: 'success',
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
      return this.presencesforacceptance.length;
    },
    isAcceptAllDisabled() {
      if (!this.presencesforacceptance || this.presencesforacceptance.length === 0) {
        return true;
      }
      return this.presencesforacceptance.every(presence => 
    presence.environnement === "N/A" || 
    (presence.overallStatus && presence.overallStatus == true)
);
    },
  },
  methods: {
    ...mapActions(['getPresences', 'updatePresenceField','updateOverallStatus']),
    ...mapActions({ fetchAllAgents: "agent/fetchAllAgents" }),
    async acceptAllStatus() {
  try {
    // Determine the fields to update based on bool value
    const fieldsToUpdate = !this.bool
      ? ['morningEntryStatus', 'morningExitStatus', 'afternoonEntryStatus', 'afternoonExitStatus', 'overallStatus']
      : ['morningEntryStatus', 'morningExitStatus', 'overallStatus'];

    // Prepare records to update
    const recordsToUpdate = this.presencesforacceptance.map(presence => {
      // Determine the current step for each presence
      const currentStep = this.determineCurrentStep(presence);
      let updateData = {};

      if (currentStep) {
        updateData = {
          id: presence.id,
          [currentStep]: true,
        };
      } else {
        return null;
      }

      return updateData;
    }).filter(record => record !== null); // Remove null records

    // Send the update request
    await axios.post('http://localhost:3000/api/presence/update-all-statuses', recordsToUpdate, {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
    });

    this.showSnackbar('All statuses have been accepted.', 'success');
    await this.fetch(this.options);
  } catch (error) {
    this.showSnackbar('Error accepting all statuses: ' + error.message, 'error');
  } finally {
    this.loading = false;
  }
},
    async confirmStatus(item, action) {
      try {
        const status = action === 'accept' ? 'true' : 'false';
        let currentStep = this.determineCurrentStep(item);

        if (!currentStep) {
          this.showSnackbar('Aucun étape à confirmer.', 'warning');
          return;
        }

        if (currentStep === 'overallStatus' && action === 'reject' && !this.bool) {
          this.$router.push({ name: 'Absence' });
          return;
        }

        await this.updatePresenceField({
          id: item.id,
          field: currentStep,
          status: status,
        });

        this.saveProgress(item.id, currentStep, status);
        this.showSnackbar(`Étape ${currentStep} marquée comme ${status} avec succès`, 'success');
        await this.fetch(this.options);
      } catch (error) {
        this.showSnackbar(`Erreur lors de la marquage de l'étape : ${error}`, 'error');
      }
    },
    determineCurrentStep(item) {
      if (!this.bool) {
        if (item.morningEntryStatus === null) return 'morningEntryStatus';
        if (item.morningExitStatus === null) return 'morningExitStatus';
        if (item.afternoonEntryStatus === null) return 'afternoonEntryStatus';
        if (item.afternoonExitStatus === null) return 'afternoonExitStatus';
        if (item.overallStatus === null) return 'overallStatus';
      } else {
        if (item.morningEntryStatus === null) return 'morningEntryStatus';
        if (item.morningExitStatus === null) return 'morningExitStatus';
        if (item.overallStatus === null) return 'overallStatus';
      }
      return null;
    },
    isAllStepsConfirmed(item) {
      if (!this.bool) {
        return (
          item.morningEntryStatus !== null &&
          item.morningExitStatus !== null &&
          item.afternoonEntryStatus !== null &&
          item.afternoonExitStatus !== null
        );
      } else {
        return (
          item.morningEntryStatus !== null &&
          item.morningExitStatus !== null
        );
      }
    },
    saveProgress(presenceId, step, status) {
      const progress = JSON.parse(localStorage.getItem('progress')) || {};
      if (!progress[presenceId]) {
        progress[presenceId] = {};
      }
      progress[presenceId][step] = status;
      localStorage.setItem('progress', JSON.stringify(progress));
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
  
  // Set agentId only if selectedAgent is not null
  const agentId = this.selectedAgent !== null ? this.selectedAgent : undefined;
  
  await this.getPresences({
    agentId: agentId,
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
        "statut global": item.overallStatus,
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
        { wch: 12 },
      ];
      worksheet['!cols'] = columnWidths;
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Présences');
      XLSX.writeFile(workbook, 'presences.xlsx');
    },
    formatTime(minutes) {
      if (isNaN(minutes)) {
        return 'en attente';
      }
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    },
    async loadbool() {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/schedules/getisramadan",
          {
            params: { date: new Date() },
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }
        );
        this.bool = response.data.isRamadan;
        console.log('isRamadan:', !this.bool); // Debugging line
      } catch (error) {
        console.error('Error fetching isRamadan:', error);
      }
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
    await this.loadbool();
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