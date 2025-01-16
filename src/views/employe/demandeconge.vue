<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-btn color="primary" @click="openAddDialog">
          <v-icon left>mdi-plus</v-icon>
          <div>Demandes Conges</div>

        </v-btn>
        <br />
        <br />
        <v-btn color="primary" @click="refresh">

          <div>Actualiser</div>

        </v-btn>

      </v-card-title>

      <v-card-text>
        <v-data-table-server v-model:items-per-page="options.itemsPerPage" :headers="headers" :items="conges"
          :items-length="totalItems" :loading="loading" item-value="id" @update:options="fetchConges"
          class="elevation-1">
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
            <v-icon small @click="editItem(item)" class="mr-2" :disabled="!canDelete(item)">mdi-pencil</v-icon>
            <v-icon small @click="deleteItem(item)" color="black" :disabled="!canDelete(item)">mdi-delete</v-icon>
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
            <v-date-input
  v-model="editedItem.startDate"
  label="Date début"
  :rules="getStartDateRules()"
  required
  :min="getCurrentDate()"
  locale="fr"
  date-format="dd/MM/yyyy"
  @change="changeDateStart"
  :allowed-dates="allowedDates" 
></v-date-input>

<v-date-input
  v-model="editedItem.endDate"
  label="Date fin"
  :rules="getEndDateRules()"
  required
  :min="editedItem.startDate || getCurrentDate()"
  locale="fr"
  date-format="dd/MM/yyyy"
  @change="changeDateFin"
  :allowed-dates="allowedDates" 
