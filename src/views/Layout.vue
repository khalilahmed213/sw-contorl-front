<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" :rail="mini" permanent @update:rail="handleRailUpdate">
      <v-list>
        <v-list-item prepend-avatar="/Capture.png" title="swcontrole"></v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <div v-if="this.$store.getters['auth/userRole'] === 'admin'">
          <v-list-item to="/app/home" prepend-icon="mdi-home" title="Home"></v-list-item>

          <v-list-group value="gestion-conge">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                prepend-icon="mdi-calendar"
                title="Gestion Congé"
              ></v-list-item>
            </template>

            <v-list-item to="/app/conge" class="submenu-item">
              <template v-slot:prepend>
                <v-icon icon="mdi-calendar-check" size="small"></v-icon>
              </template>
              <v-list-item-title class="text-wrap">Congé</v-list-item-title>
            </v-list-item>
            <v-list-item to="/app/demandeconge" class="submenu-item">
              <template v-slot:prepend>
                <v-icon icon="mdi-calendar-clock" size="small"></v-icon>
              </template>
              <v-list-item-title class="text-wrap">Demandes Congés</v-list-item-title>
            </v-list-item>
            <v-list-item to="/app/presenceparticulier" class="submenu-item">
              <template v-slot:prepend>
                <v-icon icon="mdi-calendar-account" size="small"></v-icon>
              </template>
              <v-list-item-title class="text-wrap">Présence particulier</v-list-item-title>
            </v-list-item>
          </v-list-group>

          <v-list-item to="/app/gestionutilisateur" prepend-icon="mdi-account-group" title="Gestion utilisateur"></v-list-item>
          <v-list-item to="/app/demandeautorisation" prepend-icon="mdi-clipboard-check" title="Demandes Autorisation"></v-list-item>
          <v-list-item to="/app/presence" prepend-icon="mdi-account-check" title="Presence"></v-list-item>
          <v-list-item to="/app/penalite" prepend-icon="mdi-gavel" title="Penalite"></v-list-item>
          <v-list-item to="/app/absence" prepend-icon="mdi-account-off" title="Absence"></v-list-item>
          <v-list-item to="/app/retard" prepend-icon="mdi-clock-alert" title="Retard"></v-list-item>
          <v-list-item to="/app/confighoraire" prepend-icon="mdi-clock" title="Horaires"></v-list-item>
          <v-list-item to="/app/projets" prepend-icon="mdi-briefcase" title="Projets"></v-list-item>
        </div>
        <div v-else>
          <v-list-item to="/employee/presenceparticulier" prepend-icon="mdi-calendar-account" title="Congé"></v-list-item>
          <v-list-item to="/employee/retardp" prepend-icon="mdi-clock-alert" title="Retard"></v-list-item>
          <v-list-item to="/employee/demandeautorisation" prepend-icon="mdi-clipboard-check" title="Demande autorisation"></v-list-item>
          <v-list-item to="/employee/demandeconge" prepend-icon="mdi-calendar-clock" title="Demande congé"></v-list-item>
        </div>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar>
      <v-app-bar-nav-icon @click="toggleMini"></v-app-bar-nav-icon>
      <v-app-bar-title>{{ currentRouteName }}</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="goToProfile">
        <v-avatar color="primary">
          <v-img src="https://via.placeholder.com/150" alt="Profile"></v-img>
        </v-avatar>
      </v-btn>
      <v-btn @click="Logout" prepend-icon="mdi-logout">Logout</v-btn>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'Layout',
  data() {
    return {
      drawer: true,
      mini: false,
    };
  },
  computed: {
    currentRouteName() {
      return this.$route.name;
    }
  },
  methods: {
    ...mapActions('auth', ['logout']),
    Logout() {
      this.logout();
      this.$router.push({ name: 'Login' });
    },
    goToProfile() {
      this.$router.push({ name: 'Profile' });
    },
    toggleMini() {
      this.mini = !this.mini;
    },
    handleRailUpdate(value) {
      if (!value) {
        this.mini = false;
      }
    }
  }
}
</script>

<style scoped>
.v-list-item--active {
  background-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.submenu-item {
  padding-left: 16px;
}

.text-wrap {
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
}

.v-list-group__items .v-list-item {
  min-height: 40px;
}
</style>