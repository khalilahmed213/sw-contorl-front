<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-btn color="primary" @click="openAddDialog">
          <v-icon left>mdi-plus</v-icon>
          Demande d'autorisation
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table-server
          v-model:items-per-page="options.itemsPerPage"
          :headers="headers"
          :items="autorisations"
          :items-length="totalItems"
          :loading="loading"
          item-value="id"
          @update:options="fetchAutorisations"
          class="elevation-1"
        >
          <template v-slot:item.status="{ item }">
            <v-chip :color="getStatusColor(item.status)" dark>
              {{ item.status }}
            </v-chip>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon small @click="editItem(item)" class="mr-2">mdi-pencil</v-icon>
            <v-icon 
              small 
              @click="deleteItem(item)" 
              color="black" 
              :disabled="!canDelete(item)"
              :class="{ 'v-icon--disabled': !canDelete(item) }"
            >
              mdi-delete
            </v-icon>
          </template>
          <template v-slot:item.nbrheures="{ item }">
            {{ formatMinutesToHoursAndMinutes(item.nbrheures) }}
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <!-- Add/Edit Autorisation Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>{{ formTitle }}</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-text-field
              v-model="editedItem.date"
              label="Date"
              type="date"
              required
              :min="getCurrentDate()"
            ></v-text-field>
            <v-text-field
              v-model="editedItem.heureDebut"
              label="Heure de Début"
              type="time"
              required
            ></v-text-field>
            <v-text-field
              v-model="editedItem.heureFin"
              label="Heure de Fin"
              type="time"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">Annuler</v-btn>
          <v-btn color="blue darken-1" text @click="saveItem" :disabled="!valid">
            {{ editedItem.id ? 'Modifier' : 'Ajouter' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title>Confirmer la suppression</v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir supprimer cette autorisation ?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDelete">Annuler</v-btn>
          <v-btn color="red darken-1" text @click="deleteItemConfirm">Supprimer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor">
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn color="white" text @click="snackbar = false">Fermer</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  data() {
    return {
      dialog: false,
      dialogDelete: false,
      valid: false,
      headers: [
        { title: 'Date', key: 'date' },
        { title: 'Heure de Début', key: 'heureDebut' },
        { title: 'Heure de Fin', key: 'heureFin' },
        { title: "nbr d'heures", key: 'nbrheures' },
        { title: 'Référence', key: 'référence' },
        { title: 'Status', key: 'status' },
        { title: 'Actions', key: 'actions', sortable: false },
      ],
      editedItem: {
        date: '',
        heureDebut: '',
        heureFin: '',
        userId: '',
      },
      defaultItem: {
        date: '',
        heureDebut: '',
        heureFin: '',
        userId: '',
      },
      options: {
        userId: this.currentUserId,
        page: 1,
        sortBy: [],
        sortDesc: [],
        itemsPerPage: 10, // Add a default value
      },
      snackbar: false,
      snackbarMessage: '',
      snackbarColor: 'success',
    };
  },
  computed: {
    ...mapState('autorisation', ['autorisations', 'totalItems', 'loading']),
    ...mapState('auth', ['user']),
    formTitle() {
      return this.editedItem.id ? 'Modifier Autorisation' : 'Nouvelle Autorisation';
    },
    currentUserId() {
      return this.user ? this.user.id : null;
    },
    isFormValid() {
      return this.valid && this.editedItem.date && this.editedItem.heureDebut && this.editedItem.heureFin;
    },
  },
  methods: {
    ...mapActions('autorisation', ['fetchUserAutorisations', 'createAutorisation', 'updateAutorisation', 'deleteAutorisation']),
    
    async fetchAutorisations(newOptions) { // Don't fetch if user ID is not available
      
      if (newOptions) {
        this.options = newOptions;
      }
      const { page, itemsPerPage, sortBy, sortDesc } = this.options;

      // Adjusting to handle the new structure of sortBy
      const sortKey = sortBy && sortBy.length > 0 ? sortBy[0].key : 'date';
      const sortOrder = sortBy && sortBy.length > 0  ? sortBy[0].order : 'asc';

      await this.fetchUserAutorisations({
        userId: this.currentUserId,
        page,
        limit: itemsPerPage,
        sortBy: sortKey,
        sortOrder,
      });
    },

    openAddDialog() {
      this.editedItem = { ...this.defaultItem, userId: this.currentUserId };
      this.dialog = true;
    },

    editItem(item) {
      this.editedItem = { ...item };
      this.dialog = true;
    },

    deleteItem(item) {
      if (this.canDelete(item)) {
        this.editedItem = { ...item };
        this.dialogDelete = true;
      }
    },

    closeDialog() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = { ...this.defaultItem };
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = { ...this.defaultItem };
      });
    },

    async saveItem() {
      if (this.$refs.form.validate()) {
        try {
          if (this.editedItem.id) {
            await this.updateAutorisation({
              id: this.editedItem.id,
              autorisationData: {
                date: this.editedItem.date,
                heureDebut: this.editedItem.heureDebut,
                heureFin: this.editedItem.heureFin,
                userId: this.currentUserId
              }
            });
           
            this.showSnackbar('Autorisation mise à jour avec succès', 'success');
          } else {
            await this.createAutorisation({
              date: this.editedItem.date,
              heureDebut: this.editedItem.heureDebut,
              heureFin: this.editedItem.heureFin,
              userId: this.currentUserId
            });
            this.showSnackbar('Autorisation ajoutée avec succès', 'success');
          }
          this.closeDialog();
          await this.fetchAutorisations(this.options)
        } catch (error) {
          console.error('Failed to save autorisation:', error);
          this.showSnackbar('Erreur lors de l\'enregistrement de l\'autorisation', 'error');
        }
      }
    },
    async deleteItemConfirm() {
      try {
        await this.deleteAutorisation(this.editedItem.id);
        this.closeDelete();
       await this.fetchAutorisations(this.options)
        this.showSnackbar('Autorisation supprimée avec succès', 'success');
      } catch (error) {
        console.error('Failed to delete autorisation:', error);
        this.showSnackbar('Erreur lors de la suppression de l\'autorisation', 'error');
      }
    },

    getStatusColor(status) {
      switch (status.toLowerCase()) {
        case 'accepté':
          return 'green';
        case 'rejeté':
          return 'red';
        case 'en attente':
          return 'orange';
        default:
          return 'grey';
      }
    },
      getCurrentDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
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

    canDelete(item) {
      return item.status.toLowerCase() === 'en attente';
    },
  },
  

  created() {
   console.log(this.autorisations)
  },
  watch: {
  'editedItem.heureFin'(newVal) {
    if (newVal && this.editedItem.heureDebut && newVal < this.editedItem.heureDebut) {
      this.timeError = "Respectez l'ordre des heures";
      alert("Respectez l'ordre des heures");
    } else {
      this.timeError = null;
    }
  },
  'editedItem.heureDebut'(newVal) {
    if (newVal && this.editedItem.heureFin && this.editedItem.heureFin < newVal) {
      this.timeError = "Respectez l'ordre des heures";
      alert("Respectez l'ordre des heures");
    } else {
      this.timeError = null;
    }
  }
}
};
</script>

<style scoped>
.v-icon--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>