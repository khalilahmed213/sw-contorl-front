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

        <!-- Non-Recurring Schedule (bool === false) -->
        <template v-if="!bool && environmentSelected">
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
          >
            Fin Journée
          </v-btn>
        </template>

        <!-- Recurring Schedule (bool === true) -->
        <template v-else-if="bool && environmentSelected">
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
          >
            Fin Après Midi
          </v-btn>
        </template>
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
import { mapActions, mapGetters } from "vuex";
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
      bool: null, // Schedule type: true (recurring), false (non-recurring)
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
    ...mapGetters("schedule", ["isRecurring"]),
  },
  methods: {
    ...mapActions(["addPointage", "updatePresence"]),

    async loadScheduleType() {
      try {
        const response = await axios.get("http://localhost:3000/api/schedules/getisramadan", {
          params: { date: new Date() },
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });
        this.bool = response.data.isRamadan; // Schedule type
      } catch (error) {
        console.error("Error fetching schedule type:", error);
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

      if (this.bool) {
        // Recurring schedule logic
        if (buttonNumber < 4) {
          this.currentButton++;
        } else {
          this.isCompleted = true;
        }
      } else {
        // Non-recurring schedule logic
        if (buttonNumber < 2) {
          this.currentButton++;
        } else {
          this.isCompleted = true;
        }
      }
      this.saveState();
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
      localStorage.removeItem("pointageData");
    },
  },
  async created() {
    await this.loadScheduleType();
    this.loading = false;
  },
  mounted() {
    this.restoreState();
  },
};
</script>
