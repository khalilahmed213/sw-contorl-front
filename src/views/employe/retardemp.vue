<template>
  <v-container>
    <v-card>
      <v-card-title >
        Détails des Retards pour {{ user.name }}
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="tardinessRecords"
          class="elevation-1"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Historique des Retards</v-toolbar-title>
              <v-divider class="mx-4" inset vertical></v-divider>
              <v-spacer></v-spacer>
            </v-toolbar>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon small @click="showEditModal(item)">mdi-pencil</v-icon>
          </template>
          <template v-slot:item.date="{ item }">
            {{ new Date(item.date).toLocaleDateString() }}
          </template>
          <template v-slot:item.days="{ item }">
            {{ convertDaysToHours(item.days) }} h
          </template>
          <template v-slot:item.reason="{ item }">
            {{ item.reason || 'Aucune raison fournie' }}
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Add/Edit Tardiness Modal -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ isEdit ? 'Modifier' : 'Ajouter' }} un Retard</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field
              v-model="formData.date"
              label="Date"
              type="date"
              required
            ></v-text-field>
            <v-text-field
              v-model="formData.hours" 
              label="Heures"
              type="number"
              required
            ></v-text-field>
            <v-text-field
              v-model="formData.reason"
              label="Raison"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">Annuler</v-btn>
          <v-btn color="blue darken-1" text @click="saveTardiness">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  props: {
    UserId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      user: {
        name: 'Alice',
        tardiness: 5,
      },
      headers: [
        { title: 'Date', key: 'date' },
        { title: 'Retard (heures)', key: 'days' },
        { title: 'Raison', key: 'reason' },
        { title: 'Actions', key: 'actions', sortable: false },
      ],
      tardinessRecords: [
        { id: 1, date: '2024-06-01', days: 8, reason: 'Trafic' }, 
        { id: 2, date: '2024-06-05', days: 16, reason: 'Rendez-vous médical' },
        { id: 3, date: '2024-06-10', days: 8 },
        { id: 4, date: '2024-06-15', days: 8, reason: 'Urgence familiale' },
      ],
      dialog: false,
      isEdit: false,
      formData: {
        id: null,
        date: '',
        hours: 0,
        reason: '',
      },
    };
  },
  methods: {
    showAddModal() {
      this.isEdit = false;
      this.formData = {
        id: null,
        date: '',
        hours: 0,
        reason: '',
      };
      this.dialog = true;
    },
    showEditModal(record) {
      this.isEdit = true;
      this.formData = { ...record };
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
    },
    saveTardiness() {
      if (this.$refs.form.validate()) {
        if (this.isEdit) {
          const index = this.tardinessRecords.findIndex(record => record.id === this.formData.id);
          if (index !== -1) {
            this.tardinessRecords.splice(index, 1, this.formData);
          }
        } else {
          this.formData.id = this.tardinessRecords.length + 1;
          this.tardinessRecords.push({ ...this.formData });
        }
        this.closeDialog();
      }
    },
    convertDaysToHours(days) {
      // Conversion de jours en heures (par exemple, si un jour équivaut à 8 heures)
      return days * 8;
    },
  },
};
</script>

<style scoped>
/* Ajoutez vos styles CSS si nécessaire */
</style>