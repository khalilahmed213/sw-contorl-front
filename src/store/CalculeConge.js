import axios from 'axios';

const getAccessToken = () => localStorage.getItem('accessToken');

const state = {
  CongeData: [],
  pagination: {},
  loading: false,
  leaveBalances: null,
};

const getters = {
  CongeData: (state) => state.CongeData,
  pagination: (state) => state.pagination,
  loading: (state) => state.loading,
  leaveBalances: (state) => state.leaveBalances
};

const actions = {
  async fetchCongeData({ commit }, { userId, month, page, limit, sortBy, order }) {
    commit('SET_LOADING', true);
    try {
      const response = await axios.get('http://localhost:3000/api/congecalcule', {
        params: { userId, month, page, limit, sortBy, order },
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });
     
      commit('SET_CongeData', response.data.leaveBalances);
      commit('SET_PAGINATION', response.data.pagination);
    } catch (error) {
      console.error('Error fetching CongeData:', error);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async fetchCongeDataUser({ commit }, { userId }) {
    commit('SET_LOADING', true);
    try {
      const response = await axios.get('http://localhost:3000/api/calculep', {
        params: { userId },
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });
      commit('SET_LEAVE_BALANCES', response.data);
    } catch (error) {
      console.error('Error fetching leave balances:', error);
      commit('SET_LEAVE_BALANCES', null);
    } finally {
      commit('SET_LOADING', false);
    }
  }
};

const mutations = {
  SET_CongeData(state, CongeData) {
    state.CongeData = CongeData;
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = pagination;
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_LEAVE_BALANCES(state, leaveBalances) {
    state.leaveBalances = leaveBalances;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};