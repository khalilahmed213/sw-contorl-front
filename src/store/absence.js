import axios from 'axios';

const getAccessToken = () => localStorage.getItem('accessToken');

const state = {
  absences: [],
  pagination: {},
  loading: false,
};

const getters = {
  absences: (state) => state.absences,
  pagination: (state) => state.pagination,
  loading: (state) => state.loading,
};

const actions = {
  async fetchAbsences({ commit }, { userId, month, page, limit, sortBy, order ,year}) {
    commit('SET_LOADING', true);
    try {
      const response = await axios.get(`${process.env.VUE_APP_API_URL}api/absence`, {
        params: { userId, month, page, limit, sortBy, order,year },
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });
     
      commit('SET_ABSENCES', response.data.absences);
      commit('SET_PAGINATION', response.data.pagination);
    } catch (error) {
      console.error('Error fetching absences:', error);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async addAbsence({ commit }, absence) {
    try {
    await axios.post(`${process.env.VUE_APP_API_URL}api/absence`, absence, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });
    } catch (error) {
      console.error('Error adding absence:', error);
      throw error;
    }
  },
};

const mutations = {
  SET_ABSENCES(state, absences) {
    state.absences = absences;
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = pagination;
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