<template>
  <v-container>
    <v-card>
      <v-card-title>
        Demandes Congés <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search by Agent"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="filteredDemandes"
        :search="search"
        class="elevation-1"
        :sort-by="sortBy"
        :sort-desc="sortDesc"
      >
        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" dark>
            {{ item.status }}
          </v-chip>
        </template>
        <template v-slot:item.action="{ item }">
          <v-icon
            small
            color="green"
            @click="acceptDemande(item)"
            :disabled="item.status === 'accepted'"
          >
            mdi-check
          </v-icon>
          <v-icon
            small
            color="red"
            @click="declineDemande(item)"
            :disabled="item.status === 'declined'"
          >
            mdi-close
          </v-icon>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
<script>
export default {
  data() {
    return {
      search: "",
      headers: [
        { title: "Référence", key: "reference", sortable: true },
        { title: "Agent", key: "agent", sortable: true },
        { title: "Date Début", key: "dateDebut", sortable: true },
        { title: "Date Fin", key: "dateFin", sortable: true },
        { title: "Nbr de Jour", key: "nbrJour", sortable: true },
        { title: "Solde Congé", key: "soldeConge", sortable: true },
        { title: "Status", key: "status", sortable: true },
        { title: "Action", key: "action", sortable: false },
      ],
      demandes: [
        {
          reference: "REF001",
          agent: "John Doe",
          dateDebut: "2023-06-01",
          dateFin: "2023-06-10",
          nbrJour: 10,
          soldeConge: 20,
          status: "pending",
        },
        {
          reference: "REF002",
          agent: "Jane Smith",
          dateDebut: "2023-07-05",
          dateFin: "2023-07-15",
          nbrJour: 11,
          soldeConge: 15,
          status: "accepted",
        },
        {
          reference: "REF003",
          agent: "Alice Johnson",
          dateDebut: "2023-08-10",
          dateFin: "2023-08-20",
          nbrJour: 11,
          soldeConge: 12,
          status: "declined",
        },
      ],
      sortBy: [{ key: "agent", order: "desc" }],
      sortDesc: true,
    };
  },
  computed: {
    filteredDemandes() {
      if (this.search) {
        return this.demandes.filter((demande) =>
          demande.agent.toLowerCase().includes(this.search.toLowerCase())
        );
      }
      return this.demandes;
    },
  },
  methods: {
    getStatusColor(status) {
      switch (status) {
        case "accepted":
          return "green";
        case "declined":
          return "red";
        case "pending":
          return "orange";
        default:
          return "grey";
      }
    },
    acceptDemande(item) {
      item.status = "accepted";
    },
    declineDemande(item) {
      item.status = "declined";
    },
  },
};
</script>
<style scoped>
.v-chip.green {
  background-color: green !important;
}
.v-chip.red {
  background-color: red !important;
}
.v-chip.orange {
  background-color: orange !important;
}
</style>
