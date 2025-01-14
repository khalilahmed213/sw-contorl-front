<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-row align="center">
          <v-col cols="12" sm="6" md="4">
            <v-select
              class="w-50"
              v-model="selectedAgent"
              :items="allAgents"
              item-title="name"
              item-value="id"
              label="Filtrer par agent"
              clearable
              @update:modelValue="loadItems"
            ></v-select>
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
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="options.selectedDate"
                @update:model-value="handleDateSelect"
                locale="fr-FR"
                :first-day-of-week="1"
                :header-format="'dddd D MMMM YYYY'"
                :title-format="'MMMM YYYY'"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-btn color="primary" @click="openAddDialog">Ajouter Pénalité</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn @click="exportToExcel" class="ml-auto" color="green">
              Export Excel
            </v-btn>
            <v-btn @click="refresh" class="ml-auto" color="blue">
              Actualiser
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

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
          ></v-date-input>
          <v-date-input
            v-model="editedItem.endDate"
            label="Date fin"
            :rules="[v => !!v || 'La date est requise', v => validateDates(editedItem.startDate, v) || 'La date de fin doit être après la date de début']"
            required
            :min="editedItem.startDate || getCurrentDate()"
            locale="fr"
            date-format="dd/MM/yyyy"
          ></v-date-input>
          <v-text-field
            v-model="editedItem.raison"
            label="Raison"
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
        sortBy: [],
        sortDesc: [],
        groupBy: [],
        groupDesc: [],
        multiSort: false,
        mustSort: false,
        selectedDate: null
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
    ...mapGetters(["allPenalites", "selectedschedule", "getSchedules", "isLoadingPenalite", "totalPenalites"]),
    ...mapGetters("agent", ["allAgents", "loading"]),
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
    refresh(){
      this.loadItems(this.options)
    },
    ...mapActions(["fetchSchedules", "toggleSelected"]),
    ...mapActions({
      fetchAllAgents: "agent/fetchAllAgents"
    }),

    validateDates(startDate, endDate) {
      return new Date(startDate) < new Date(endDate);
    },

    updateEndDateMin(startDate) {
      if (startDate && this.editedItem.endDate && new Date(this.editedItem.endDate) < new Date(startDate)) {
        this.editedItem.endDate = startDate; // Reset endDate if it's before the new startDate
      }
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
        ScheduleId: null,
      };
      this.dialog = true;
    },

    editItem(item) {
      this.isEditing = true;
      this.editedItem = {
        id: item.id,
        startDate: new Date(item.startDate).toISOString().split('T')[0],
        endDate: new Date(item.endDate).toISOString().split('T')[0],
        raison: item.raison,
        UserId: item.UserId,
        ScheduleId: item.ScheduleId,
      };
      this.$nextTick(() => {
        this.editedItem = { ...this.editedItem };
      });
      this.dialog = true;
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
        agent: "",
        startDate: "",
        endDate: "",
        raison: "",
        UserId: null,
        ScheduleId: null,
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
        this.options = newOptions;
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
  },

  async created() {
    await this.fetchAllAgents();
    await this.fetchSchedules();
  },
};
</script>