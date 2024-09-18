import { login } from '@/api/auth';
import axios from 'axios';

const state = {
  accessToken: localStorage.getItem('accessToken') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  error: null,
  loading: false
};

const mutations = {
  SET_ACCESS_TOKEN(state, token) {
    state.accessToken = token;
    localStorage.setItem('accessToken', token);
  },
  SET_USER(state, user) {
    state.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  }
};

const actions = {
  async login({ commit, dispatch }, credentials) {
    commit('SET_LOADING', true);
    try {
      const response = await login(credentials);
      const { accessToken,user } = response;
      commit('SET_ACCESS_TOKEN', accessToken);
      commit('SET_USER', user);
    
      // Start refresh token timer
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    } 
  },
  logout({ commit, state }) {
    commit('SET_ACCESS_TOKEN', null);
    commit('SET_USER', null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },
  async forgotPassword({ commit }, email) {
    try {
      const response = await axios.patch('http://localhost:3000/api/auth/forgotPassword', { email });
      return response.message;
    } catch (error) {
      commit('SET_ERROR', error.response.data.message);
      throw error;
    }
  },
  async resetPassword({ commit }, { token, password }) {
    commit('SET_LOADING', true);
    try {
      const response = await axios.put(`http://localhost:3000/api/auth/resetPassword/${token}`, { password });
      commit('SET_ERROR', null); // Clear any previous errors
      return response.data;
    } catch (error) {
      commit('SET_ERROR', error.response.data.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  clearError({ commit }) {
    commit('SET_ERROR', null);
  }
};

const getters = {
  isLoggedIn(state) {
    return !!state.accessToken;
  },
  userRole(state) {
    return state.user ? state.user.role : null;
  },
  authenticatedUser(state) {
    return state.user;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};