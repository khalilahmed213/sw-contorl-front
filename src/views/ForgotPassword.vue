<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title>Forgot Password</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <h4>Please type your email:</h4>
            <v-form @submit.prevent="submitForgotPassword" ref="form">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                outlined
                :rules="emailRules"
                required
              ></v-text-field>
              <v-btn type="submit" color="primary" block>Submit</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      email: '',
      emailRules: [
        v => !!v || 'Email is required',
        v => /.+@.+\..+/.test(v) || 'Email must be valid',
      ],
    };
  },
  methods: {
    ...mapActions('auth', ['forgotPassword']),
    async submitForgotPassword() {
      if (this.$refs.form.validate()) {
        try {
       await this.forgotPassword(this.email);
          this.$router.push('/forgot-password-success');
        } catch (error) {
          console.error('Error:', error);
        }
      }
    },
  },
};
</script>