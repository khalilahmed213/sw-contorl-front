<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-select
          v-model="selectedAgent"
          :items="allAgents"
          item-title="name"
          item-value="id"
          label="Filtrer par agent"
          clearable
          @update:modelValue="handleAgentChange"
          class="mr-2"
          style="max-width: 200px;"
          density="compact"
          variant="outlined"
        ></v-select>

        <v-menu
          v-model="menu"
          transition="scale-transition"
          close-on-content-click
          max-width="290"
          offset-y
        >
          <template v-slot:activator="{ props }">
            <v-text-field
              :model-value="options.date ? formatDateForDisplay(options.date) : ''"
              label="Filtrer par date"
              prepend-icon="mdi-calendar"
              clearable
              @click:clear="clearDateFilter"
              readonly
              v-bind="props"
              style="max-width: 200px;"
              density="compact"
              variant="outlined"
              class="mr-2"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="options.date"
            @update:modelValue="handleDateChange"
            locale="fr"
          ></v-date-picker>
        </v-menu>

        <v-spacer></v-spacer>

        <v-btn 
          @click="exportToExcel" 
          color="green" 
          class="ml-2"
          :loading="exporting"
          prepend-icon="mdi-file-excel"
        >
          Export Excel
        </v-btn>
        <v-btn 
          @click="refresh" 
          color="blue" 
          class="ml-2"
          :loading="loading"
          prepend-icon="mdi-refresh"
        >
          Actualiser
        </v-btn>
      </v-card-title>

      <v-data-table-server
        :headers="headers"
        :items="autorisations"
        v-model:options="options"
        :items-length="totalItems"
        :loading="loading"
        class="elevation-1"
        @update:options="handleTableUpdate"
      >
        <template v-slot:item.actions="{ item }">
          <v-tooltip text="Accepter">
            <template v-slot:activator="{ props }">
              <v-icon
                v-bind="props"
                color="green"
                @click="toggleStatus(item, 'accepté')"
                :disabled="item.status !== 'en attente'"
                class="mr-2"
              >
                mdi-check
              </v-icon>
            </template>
          </v-tooltip>
          <v-tooltip text="Rejeter">
            <template v-slot:activator="{ props }">
              <v-icon
                v-bind="props"
                color="red"
                @click="toggleStatus(item, 'rejeté')"
                :disabled="item.status !== 'en attente'"
              >
                mdi-close
              </v-icon>
            </template>
          </v-tooltip>
        </template>

        <template v-slot:item.nbrheures="{ item }">
          {{ formatMinutesToHoursAndMinutes(item.nbrheures) }}
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            :text-color="getStatusTextColor(item.status)"
            size="small"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template v-slot:item.date="{ item }">
          {{ formatDateForDisplay(item.date) }}
        </template>

        <template v-slot:item.User.name="{ item }">
          {{ item.User?.name || '-' }}
        </template>
      </v-data-table-server>
    </v-card>

    <v-snackbar
      v-model="snackbar"
      :timeout="3000"
      :color="snackbarColor"
      location="top"
    >
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn
          color="white"
          text
          @click="snackbar = false"
        >
          Fermer
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { ref } from 'vue';
import { mapState, mapActions, mapGetters } from 'vuex';
import * as XLSX from 'xlsx';

