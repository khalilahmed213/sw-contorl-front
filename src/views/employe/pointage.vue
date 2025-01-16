<template>
  <v-container class="d-flex justify-center align-center" style="height: 80vh;">
    <!-- Card for Pointage -->
    <v-card v-if="!isCompleted" class="pa-10" elevation="10" max-width="500">
      <!-- Date & Time -->
      <v-card-title class="text-h4 text-center">
        {{ formattedDate }}<br />
        {{ formattedTime }}
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
        <div v-if="environmentSelected">
          <!-- Recurring Schedule (bool === true) -->
          <div v-if="!bool">
            <div class="mr-10" v-if="environmentSelected && !isCompleted && currentButton!=1">
              <v-btn
                @click="handleRefreshClick"
                icon
                color="primary"
                class="ml-4"
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </div>
            <v-btn
              v-if="currentButton === 1"
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
              :disabled="buttonDisabled.morningExit"
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
              :disabled="buttonDisabled.afternoonEntry"
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
              :disabled="buttonDisabled.afternoonExit"
            >
              Fin Après Midi
            </v-btn>
          </div>
          <!-- Non-Recurring Schedule (bool === false) -->
          <div v-else>
            <div class="mr-10" v-if="environmentSelected && !isCompleted">
              <v-btn
                @click="handleRefreshClick"
                icon
                color="primary"
                class="ml-4"
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </div>
            <v-btn
              v-if="currentButton === 1"
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
              color="error"
              class="ma-4"
              elevation="10"
              rounded
              size="x-large"
              :disabled="buttonDisabled.morningExit"
            >
              Fin Journée
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <v-card v-else class="pa-10" elevation="10" max-width="500">
      <v-card-title class="text-h4 text-center">
        Fin de pointage
      </v-card-title>
    </v-card>
  </v-container>
</template>

