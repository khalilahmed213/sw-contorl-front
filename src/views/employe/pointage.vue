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
              :disabled="buttonStatus.afternoonExit"
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
              :disabled="buttonStatus.morningExit"
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
      fetchedDate: "", // To store the fetched date
      fetchedTime: "",
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
      // Fetch the current UTC time from the World Time API
      const response = await axios.get("http://worldtimeapi.org/api/ip");
      const datetime = new Date(response.data.utc_datetime);

      // Format the date and time
      this.formattedDate = new Intl.DateTimeFormat("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(datetime);

      this.formattedTime = moment(datetime).format("HH:mm:ss");
    } catch (error) {
      console.error("Error fetching network time:", error);

      // Fallback to local time if the network time fetch fails
      this.formattedDate = new Intl.DateTimeFormat("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date());

      this.formattedTime = moment().format("HH:mm:ss");
    }
  },
  startNetworkTimeInterval() {
    // Fetch the network time immediately
    this.fetchNetworkTime();

    // Set an interval to fetch the network time every second
    this.networkTimeInterval = setInterval(() => {
      this.fetchNetworkTime();
    },100000000000000);
  },
    async fetchButtonStatus() {
  if (this.presenceId && this.currentButton) {
    const response = await axios.get(
      "http://localhost:3000/api/presence/checkButtonStatus",
      {
        params: { presenceId: this.presenceId, buttonNumber: this.currentButton },
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      }
    );
    console.log('API Response:', response.data);

    if (this.bool) {
      // Non-recurring schedule
      if (this.currentButton === 2) {
        this.buttonStatus.morningExit =response.data.disabled;
      }
    } else {
      // Recurring schedule
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
          "http://localhost:3000/api/presence/conge/today",
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
            params:{
              UserId:this.currentUserId
            }
          }
        );
        this.hasConge = response.data.hasConge || false;
      } catch (error) {
        console.error("Error fetching conge status:", error);
        this.error = "Failed to fetch conge status.";
      }
    },

    async fetchPenaliteToday() {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/presenece/penalite/today",
          {
            params:{
              UserId:this.currentUserId
            },
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }
        );
        this.hasPenalite = response.data.hasPenalite || false;
      } catch (error) {
        console.error("Error fetching penalite status:", error);
        if (!this.error) {
          this.error = "Failed to fetch penalite status.";
        }
      }
    },

    async handleRefreshClick() {
  if (this.presenceId && this.currentButton) {
    const response = await axios.get(
      "http://localhost:3000/api/presence/checkButtonStatus",
      {
        params: { presenceId: this.presenceId, buttonNumber: this.currentButton },
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      }
    );
    console.log('API Response:', response.data);

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
  const fieldMap = { 1: "entree", 2: "sortie", 3: "entree1", 4: "sortie1" };

  // Determine which field to update based on buttonNumber
  const field = fieldMap[buttonNumber];
  const updateFields = {};
  updateFields[field] = true; // Set the field to true

  // Update presence with the determined field
  await this.updatePresence({
    id: this.presenceId,
    userId: this.currentUserId,
    ...updateFields,
  });

  // Fetch latest button status after updating presence
  await this.fetchButtonStatus();

  // Update currentButton based on schedule type and buttonNumber
  if (!this.bool) { // Recurring schedule
    if (buttonNumber < 4) {
      this.currentButton++;
    } else {
      this.isCompleted = true;
    }
  } else { // Non-recurring schedule
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
        "http://localhost:3000/api/schedules/getisramadan",
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
          lastPointageDate: moment().format("YYYY-MM-DD"),
        })
      );
    },

    restoreState() {
  const savedState = JSON.parse(localStorage.getItem("pointageData"));
  const today = moment().format("YYYY-MM-DD");

  if (savedState && savedState.lastPointageDate === today) {
    this.presenceId = savedState.presenceId;
    this.selectedEnvironment = savedState.selectedEnvironment;
    this.environmentSelected = savedState.environmentSelected;
    this.currentButton = savedState.currentButton;
    this.isCompleted = savedState.isCompleted;
    Object.assign(this.buttonStatus, savedState.buttonStatus || {
      morningExit: false,
      afternoonEntry: false,
      afternoonExit: false,
    });
  } else {
    this.resetPointageState();
  }
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
  if (this.networkTimeInterval) {
    clearInterval(this.networkTimeInterval);
  }
},
  async created() {
    this.startNetworkTimeInterval();
    await this.fetchCongeToday();
    await this.fetchPenaliteToday();
    await this.loadbool();
    this.loading = false;
  },
  mounted() {
   
    this.restoreState();
  },
};
</script>