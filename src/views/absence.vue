<template>
  <div>
    <v-card>
      <v-card-title class="d-flex justify-start align-center">
        <!-- Changed to justify-start -->
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
      <v-card-text>
        <v-data-table-server
          :headers="headers"
          :items="absences"
          :options.sync="options"
          :items-length="pagination.totalItems"
          :loading="loading"
          class="elevation-1"
          @update:options="fetch"
        >
        </v-data-table-server>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import * as XLSX from 'xlsx';
export default {
  name: "MyDataTable",
  data() {
    return {
      headers: [
        { title: "Agent", key: "name" },
        { title: "Date début d'Absence", key: "startDate" },
        { title: "Date fin d'Absence", key: "endDate" },
        { title: "Nbr de jours", key: "days" },
        { title: "raison", key: "raison" },
      ],
      search: "",
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
      selectedMonth: null,
      selectedAgent: null,
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
    ...mapGetters("absence",["absences", "pagination", "loading"]), 
  },
  methods: {
    ...mapActions({
      fetchAllAgents: "agent/fetchAllAgents",
    }),
    ...mapActions("absence",["fetchAbsences"]),

    exportToExcel() {
      const dataToExport = this.absences.map(absence => ({
        'Agent': absence.User.name,
        'Date d\'Absence': new Date(absence.date).toLocaleDateString(),
    
      }));
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Absences');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveExcelFile(excelBuffer, 'absences.xlsx');
    },
    saveExcelFile(buffer, fileName) {
      const data = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(data);
      link.download = fileName;
      link.click();
    },
    async fetch(newOptions) {
      if (newOptions) {
        this.options.page = newOptions.page;
        this.options.itemsPerPage = newOptions.itemsPerPage;
        this.options.sortBy = newOptions.sortBy;
      }
      const { page, itemsPerPage, sortBy } = this.options;
      const sortKey = sortBy && sortBy.length > 0 ? sortBy[0].key : "date";
      const sortOrder = sortBy && sortBy.length > 0 ? sortBy[0].order : "asc";
      await this.fetchAbsences({
        page,
        limit: itemsPerPage,
        sortBy: sortKey,
        order:sortOrder,
        userId: this.options.selectedAgent,
        month: this.options.selectedMonth,
      });
    },
  },
  async created() {
    await this.fetchAllAgents();
  },
  mounted() {
  console.log(this.absences)
  },
};
</script>

<style scoped>
</style>
