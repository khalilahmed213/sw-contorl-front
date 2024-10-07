<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="mini"
      permanent
      @update:rail="handleRailUpdate"
    >
      <v-list>
        <v-list-item prepend-avatar="/Capture.png" title="swcontrole"></v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <template v-for="item in menuItems" :key="item.title">
          <v-list-group
            v-if="item.subItems"
            :value="item.title"
          >
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                :prepend-icon="item.icon"
                :title="item.title"
              ></v-list-item>
            </template>

            <v-list-item
              v-for="subItem in item.subItems"
              :key="subItem.title"
              :to="subItem.to"
              :prepend-icon="subItem.icon"
              :title="subItem.title"
            ></v-list-item>
          </v-list-group>

          <v-list-item
            v-else
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
          ></v-list-item>
        </template>
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
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'Layout',
  data() {
    return {
      drawer: true,
      mini: false,
    };
  },
  computed: {
    ...mapGetters('auth', ['userRole']),
    currentRouteName() {
      return this.$route.name;
    },
    menuItems() {
      return this.userRole === 'admin'
        ? [
            { title: 'Home', icon: 'mdi-home', to: '/app/home' },
            { 
              title: 'Gestion Congé', 
              icon: 'mdi-calendar',
              subItems: [
                { title: 'Congé', icon: 'mdi-calendar-check', to: '/app/conge' },
                { title: 'Demandes Congés', icon: 'mdi-calendar-clock', to: '/app/demandeconge' },
                { title: 'Présence particulier', icon: 'mdi-calendar-account', to: '/app/presenceparticulier' },
              ]
            },
            { title: 'Gestion utilisateur', icon: 'mdi-account-group', to: '/app/gestionutilisateur' },
            { title: 'Demandes Autorisation', icon: 'mdi-clipboard-check', to: '/app/demandeautorisation' },
            { title: 'Presence', icon: 'mdi-account-check', to: '/app/presence' },
            { title: 'Penalite', icon: 'mdi-gavel', to: '/app/penalite' },
            { title: 'Absence', icon: 'mdi-account-off', to: '/app/absence' },
            { title: 'Retard', icon: 'mdi-clock-alert', to: '/app/retard' },
            { title: 'Horaires', icon: 'mdi-clock', to: '/app/confighoraire' },
            { title: 'Projets', icon: 'mdi-briefcase', to: '/app/projets' },
          ]
        : [
            { title: 'Congé', icon: 'mdi-calendar-account', to: '/employee/presenceparticulier' },
            { title: 'Retard', icon: 'mdi-clock-alert', to: '/employee/retardp' },
            { title: 'Demande autorisation', icon: 'mdi-clipboard-check', to: '/employee/demandeautorisation' },
            { title: 'Demande congé', icon: 'mdi-calendar-clock', to: '/employee/demandeconge' },
          ];
    },
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
    },
  },
};
</script>

<style scoped>
.v-list-group__items .v-list-item {
  padding-left: 16px !important;
}

.v-navigation-drawer--rail .v-list-item__prepend {
  justify-content: center;
}

.v-navigation-drawer--rail .v-list-group__items .v-list-item {
  padding-left: 0 !important;
}

.v-navigation-drawer--rail .v-list-item__content,
.v-navigation-drawer--rail .v-list-group__items .v-list-item__content {
  display: none;
}

.v-navigation-drawer--rail .v-list-group__items .v-list-item__prepend {
  min-width: 0;
  margin-inline-end: 0;
}

.v-navigation-drawer--rail .v-list-group__items .v-list-item {
  justify-content: center;
}
</style>