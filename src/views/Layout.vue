<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app mini-variant="mini" permanent>
      
      <v-list dense nav>
        <v-list-item>
          <img src="/Capture.png" alt="Logo" class="logo-img">
          <v-list-item-content>
            <v-list-item-title class="logo-text">swcontrole</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <div v-if="this.$store.getters['auth/userRole']=='admin'">
        <router-link to="/app/home" class="nav-link" active-class="nav-link--active" tag="div">
          <v-list-item prepend-icon="mdi-home-city" title="Home"></v-list-item>
        </router-link>

        <v-list-item @click="toggleGestionConge" class="nav-link">
  <v-list-item-icon>
    <v-icon>mdi-calendar</v-icon>
  </v-list-item-icon>
  <div class="conge">
  <v-list-item-content>
    
    <v-list-item-title>Gestion Congé</v-list-item-title>
  </v-list-item-content>
  <!-- Move the arrow icon outside of the v-list-item-content but keep it inside the v-list-item -->
  <v-list-item-icon >
    <v-icon v-if="gestionCongeOpen">mdi-chevron-right</v-icon>
    <v-icon v-else>mdi-chevron-down</v-icon>
  </v-list-item-icon>
</div>
</v-list-item>

        <v-list-item-group v-if="gestionCongeOpen">
          <router-link to="/app/conge" class="nav-link" active-class="nav-link--active" tag="div">
            <v-list-item prepend-icon="mdi-calendar" title="Congé"></v-list-item>
          </router-link>
          <router-link to="/app/demandeconge" class="nav-link" active-class="nav-link--active" tag="div">
            <v-list-item prepend-icon="mdi-calendar-check" title="Demandes Congés"></v-list-item>
          </router-link>
          <router-link to="/app/presenceparticulier" class="nav-link" active-class="nav-link--active" tag="div">
            <v-list-item prepend-icon="mdi-calendar-check" title="Présence particulier"></v-list-item>
          </router-link>
        </v-list-item-group>

        <router-link to="/app/gestionutilisateur" class="nav-link" active-class="nav-link--active" tag="div">
          <v-list-item prepend-icon="mdi-account-group-outline" title="Gestion utilisateur"></v-list-item>
        </router-link>
        <router-link to="/app/demandeautorisation" class="nav-link" active-class="nav-link--active" tag="div">
          <v-list-item prepend-icon="mdi-calendar-check" title="Demandes Autorisation"></v-list-item>
        </router-link>
        <router-link to="/app/presence" class="nav-link" active-class="nav-link--active" tag="div">
          <v-list-item prepend-icon="mdi-account-group-outline" title="Presence"></v-list-item>
        </router-link>
        <router-link to="/app/penalite" class="nav-link" active-class="nav-link--active" tag="div">
          <v-list-item prepend-icon="mdi-account-group-outline" title="Penalite"></v-list-item>
        </router-link>
        <router-link to="/app/absence" class="nav-link" active-class="nav-link--active" tag="div">
          <v-list-item prepend-icon="mdi-account-group-outline" title="Absence"></v-list-item>
        </router-link>
        <router-link to="/app/retard" class="nav-link" active-class="nav-link--active" tag="div">
          <v-list-item prepend-icon="mdi-account-group-outline" title="Retard"></v-list-item>
        </router-link>
        <router-link to="/app/confighoraire" class="nav-link" active-class="nav-link--active" tag="div">
          <v-list-item prepend-icon="mdi-account-group-outline" title="Horaires"></v-list-item>
        </router-link>
        <router-link to="/app/projets" class="nav-link" active-class="nav-link--active" tag="div">
          <v-list-item prepend-icon="mdi-account-group-outline" title="Projets"></v-list-item>
        </router-link>
      </div>
      <div v-else>
        <router-link to="/employee/presenceparticulier" class="nav-link" active-class="nav-link--active" tag="div">
          <v-list-item prepend-icon="mdi-account-group-outline" title="Congé"></v-list-item>
        </router-link>
       
        <router-link to="/employee/retardp" class="nav-link" active-class="nav-link--active" tag="div">
          <v-list-item prepend-icon="mdi-account-group-outline" title="Retard"></v-list-item>
        </router-link>
        <router-link to="/employee/demandeautorisation" class="nav-link" active-class="nav-link--active" tag="div">
          <v-list-item prepend-icon="mdi-account-group-outline" title="Demande autorisation"></v-list-item>
        </router-link>
        <router-link to="/employee/demandeconge" class="nav-link" active-class="nav-link--active" tag="div">
          <v-list-item prepend-icon="mdi-account-group-outline" title="Demande congé"></v-list-item>
        </router-link>
      </div>
      </v-list>
    
    </v-navigation-drawer>

    <v-app-bar app>
      <v-btn icon @click="toggleDrawer">
        <v-icon>{{ mini ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
      </v-btn>
      <v-toolbar-title>{{ currentRouteName }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-avatar @click="goToProfile" style="cursor: pointer;">
        <img src="https://via.placeholder.com/150" alt="Profile" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
      </v-avatar>
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
      gestionCongeOpen: false // State to track whether gestion congé items are open
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
      this.logout(); // Call the Vuex action to logout
      this.$router.push({ name: 'Login' }); // Redirect to login page after logout
    },
    goToProfile() {
      this.$router.push({ name: 'Profile' });
    },
    toggleDrawer() {
      this.mini = !this.mini;
      if (this.mini) {
        this.drawer = false; // Hide the drawer when mini is true
      } else {
        this.drawer = true; // Show the drawer when mini is false
      }
    },
    toggleGestionConge() {
      this.gestionCongeOpen = !this.gestionCongeOpen;
    }
  }
}
</script>
<style scoped>
.logo-img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 16px;
}

.logo-text {
  font-family: 'Roboto', sans-serif;
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  color: #666;
  text-decoration: none;
}

.nav-link:hover {
  background-color: #99a1aa;
}

.nav-link--active {
  background-color: #007bff;
  color: white;
}

.v-list-item-icon i {
  margin-right: 8px;
}

.v-list-item .v-list-item__content {
  margin-left: 16px;
}

.v-navigation-drawer {
  background-color: #ffffff;
}

.v-toolbar {
  background-color: #ffffff;
}

.v-avatar img {
  border-radius: 50%;
  object-fit: cover;
}
.conge{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>