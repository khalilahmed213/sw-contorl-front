<template>
  <div>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <h2>Absences</h2>
        <v-select
          v-model="selectedMonth"
          :items="months"
          label="Sélectionnez un mois"
          class="mx-4"
          style="max-width: 200px;"
        ></v-select>
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="search"
          label="Rechercher"
          outlined
          clearable
          class="mb-4"
        ></v-text-field>
        <v-data-table
          :headers="headers"
          :items="filteredItems"
          :items-per-page="5"
          class="elevation-1"
        >
          <template v-slot:item.actions="{ item, index }">
            <v-icon small @click="editItem(index)">mdi-pencil</v-icon>
          </template>
          <template v-slot:item.agent="{ item }">
            {{ item.nom }} {{ item.prenom }}
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'MyDataTable',
  data() {
    return {
      headers: [
        { title: 'Agent', key: 'agent' },
        { title: 'Date Début d\'Absence', key: 'dateDebutAbsence' },
        { title: 'Date Fin d\'Absence', key: 'dateFinAbsence' },
        { title: 'Nb Jours', key: 'nbJours' },
        { title: 'Raison', key: 'raison' },
        { title: 'Actions', key: 'actions', sortable: false },
      ],
      items: [
        {
          nom: 'John',
          prenom: 'Doe',
          dateDebutAbsence: '2024-06-01',
          dateFinAbsence: '2024-06-10',
          nbJours: 10,
          raison: 'Maladie',
        },
        {
          nom: 'Jane',
          prenom: 'Smith',
          dateDebutAbsence: '2024-06-05',
          dateFinAbsence: '2024-06-07',
          nbJours: 3,
          raison: 'Congé',
        },
      ],
      search: '',
      months: [
        'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
        'août', 'septembre', 'octobre', 'novembre', 'décembre',
      ],
      selectedMonth: null,
    };
  },
  computed: {
    filteredItems() {
      if (!this.search.trim()) {
        return this.items;
      }
      const searchTerm = this.search.trim().toLowerCase();
      return this.items.filter(item => {
        return (
          item.nom.toLowerCase().includes(searchTerm) ||
          item.prenom.toLowerCase().includes(searchTerm) ||
          item.raison.toLowerCase().includes(searchTerm)
        );
      });
    },
  },
  methods: {
    editItem(index) {
      console.log('Editing item at index:', index);
    },
  },
};
</script>

<style scoped>
</style>