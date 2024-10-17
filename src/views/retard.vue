<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
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
      </v-card-title>
      <v-card-text>
        <v-data-table-server
          :headers="headers"
          :items="retard"
          :options.sync="options"
          :items-length="total"
          :loading="loading"
          class="elevation-1"
          @update:options="fetch"
        >
          <template v-slot:item.totalTardiness="{ item }">
            <v-chip :color="getRetardColor(item.totalTardiness)" dark>
              {{ item.totalTardiness }}
            </v-chip>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { mapActions,mapGetters } from 'vuex';
import * as XLSX from 'xlsx';
export default {
  data() {
    return {
      search: '',
      headers: [
        { title: 'Agent', align: 'start', key: 'User.name' },
        { title: 'Date', align: 'start', key: 'date' },
        { title: 'Retard Matin', key: 'retardm' },
        { title: 'Retard Après Midi', key: 'retardam' },
        { title: 'Retard total', key: 'retardtotal' },
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
      users: [
        { name: 'Alice', retard: 16 }, // Exemple avec des heures
        { name: 'Bob', retard: 35.5 },
        { name: 'Charlie', retard: 0 },
        { name: 'David', retard: 24 },
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
    ...mapGetters("retard",["retard", "total", "loading"]), 
  },
  methods: {
    getRetardColor(retard) {
      // Parse the totalTardiness string
      const matches = retard.match(/(\d+)h\s*(\d+)m/);
      let totalMinutes = 0;

      if (matches) {
        const hours = parseInt(matches[1], 10);
        const minutes = parseInt(matches[2], 10);
        totalMinutes = hours * 60 + minutes;
      }

      // Determine color based on total minutes
      if (totalMinutes === 0) return 'green';
      if (totalMinutes <= 16) return 'orange'; // Adjusted threshold for minutes
      return 'red';
    },
    exportToExcel() {
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Convert the retard data to a format suitable for Excel
      const excelData = this.retard.map(item => ({
        Agent: item.userName,
        Date: item.date,
        Retard: item.totalTardiness
      }));
      
      // Create a worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, "Retards");
      
      // Generate Excel file and trigger download
      XLSX.writeFile(wb, "retards_export.xlsx");
    },
    ...mapActions({
      fetchAllAgents: "agent/fetchAllAgents",
    }),
    ...mapActions("retard",["fetchRetard"]),
    async fetch(newOptions) {
      if (newOptions) {
        this.options.page = newOptions.page;
        this.options.itemsPerPage = newOptions.itemsPerPage;
        this.options.sortBy = newOptions.sortBy;
      }
      const { page, itemsPerPage, sortBy } = this.options;
      const sortKey = sortBy && sortBy.length > 0 ? sortBy[0].key : "date";
      const sortOrder = sortBy && sortBy.length > 0 ? sortBy[0].order : "asc";
      await this.fetchRetard({
        page,
        limit: itemsPerPage,
        sortBy: sortKey,
        order:sortOrder,
        userId: this.options.selectedAgent,
        month: this.options.selectedMonth,
      });
    },

  },
  mounted(){
    console.log(this.retard)
  },
  async created() {
    await this.fetchAllAgents();
   
  },
 
};
</script>

<style scoped>
/* Ajoutez vos styles CSS si nécessaire */
</style>