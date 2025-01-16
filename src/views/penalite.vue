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
          @update:modelValue="loadItems"
          class="mr-4"
          style="max-width: 200px;"
          density="compact"
          variant="outlined"
        ></v-select>

        <!-- Date Filter -->
        <v-menu v-model="dateMenu" :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-text-field
              v-model="displayDate"
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
            @update:model-value="handleDateSelect"
            locale="fr-FR"
            :first-day-of-week="1"
          ></v-date-picker>
        </v-menu>

        <!-- Spacer to push buttons to the right -->
        <v-spacer></v-spacer>

        <!-- Add Penalty Button -->
        <v-btn color="primary" @click="openAddDialog" class="mr-2">
          Ajouter Pénalité
        </v-btn>

        <!-- Export and Refresh Buttons -->
        <v-btn @click="exportToExcel" color="green" class="mr-2">
          <v-icon left>mdi-file-excel</v-icon>
          Export Excel
        </v-btn>
        <v-btn @click="refresh" color="blue">
          Actualiser
        </v-btn>
      </v-card-title>

      <!-- Data Table -->
      <v-card-content>
        <v-data-table-server
          :headers="headers"
          :items="allPenalites"
          :items-length="totalPenalites"
          :loading="isLoadingPenalite"
          :search="search"
          item-value="id"
          @update:options="loadItems"
        >
          <template v-slot:item="{ item }">
            <tr>
              <td>{{ item.agent }}</td>
              <td>{{ formatDate(item.startDate) }}</td>
              <td>{{ formatDate(item.endDate) }}</td>
              <td>{{ item.nbrDeJour }}</td>
              <td>{{ item.raison }}</td>
              <td>
                <v-icon small @click="viewItem(item)">mdi-eye</v-icon>
                <v-icon small @click="editItem(item)">mdi-pencil</v-icon>
                <v-icon small @click="confirmDelete(item.id)">mdi-delete</v-icon>
              </td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card-content>
    </v-card>

    <!-- Edit/Add Modal Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          {{ isEditing ? "Modifier pénalité" : "Ajouter pénalité" }}
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="editedItem.UserId"
            :items="allAgents"
            item-title="name"
            item-value="id"
            label="Agents"
            density="compact"
            variant="outlined"
          ></v-select>
          <v-date-input
  v-model="editedItem.startDate"
  label="Date début"
  :rules="[v => !!v || 'La date est requise']"
  required
  :min="getCurrentDate()"
  locale="fr"
  date-format="dd/MM/yyyy"
  @update:modelValue="updateEndDateMin"
  density="compact"
  variant="outlined"
   :allowed-dates="isWeekday"
></v-date-input>
<v-date-input
  v-model="editedItem.endDate"
  label="Date fin"
  :rules="[v => !!v || 'La date est requise']"
  required
  :min="editedItem.startDate || getCurrentDate()"
  locale="fr"
  date-format="dd/MM/yyyy"
  density="compact"
  variant="outlined"
   :allowed-dates="isWeekday"
