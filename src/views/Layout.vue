<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" :rail="mini" permanent>
      <v-list>
        <v-list-item prepend-avatar="/Capture.png" title="swcontrole"></v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <div v-if="this.$store.getters['auth/userRole'] === 'admin'">
          <v-list-item to="/app/home" prepend-icon="mdi-home-city" title="Home"></v-list-item>

          <v-list-group value="Gestion Congé">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                prepend-icon="mdi-calendar"
                title="Gestion Congé"
              ></v-list-item>
            </template>
            <v-list-item to="/app/conge" title="Congé"></v-list-item>
            <v-list-item to="/app/demandeconge" title="Demandes Congés"></v-list-item>
            <v-list-item to="/app/presenceparticulier" title="Présence particulier"></v-list-item>
          </v-list-group>

          <v-list-item to="/app/gestionutilisateur" prepend-icon="mdi-account-group-outline" title="Gestion utilisateur"></v-list-item>
          <v-list-item to="/app/demandeautorisation" prepend-icon="mdi-calendar-check" title="Demandes Autorisation"></v-list-item>
          <v-list-item to="/app/presence" prepend-icon="mdi-account-group-outline" title="Presence"></v-list-item>
          <v-list-item to="/app/penalite" prepend-icon="mdi-account-group-outline" title="Penalite"></v-list-item>
          <v-list-item to="/app/absence" prepend-icon="mdi-account-group-outline" title="Absence"></v-list-item>
          <v-list-item to="/app/retard" prepend-icon="mdi-account-group-outline" title="Retard"></v-list-item>
          <v-list-item to="/app/confighoraire" prepend-icon="mdi-account-group-outline" title="Horaires"></v-list-item>
          <v-list-item to="/app/projets" prepend-icon="mdi-account-group-outline" title="Projets"></v-list-item>
        </div>
        <div v-else>
          <v-list-item to="/employee/presenceparticulier" prepend-icon="mdi-account-group-outline" title="Congé"></v-list-item>
          <v-list-item to="/employee/retardp" prepend-icon="mdi-account-group-outline" title="Retard"></v-list-item>
          <v-list-item to="/employee/demandeautorisation" prepend-icon="mdi-account-group-outline" title="Demande autorisation"></v-list-item>
          <v-list-item to="/employee/demandeconge" prepend-icon="mdi-account-group-outline" title="Demande congé"></v-list-item>
        </div>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar>
      <v-app-bar-nav-icon @click="mini = !mini"></v-app-bar-nav-icon>
      <v-app-bar-title>{{ currentRouteName }}</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="goToProfile">
        <v-avatar color="primary">
          <v-img src="https://via.placeholder.com/150" alt="Profile"></v-img>
        </v-avatar>
      </v-btn>
      <v-btn @click="Logout">Logout</v-btn>
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
  }
}
</script>

<style scoped>
.v-list-item--active {
  background-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}
</style>