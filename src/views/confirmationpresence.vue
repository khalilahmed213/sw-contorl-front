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
          >Export Excel</v-btn>
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
          @click="toggleStatus(item, 'present')"
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
            @click="submitAbsence"
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
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
      absenceReason: '',
      selectedItem: null,
      dialogVisible: false,
      isLoading: false
    };
  },
  
  computed: {
    ...mapGetters("agent", ["allAgents"]),
    ...mapGetters(["presencesforacceptance"])
  },

  methods: {
    ...mapActions(['getPresences', 'togglePresenceStatus']),
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
      this.absenceReason = '';
      this.dialogVisible = true;
      console.log(this.selectedItem)
    },

    async toggleStatus(item, action) {
      this.isLoading = true;
      try {
        await this.togglePresenceStatus({
          id: item.id,
          action: action,
          UserId: item.UserId
        });
        await this.fetch(this.options);
        this.showSnackbar(`Presence marked as ${action} successfully`, 'success');
      } catch (error) {
        console.error(`Failed to mark presence as ${action}:`, error);
        this.showSnackbar(`Error marking presence as ${action}`, 'error');
      } finally {
        this.isLoading = false;
      }
    },

    async submitAbsence() {
      if (!this.absenceReason.trim()) {
        this.showSnackbar('Please enter a reason for absence', 'error');
        return;
      }

      this.isLoading = true;
      try {
        await this.togglePresenceStatus({
          id: this.selectedItem.id,
          action: 'absent',
          UserId: this.selectedItem.UserId,
          raison: this.absenceReason
        });
        await this.fetch(this.options);
        this.showSnackbar('Presence marked as absent successfully', 'success');
        this.dialogVisible = false;
        this.absenceReason = '';
        this.selectedItem = null;
      } catch (error) {
        console.error('Failed to mark presence as absent:', error);
        this.showSnackbar('Error marking presence as absent', 'error');
      } finally {
        this.isLoading = false;
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
        this.options = newOptions;
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

    exportToExcel() {
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
        { wch: 10 },
      ];

      worksheet['!cols'] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Presences');

      XLSX.writeFile(workbook, 'presences.xlsx');
    }
  },
 
  async created() {
    await this.fetchAllAgents();
  }
};
</script>

<style scoped>
</style>