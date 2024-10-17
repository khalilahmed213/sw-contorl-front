<template>
<v-card>
      <v-card-title class="d-flex justify-start align-center">
        <v-select
          v-model="options.selectedMonth"
          :items="months"
          @update:modelValue="fetch"
          label="filtrer un mois"
          clearable
          class="mx-4"
          item-value="value"
          style="max-width: 200px"
        ></v-select>
        <v-select
          v-model="options.selectedAgent"
          :items="allAgents"
          item-title="name"
          item-value="id"
          label="Filtrer par agent"
          clearable
          @update:modelValue="fetch"
          class="mr-2"
          style="max-width: 200px"
        ></v-select>
        <v-btn @click="exportToExcel" class="ml-auto" color="green"
          >Export Excel</v-btn
        >
        <!-- Added export button -->
      </v-card-title>
      <v-data-table-server
          :headers="headers"
          :items="CongeData"
          :options.sync="options"
          :items-length="pagination.totalItems"
          :loading="loading"
          class="elevation-1"
          @update:options="fetch"
        >
        <template #item.name="{ item }">
      <router-link :to="{ name: 'synthèse congé particulier', params: { id: item.id }}">
        {{ item.name }}
      </router-link>
    </template>
        </v-data-table-server>

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
  </v-card>
</template>

<script>
import { mapActions, mapGetters,mapState } from "vuex";
import * as XLSX from 'xlsx';
export default {
  data() {
    return {
      search: '',
      headers: [
        { title: 'Agent', key: 'name' },
        { title: 'Nb Mois effectué', key: 'monthsDone' },
        { title: 'SOLDE CONGE', key: 'SOLDECONGE' },
        { title: 'CONGE PRISE', key: 'CONGEPRISE' },
        { title: 'Sanction', key: 'sanction' },
        { title: 'RESTE CONGE', key: 'RESTCONGE' },
        { title: 'Rest ancien congé', key: 'RESTANCIENCONGE' }
      ],
      months: [
        { title: "Janvier", value: 1 },
        { title: "Février", value: 2 },
        { title: "Mars", value: 3 },
        { title: "Avril", value: 4 },
        { title: "Mai", value: 5 },
        { title: "Juin", value: 6 },
        { title: "Juillet", value: 7 },
        { title: "Août", value: 8 },
        { title: "Septembre", value: 9 },
        { title: "Octobre", value: 10 },
        { title: "Novembre", value: 11 },
        { title: "Décembre", value: 12 },
      ],
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ["date"],
        sortDesc: [true],
        selectedAgent: "",
        selectedMonth: "",
      },
    };
  },
  computed: {
    ...mapGetters("agent", ["allAgents"]),
    ...mapGetters("CalculeConge",["CongeData", "pagination"]),
    ...mapState( "CalculeConge",['loading']) 
  },
  methods: {
    ...mapActions({
      fetchAllAgents: "agent/fetchAllAgents",
    }),
    ...mapActions("CalculeConge",["fetchCongeData"]),
    async fetch(newOptions) {
      if (newOptions) {
        this.options.page = newOptions.page;
        this.options.itemsPerPage = newOptions.itemsPerPage;
        this.options.sortBy = newOptions.sortBy;
      }
      const { page, itemsPerPage, sortBy } = this.options;
      const sortKey = sortBy && sortBy.length > 0 ? sortBy[0].key : "name";
      const sortOrder = sortBy && sortBy.length > 0 ? sortBy[0].order : "asc";
      await this.fetchCongeData({
        page,
        limit: itemsPerPage,
        sortBy: sortKey,
        order:sortOrder,
        userId: this.options.selectedAgent,
        month: this.options.selectedMonth,
      });
    }, 
    exportToExcel() {
      const data = this.CongeData.map(item => ({
        'Agent': item.name,
        'Nb Mois effectué': item.monthsDone,
        'SOLDE CONGE': item.SOLDECONGE,
        'CONGE PRISE': item.CONGEPRISE,
        'Sanction': item.sanction,
        'RESTE CONGE': item.RESTCONGE,
        'Rest ancien congé': item.RESTANCIENCONGE
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Données de Congé");

      // Générer un nom de fichier avec la date actuelle
      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = `Données_de_Congé_${dateStr}.xlsx`;

      // Déclencher le téléchargement
      XLSX.writeFile(wb, fileName);
    },
  },
  mounted(){
console.log(this.CongeData)
  },
  async created() {
    await this.fetchAllAgents();
  },
};
</script>

<style>
.v-data-table {
  width: 100%;
}
</style>