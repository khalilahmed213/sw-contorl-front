<template>
  <v-container>
    <v-card>
      <!-- Card Title and Top Row -->
      <v-card-title>
        <v-row align="center">
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="selectedAgent"
              :items="allAgents"
              item-title="name"
              item-value="id"
              label="Filtrer par agent"
              clearable
              @update:modelValue="loadItems"
            ></v-select>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-btn color="primary" @click="openAddDialog">Ajouter Pénalité</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn @click="exportToExcel" class="ml-auto" color="green"
          >Export Excel</v-btn
        >
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
        <v-card-title>{{
          isEditing ? "modifier pénalité" : "Ajouter pénalité"
        }}</v-card-title>
        <v-card-text>
          <v-select
            v-model="editedItem.UserId"
            :items="allAgents"
            item-title="name"
            item-value="id"
            label="Agents"
          ></v-select>
          <v-text-field
            v-model="editedItem.startDate"
            label="Date début Pénalité"
            type="date"
          ></v-text-field>
          <v-text-field
            v-model="editedItem.endDate"
            label="Date Fin Pénalité"
            type="date"
          ></v-text-field>
          <v-text-field
            v-model="editedItem.raison"
            label="Raison"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="closeDialog">Annuler</v-btn>
          <v-btn color="blue darken-1" text @click="saveItem"  :disabled="!isFormValid">{{
            isEditing ? "enregistrer" : "ajouter"
          }}</v-btn>
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
          <v-btn color="blue darken-1" text @click="cancelDelete"
            >Annuler</v-btn
          >
          <v-btn color="red darken-1" text @click="deleteItem">Supprimer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Details Dialog -->
    <v-dialog v-model="viewDialog" max-width="500px">
      <v-card>
        <v-card-title>Détails de la pénalité</v-card-title>
        <v-card-text>
          <div>Agent: {{ currentItem.UserId }}</div>
          <div>Date début: {{ formatDate(currentItem.startDate) }}</div>
          <div>Date fin: {{ formatDate(currentItem.endDate) }}</div>
          <div>Raison: {{ currentItem.raison }}</div>
          <div>Horaires: {{ currentItem.ScheduleId }}</div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="viewDialog = false">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add this snackbar component at the end of the template -->
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
import moment from "moment";
import { mapActions, mapGetters } from "vuex";
import * as XLSX from 'xlsx'; // Make sure to install this package: npm install xlsx

export default {
  data() {
    return {
      headers: [
  { title: "Agent", key: "agent" },
  { title: "Date début Pénalité", key: "startDate", value: item => this.formatDate(item.startDate) },
  { title: "Date Fin Pénalité", key: "endDate", value: item => this.formatDate(item.endDate) },
  { title: "nbrDeJour", key: "nbrDeJour" },
  { title: "Raison", key: "raison" },
  { title: "Actions", key: "actions", sortable: false },
],
      dialog: false,
      deleteDialog: false,
      isEditing: false,
      editedIndex: -1,
      editedItem: {
        startDate: "",
        endDate: "",
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
      },
      viewDialog: false,
      currentItem: null,
      search: "",
      selectedAgent: null,
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
        this.editedItem.UserId !== null 
      );
    }
  },
  methods: {
    ...mapActions([
      "fetchPenalites",
      "createPenalite",
      "updatePenalite",
      "deletePenalite",
    ]),
    ...mapActions(["fetchSchedules", "toggleSelected"]),
    ...mapActions({
      fetchAllAgents: "agent/fetchAllAgents"
    }),
    openAddDialog() {
      this.isEditing = false;
      this.editedItem = {
        startDate: "",
        endDate: "",
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
      // Force Vue to re-render the select component
      this.$nextTick(() => {
        this.editedItem = { ...this.editedItem };
      });
      this.dialog = true;
    },
    async saveItem() {
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
    formatDate(date) {
      return moment(date).locale('fr').format('DD/MM/YYYY');
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
      });
    },
    showSnackbar(text) {
      this.snackbar.text = text;
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
      
      // Generate file name with current date
      const fileName = `penalites_${moment().format('YYYY-MM-DD')}.xlsx`;

      // Trigger file download
      XLSX.writeFile(workbook, fileName);

      this.showSnackbar('Exportation Excel réussie');
    },
  },
  async created() {
    await this.fetchAllAgents(); // Adjust these values as needed
    await this.fetchSchedules(); // Initial load of items
  },
  mounted(){
  },
  watch: {
 

    'editedItem.startDate': function(newVal) {
      if (new Date(newVal) > new Date(this.editedItem.endDate)) {
        alert("Respecter l'ordre des dates : La date de début ne peut pas être postérieure à la date de fin.");
        this.editedItem.startDate = '';
      }
    },
    'editedItem.endDate': function(newVal) {
      if (new Date(newVal) < new Date(this.editedItem.startDate)) {
        alert("Respecter l'ordre des dates : La date de fin ne peut pas être antérieure à la date de début.");
        this.editedItem.endDate = '';
      }
    }
  }
};
</script>

<style scoped>
.punishment-table {
  width: 100%;
  border-collapse: collapse;
}
.punishment-table th,
.punishment-table td {
  padding: 8px;
  border: 1px solid #ccc;
  text-align: left;
}
.punishment-table th {
  background-color: #f5f5f5;
}
</style>
