<template>
  <v-container>
    <v-card>
      <v-card-title>
        <div class="d-flex justify-space-between align-center w-100">
        <v-select
          v-model="selectedAgent"
          :items="allAgents"
          item-title="name"
          item-value="id"
          label="Filtrer par agent"
          clearable
          @update:modelValue="fetch"
          class="mr-4"
          style="max-width: 200px;"
        ></v-select>
        <v-btn color="success" @click="exportToExcel">
            <v-icon left>mdi-file-excel</v-icon>
            Exporter Excel
          </v-btn>
      </div>
      </v-card-title>
  
      <v-data-table-server
        :headers="headers"
        :items="conges"
        :options.sync="options"
        :items-length="totalItems"
        :loading="loading"
        class="elevation-1"
        @update:options="fetch"
      >
      <template v-slot:item.actions="{ item }">
        <v-icon
          color="green"
          @click="toggleStatus(item, 'accepté')"
          :disabled="item.status !== 'en attente'"
        >
          mdi-check
        </v-icon>
        <v-icon
          color="red"
          @click="toggleStatus(item, 'rejeté')"
          :disabled="item.status !== 'en attente'"
        >
          mdi-close
        </v-icon>
      </template>
      <template v-slot:item.startDate="{ item }">
        {{ formatDate(item.startDate) }}
      </template>
      <template v-slot:item.endDate="{ item }">
        {{ formatDate(item.endDate) }}
      </template>
      <template v-slot:item.status="{ item }">
        <v-chip :color="getStatusColor(item.status)" dark>{{ item.status }}</v-chip>
      </template>
      </v-data-table-server>
    </v-card>
  </v-container>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import * as XLSX from 'xlsx'; 

export default {
  data() {
    return {
      headers: [
        { title: "Référence", key: "reference", sortable: true },
        { title: "Agent", key: "User.name", sortable: true },
        { title: "Date Début", key: "startDate", sortable: true },
        { title: "Date Fin", key: "endDate", sortable: true },
        { title: "Nbr de Jour", key: "nbrDeJour", sortable: true },
        { title: "Status", key: "status", sortable: true },
        { title: "Action", key: "actions", sortable: false },
      ],
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: '',
        sortDesc:'',
      },
      selectedAgent: null,
    };
  },
  
  computed: {
    ...mapState('conge', ['conges', 'totalItems', 'loading']),
    ...mapGetters("agent", ["allAgents"]),
  },
  
  methods: {
    ...mapActions('conge', ['fetchConges', 'toggleCongeStatus']),
    ...mapActions({
      fetchAllAgents: "agent/fetchAllAgents"
    }),
    getStatusColor(status) {
      switch (status) {
        case "accepté": return "green"; // Green for accepted
        case "rejeté": return "red"; // Red for rejected
        case "en attente": return "orange"; // Orange for pending
        default: return "grey"; // Default color
      }
    },
    
    async toggleStatus(item, newStatus) {
      await this.toggleCongeStatus({ id: item.id, newStatus });
      await this.fetch(this.options)
    },
    
    async fetch(newOptions) {
      if (newOptions) {
        this.options.itemsPerPage = newOptions.itemsPerPage;
        this.options.page=newOptions.page
        this.options.sortBy=newOptions.sortBy
      }
      const { page, itemsPerPage, sortBy } = this.options;
      const sortKey = sortBy && sortBy.length > 0 ? sortBy[0].key : 'reference';
      const sortOrder = sortBy && sortBy.length > 0 ? sortBy[0].order : 'asc';
      console.log( sortKey)
      await this.fetchConges({
        page,
        limit: itemsPerPage,
        sortBy: sortKey,
        sortOrder,
        UserId: this.selectedAgent,
      });
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR');
    },
    
    async exportToExcel() { // New method for exporting to Excel
      const worksheet = XLSX.utils.json_to_sheet(this.conges.map(({ id, ...rest }) => rest)); // Exclude id
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Congés');
      XLSX.writeFile(workbook, 'conges.xlsx');
    },
  },
  async mounted(){
  },
  async created() {
    await this.fetchAllAgents();
  },
};
</script>
