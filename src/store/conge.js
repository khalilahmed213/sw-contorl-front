import axios from 'axios';

const getAccessToken = () => localStorage.getItem('accessToken');

const state = {
  conges: [],
  totalPages: 0,
  currentPage: 1,
  totalItems: 0,
  loading: false,
  error: null,
};

const mutations = {
  SET_CONGES(state, { conges, totalPages, currentPage, totalItems }) {
    state.conges = conges;
    state.totalPages = totalPages;
    state.currentPage = currentPage;
    state.totalItems = totalItems;
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
};

const actions = {
  async fetchConges({ commit,state }, { page, limit, sortBy, sortOrder, UserId }) {
    commit('SET_LOADING', true);
    try {
      const response = await axios.get('http://localhost:3000/api/conges', {
        params: { page, limit, sortBy, sortOrder, UserId },
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      commit('SET_CONGES', response.data);
      console.log(state.conge)
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createConge({ commit }, congeData) {
    commit('SET_LOADING', true);
    try {
      await axios.post('http://localhost:3000/api/conges', congeData, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateConge({ commit }, { id, congeData }) {
    commit('SET_LOADING', true);
    try {
      await axios.put(`http://localhost:3000/api/conges/${id}`, congeData, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async deleteConge({ commit }, id) {
    commit('SET_LOADING', true);
    try {
      await axios.delete(`http://localhost:3000/api/conges/${id}`, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async fetchUserConges({ commit }, { UserId, page, limit, sortBy, sortOrder }) {
    commit('SET_LOADING', true);
    try {
      const response = await axios.get(`http://localhost:3000/api/conge`, {
        params: { page, limit, sortBy, sortOrder ,UserId},
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      commit('SET_CONGES', response.data);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  
  async toggleCongeStatus({ commit }, { id, newStatus }) {
    commit('SET_LOADING', true);
    try {
      const response = await axios.put(`http://localhost:3000/api/conge/${id}`, 
        { newStatus },
        {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`
          }
        }
      );
      console.log(response)
      // Optionally, you can update the local state here if needed
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },
};

const getters = {
  getConges: state => state.conges,
  getTotalPages: state => state.totalPages,
  getCurrentPage: state => state.currentPage,
  getTotalItems: state => state.totalItems,
  isLoading: state => state.loading,
  getError: state => state.error,
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
