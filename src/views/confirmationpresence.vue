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
            @click="toggleStatus(item, 'true')"
          >
            mdi-check
          </v-icon>
          <v-icon
            color="red"
            @click="toggleStatus(item, 'false')"
          >
            mdi-close
          </v-icon>
        </template>

        <!-- Custom template for entree column -->
        <template v-slot:item.entree="{ item }">
          <div
            class="hover-icons-entree custom-chip"
            :style="{ backgroundColor: statusColors[item.morningEntryStatus] || statusColors.default }"
          >
            {{ item.entree }}
            <v-icon small class="accept-icon" @click="toggleFieldStatus(item, 'entree', 'true')">
              mdi-check
            </v-icon>
            <v-icon small class="reject-icon" @click="toggleFieldStatus(item, 'entree', 'false')">
              mdi-close
            </v-icon>
          </div>
        </template>

        <!-- Custom template for sortie column -->
        <template v-slot:item.sortie="{ item }">
          <div
            class="hover-icons custom-chip"
            :style="{ backgroundColor: statusColors[item.morningExitStatus] || statusColors.default }"
          >
            {{ item.sortie }}
            <v-icon small class="accept-icon" @click="toggleFieldStatus(item, 'sortie', 'true')">
              mdi-check
            </v-icon>
            <v-icon small class="reject-icon" @click="toggleFieldStatus(item, 'sortie', 'false')">
              mdi-close
            </v-icon>
          </div>
        </template>

        <!-- Custom template for entree1 column -->
        <template v-slot:item.entree1="{ item }">
          <div
            class="hover-icons custom-chip"
            :style="{ backgroundColor: statusColors[item.afternoonEntryStatus] || statusColors.default }"
          >
            {{ item.entree1 }}
            <v-icon small class="accept-icon" @click="toggleFieldStatus(item, 'entree1', 'true')">
              mdi-check
            </v-icon>
            <v-icon small class="reject-icon" @click="toggleFieldStatus(item, 'entree1', 'false')">
              mdi-close
            </v-icon>
          </div>
        </template>

        <!-- Custom template for sortie1 column -->
        <template v-slot:item.sortie1="{ item }">
          <div
            class="hover-icons custom-chip"
            :style="{ backgroundColor: statusColors[item.afternoonExitStatus] || statusColors.default }"
          >
            {{ item.sortie1 }}
            <v-icon small class="accept-icon" @click="toggleFieldStatus(item, 'sortie1', 'true')">
              mdi-check
            </v-icon>
            <v-icon small class="reject-icon" @click="toggleFieldStatus(item, 'sortie1', 'false')">
              mdi-close
            </v-icon>
          </div>
        </template>

        <!-- Other slots remain unchanged -->
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
        { title: "Date", key: "date", sortable:false},
        { title: "Environnement", key: "environnement", sortable:false },
        { title: "Début Matin", key: "entree", sortable: false },
        { title: "Fin Matin", key: "sortie", sortable:false },
        { title: "Début après Midi", key: "entree1", sortable:false },
        { title: "Fin Après Midi", key: "sortie1", sortable: false },
        { title: "Prod", key: "prod", sortable: false },
        { title: "Prod Matin", key: "prodm", sortable: false },
        { title: "Prod Après-Midi", key: "prodam", sortable: false },
        { title: "Retard Total", key: "retardtotal", sortable: false },
        { title: "Retard Matin", key: "retardm", sortable:false },
        { title: "Retard Après-Midi", key: "retardam", sortable:false },
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
      dafield: null
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
    }
  },
  methods: {
    ...mapActions(['getPresences', 'togglePresenceStatus', 'updatePresenceField']),
    ...mapActions({ fetchAllAgents: "agent/fetchAllAgents" }),

    async toggleFieldStatus(item, field, status) {
      try {
        let dafield;
        switch (field) {
          case 'entree':
            dafield = 'morningEntryStatus';
            break;
          case 'sortie':
            dafield = 'morningEndStatus';
            break;
          case 'entree1':
            dafield = 'afternoonEntryStatus';
            break;
          case 'sortie1':
            dafield = 'afternoonExitStatus';
            break;
          default:
            throw new Error(`Invalid field: ${field}`);
        }
        await this.updatePresenceField({
          id: item.id,
          field: dafield,
          status: status
        });

        // Show success message
        this.showSnackbar(`Field ${field} marked as ${status} successfully`, 'success');
      } catch (error) {
        // Handle errors and show error message
        console.error(`Error marking field ${field} as ${status}:`, error);
        this.showSnackbar(`Error marking field ${field} as ${status}`, 'error');
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
  },

  async created() {
    await this.fetchAllAgents();
    await this.fetch(this.options);
  },
};
</script>

<style scoped>
.hover-icons {
  position: relative;
  display: inline-block;
}

.hover-icons .accept-icon,
.hover-icons .reject-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.hover-icons .accept-icon {
  left: 100%;
  margin-left: 5px;
  color: green;
}

.hover-icons .reject-icon {
  left: 100%;
  margin-left: 20px;
  color: red;
}

.hover-icons:hover .accept-icon,
.hover-icons:hover .reject-icon {
  opacity: 1;
}

.custom-chip {
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  color: white;
  font-size: 14px;
}
</style>