></v-date-input>
            <v-text-field v-model="editedItem.raison" label="Raison" type="text" required></v-text-field>
            <v-alert v-if="formError" type="error" class="mt-3">{{ formError }}</v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">Annuler</v-btn>
          <v-btn color="blue darken-1" text @click="saveItem" :disabled="!valid">{{ editedItem.id ? 'Modifier' :
            'Ajouter'
            }}</v-btn>
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
import axios from 'axios';
import moment from 'moment';
import { mapState, mapActions, mapGetters } from 'vuex';
export default {
  data() {
    
    return {
      dateValidationMessages: {
      required: 'Ce champ est obligatoire',
      startDateFuture: 'La date de début doit être égale ou postérieure à aujourd\'hui',
      endDateAfterStart: 'La date de fin doit être égale ou postérieure à la date de début',
    },
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
        startDate: null,
        endDate:null,
        raison: '',
        status: '',
        UserId: this.currentUserId,
        ScheduleId: ''
      },
      defaultItem: {
        startDate: null,
        endDate:null,
        raison: '',
        status: '',
        ScheduleId: ''
      },
      options: {
        page: 1,
        itemsPerPage: 10,
      },
      snackbar: false,
      snackbarMessage: '',
      snackbarColor: 'success',
      menuStartDate: false,
      menuEndDate: false,
      rules: {
        required: value => !!value || 'Ce champ est requis.',
      },
    };
  },
  computed: {
    error() {
    return this.$store.getters['conge/getError'];
  },
    ...mapState('conge', ['conges', 'totalItems', 'loading', 'penalites']),
    ...mapGetters('calcule', ['Data']),
    ...mapGetters('schedule', ['isselectedschedule']),
    formTitle() {
      return this.editedItem.id ? 'Modifier Congé' : 'Nouvelle Demande de Congé';
    },
    currentUserId() {
      return this.$store.state.auth.user.id; // Get current user ID
    },
  },
  methods: {
    moment,
    ...mapActions('conge', ['fetchConges', 'createConge', 'updateConge', 'deleteConge', 'fetchUserConges', 'fetchUserPenalites']),
    ...mapActions({
      fetchAllAgents: "agent/fetchAllAgents"
    }),
    allowedDates(date) {
  const day = new Date(date).getDay();
  // Returns false for Saturday (6) and Sunday (0)
  return day !== 0 && day !== 6;
},
    ...mapActions('schedule', ['fetchSelectedSchedule']),
    ...mapActions('calcule', ['fetchCongepData']),
    datesOverlap(congeStartDate, congeEndDate, penaliteStartDate, penaliteEndDate) {
  const cStart = moment(congeStartDate, 'YYYY-MM-DD');
  const cEnd = moment(congeEndDate, 'YYYY-MM-DD');
  const pStart = moment(penaliteStartDate, 'YYYY-MM-DD');
  const pEnd = moment(penaliteEndDate, 'YYYY-MM-DD');
  return !(cEnd.isBefore(pStart) || cStart.isAfter(pEnd));
},

getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
},
    async fetchConges(newOptions) {
      if (newOptions) {
        this.options = newOptions;
      }
      const { page, itemsPerPage, sortBy } = this.options;
      const sortKey = sortBy && sortBy.length > 0 ? sortBy[0].key : 'reference';
      const sortOrder = sortBy && sortBy.length > 0 ? sortBy[0].order : 'asc';
      await this.fetchUserConges({
        page,
        limit: itemsPerPage,
        sortBy: sortKey,
        sortOrder,
        UserId: this.currentUserId,
      })
    },
    async refresh() {
      await this.fetchConges(this.options)
    },
    openAddDialog() {
      this.editedItem = { ...this.defaultItem, UserId: this.currentUserId, ScheduleId: null };
      this.dialog = true;
    },
    async editItem(item) {
      const response = await axios.get('http://localhost:3000/api/conges/status', {
      params: { id:item.id },
      headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
    });
      if(response.data.result){
        this.showSnackbar('ce congé a été confirmer veillez actualiser', 'success');
        return;
      } else{
        this.editedItem = {
      ...item, // Copy all properties from item
      startDate: new Date(item.startDate), // Format startDate
      endDate:new Date(item.endDate),     // Format endDate
    };
      this.dialog = true;
    }
    },
    canDelete(item) {
      return item.status.toLowerCase() === 'en attente';
    },
    async deleteItem(item) {
  try {
    const response = await axios.get('http://localhost:3000/api/conges/status', {
      params: { id: item.id },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (response.data.result) {
      this.showSnackbar('Le statut de ce congé a été modifié, veuillez actualiser', 'error');
      await this.fetchConges(this.options);
      return;
    }

    this.editedItem = { ...item };
    this.dialogDelete = true;
  } catch (error) {
    console.error('Erreur lors de la vérification du statut:', error);
    this.showSnackbar('Erreur lors de la vérification du statut du congé', 'error');
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
    },
   
    getStartDateRules() {
  return [
    v => !!v || this.dateValidationMessages.required,
    v => {
      if (!v) return true;
      const today = moment(this.getCurrentDate(), 'YYYY-MM-DD');
      const startDate = moment(v, 'DD/MM/YYYY');
      return startDate.isSameOrAfter(today) || this.dateValidationMessages.startDateFuture;
    }
  ];
},

getEndDateRules() {
  return [
    v => !!v || this.dateValidationMessages.required,
    v => {
      if (!this.editedItem.startDate || !v) return true;
      const startDate = moment(this.editedItem.startDate, 'YYYY-MM-DD');
      const endDate = moment(v, 'DD/MM/YYYY');
      return endDate.isSameOrAfter(startDate) || this.dateValidationMessages.endDateAfterStart;
    }
  ];
},

    validateDates() {
      if (!this.editedItem.startDate || !this.editedItem.endDate) return;
      
      const startDate = moment(this.editedItem.startDate).startOf('day');
      const endDate = moment(this.editedItem.endDate).startOf('day');
      
      if (endDate.isBefore(startDate)) {
        this.editedItem.endDate = this.editedItem.startDate;
      }
    },

    changeDateStart(value) {
  const date = moment(value, 'DD/MM/YYYY').format('YYYY-MM-DD');
  this.editedItem.startDate = date;
  this.validateDates();
  if (this.$refs.form) {
    this.$nextTick(() => {
      this.$refs.form.validate();
    });
  }
},

changeDateFin(value) {
  const date = moment(value, 'DD/MM/YYYY').format('YYYY-MM-DD');
  this.editedItem.endDate = date;
  this.validateDates();
  if (this.$refs.form) {
    this.$nextTick(() => {
      this.$refs.form.validate();
    });
  }
},
changeDateStart(value) {
  this.editedItem.startDate = value;
  this.validateDates();
  // Only validate if form exists
  if (this.$refs.form) {
    this.$nextTick(() => {
      this.$refs.form.validate();
    });
  }
},

// Fix the changeDateFin method
changeDateFin(value) {
  this.editedItem.endDate = value;
  this.validateDates();
  // Only validate if form exists
  if (this.$refs.form) {
    this.$nextTick(() => {
      this.$refs.form.validate();
    });
  }
},
async saveItem() {
  if (this.$refs.form.validate()) {
    this.loading = true;
    try {
      if (this.editedItem.id) {
        // Update existing conge
        await axios.put(`http://localhost:3000/api/conges/${this.editedItem.id}`, this.editedItem, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        });
        this.showSnackbar('Congé mis à jour avec succès', 'success');
      } else {
        // Create new conge
        await axios.post('http://localhost:3000/api/conges', this.editedItem, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        });
        this.showSnackbar('Congé ajouté avec succès', 'success');
      }
      this.closeDialog();
      await this.fetchConges(this.options);
    } catch (error) {
      let errorMessage = 'Une erreur est survenue';
      if (error.response) {
        // Server responded with a status other than 2xx
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.statusText) {
          errorMessage = error.response.statusText;
        }
      } else if (error.request) {
        // No response received
        errorMessage = 'Aucune réponse du serveur';
      } else {
        // Something else happened
        errorMessage = error.message;
      }
      this.closeDialog()
      this.showSnackbar(errorMessage, 'error');
    } finally {
      this.loading = false;
    }
  }
},
    async deleteItemConfirm() {
  try {
    await this.deleteConge(this.editedItem.id);
    this.showSnackbar('Congé supprimé avec succès', 'success');
    this.closeDelete();
    await this.fetchConges(this.options);
  } catch (error) {
    console.error('Échec de la suppression du congé:', error);
    this.showSnackbar('Erreur lors de la suppression du congé', 'error');
    this.closeDelete();
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
}

  },
  async created() {
    await this.fetchSelectedSchedule()
    await this.fetchUserPenalites(this.currentUserId);
  },
  watch: {
  'editedItem.startDate': {
    handler(newVal) {
      if (newVal) {
        this.validateDates();
        // Only validate if form exists
        if (this.$refs.form) {
          this.$nextTick(() => {
            this.$refs.form.validate();
          });
        }
      }
    }
  },
  'editedItem.endDate': {
    handler(newVal) {
      if (newVal) {
        this.validateDates();
        // Only validate if form exists
        if (this.$refs.form) {
          this.$nextTick(() => {
            this.$refs.form.validate();
          });
        }
      }
    }
  }
}
};
</script>

<style scoped></style>