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
          <v-form ref="form" v-model="valid" @submit.prevent="saveItem">
            <v-text-field
              v-model="editedItem.date"
              label="Date"
              type="date"
              :rules="[v => !!v || 'La date est requise', validateDate]"
              required
              :min="getCurrentDate()"
            ></v-text-field>
            <v-text-field
              v-model="editedItem.heureDebut"
              label="Heure de Début"
              type="time"
              :rules="[v => !!v || 'L\'heure de début est requise', validateStartTime]"
              required
            ></v-text-field>
            <v-text-field
              v-model="editedItem.heureFin"
              label="Heure de Fin"
              type="time"
              :rules="[v => !!v || 'L\'heure de fin est requise', validateEndTime]"
              required
            ></v-text-field>
            <v-alert
              v-if="formError"
              type="error"
              class="mt-3"
            >
              {{ formError }}
            </v-alert>
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
import { mapState, mapActions,mapGetters } from 'vuex';

export default {
  data() {
    return {
      dialog: false,
      dialogDelete: false,
      valid: false,
      formError: null,
      headers: [
      { title: 'Référence', key: 'référence' },
        { title: 'Date', key: 'date' },
        { title: 'Heure de Début', key: 'heureDebut' },
        { title: 'Heure de Fin', key: 'heureFin' },
        { title: "nbr d'heures", key: 'nbrheures' },
        { title: 'Status', key: 'status' },
        { title: 'Actions', key: 'actions', sortable: false },
      ],
      editedItem: {
        date: '',
        heureDebut: '',
        heureFin: '',
        UserId: '',
        ScheduleId:''
      },
      defaultItem: {
        date: '',
        heureDebut: '',
        heureFin: '',
        UserId: '',
      },
      options: {
        UserId: this.currentUserId,
        page: 1,
        sortBy: [],
        sortDesc: [],
        itemsPerPage: 10,
      },
      snackbar: false,
      snackbarMessage: '',
      snackbarColor: 'success',
    };
  },
  computed: {
    ...mapState('autorisation', ['autorisations', 'totalItems', 'loading']),
    ...mapGetters('schedule',['scheduleSelected']),
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
    ...mapActions('schedule', ['fetchSelectedSchedule']),
    
    async fetchAutorisations(newOptions) {
      if (newOptions) {
        this.options = newOptions;
      }
      const { page, itemsPerPage, sortBy, sortDesc } = this.options;

      const sortKey = sortBy && sortBy.length > 0 ? sortBy[0].key : 'date';
      const sortOrder = sortBy && sortBy.length > 0  ? sortBy[0].order : 'asc';

      await this.fetchUserAutorisations({
        UserId: this.currentUserId,
        page,
        limit: itemsPerPage,
        sortBy: sortKey,
        sortOrder,
      });
    },

    openAddDialog() {
      this.editedItem = { ...this.defaultItem, UserId: this.currentUserId ,ScheduleId:this.scheduleSelected};
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

    validateDate(value) {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today || 'La date doit être aujourd\'hui ou dans le futur';
    },

    validateStartTime(value) {
      const startTime = this.parseTime(value);
      const minTime = this.parseTime('08:00');
      const maxTime = this.parseTime('18:00');
      
      if (startTime < minTime || startTime > maxTime) {
        return 'L\'heure de début doit être entre 08:00 et 18:00';
      }
      
      return true;
    },

    validateEndTime(value) {
      if (!this.editedItem.heureDebut) return true;
      
      const startTime = this.parseTime(this.editedItem.heureDebut);
      const endTime = this.parseTime(value);
      const maxTime = this.parseTime('18:00');
      
      if (endTime <= startTime) {
        return 'L\'heure de fin doit être après l\'heure de début';
      }
      
      if (endTime > maxTime) {
        return 'L\'heure de fin ne doit pas dépasser 18:00';
      }
      
      const durationInHours = (endTime - startTime) / (1000 * 60 * 60);
      if (durationInHours > 4) {
        return 'La durée ne doit pas dépasser 4 heures';
      }
      
      return true;
    },

    parseTime(timeString) {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    },

    async saveItem() {
      if (this.$refs.form.validate()) {
        const startTime = this.parseTime(this.editedItem.heureDebut);
        const endTime = this.parseTime(this.editedItem.heureFin);
        const durationInHours = (endTime - startTime) / (1000 * 60 * 60);

        if (durationInHours > 4) {
          this.formError = 'La durée de l\'autorisation ne doit pas dépasser 4 heures';
          return;
        }

        this.formError = null;

        try {
          if (this.editedItem.id) {
            await this.updateAutorisation({
              id: this.editedItem.id,
              autorisationData: {
                date: this.editedItem.date,
                heureDebut: this.editedItem.heureDebut,
                heureFin: this.editedItem.heureFin,
                UserId: this.currentUserId
              }
            });
           
            this.showSnackbar('Autorisation mise à jour avec succès', 'success');
          } else {
            await this.createAutorisation({
              date: this.editedItem.date,
              heureDebut: this.editedItem.heureDebut,
              heureFin: this.editedItem.heureFin,
              UserId: this.currentUserId
            });
            this.showSnackbar('Autorisation ajoutée avec succès', 'success');
          }
          this.closeDialog();
          await this.fetchAutorisations(this.options);
        } catch (error) {
          this.showSnackbar('Erreur lors de l\'enregistrement de l\'autorisation', 'error');
        }
      }
    },

    async deleteItemConfirm() {
      try {
        await this.deleteAutorisation(this.editedItem.id);
        this.closeDelete();
        await this.fetchAutorisations(this.options);
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
  async mounted() {
    await this.fetchSelectedSchedule()
  },
};
</script>

<style scoped>
.v-icon--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>