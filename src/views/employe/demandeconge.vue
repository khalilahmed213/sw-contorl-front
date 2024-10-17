<template>
  <v-container>
    <v-card>
        <v-card class="pa-4 text-center">
          <div class="caption grey--text">Congé restant</div>
          <div class="display-1 font-weight-bold">21 jours</div>
        </v-card>
   
      <v-card-title>
        <v-btn color="primary" @click="openAddDialog">
          <v-icon left>mdi-plus</v-icon>
          Demande de Congé
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-data-table-server
          v-model:items-per-page="options.itemsPerPage"
          :headers="headers"
          :items="conges"
          :items-length="totalItems"
          :loading="loading"
          item-value="id"
          @update:options="fetchConges"
          class="elevation-1"
        >
          <template v-slot:item.startDate="{ item }">
            {{ formatDate(item.startDate) }}
          </template>
          <template v-slot:item.endDate="{ item }">
            {{ formatDate(item.endDate) }}
          </template>
          <template v-slot:item.status="{ item }">
            <v-chip :color="getStatusColor(item.status)" dark>
              {{ item.status }}
            </v-chip>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon small @click="editItem(item)" class="mr-2">mdi-pencil</v-icon>
            <v-icon small @click="deleteItem(item)" color="black" :disabled="!canDelete(item)">mdi-delete</v-icon>
          </template>
          <template v-slot:item.remainingLeave="{ item }">
            <div class="caption grey--text">Congé restant</div>
            <div class="display-1 font-weight-bold">{{ item.remainingLeave }} jours</div>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <!-- Add/Edit Congé Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>{{ formTitle }}</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" @submit.prevent="saveItem">
            <v-text-field v-model="editedItem.startDate" label="Date début" type="date" required></v-text-field>
            <v-text-field v-model="editedItem.endDate" label="Date fin" type="date" required></v-text-field>
            <v-text-field v-model="editedItem.raison" label="Raison" type="text" required></v-text-field>
            <v-alert v-if="formError" type="error" class="mt-3">{{ formError }}</v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">Annuler</v-btn>
          <v-btn color="blue darken-1" text @click="saveItem" :disabled="!valid">{{ editedItem.id ? 'Modifier' : 'Ajouter' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title>Confirmer la suppression</v-card-title>
        <v-card-text>Êtes-vous sûr de vouloir supprimer ce congé ?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDelete">Annuler</v-btn>
          <v-btn color="red darken-1" text @click="deleteItemConfirm">Supprimer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor">{{ snackbarMessage }}
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
        { title: 'référence', key: 'reference' },
        { title: 'Date début', key: 'startDate' },
        { title: 'Date fin', key: 'endDate' },
        { title: 'Raison', key: 'raison' },
        { title: 'Statut', key: 'status' },
        { title: 'Actions', key: 'actions', sortable: false },
      ],
      editedItem: {
        startDate: '',
        endDate: '',
        raison: '',
        status: '',
        UserId: this.currentUserId, // Add UserId
      },
      defaultItem: {
        startDate: '',
        endDate: '',
        raison: '',
        status: '',
      },
      options: {
        page: 1,
        itemsPerPage: 10,
      },
      snackbar: false,
      snackbarMessage: '',
      snackbarColor: 'success',
    };
  },
  computed: {
    ...mapState('conge', ['conges', 'totalItems', 'loading']),
    ...mapGetters('calcule',[' Data']),
    ...mapGetters('schedule',['isselectedschedule']),
    formTitle() {
      return this.editedItem.id ? 'Modifier Congé' : 'Nouvelle Demande de Congé';
    },
    currentUserId() {
      return this.$store.state.auth.user.id; // Get current user ID
    },
  },
  methods: {
    ...mapActions('conge', ['fetchConges', 'createConge', 'updateConge', 'deleteConge','fetchUserConges']),
    ...mapActions({
      fetchAllAgents: "agent/fetchAllAgents"
    }),
    ...mapActions('schedule',['fetchSelectedSchedule']),
    ...mapActions('calcule',['fetchCongepData']),
    async fetchConges(newOptions) {
      if (newOptions) {
        this.options = newOptions;
      }
      const { page, itemsPerPage, sortBy } = this.options;
      const sortKey = sortBy && sortBy.length > 0 ? sortBy[0].key : 'reference';
      const sortOrder = sortBy && sortBy.length > 0  ? sortBy[0].order : 'asc';
      await this.fetchUserConges({
        page,
        limit: itemsPerPage,
        sortBy: sortKey,
        sortOrder,
        UserId: this.currentUserId,
      });
      
    },

    openAddDialog() {
      this.editedItem = { ...this.defaultItem, UserId: this.currentUserId };
      this.dialog = true;
    },

    editItem(item) {
      this.editedItem = { ...item };
      this.dialog = true;
    },
    canDelete(item) {
      return item.status.toLowerCase() === 'en attente';
    },
    deleteItem(item) {
      this.editedItem = { ...item };
      this.dialogDelete = true;
    },

    closeDialog() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = { ...this.defaultItem };
      });
    },

    closeDelete() {
      this.dialogDelete = false;
    },

    async saveItem() {
      if (this.$refs.form.validate()) {
        this.formError = null;
        try {
          if (this.editedItem.id) {
            await this.updateConge({ id: this.editedItem.id, congeData: this.editedItem });
            this.showSnackbar('Congé mis à jour avec succès', 'success');
          } else {
            await this.createConge(this.editedItem);
            this.showSnackbar('Congé ajouté avec succès', 'success');
          }
          this.closeDialog();
          await this.fetchConges(this.options);
        } catch (error) {
          console.error('Échec de l\'enregistrement du congé:', error);
          this.showSnackbar('Erreur lors de l\'enregistrement du congé', 'error');
        }
      }
    },

    async deleteItemConfirm() {
      try {
        await this.deleteConge(this.editedItem.id);
        this.closeDelete();
        await this.fetchConges(this.options);
        this.showSnackbar('Congé supprimé avec succès', 'success');
      } catch (error) {
        console.error('Échec de la suppression du congé:', error);
        this.showSnackbar('Erreur lors de la suppression du congé', 'error');
      }
    },

    showSnackbar(message, color = 'success') {
      this.snackbarMessage = message;
      this.snackbarColor = color;
      this.snackbar = true;
    },

    getStatusColor(status) {
      switch (status.toLowerCase()) {
        case 'accepté': // Updated case for accepted status
          return 'green';
        case 'rejeté': // Confirmed red for rejected status
          return 'red';
        case 'en attente': // Confirmed yellow for pending status
          return 'orange'; // Changed to yellow
        default:
          return 'grey';
      }
    },
    
    formatDate(date) {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return new Date(date).toLocaleDateString('fr-FR', options);
    },
    async created(){
await this.fetchCongepData(this.currentUserId)
await this.fetchSelectedSchedule()
    }
  },
};
</script>

<style scoped>
</style>