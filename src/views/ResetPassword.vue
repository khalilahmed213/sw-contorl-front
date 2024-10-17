<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title>Reset Password</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <h4>Please type the new password:</h4>
            <v-form @submit.prevent="submitResetPassword" ref="form">
              <v-text-field
                v-model="password"
                label="New Password"
                type="password"
                outlined
                :rules="passwordRules"
                required
              ></v-text-field>
              <v-btn type="submit" color="primary" block :loading="loading">Submit</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
        <v-dialog v-model="dialog" max-width="400px">
          <v-card>
            <v-card-title class="headline">Error</v-card-title>
            <v-card-text>{{ error }}</v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="dialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  data() {
    return {
      password: '',
      dialog: false,
      passwordRules: [
        v => !!v || 'Password is required',
        v => v.length >= 8 || 'Password must be at least 8 characters',
        v => /[A-Z]/.test(v) || 'Password must contain at least one uppercase letter',
        v => /[a-z]/.test(v) || 'Password must contain at least one lowercase letter',
        v => /[0-9]/.test(v) || 'Password must contain at least one number',
        v => /[\W_]/.test(v) || 'Password must contain at least one special character',
      ],
    };
  },
  computed: {
    ...mapState(['error', 'loading']),
  },
  watch: {
    error(newError) {
      if (newError) {
        this.dialog = true;
      }
    }
  },
  methods: {
    ...mapActions('auth', ['resetPassword']),
    async submitResetPassword() {
      if (this.$refs.form.validate()) {
        const token = this.$route.params.token;
        if (!token) {
          this.$store.commit('SET_ERROR', 'Invalid or missing token');
          return;
        }
        try {
           await this.resetPassword({ token, password: this.password });
          this.$router.push('/reset-password-success');
        } catch (error) {
          console.error('Error:', error);
        }
      }
    },
  },
};
</script>