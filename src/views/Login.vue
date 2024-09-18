<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title>SW Controle</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field v-model="form.email" label="Email" outlined></v-text-field>
              <v-text-field
                v-model="form.password"
                :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :type="showPassword ? 'text' : 'password'"
                label="Password"
                outlined
                @click:append="showPassword = !showPassword"
              ></v-text-field>
              <v-btn color="primary" type="submit" block :loading="loading">Login</v-btn>
            </v-form>
            <v-dialog v-model="dialog" max-width="400px">
              <v-card>
                <v-card-title class="headline">Error</v-card-title>
                <v-card-text>{{ error }}</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" text @click="closeDialog">Close</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <router-link to="/forgot-password">Forgot Password?</router-link>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      loading: false,
      showPassword: false,
      dialog: false
    };
  },
  computed: {
    error() {
      return this.$store.state.auth.error;
    },
    user() {
      return this.$store.state.auth.user;
    }
  },
  watch: {
    error(newError) {
      if (newError) {
        this.dialog = true;
      }
    }
  },
  methods: {
    async login() {
      this.loading = true;
      try {
        await this.$store.dispatch('auth/login', this.form);
        const userRole = this.$store.getters['auth/userRole'];
        if (userRole === 'admin') {
          this.$router.push('/app/home'); 
        } else if (userRole === 'employe') {
          this.$router.push('/employee/home'); 
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        this.loading = false;
      }
    },
    closeDialog() {
      this.dialog = false;
      this.$store.dispatch('auth/clearError'); // Clear the error after the dialog is closed
    }
  }
};
</script>