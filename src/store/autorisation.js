import axios from 'axios';

const getAccessToken = () => localStorage.getItem('accessToken');

const state = {
  autorisations: [],
  totalPages: 0,
  currentPage: 1,
  totalItems: 0,
  loading: false,
  error: null,

};

const mutations = {
  SET_AUTORISATIONS(state, { autorisations, totalPages, currentPage, totalItems }) {
    state.autorisations = autorisations;
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
  async fetchAutorisations({ commit }, { page, limit, sortBy, sortOrder, agentId }) {
    commit('SET_LOADING', true);
    try {
      const response = await axios.get('http://localhost:3000/api/autorisations', {
        params: { page, limit, sortBy, sortOrder, agentId },
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      commit('SET_AUTORISATIONS', response.data);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },




  async updateAutorisation({ commit}, { id, autorisationData }) {
    commit('SET_LOADING', true);
    try {
      await axios.put(`http://localhost:3000/api/autorisations/${id}`, autorisationData, {
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

  async deleteAutorisation({ commit}, id) {
    commit('SET_LOADING', true);
    try {
      await axios.delete(`http://localhost:3000/api/autorisations/${id}`, {
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

  async fetchUserAutorisations({ commit }, { UserId, page, limit, sortBy, sortOrder }) {
    commit('SET_LOADING', true);
    try {
      const response = await axios.get(`http://localhost:3000/api/autorisation`, {
        params: { page, limit, sortBy, sortOrder ,UserId},
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      commit('SET_AUTORISATIONS', response.data);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async toggleAutorisationStatus({ commit }, { id, newStatus }) {
    commit('SET_LOADING', true);
    try {
      const response = await axios.put(`http://localhost:3000/api/autorisation/${id}`, 
        { newStatus },
        {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`
          }
        }
      );
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
  getAutorisations: state => state.autorisations,
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
