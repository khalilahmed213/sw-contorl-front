<template>
  <v-container class="d-flex justify-center align-center" style="height: 80vh;">
    <v-card v-if="!isCompleted" class="pa-10" elevation="10" max-width="500">
       <div mr-10 v-if="environmentSelected==true&&isCompleted==false">
        <v-btn
          @click="handleRefreshClick"
          icon
          color="primary"
          class="ml-4"
        >
        
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
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
        <v-btn v-if="currentButton === 1" @click="handleClick(1)" color="primary" class="ma-4" elevation="10" rounded size="x-large" :style="buttonStyle" :disabled="!buttonStatus.morningEntry">
          Début Matin
        </v-btn>
        <v-btn v-if="currentButton === 2" @click="handleClick(2)" color="success" class="ma-4" elevation="10" rounded size="x-large" :style="buttonStyle" :disabled="!buttonStatus.morningExit">
          Fin Matin
        </v-btn>
        <v-btn v-if="currentButton === 3" @click="handleClick(3)" color="warning" class="ma-4" elevation="10" rounded size="x-large" :style="buttonStyle" :disabled="!buttonStatus.breakEntry">
          Début après Midi
        </v-btn>
        <v-btn v-if="currentButton === 4" @click="handleClick(4)" color="error" class="ma-4" elevation="10" rounded size="x-large" :style="buttonStyle" :disabled="!buttonStatus.afternoonExit">
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
import axios from 'axios';

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
      presenceId: null,
      buttonStatus: {
        morningEntry: true,
        morningExit: true,
        breakEntry:true,
        afternoonEntry: true,
        afternoonExit: true,
      },
    };
  },
  methods: {
    ...mapActions('schedule', ['checkIfScheduleIsRecurring']),
    ...mapActions(['addPointage', 'updatePresence']),
    async handleEnvironmentSelection() {
      this.environmentSelected = true;
      const today = new Date().toLocaleDateString('fr-FR');
      const response = await this.addPointage({
        env: this.selectedEnvironment,
        date: new Date(),
        status: 'en attente',
        UserId: this.currentUserId,
      });
      this.presenceId = response;
      localStorage.setItem('pointageData', JSON.stringify({
        presenceId: this.presenceId,
        selectedEnvironment: this.selectedEnvironment,
        environmentSelected: true,
        currentButton: this.currentButton,
        pointageDate: today,
      }));
    },
   async handleRefreshClick(){
    await this.checkButtonStatus()
     

    },
    async handleClick(buttonNumber) {
      const currentTime = moment().format('HH:mm:ss');
      const fieldMap = { 1: 'entree', 2: 'sortie', 3: 'entree1', 4: 'sortie1' };
      const fieldToUpdate = fieldMap[buttonNumber];

      await this.updatePresence({ id:this.presenceId, [fieldToUpdate]: currentTime });

      if (this.currentButton < 4) {
        this.currentButton++;
        this.updateLocalStorage();
      } else {
        this.isCompleted = true;
        localStorage.setItem('pointageCompleted', true);
        localStorage.removeItem('pointageData');
      }
    },
    updateLocalStorage() {
      const pointageData = JSON.parse(localStorage.getItem('pointageData'));
      pointageData.currentButton = this.currentButton;
      localStorage.setItem('pointageData', JSON.stringify(pointageData));
    },
    restorePointageState() {
      const pointageData = JSON.parse(localStorage.getItem('pointageData'));
      this.presenceId = pointageData.presenceId;
      this.selectedEnvironment = pointageData.selectedEnvironment;
      this.environmentSelected = pointageData.environmentSelected;
      this.currentButton = pointageData.currentButton;
    },
    updateTime() {
      this.currentTime = moment();
    },
    async checkButtonStatus() {
      try {
        const response = await axios.get(`http://localhost:3000/api/presence/checkButtonStatus/${this.presenceId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        this.buttonStatus = response.data;
      } catch (error) {
        console.error('Error checking button status:', error);
      }
    },
  },
  computed: {
    formattedDate() {
      return new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());
    },
    formattedTime() {
      return this.currentTime.format('HH:mm:ss');
    },
    currentUserId() {
      return this.$store.state.auth.user.id;
    },
  },
  mounted() {
    setInterval(this.updateTime, 1000);
    const pointageData = localStorage.getItem('pointageData');
    if (pointageData) {
      const parsedData = JSON.parse(pointageData);
      const today = new Date().toLocaleDateString('fr-FR');
      if (parsedData.pointageDate === today) {
        this.restorePointageState();
      } else {
        localStorage.removeItem('pointageData');
      }
    }
    if (localStorage.getItem('pointageCompleted')) {
      this.isCompleted = true;
    }
  },
  async created() {
    await this.checkIfScheduleIsRecurring(new Date());
  },
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
