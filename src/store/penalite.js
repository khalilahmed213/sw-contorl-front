import axios from 'axios';

const getAccessToken = () => localStorage.getItem('accessToken');

const state = {
  penalites: [],
  penalite: null,
  totalPenalites: 0, // Add totalPenalites to state
  loading: false, // Add loading state
};

const getters = {
  allPenalites: (state) => state.penalites,
  totalPenalites: (state) => state.totalPenalites, // Expose totalPenalites
  isLoadingPenalite: (state) => state.loading, // Expose loading state
  singlePenalite: (state) => state.penalite,
};

const actions = {
  async fetchPenalites({ commit }, { page, limit, sortBy, sortDesc, search, agentId }) {
    commit('SET_LOADING', true);
    try {
      const response = await axios.get('http://localhost:3000/api/penalites', {
        params: {
          page,
          limit,
          sortBy,
          sortDesc: sortDesc ? 'true' : 'false',
          search,
          agentId
        },
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      commit('setPenalites', response.data.data);
      commit('setTotalPenalites', response.data.total);
    } catch (error) {
      console.error('Failed to fetch penalites:', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async createPenalite({ commit }, penaliteData) {
    try {
      const response = await axios.post('http://localhost:3000/api/penalites', penaliteData, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });
    } catch (error) {
      console.error('Failed to create penalite:', error.message);
    }
  },

  async updatePenalite({ commit }, updatedPenalite) {
    try {
      const response = await axios.put(`http://localhost:3000/api/penalites/${updatedPenalite.id}`, updatedPenalite, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });
    } catch (error) {
      console.error('Failed to update penalite:', error.message);
      throw error;
    }
  },

  async deletePenalite({ commit }, id) {
    try {
      await axios.delete(`http://localhost:3000/api/penalites/${id}`, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });
    } catch (error) {
      console.error('Failed to delete penalite:', error.message);
      throw error;
    }
  },
};

const mutations = {
  SET_LOADING: (state, isLoading) => (state.loading = isLoading),
  setPenalites: (state, penalites) => (state.penalites = penalites),
  setTotalPenalites: (state, total) => (state.totalPenalites = total),
  newPenalite: (state, penalite) => state.penalites.push(penalite),
  editPenalite: (state, updatedPenalite) => {
    const index = state.penalites.findIndex(p => p.id === updatedPenalite.id);
    if (index !== -1) {
      state.penalites.splice(index, 1, updatedPenalite);
    }
  },
 
};

export default {
  state,
  getters,
  actions,
  mutations,
};