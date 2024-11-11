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
            @click="toggleStatus(item,action)"
            :disabled="item.status !== 'en attente'"
          >
            mdi-check
          </v-icon>
          <v-icon
            color="red"
            @click="showAbsentDialog(item)"
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
      <v-dialog v-model="dialogVisible" max-width="500px">
      <v-card>
        <v-card-title>Enter Absence Reason</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="absenceReason"
            label="Reason"
            required
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="dialogVisible = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="isLoading"
            @click="setraison"
          >
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    </v-container>
  </template>
  
  <script>
  import { mapActions, mapGetters } from 'vuex';
  import * as XLSX from 'xlsx';
  import { format } from 'date-fns'; // Import date-fns for date formatting
  import { fr } from 'date-fns/locale'; // Import French locale
  
  export default {
    data() {
      return {
        headers: [
          { title: "Agent", key: "User", sortable: true },
          { title: "Date", key: "date", sortable: true },
          { title: "Environnement", key: "environnement", sortable: true },
          { title: "entree", key: "entree", sortable: true },
          { title: "sortie", key: "sortie", sortable: true },
          { title: "entree1", key: "entree1", sortable: true },
          { title: "sortie1", key: "sortie1", sortable: true },
          { title: "prod", key: "prod", sortable: true },
          { title: "prodM", key: "prodm", sortable: true },
          { title: "prodAm", key: "prodam", sortable: true },
          { title: "retardtotal", key: "retardtotal", sortable: true },
          { title: "retardm", key: "retardm", sortable: true },
          { title: "retardam", key: "retardam", sortable: true },
          { title: "retardam", key: "retardam", sortable: true },
          { title: "status", key: "status", sortable: true },
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
        raison:null,
        selectedItem:null,
        dialogVisible:false
      };
    },
    
    computed: {
      
      ...mapGetters("agent", ["allAgents"]),
      ...mapGetters(["presencesforacceptance"])
    },
    methods: {
      ...mapActions(['getPresences','togglePresenceStatus']),
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
     showAbsentDialog(item) {
      this.selectedItem = item;
      this.dialogVisible = true;
    },
      async toggleStatus(item,action) {
        try {
          await this.togglePresenceStatus({
            id:item.id,
            action:action,
            UserId:item.UserId  
          });
          await this.fetch(this.options)
          this.showSnackbar(`Presence ${newStatus}e avec succès`, 'success');
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
      async submitAbsence() {

      this.isLoading = true;

      try {
        await this.togglePresenceStatus({
          id: this.selectedItem.id,
          action: 'absent',
          UserId: this.selectedItem.UserId,
          raison: this.absenceReason
        });

        // Fetch updated presences after toggle
        await this.getPresences({
          page: this.options.page,
          limit: this.options.itemsPerPage,
          sortBy: this.options.sortBy[0].key,
          sortOrder: this.options.sortBy[0].order,
          agentId: this.selectedAgent
        });

        this.showSnackbar('Presence marked as absent successfully', 'success');
      } catch (error) {
        console.error('Failed to mark presence as absent:', error);
        this.showSnackbar('Error marking presence as absent', 'error');
      } finally {
        this.dialogVisible = false;
        this.absenceReason = '';
        this.selectedItem = null;
        this.isLoading = false;
      }
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
        await this.getPresences({
          page,
          limit: itemsPerPage,
          sortBy: sortKey,
          sortOrder,
          agentId: this.selectedAgent,
        });
      },
      
      // Modify exportToExcel to exclude createdAt and updatedAt and follow header order
      exportToExcel() {
  // Map the data according to the headers structure and format it appropriately
  const modifiedData = this.presencesforacceptance.map(item => ({
    agent: item.User,
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
    status: item.status
  }));

  // Create a new workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(modifiedData);

  // Modify column widths for better readability
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
    { wch: 10 },
  ];

  worksheet['!cols'] = columnWidths;

  // Create the workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Presences');

  // Generate the Excel file
  XLSX.writeFile(workbook, 'presences.xlsx');
},

async toggleStatus(item, action) {
      this.isLoading = true;

      try {
        await this.togglePresenceStatus({
          id: item.id,
          action: action,
          UserId: item.UserId
        });

        // Fetch updated presences after toggle
        await this.getPresences({
          page: this.options.page,
          limit: this.options.itemsPerPage,
          sortBy: this.options.sortBy[0].key,
          sortOrder: this.options.sortBy[0].order,
          agentId: this.selectedAgent
        });

        if (action === 'present') {
          this.showSnackbar('Presence marked as present successfully', 'success');
        } else {
          this.showSnackbar('Presence marked as absent successfully', 'success');
        }
      } catch (error) {
        console.error(`Failed to mark presence as ${action}:`, error);
        this.showSnackbar(`Error marking presence as ${action}`, 'error');
      } finally {
        this.isLoading = false;
      }
    },

    },
   
   async created() {
     await this.fetchAllAgents();
    },
    mounted(){
    }
  };
  </script>
  
  <style scoped>
  </style>