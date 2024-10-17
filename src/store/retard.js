import axios from 'axios';

const getAccessToken = () => localStorage.getItem('accessToken');

const state = {
retard: [],
total:null,
loading: false,
};

const getters = {
  retard: (state) => state.retard,
  total: (state) => state.total,
  loading: (state) => state.loading,
};

const actions = {
  async fetchRetard({ commit }, { userId, month, page, limit, sortBy, order }) {
    commit('SET_LOADING', true);
    try {
      const response = await axios.get('http://localhost:3000/api/retard', {
        params: { userId, month, page, limit, sortBy, order },
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });
     
      commit('SET_RETARDS', response.data.records);
      commit('SET_TOTAL', response.data.totalPages);
    } catch (error) {
      console.error('Error fetching retard:', error);
    } finally {
      commit('SET_LOADING', false);
    }
  },
};

const mutations = {
  SET_RETARDS(state, retard) {
    state.retard = retard;
  },
  SET_TOTAL(state, total) {
    state.total = total;
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
};

export default {
  namespaced: true,  // Add this line to enable namespacing
  state,
  getters,
  actions,
  mutations,
};