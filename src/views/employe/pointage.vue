<template>
  <v-container class="d-flex justify-center align-center" style="height: 80vh;">
    <!-- Card for Pointage -->
    <v-card v-if="!isCompleted" class="pa-10" elevation="10" max-width="500">
      <!-- Date & Time -->
      <v-card-title class="text-h4 text-center">
        {{ formattedDate }}<br />
        {{ formattedTime }}
        {{ bool }}
      </v-card-title>

      <!-- Loading, Errors, or Messages -->
      <v-card-text v-if="loading" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-card-text>
      <v-card-text v-else-if="error" class="text-center">
        <p>{{ error }}</p>
      </v-card-text>
      <v-card-text v-else-if="hasConge" class="text-center">
        <p>Vous ne pouvez pas pointer aujourd'hui, vous avez un congé.</p>
      </v-card-text>
      <v-card-text v-else-if="hasPenalite" class="text-center">
        <p>Vous ne pouvez pas pointer aujourd'hui, vous avez une pénalité.</p>
      </v-card-text>

      <!-- Main Content -->
      <v-card-text v-else class="text-center">
        <!-- Refresh Button -->
        <div v-if="environmentSelected">
          <v-btn @click="handleRefreshClick" icon color="primary" class="ml-4">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </div>

        <!-- Environment Selection -->
        <v-select
          v-if="!environmentSelected"
          v-model="selectedEnvironment"
          :items="environments"
          label="Choisissez votre environnement"
          variant="outlined"
          dense
          class="ma-4"
        ></v-select>
        <v-btn
          v-if="selectedEnvironment && !environmentSelected"
          @click="handleEnvironmentSelection"
          color="primary"
          class="ma-4"
          elevation="10"
          rounded
        >
          Suivant
        </v-btn>

        <!-- Pointage Buttons -->
        <v-btn
          v-if="currentButton === 1 && environmentSelected"
          @click="handleClick(1)"
          color="primary"
          class="ma-4"
          elevation="10"
          rounded
          size="x-large"
        >
          Début Matin
        </v-btn>
        <v-btn
          v-if="currentButton === 2"
          @click="handleClick(2)"
          color="success"
          class="ma-4"
          elevation="10"
          rounded
          size="x-large"
          :disabled="buttonStatus.morningExit"
        >
          Fin Matin
        </v-btn>
        <v-btn
          v-if="currentButton === 3"
          @click="handleClick(3)"
          color="warning"
          class="ma-4"
          elevation="10"
          rounded
          size="x-large"
          :disabled="buttonStatus.afternoonEntry"
        >
          Début Après Midi
        </v-btn>
        <v-btn
          v-if="currentButton === 4"
          @click="handleClick(4)"
          color="error"
          class="ma-4"
          elevation="10"
          rounded
          size="x-large"
          :disabled="buttonStatus.afternoonExit"
        >
          Fin Après Midi
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Completed State -->
    <v-card v-else class="pa-10" elevation="10" max-width="500">
      <v-card-title class="text-h4 text-center">
        Fin de pointage
      </v-card-title>
    </v-card>
  </v-container>
</template>

<script>
import moment from "moment";
import { mapActions,mapGetters} from "vuex";
import axios from "axios";

