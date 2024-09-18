<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        Rapport de retard mensuelle
        <v-select
                v-model="selectedMonth"
                :items="months"
                label="Sélectionnez un mois"
                class="mx-4"
                style="max-width: 200px;"
              ></v-select>
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="users"
          class="elevation-1"
          locale="fr"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Retards des Utilisateurs</v-toolbar-title>
              <v-divider class="mx-4" inset vertical></v-divider>
              <v-spacer></v-spacer>
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Rechercher"
                single-line
                hide-details
              ></v-text-field>
            </v-toolbar>
          </template>
          <template v-slot:item.retard="{ item }">
            <v-chip :color="getRetardColor(item.retard)" dark>
              {{ item.retard }} h
            </v-chip>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      search: '',
      headers: [
        { title: 'Agent', align: 'start', key: 'name' },
        { title: 'Retard (heures)', key: 'retard' },
      ],
      users: [
        { name: 'Alice', retard: 16 }, // Exemple avec des heures
        { name: 'Bob', retard: 35.5 },
        { name: 'Charlie', retard: 0 },
        { name: 'David', retard: 24 },
      ],
    };
  },
  methods: {
    getRetardColor(retard) {
      if (retard === 0) return 'green';
      if (retard <= 16) return 'orange'; // Exemple de seuil ajusté pour les heures
      return 'red';
    },
  },
};
</script>

<style scoped>
/* Ajoutez vos styles CSS si nécessaire */
</style>