></v-date-input>
          <v-text-field
            v-model="editedItem.raison"
            label="Raison"
            density="compact"
            variant="outlined"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="closeDialog">Annuler</v-btn>
          <v-btn 
            color="blue darken-1" 
            text 
            @click="saveItem" 
            :disabled="!isFormValid"
          >
            {{ isEditing ? "Enregistrer" : "Ajouter" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title>Confirmer la suppression</v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir supprimer cette pénalité ?
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="cancelDelete">
            Annuler
          </v-btn>
          <v-btn color="red darken-1" text @click="deleteItem">
            Supprimer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Details Dialog -->
    <v-dialog v-model="viewDialog" max-width="500px">
      <v-card>
        <v-card-title>Détails de la pénalité</v-card-title>
        <v-card-text>
          <div>Agent: {{ currentItem.agent }}</div>
          <div>Date début: {{ formatDate(currentItem.startDate) }}</div>
          <div>Date fin: {{ formatDate(currentItem.endDate) }}</div>
          <div>Raison: {{ currentItem.raison }}</div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="viewDialog = false">
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for Notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script>
import moment from 'moment';
import 'moment/locale/fr';
import { mapActions, mapGetters } from "vuex";
import * as XLSX from 'xlsx';

moment.locale('fr');

export default {
  data() {
    return {
      headers: [
        { title: "Agent", key: "agent" },
        { title: "Date début Pénalité", key: "startDate" },
        { title: "Date Fin Pénalité", key: "endDate" },
        { title: "nbrDeJour", key: "nbrDeJour" },
        { title: "Raison", key: "raison" },
        { title: "Actions", key: "actions", sortable: false },
      ],
      dialog: false,
      deleteDialog: false,
      isEditing: false,
      editedIndex: -1,
      editedItem: {
        startDate: null,
        endDate: null,
        raison: "",
        UserId: null,
      },
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: [],
        sortDesc: [],
        selectedDate: null,
      },
      dateMenu: false,
      displayDate: '',
      viewDialog: false,
      currentItem: null,
      search: "",
      selectedAgent: null,
      itemToDelete: null,
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
    };
  },

  computed: {
    ...mapGetters(["allPenalites", "isLoadingPenalite", "totalPenalites"]),
    ...mapGetters("agent", ["allAgents"]),
    isFormValid() {
  return (
    this.editedItem.startDate &&
    this.editedItem.endDate &&
    this.editedItem.raison &&
    this.editedItem.UserId !== null &&
    this.validateDates(this.editedItem.startDate, this.editedItem.endDate)
  );
}
  },


  watch: {
    'options.selectedDate'(newDate) {
      this.displayDate = newDate ? this.formatDateForDisplay(newDate) : '';
    }
  },

  methods: {
    ...mapActions([
      "fetchPenalites",
      "createPenalite",
      "updatePenalite",
      "deletePenalite",
    ]),
    ...mapActions({
      fetchAllAgents: "agent/fetchAllAgents"
    }),

    validateDates(startDate, endDate) {
      return new Date(startDate) < new Date(endDate);
    },

    updateEndDateMin(startDate) {
      if (startDate && this.editedItem.endDate && new Date(this.editedItem.endDate) < new Date(startDate)) {
        this.editedItem.endDate = startDate;
      }
    },
    isWeekday(date) {
  const day = new Date(date).getDay();
  return day !== 0 && day !== 6; // 0 is Sunday, 6 is Saturday
},
    handleDateSelect(date) {
      this.dateMenu = false;
      this.loadItems();
    },

    clearDate() {
      this.options.selectedDate = null;
      this.displayDate = '';
      this.loadItems();
    },
    validateDates(startDate, endDate) {
  return new Date(startDate) < new Date(endDate);
},
updateEndDateMin(startDate) {
  if (startDate && this.editedItem.endDate && new Date(this.editedItem.endDate) < new Date(startDate)) {
    this.editedItem.endDate = startDate;
  }
},
    getCurrentDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    formatDateForDisplay(date) {
      if (!date) return '';
      return moment(date).format('DD/MM/YYYY');
    },

    formatDate(date) {
      return moment(date).format('DD/MM/YYYY');
    },

    openAddDialog() {
      this.isEditing = false;
      this.editedItem = {
        startDate: null,
        endDate: null,
        raison: "",
        UserId: null,
      };
      this.dialog = true;
    },

    editItem(item) {
      console.log(item)
      this.isEditing = true;
      this.editedItem = {
        id: item.id,
        startDate:new Date(item.startDate),
        endDate: new Date(item.endDate),
        raison: item.raison,
        UserId: item.UserId,
      };
      this.dialog = true;
    },
    formatDateForInput(date) {
    if (!date) return null;

    // If the date is already in the correct format (YYYY-MM-DD), return it directly
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }

    // If the date is a JavaScript Date object, convert it to YYYY-MM-DD format
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }

    // If the date is in another format, parse it and convert it to YYYY-MM-DD
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0];
    }

    // If the date is invalid, return null
    return null;
  },
    async saveItem() {
  if (!this.validateDates(this.editedItem.startDate, this.editedItem.endDate)) {
    this.showSnackbar("La date de fin doit être après la date de début", 'error');
    return;
  }

  if (this.isEditing) {
    await this.updatePenalite(this.editedItem);
    this.showSnackbar('Pénalité mise à jour avec succès');
  } else {
    await this.createPenalite(this.editedItem);
    this.showSnackbar('Pénalité ajoutée avec succès');
  }
  await this.fetchPenalites(this.options);
  this.closeDialog();
},

    closeDialog() {
      this.dialog = false;
      this.editedItem = {
        startDate: null,
        endDate: null,
        raison: "",
        UserId: null,
      };
      this.editedIndex = -1;
    },

    confirmDelete(id) {
      this.itemToDelete = id;
      this.deleteDialog = true;
    },

    cancelDelete() {
      this.deleteDialog = false;
      this.itemToDelete = null;
    },

    async deleteItem() {
      if (this.itemToDelete) {
        await this.deletePenalite(this.itemToDelete);
        this.showSnackbar('Pénalité supprimée avec succès');
        await this.loadItems(this.options);
      }
      this.deleteDialog = false;
      this.itemToDelete = null;
    },

    viewItem(item) {
      this.currentItem = item;
      this.viewDialog = true;
    },

    async loadItems(newOptions) {
      if (newOptions) {
        this.options = {
          ...this.options,
          ...newOptions,
        };
      }

      const { page, itemsPerPage, sortBy, sortDesc } = this.options;
      const sortKey = sortBy && sortBy.length > 0 ? sortBy[0].key : "name";
      const sortOrder = sortBy && sortBy.length > 0 ? sortBy[0].order : "asc";

      await this.fetchPenalites({
        page: page,
        limit: itemsPerPage,
        sortBy: sortKey,
        sortDesc: sortOrder === "desc",
        search: this.search,
        agentId: this.selectedAgent,
        date: this.options.selectedDate
      });
    },

    showSnackbar(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    exportToExcel() {
      const headers = this.headers.map(header => header.title);
      const data = this.allPenalites.map(item => [
        item.agent,
        this.formatDate(item.startDate),
        this.formatDate(item.endDate),
        item.nbrDeJour,
        item.raison
      ]);

      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Pénalités");
      
      const fileName = `penalites_${moment().format('YYYY-MM-DD')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      this.showSnackbar('Exportation Excel réussie');
    },

    refresh() {
      this.loadItems(this.options);
    },
  },

  async created() {
    await this.fetchAllAgents();
    await this.fetchPenalites(this.options);
  },
};
</script>

<style scoped>
/* Add custom styles if needed */
</style>