export default {
  name: 'DemandeAutorisation',
  
  setup() {
    const exporting = ref(false);
    return { exporting };
  },

  data() {
    return {
      menu: false,
      headers: [
        { title: "Référence", key: "référence", sortable: true },
        { title: "Agent", key: "User.name", sortable: true },
        { title: "Date", key: "date", sortable: true },
        { title: "Heure Début", key: "heureDebut", sortable: true },
        { title: "Heure Fin", key: "heureFin", sortable: true },
        { title: "Nbr d'heures", key: "nbrheures", sortable: true },
        { title: "Status", key: "status", sortable: true },
        { title: "Actions", key: "actions", sortable: false, align: 'center' },
      ],
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['date'],
        sortDesc: [true],
        date: null,
      },
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

    formatDateForDisplay(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    },

    formatDateForAPI(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    formatMinutesToHoursAndMinutes(minutes) {
      if (!minutes) return '0h 0m';
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    },

    getStatusColor(status) {
      const colors = {
        "accepté": "green-lighten-1",
        "rejeté": "red-lighten-1",
        "en attente": "orange-lighten-1",
      };
      return colors[status] || "grey";
    },

    getStatusTextColor(status) {
      return status === 'en attente' ? 'black' : 'white';
    },

    async handleAgentChange() {
      this.options.page = 1;
      await this.fetch();
    },

    async handleDateChange() {
      this.menu = false;
      this.options.page = 1;
      await this.fetch();
    },

    clearDateFilter() {
      this.options.date = null;
      this.fetch();
    },

    async handleTableUpdate(newOptions) {
      await this.fetch(newOptions);
    },

    async fetch(newOptions) {
      try {
        if (newOptions) {
          this.options = { ...this.options, ...newOptions };
        }

        const { page, itemsPerPage, sortBy, sortDesc, date } = this.options;
        const sortKey = sortBy?.[0] || 'date';
        const sortOrder = sortDesc?.[0] ? 'desc' : 'asc';
        const formattedDate = this.formatDateForAPI(date);

        await this.fetchAutorisations({
          page,
          limit: itemsPerPage,
          sortBy: sortKey,
          sortOrder,
          agentId: this.selectedAgent,
          date: formattedDate,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        this.showSnackbar('Erreur lors du chargement des données', 'error');
      }
    },

    async toggleStatus(item, newStatus) {
      try {
        await this.toggleAutorisationStatus({
          id: item.id,
          newStatus: newStatus
        });
        await this.fetch();
        this.showSnackbar(`Autorisation ${newStatus}e avec succès`, 'success');
      } catch (error) {
        console.error('Failed to update autorisation status:', error);
        this.showSnackbar('Erreur lors de la mise à jour du statut', 'error');
      }
    },

    async refresh() {
      this.options = {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['date'],
        sortDesc: [true],
        date: null,
      };
      this.selectedAgent = null;
      await this.fetch();
    },

    async exportToExcel() {
      try {
        this.exporting = true;
        const modifiedData = this.autorisations.map(item => ({
          'Référence': item.référence,
          'Agent': item.User?.name || '-',
          'Date': this.formatDateForDisplay(item.date),
          'Heure Début': item.heureDebut,
          'Heure Fin': item.heureFin,
          'Nombre d\'heures': this.formatMinutesToHoursAndMinutes(item.nbrheures),
          'Statut': item.status,
        }));

        const worksheet = XLSX.utils.json_to_sheet(modifiedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Autorisations');
        
        const maxWidth = 50;
        const columnsWidth = modifiedData.reduce((width, row) => {
          Object.keys(row).forEach(key => {
            const length = row[key].toString().length;
            width[key] = Math.min(Math.max(width[key] || 0, length), maxWidth);
          });
          return width;
        }, {});
        
        worksheet['!cols'] = Object.keys(columnsWidth).map(key => ({ 
          wch: columnsWidth[key] 
        }));

        const today = new Date();
        const fileName = `autorisations_${this.formatDateForAPI(today)}.xlsx`;
        XLSX.writeFile(workbook, fileName);
      } catch (error) {
        console.error('Error exporting to Excel:', error);
        this.showSnackbar('Erreur lors de l\'export Excel', 'error');
      } finally {
        this.exporting = false;
      }
    },

    showSnackbar(message, color = 'success') {
      this.snackbarMessage = message;
      this.snackbarColor = color;
      this.snackbar = true;
    },
  },

  async created() {
    try {
      await this.fetchAllAgents();
      await this.fetch();
    } catch (error) {
      console.error('Error initializing component:', error);
      this.showSnackbar('Erreur lors de l\'initialisation', 'error');
    }
  },
};
</script>

<style scoped>
.v-data-table {
  width: 100%;
}

.v-card-title {
  padding: 16px;
}

.v-btn {
  text-transform: none;
}
</style>