<script>
import moment from "moment";
import { mapActions, mapGetters } from "vuex";
import axios from "axios";
export default {
  data() {
    return {
      formattedDate: "",
      formattedTime: "",
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
        morningExit: false,
        afternoonEntry: false,
        afternoonExit: false,
      },
      apiurl:process.env.VUE_APP_API_URL,
      bool: null,
    };
  },
  computed: {
    buttonDisabled() {
      return {
        morningExit: this.buttonStatus.morningExit,
        afternoonEntry: this.buttonStatus.afternoonEntry,
        afternoonExit: this.buttonStatus.afternoonExit,
      };
    },
    currentUserId() {
      return this.$store.state.auth.user.id;
    },
    ...mapGetters("schedule", ["isRecurring"]),
  },
  methods: {
    ...mapActions(["addPointage", "updatePresence"]),
    async fetchNetworkTime() {
      try {
        const response = await axios.get("http://worldtimeapi.org/api/ip");
        const datetime = new Date(response.data.utc_datetime);
        this.formattedDate = moment(datetime).format("YYYY-MM-DD");
        this.formattedTime = moment(datetime).format("HH:mm");
      } catch (error) {
        this.formattedDate = moment().format("YYYY-MM-DD");
        this.formattedTime = moment().format("HH:mm:ss");
      }
    },
    startNetworkTimeInterval() {
      this.fetchNetworkTime();
      setInterval(() => {
        this.fetchNetworkTime();
      }, 60000);
    },
    async fetchButtonStatus() {
      if (this.presenceId && this.currentButton) {
        const response = await axios.get(
          `${this.apiurl}api/presence/checkButtonStatus`,
          {
            params: { presenceId: this.presenceId, buttonNumber: this.currentButton },
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }
        );
        if (this.bool) {
          if (this.currentButton === 2) {
            this.buttonStatus.morningExit = response.data.disabled;
          }
        } else {
          switch (this.currentButton) {
            case 2:
              this.buttonStatus.morningExit = response.data.disabled;
              break;
            case 3:
              this.buttonStatus.afternoonEntry = response.data.disabled;
              break;
            case 4:
              this.buttonStatus.afternoonExit = response.data.disabled;
              break;
            default:
              break;
          }
        }
      }
    },
    async fetchCongeToday() {
      try {
        const response = await axios.get(
          `${this.apiurl}api/presence/conge/today`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            params: { UserId: this.currentUserId },
          }
        );
        this.hasConge = response.data.hasConge || false;
      } catch (error) {
        this.error = "Failed to fetch conge status.";
      }
    },
    async fetchPenaliteToday() {
      try {
        const response = await axios.get(
          `${this.apiurl}api/presence/penalite/today`,
          {
            params: { UserId: this.currentUserId },
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }
        );
        this.hasPenalite = response.data.hasPenalite || false;
      } catch (error) {
        if (!this.error) {
          this.error = "Failed to fetch penalite status.";
        }
      }
    },
    async handleRefreshClick() {
      if (this.presenceId && this.currentButton) {
        const response = await axios.get(
          `${this.apiurl}api/presence/checkButtonStatus`,
          {
            params: { presenceId: this.presenceId, buttonNumber: this.currentButton },
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }
        );
        if (this.bool) {
          if (this.currentButton === 2) {
            this.buttonStatus.morningExit = response.data.disabled;
          }
        } else {
          switch (this.currentButton) {
            case 2:
              this.buttonStatus.morningExit = response.data.disabled;
              break;
            case 3:
              this.buttonStatus.afternoonEntry = response.data.disabled;
              break;
            case 4:
              this.buttonStatus.afternoonExit = response.data.disabled;
              break;
            default:
              break;
          }
        }
      }
    },
    async fetchCurrentPresenceStatus() {
      try {
        const response = await axios.get(
          `${this.apiurl}api/presence/current-status`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }
        );
        const { presenceId, environmentSelected, currentButton, isCompleted, buttonStatus, scheduleType } = response.data;
        this.presenceId = presenceId;
        this.environmentSelected = environmentSelected;
        this.currentButton = currentButton;
        this.isCompleted = isCompleted;
        this.buttonStatus = buttonStatus;
        this.bool = !scheduleType; // Assuming bool is set based on scheduleType
        await this.fetchButtonStatus();
        this.saveState();
      } catch (error) {
        console.error('Error fetching current presence status:', error);
        this.error = 'Failed to fetch presence status.';
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
     await this.fetchCurrentPresenceStatus();
      await this.saveState();

    },
    async handleClick(buttonNumber) {
      const fieldMap = { 1: "entree", 2: "sortie", 3: "entree1", 4: "sortie1" };
      const field = fieldMap[buttonNumber];
      const updateFields = {};
      updateFields[field] = true;
      await this.updatePresence({
        id: this.presenceId,
        userId: this.currentUserId,
        ...updateFields,
      });
      await this.fetchButtonStatus();
      if (!this.bool) {
        if (buttonNumber < 4) {
          this.currentButton++;
        } else {
          this.isCompleted = true;
        }
      } else {
        if (buttonNumber === 1) {
          this.currentButton = 2;
        } else if (buttonNumber === 2) {
          this.isCompleted = true;
        }
      }
      this.saveState();
    },
    async loadbool() {
      const response = await axios.get(
        `${this.apiurl}api/schedules/getisramadan`,
        {
          params: { date: new Date() },
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        }
      );
      this.bool = response.data.isRamadan;
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
          buttonStatus: this.buttonStatus,
          lastPointageDate: this.formattedDate,
        })
      );
    },
    restoreStateFromLocalStorage() {
      const savedData = localStorage.getItem("pointageData");
      if (savedData) {
        const data = JSON.parse(savedData);
        if (data.lastPointageDate === this.formattedDate) {
          this.presenceId = data.presenceId;
          this.selectedEnvironment = data.selectedEnvironment;
          this.environmentSelected = data.environmentSelected;
          this.currentButton = data.currentButton;
          this.isCompleted = data.isCompleted;
          this.buttonStatus = data.buttonStatus;
          return true;
        }
      }
      return false;
    },
    resetPointageState() {
      this.presenceId = null;
      this.selectedEnvironment = null;
      this.environmentSelected = false;
      this.currentButton = 1;
      this.isCompleted = false;
      this.buttonStatus = {
        morningExit: false,
        afternoonEntry: false,
        afternoonExit: false,
      };
      localStorage.removeItem("pointageData");
    },
  },
  watch: {
    presenceId: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.fetchButtonStatus();
        }
      },
    },
    currentButton: {
      handler(newValue) {
        if (this.presenceId && newValue) {
          this.fetchButtonStatus();
        }
      },
    },
  },
  beforeDestroy() {
    clearInterval(this.networkTimeInterval);
  },
 async created() {
    this.startNetworkTimeInterval();
    this.fetchCongeToday();
    this.fetchPenaliteToday();
    this.loadbool();
    if (!this.restoreStateFromLocalStorage()) {
      this.fetchCurrentPresenceStatus();
    }
    this.loading = false;
  },
};
</script>