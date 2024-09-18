<template>
    <v-container>
 
      <v-row justify="center">
        <v-col cols="12">
          <v-card>
            <v-card-title>

              Demande Congé
        <v-card class="pa-4 text-center">
          <div class="caption grey--text">Congé restant</div>
          <div class="display-1 font-weight-bold">21 jours</div>
        </v-card>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="showAddModal = true">Ajouter une nouvelle demande</v-btn>
            </v-card-title>
            <v-card-text>
              <v-data-table
                :headers="headers"
                :items="demandes"
                item-key="id"
                class="elevation-1"
              >
                <template v-slot:item.status="{ item }">
                  <v-chip
                    :color="item.status === 'Approved' ? 'green' : 'red'"
                    dark
                  >
                    {{ item.status === 'Approved' ? 'Approuvée' : 'Rejetée' }}
                  </v-chip>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- Add Demande Modal -->
      <v-dialog v-model="showAddModal" max-width="500px">
        <v-card>
          <v-card-title>
            <span class="headline">Demande Congé</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field
                v-model="newDemande.startDate"
                label="Date début"
                type="date"
                required
              ></v-text-field>
              <v-text-field
                v-model="newDemande.endDate"
                label="Date fin"
                type="date"
                required
              ></v-text-field>
              <v-text-field
                v-model="newDemande.reason"
                label="Raison"
                type="text"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="closeModal">Annuler</v-btn>
            <v-btn color="blue darken-1" text @click="addDemande">Enregistrer</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
<script>
export default {
  data() {
    return {
      showAddModal: false,
      valid: false,
      headers: [
        { title: 'Date début', key: 'startDate' },
        { title: 'Date fin', key: 'endDate' },
        { title: 'Raison', key: 'reason' },
        { title: 'Statut', key: 'status' },
      ],
      demandes: [
        { id: 1, startDate: '2023-07-01', endDate: '2023-07-10', reason: 'Vacances', status: 'Approuvée' },
        { id: 2, startDate: '2023-08-15', endDate: '2023-08-20', reason: 'Personnel', status: 'Rejetée' },
      ],
      newDemande: {
        startDate: '',
        endDate: '',
        reason: '',
        status: '',
      },
    };
  },
  methods: {
    closeModal() {
      this.showAddModal = false;
      this.resetForm();
    },
    addDemande() {
      if (this.$refs.form.validate()) {
        this.demandes.push({
          ...this.newDemande,
          id: this.demandes.length + 1,
        });
        this.closeModal();
      }
    },
    resetForm() {
      this.newDemande = {
        startDate: '',
        endDate: '',
        reason: '',
        status: '',
      };
    },
  },
};
</script>
  
  <style scoped>
  </style>