<template>
  <v-container class="d-flex justify-center align-center" style="height: 80vh;">
    <v-card v-if="!isCompleted" class="pa-10" elevation="10" max-width="500">
      <v-card-title class="text-h4 text-center">
        {{ formattedDate }}<br>
        {{ formattedTime }}
      </v-card-title>

      <!-- Step 1: Environment Selection -->
      <v-card-text v-if="!environmentSelected" class="text-center">
        <v-select
          width="300"
          v-model="selectedEnvironment"
          :items="environments"
          label="Choisissez votre environnement"
          variant="outlined"
          dense class="ma-4"
        ></v-select>

        <!-- Suivant Button -->
        <v-btn
          v-if="selectedEnvironment"
          @click="handleEnvironmentSelection"
          color="primary"
          class="ma-4"
          elevation="10"
          rounded
        >
          Suivant
        </v-btn>
      </v-card-text>

      <!-- Step 2: Buttons to Point -->
      <v-card-text v-else class="text-center">
        <v-btn v-if="currentButton === 1" @click="handleClick(1)" color="primary" class="ma-4" elevation="10" rounded size="x-large" :style="buttonStyle">
          Début Matin
        </v-btn>
        <v-btn v-if="currentButton === 2" @click="handleClick(2)" color="success" class="ma-4" elevation="10" rounded size="x-large" :style="buttonStyle">
          Fin Matin
        </v-btn>
        <v-btn v-if="currentButton === 3" @click="handleClick(3)" color="warning" class="ma-4" elevation="10" rounded size="x-large" :style="buttonStyle">
          Début après Midi
        </v-btn>
        <v-btn v-if="currentButton === 4" @click="handleClick(4)" color="error" class="ma-4" elevation="10" rounded size="x-large" :style="buttonStyle">
          Fin Après Midi
        </v-btn>
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
import { mapActions, mapGetters } from 'vuex';
import moment from 'moment';

export default {
  data() {
    return {
      currentButton: 1,
      buttonStyle: {
        transition: 'transform 0.2s',
      },
      isCompleted: false,
      selectedEnvironment: null,
      environments: ['sur site', 'remote'],
      environmentSelected: false,
      currentTime: moment(),
      presenceId: null, // Save the presence ID for updates
    };
  },
  methods: {
    ...mapActions('schedule', ['checkIfScheduleIsRecurring']),
    ...mapActions(['addPointage', 'updatePresence']), // Include updatePresence action
    async handleEnvironmentSelection() {
      this.environmentSelected = true;
      localStorage.setItem('selectedEnvironment', this.selectedEnvironment);
      localStorage.setItem('environmentSelected', true);
      let date=new Date()
      let env=this.selectedEnvironment;
      const response = await this.addPointage({env,date,status:'en attente',UserId:this.currentUserId});
      this.presenceId = response; // Store the ID from the response
      localStorage.setItem('presenceId', this.presenceId); // Persist ID
    },

    async handleClick(buttonNumber) {
      const currentTime = moment().format('HH:mm:ss'); // Format current time

      if (this.presenceId) {
        // Determine the field to update based on the button clicked
        const fieldMap = {
          1: 'entree',
          2: 'sortie',
          3: 'entree1',
          4: 'sortie1'
        };
        const fieldToUpdate = fieldMap[buttonNumber];

        // Call updatePresence action to update the time for the specific field
        await this.updatePresence({
          id: this.presenceId,
          [fieldToUpdate]: currentTime
        });

      } else {
        alert('Presence ID not found. Please select an environment first.');
      }

      if (this.currentButton < 4) {
        this.currentButton++;
        localStorage.setItem('currentButton', this.currentButton); // Save current button state
      } else {
        this.isCompleted = true;
        localStorage.setItem('pointageCompleted', true);
        localStorage.setItem('completionDate', new Date().toLocaleDateString('fr-FR'));
      }
    },

    updateTime() {
      this.currentTime = moment();
    }
  },
  computed: {
    formattedDate() {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const date = new Date();
      return new Intl.DateTimeFormat('fr-FR', options).format(date);
    },
    ...mapGetters('schedule', ['isRecurring']),
    formattedTime() {
      return this.currentTime.format('HH:mm:ss');
    },
    currentUserId() {
      return this.$store.state.auth.user.id; // Get current user ID
    },
  },
  mounted() {
    setInterval(this.updateTime, 1000);
    const completionDate = localStorage.getItem('completionDate');
    const today = new Date().toLocaleDateString('fr-FR');

    if (localStorage.getItem('pointageCompleted') && completionDate === today) {
      this.isCompleted = true;
    } else {
      localStorage.removeItem('pointageCompleted');
      localStorage.removeItem('completionDate');

      const savedEnvironment = localStorage.getItem('selectedEnvironment');
      if (savedEnvironment) {
        this.selectedEnvironment = savedEnvironment;
        this.environmentSelected = localStorage.getItem('environmentSelected') === 'true';
      }

      const savedButton = localStorage.getItem('currentButton');
      if (savedButton) {
        this.currentButton = parseInt(savedButton);
      }

      // Retrieve presenceId from localStorage if it exists
      const savedPresenceId = localStorage.getItem('presenceId');
      if (savedPresenceId) {
        this.presenceId = savedPresenceId;
      }
    }
  },
  async created() {
    await this.checkIfScheduleIsRecurring(new Date());
  }
};
</script>

<style>
.v-card {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  border-radius: 20px;
}

.v-btn {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
}

.v-btn:hover {
  transform: scale(1.1);
}
</style>