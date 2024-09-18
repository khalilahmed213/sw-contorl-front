<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="filteredItems"
      class="elevation-1"
      :search="search"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Fiche Congé 2024</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Rechercher par NOM PRENOM"
            single-line
            hide-details
          ></v-text-field>
        </v-toolbar>
      </template>
    </v-data-table>

    <v-table>
      <thead>
        <tr style="background-color: bisque;">
          <th class="text-left">Congé Annuel</th>
          <td>21 jours</td>
        </tr>
      </thead>
      <tbody>
        <tr style="background-color: yellowgreen;">
          <th class="text-left">solde congé</th>
          <td>(Nb Mois effectué * 1,75)</td>
        </tr>
      </tbody>
    </v-table>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      search: '', // To store the search query
      headers: [
        { title: 'Agent', key: 'name' },
        { title: 'Nb Mois effectué', key: 'monthsDone' },
        { title: 'SOLDE CONGE', key: 'leaveBalance' },
        { title: 'CONGE PRISE', key: 'leaveTaken' },
        { title: 'Sanction', key: 'sanction' },
        { title: 'RESTE CONGE', key: 'remainingLeave' },
        { title: 'Rest ancien congé', key: 'oldLeave' }
      ],
      items: [
        { name: 'AHMED BOUZID', monthsDone: 6, leaveBalance: 11, leaveTaken: 0, sanction: 1, remainingLeave: 10, oldLeave: null },
        { name: 'AYMEN DIMASSI', monthsDone: 6, leaveBalance: 11, leaveTaken: 0, sanction: 0, remainingLeave: 11, oldLeave: null },
        { name: 'MED THABET BEN AICHA', monthsDone: 6, leaveBalance: 11, leaveTaken: 0, sanction: 1, remainingLeave: 10, oldLeave: null },
        { name: 'MERIEM MAAMRI', monthsDone: 6, leaveBalance: 11, leaveTaken: 0, sanction: 0, remainingLeave: 10, oldLeave: null },
        { name: 'AHMED BEN SALEM', monthsDone: 6, leaveBalance: 11, leaveTaken: 0, sanction: 0, remainingLeave: 10, oldLeave: null },
        { name: 'SIWAR LAHMER', monthsDone: 6, leaveBalance: 11, leaveTaken: 0, sanction: 0, remainingLeave: 11, oldLeave: null },
        { name: 'LOUAY BELTIFA', monthsDone: 6, leaveBalance: 11, leaveTaken: 0, sanction: 0, remainingLeave: 10, oldLeave: null },
        { name: 'SOFIENE FATHALLAH', monthsDone: 6, leaveBalance: 11, leaveTaken: 0, sanction: 0, remainingLeave: 10, oldLeave: null },
        { name: 'ISLEM CHAMBAH', monthsDone: 6, leaveBalance: 11, leaveTaken: 0, sanction: 0, remainingLeave: 11, oldLeave: null },
        { name: 'JIHENE HANI', monthsDone: 6, leaveBalance: 11, leaveTaken: 0, sanction: 0, remainingLeave: 11, oldLeave: null },
        { name: 'Nihel bouzid', monthsDone: 6, leaveBalance: 11, leaveTaken: 0, sanction: 0, remainingLeave: 10, oldLeave: null },
        { name: 'rawia nemria', monthsDone: 6, leaveBalance: 11, leaveTaken: 0, sanction: 0, remainingLeave: 11, oldLeave: null },
        { name: 'Dhaker Sghaier', monthsDone: 6, leaveBalance: 11, leaveTaken: 0, sanction: 0, remainingLeave: 10, oldLeave: null },
        { name: 'Yosr Sassi', monthsDone: 6, leaveBalance: 11, leaveTaken: 0, sanction: 0, remainingLeave: 11, oldLeave: null },
        { name: 'Safa Zouiat', monthsDone: 6, leaveBalance: 11, leaveTaken: 0, sanction: 0, remainingLeave: 10, oldLeave: null }
      ]
    };
  },
  computed: {
    filteredItems() {
      // Filtering items based on search query
      return this.items.filter(item =>
        item.name.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  }
};
</script>

<style>
.v-data-table {
  width: 100%;
}
</style>