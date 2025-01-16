
<template>
<v-card>
      <v-card-title class="d-flex justify-start align-center">
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
           density="compact"
          variant="outlined"
        ></v-select>
        <v-select
    v-model="options.selectedYear"
    :items="yearsList"
    label="Filtrer par année"
    clearable
    @update:modelValue="fetch"
    class="mr-2"
    style="max-width: 150px"
     density="compact"
          variant="outlined"
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
    <template #item.RESTANCIENCONGE="{ item }">
  <div v-if="!isCurrentYear">
    {{ item.RESTANCIENCONGE }}
  </div>
  <div v-else>
    <div v-if="editedItem !== item" @click="editItem(item)">
      {{ item.RESTANCIENCONGE }}
    </div>
    <div v-else>
      <input
        type="number"
        v-model="item.RESTANCIENCONGE"
        @blur="saveEdit(item)"
        @keyup.enter="saveEdit(item)"
        @keyup.esc="cancelEdit(item)"
      />
    </div>
  </div>
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
import axios from "axios";
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
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ["date"],
        sortDesc: [true],
        selectedAgent: "",
        selectedYear: new Date().getFullYear(),
        
      },
      editedItem: null,
      
    };
  },
  computed: {
    ...mapGetters("agent", ["allAgents"]),
    ...mapGetters("CalculeConge",["CongeData", "pagination"]),
    ...mapState( "CalculeConge",['loading']) ,
    isCurrentYear() {
    return this.options.selectedYear === new Date().getFullYear();
  }
  },
  methods: {
    ...mapActions({
      fetchAllAgents: "agent/fetchAllAgents",
    }),
    ...mapActions("CalculeConge",["fetchCongeData","updateSoldeAncienConge"]),
    editItem(item) {
  if (this.isCurrentYear) {
    this.editedItem = item;
  }
},
  cancelEdit(item) {
    // Restore the original value
    Object.assign(item, this.originalItem);
    this.editedItem = null;
  },
  initYearsList() {
  const currentYear = new Date().getFullYear();
  const futureYears = 5; // Shows 5 years into the future
  this.yearsList = Array.from(
    { length: (currentYear + futureYears) - 2024 + 1 },
    (_, i) => 2024 + i
  );
},

  yearItemProps(year) {
    return {
      disabled: year < 2024,
      title: year < 2024 ? 'Years before 2024 are disabled' : '',
    };
  },
  async saveEdit(item) {
   try {
    const stuff=item.id;
    const data = this.CongeData.find(item => item.id=== stuff)
    const response = await axios.put(
        'http://localhost:3000/api/update-solde-ancien-conge', 
        { id: item.id, soldeAncienConge: item.RESTANCIENCONGE}, 
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`, 
            'Content-Type': 'application/json',
          },
        }
      );
      this.fetch(this.options);
      this.editedItem = null;
    } catch (error) {
      console.error('Error saving edit:', error);
      // Optionally, revert the changes
      Object.assign(item, this.originalItem);
      this.editedItem = null;
    }
  },
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
        year: this.options.selectedYear,
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
    this.initYearsList();
  },
  watch: {
  editedItem: {
    handler(newValue) {
      if (newValue) {
        // Store the original value before editing
        this.originalItem = { ...newValue };
      }
    },
    deep: true,
  },
},

};
</script>

<style>
.v-data-table {
  width: 100%;
}
</style>