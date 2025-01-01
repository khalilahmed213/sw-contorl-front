<template>
  <div>
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
        <v-btn @click="exportToExcel" class="ml-auto" color="green">Export Excel</v-btn>
        <v-btn @click="showAddAbsenceModal = true" class="ml-2" color="primary">Add Absence</v-btn>
        <v-btn @click="refresh" color="blue"
          >Actualiser</v-btn
        >
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
        ></v-data-table-server>
        <v-dialog v-model="showAddAbsenceModal" max-width="600px">
          <v-card>
            <v-card-title>
              <span class="text-h5">Add Absence</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" class="text-center">
                    <div class="text-h6">
                      <strong>Date:</strong> {{ formattedDate }}
                    </div>
                  </v-col>
                  <v-col cols="12">
                    <v-select
                      v-model="newAbsence.userId"
                      :items="allAgents"
                      item-title="name"
                      item-value="id"
                      label="Select Agent"
                      required
                    ></v-select>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="newAbsence.raison"
                      label="Reason"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="showAddAbsenceModal = false">Close</v-btn>
              <v-btn color="blue darken-1" text @click="add">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <!-- Snackbar Component -->
        <v-snackbar
          v-model="snackbar.show"
          :timeout="snackbar.timeout"
          :color="snackbar.color"
          @input="onSnackbarInput"
        >
          {{ snackbar.message }}
          <template v-slot:action="{ attrs }">
            <v-btn
              text
              v-bind="attrs"
              @click="snackbar.show = false"
            >
              Close
            </v-btn>
          </template>
        </v-snackbar>
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
      showAddAbsenceModal: false,
      newAbsence: {
        userId: null,
        date: new Date().toISOString().substr(0, 10),
        raison: null,
      },
      snackbar: {
        show: false,
        message: '',
        color: 'success',
        timeout: 3000,
      },
    };
  },
  computed: {
    ...mapGetters("agent", ["allAgents"]),
    ...mapGetters("absence", ["absences", "pagination", "loading"]),
    formattedDate() {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(this.newAbsence.date).toLocaleDateString('fr-FR', options);
    },
  },
  methods: {
    ...mapActions({
      fetchAllAgents: "agent/fetchAllAgents",
    }),
    async refresh(){
await this.fetch(this.options)
    },
    ...mapActions("absence", ["fetchAbsences", "addAbsence"]),
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
        order: sortOrder,
        userId: this.options.selectedAgent,
        month: this.options.selectedMonth,
      });
    },
    async add() {
      try {
        const existing = this.absences.find(absence => absence.UserId === this.newAbsence.userId && absence.date === this.newAbsence.date);
        if (existing) {
          this.showErrorAlert('Absence already exists for this user on this date.');
          return;
        }
        await this.addAbsence(this.newAbsence);
        this.showSuccessAlert('Absence added successfully.');
        this.showAddAbsenceModal = false;
        this.newAbsence = { userId: null, date: new Date().toISOString().substr(0, 10), raison: null };
        this.fetch(this.options);
      } catch (error) {
        console.error("Error adding absence:", error);
        if (error.response && error.response.data.message) {
          this.showErrorAlert(error.response.data.message);
        }
      }
    },
    showErrorAlert(message) {
      this.snackbar = {
        show: true,
        message: message,
        color: 'error',
        timeout: 3000,
      };
    },
    showSuccessAlert(message) {
      this.snackbar = {
        show: true,
        message: message,
        color: 'success',
        timeout: 3000,
      };
    },
    onSnackbarInput(val) {
      if (!val) {
        this.snackbar.message = '';
      }
    },
  },
  async created() {
    await this.fetchAllAgents();
  },
  mounted() {
    console.log(this.absences);
  },
};
</script>

<style scoped>
</style>