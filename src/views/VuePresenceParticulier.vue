<template>
  <div class="select-container">
    <v-select
      v-model="selectedAgent"
      :items="allAgents"
      item-title="name"
      item-value="id"
      label="Filtrer par agent"
      @update:modelValue="fetch"
      class="mr-2"
      style="max-width: 200px"
    ></v-select>
  </div>
  
  <v-overlay :model-value="isLoading" class="align-center justify-center">
    <v-progress-circular
      color="primary"
      indeterminate
      size="64"
    ></v-progress-circular>
  </v-overlay>

  <div v-if="!isLoading && leaveBalances" class="table-container">
    <table class="vertical-table">
      <tbody>
        <tr>
          <th style="background-color: blue; color: aliceblue">Nb Mois effectué</th>
          <td>{{ leaveBalances.monthsDone || 'N/A' }}</td>
        </tr>
        <tr>
          <th style="background-color: blue; color: aliceblue">SOLDE CONGE</th>
          <td>{{ leaveBalances.SOLDECONGE || 'N/A' }}</td>
        </tr>
        <tr>
          <th style="background-color: blue; color: aliceblue">CONGE PRISE</th>
          <td style="background-color: yellow">{{ leaveBalances.CONGEPRISE || 'N/A' }}</td>
        </tr>
        <tr>
          <th style="background-color: blue; color: aliceblue">Sanction</th>
          <td style="background-color: red">{{ leaveBalances.sanction || 'N/A' }}</td>
        </tr>
        <tr>
          <th style="background-color: blue; color: aliceblue">RESTE CONGE</th>
          <td style="background-color: yellowgreen">{{ leaveBalances.RESTCONGE || 'N/A' }}</td>
        </tr>
        <tr>
          <th style="background-color: blue; color: aliceblue">Rest ancien congé</th>
          <td>{{ leaveBalances.RESTANCIENCONGE || 'N/A' }}</td>
        </tr>
      </tbody>
    </table>
    <table class="main-table">
      <thead>
        <tr>
          <th colspan="1" style="background-color: bisque">
            Projet:{{ leaveBalances.projects && leaveBalances.projects[0] ? leaveBalances.projects[0].name : 'N/A' }}
          </th>
          <th colspan="3" style="background-color: bisque">{{ leaveBalances.name || 'N/A' }}</th>
          <th colspan="1" style="background-color: bisque">
            Aujourd'hui: {{ currentDate }}
          </th>
        </tr>
        <tr style="background-color: blue; color: aliceblue">
          <th style="background-color: blue; color: aliceblue">
            Date début congé
          </th>
          <th style="background-color: blue; color: aliceblue">
            Date Fin Congé
          </th>
          <th style="background-color: blue; color: aliceblue">Nb des jours</th>
          <th style="background-color: blue; color: aliceblue" colspan="3">
            Raison
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(data, index) in leaveBalances.conges" :key="index">
          <td>{{ formatDate(data.startDate) }}</td>
          <td>{{ formatDate(data.endDate) }}</td>
          <td>{{ data.nbrDeJour }}</td>
          <td colspan="3">{{ data.raison }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else-if="!isLoading && !leaveBalances">
    No leave balance data available.
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import moment from 'moment';

export default {
  data() {
    return {
      selectedAgent: null,
      currentDate: moment().format('DD/MM/YYYY')
    };
  },
  computed: {
    ...mapGetters("agent", ["allAgents"]),
    ...mapGetters("CalculeConge", ["leaveBalances", "loading"]),
    isLoading() {
      return this.loading;
    }
  },
  methods: {
    ...mapActions({
      fetchAllAgents: "agent/fetchAllAgents",
    }),
    ...mapActions("CalculeConge", ["fetchCongeDataUser"]),
    async fetch() {
      if (this.selectedAgent) {
        await this.fetchCongeDataUser({ userId: this.selectedAgent });
      }
    },
    formatDate(dateString) {
      return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
    },
  },
  async created() {
    await this.fetchAllAgents();
    this.selectedAgent = parseInt(this.$route.params.id);
    if (this.selectedAgent) {
      await this.fetchCongeDataUser({userId: this.selectedAgent});
    }
  },
};
</script>

<style scoped>
.table-container {
  display: flex;
  align-items: flex-start;
}

.vertical-table {
  border-collapse: collapse;
  margin-right: 20px;
}

.vertical-table th,
.vertical-table td {
  border: 1px solid black;
  padding: 8px;
  text-align: left;
}

.vertical-table th {
  background-color: #f2f2f2;
}

.main-table {
  border-collapse: collapse;
  width: 100%;
}

.main-table th,
.main-table td {
  border: 1px solid black;
  padding: 8px;
  text-align: left;
}

.main-table th {
  background-color: #f2f2f2;
}

.select-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}
</style>
