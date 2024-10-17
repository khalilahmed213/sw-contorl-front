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
              @update:modelValue="fetch"
              class="mr-2"
              style="max-width: 200px;" 
            ></v-select>
          
            <v-btn @click="exportToExcel" class="ml-auto" color="green"
          >Export Excel</v-btn
        >
        </div>
      </v-card-title>
      <v-data-table-server
        :headers="headers"
        :items="autorisations"
        :options.sync="options"
        :items-length="totalItems"
        :loading="loading"
        class="elevation-1"
        @update:options="fetch"
      >
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
      <template v-slot:item.nbrheures="{ item }">
        {{ formatMinutesToHoursAndMinutes(item.nbrheures) }}
      </template>
      <template v-slot:item.status="{ item }">
        <v-chip :color="getStatusColor(item.status)" dark small>
          {{ item.status }}
        </v-chip>
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
import { mapState, mapActions, mapGetters } from 'vuex';
import * as XLSX from 'xlsx';
import { format } from 'date-fns'; // Import date-fns for date formatting
import { fr } from 'date-fns/locale'; // Import French locale

export default {
  data() {
    return {
      headers: [
        { title: "Référence", key: "référence", sortable: true },
        { title: "Agent", key: "User.name", sortable: true },
        { title: "Date", key: "date", sortable: true },
        { title: "Heure Début", key: "heureDebut", sortable: true },
        { title: "Heure Fin", key: "heureFin", sortable: true },
        { title: "Nbr d'heures", key: "nbrheures", sortable: true },
        { title: "Status", key: "status", sortable: true },
        { title: "Action", key: "actions", sortable: false },
      ],
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['date'],
        sortDesc: [true],
      },
      search: '',
      snackbar: false,
      snackbarMessage: '',
      snackbarColor: 'success',
      selectedAgent: null,
    };
  },
  
  computed: {
    ...mapState('autorisation', ['autorisations', 'totalItems', 'loading']),
    ...mapGetters("agent", ["allAgents"]),
  },
  methods: {
    ...mapActions('autorisation', ['fetchAutorisations', 'toggleAutorisationStatus']),
    ...mapActions({
      fetchAllAgents: "agent/fetchAllAgents"
    }),
    getStatusColor(status) {
      switch (status) {
        case "accepté": return "green";
        case "rejeté": return "red";
        case "en attente": return "orange";
        default: return "grey";
      }
    },
    async toggleStatus(item, newStatus) {
      try {
        await this.toggleAutorisationStatus({
          id: item.id,
          newStatus: newStatus
        });
        await this.fetch(this.options)
        this.showSnackbar(`Autorisation ${newStatus}e avec succès`, 'success');
      } catch (error) {
        console.error('Failed to update autorisation status:', error);
        this.showSnackbar('Erreur lors de la mise à jour du statut', 'error');
      }
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
      if(newOptions){
        this.options = newOptions
      }
      const { page, itemsPerPage, sortBy } = this.options;
      const sortKey = sortBy && sortBy.length > 0 ? sortBy[0].key : 'date';
      const sortOrder = sortBy && sortBy.length > 0  ? sortBy[0].order : 'desc';
      await this.fetchAutorisations({
        page,
        limit: itemsPerPage,
        sortBy: sortKey,
        sortOrder,
        agentId: this.selectedAgent,
      });
    },
    
    // Modify exportToExcel to exclude createdAt and updatedAt and follow header order
    exportToExcel() {
      const modifiedData = this.autorisations.map(item => ({
        référence: item.référence, // Include reference
        User: item.User.name, // Replace user id with user name
        date: format(new Date(item.date), 'dd/MM/yyyy', { locale: fr }), // Format date
        heureDebut: item.heureDebut, // Include start time
        heureFin: item.heureFin, // Include end time
        nbrheures: item.nbrheures, // Include number of hours
        status: item.status, // Include status
      }));
      const worksheet = XLSX.utils.json_to_sheet(modifiedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Autorisations');
      XLSX.writeFile(workbook, 'autorisations.xlsx');
    },
  },
 
 async created() {
   await this.fetchAllAgents();
  },
  mounted(){
    console.log(this.autorisations)
  }
};
</script>

<style scoped>
</style>