export default {
  data() {
    return {
      hasConge: false,
      hasPenalite: false,
      loading: true,
      error: null,
      currentButton: 1,
      isCompleted: false,
      selectedEnvironment: null,
      environments: ["sur site", "remote"],
      environmentSelected: false,
      presenceId: null,
      buttonStatus: {
        morningExit: true,
        afternoonEntry: true,
        afternoonExit: true,
      },
      bool:null
    };
  },
  computed: {
    formattedDate() {
      return new Intl.DateTimeFormat("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date());
    },
    formattedTime() {
      return moment().format("HH:mm:ss");
    },
    currentUserId() {
      return this.$store.state.auth.user.id;
    },
    ...mapGetters('schedule',["isRecurring"]),
  },
  methods: {
    ...mapActions(["addPointage", "updatePresence"]),

    async fetchCongeToday() {
      try {
        const response = await axios.get("/api/presence/conge/today");
        this.hasConge = response.data.hasConge || false;
      } catch (error) {
        console.error("Error fetching conge status:", error);
      }
    },
async handleRefreshClick(){
  const response = await axios.get('http://localhost:3000/api/presence/checkButtonStatus', {
          params: { presenceId: this.presenceId, buttonNumber: this.currentButton },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        if (this.currentButton == 2) {
          this.buttonStatus.morningExit = response.data.disabled;
        }
        if (this.currentButton == 3) {
          this.buttonStatus.afternoonEntry = response.data.disabled;
        }
        if (this.currentButton == 4) {
          this.buttonStatus.afternoonExit = response.data.disabled;
        }
},
    async handleEnvironmentSelection() {
      this.environmentSelected = true;
      const response = await this.addPointage({
        env: this.selectedEnvironment,
        date: new Date(),
        status: "en attente",
        UserId: this.currentUserId,
      });
      this.presenceId = response;
      this.saveState();
    },

    async handleClick(buttonNumber) {
      const time = moment().format("HH:mm:ss");
      const fieldMap = { 1: "entree", 2: "sortie", 3: "entree1", 4: "sortie1" };
      await this.updatePresence({
        id: this.presenceId,
        [fieldMap[buttonNumber]]: time,
      });
      if (buttonNumber < 4) {
        this.currentButton++;
      } else {
        this.isCompleted = true;
        localStorage.setItem("pointageCompleted", "true");
      }
      this.saveState();
    },
async loadbool(){
  const response = await axios.get(`http://localhost:3000/api/schedules/getisramadan`, {
        params: { date:new Date() },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      this.bool=response.data.isRamadan
},
    saveState() {
      localStorage.setItem(
        "pointageData",
        JSON.stringify({
          presenceId: this.presenceId,
          selectedEnvironment: this.selectedEnvironment,
          environmentSelected: this.environmentSelected,
          currentButton: this.currentButton,
          isCompleted: this.isCompleted,
          lastPointageDate: moment().format("YYYY-MM-DD"), // Save current date
        })
      );
    },

    restoreState() {
      const savedState = JSON.parse(localStorage.getItem("pointageData"));
      const today = moment().format("YYYY-MM-DD");

      if (savedState && savedState.lastPointageDate === today) {
        // Restore state if the last saved date matches today's date
        this.presenceId = savedState.presenceId;
        this.selectedEnvironment = savedState.selectedEnvironment;
        this.environmentSelected = savedState.environmentSelected;
        this.currentButton = savedState.currentButton;
        this.isCompleted = savedState.isCompleted;
      } else {
        // Reset state for a new day
        this.resetPointageState();
      }
    },

    resetPointageState() {
      this.presenceId = null;
      this.selectedEnvironment = null;
      this.environmentSelected = false;
      this.currentButton = 1;
      this.isCompleted = false;

      localStorage.removeItem("pointageData");
    },
    async fetchCongeToday() {
      try {
        const response = await axios.get('http://localhost:3000/api/presence/conge/today', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        this.hasConge = response.data.hasConge || false;
      } catch (error) {
        console.error('Error fetching conge status:', error);
        this.error = 'Failed to fetch conge status.';
      }
    },
    async fetchPenaliteToday() {
      try {
        const response = await axios.get('http://localhost:3000/api/presenece/penalite/today', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        this.hasPenalite = response.data.hasPenalite || false;
      } catch (error) {
        console.error('Error fetching penalite status:', error);
        if (!this.error) {
          this.error = 'Failed to fetch penalite status.';
        }
      }
    },
  },
  async created() {
    await this.fetchCongeToday();
    await this.fetchPenaliteToday()
    await this.loadbool()
    this.loading = false;
  },
  mounted() {
    this.restoreState();
  },
};
</script>
