import axios from 'axios';

const getAccessToken = () => localStorage.getItem('accessToken');

export default {
  namespaced: true,
  state: {
    projects: [],
    loading: false,
    error: null,
    totalCount: 0,
  },
  mutations: {
    SET_PROJECTS(state, projects) {
      state.projects = projects;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_TOTAL_COUNT(state, count) {
      state.totalCount = count;
    },
  },
  actions: {
    async fetchProjects({ commit }, { page, limit, sortBy, sortDesc, search }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}api/projects`, {
          params: {
            page,
            limit,
            sortBy,
            sortDesc: sortDesc ? 'true' : 'false',
            search
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }     
        });
        commit('SET_PROJECTS', response.data.projects);
        commit('SET_TOTAL_COUNT', response.data.total);
      } catch (error) {
        commit('SET_ERROR', error.message);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async addProject({ commit }, projectData) {
      commit('SET_LOADING', true);
      try {
        const response = await axios.post(`${process.env.VUE_APP_API_URL}api/projects`, projectData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
      } catch (error) {
        commit('SET_ERROR', error.message);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async updateProject({ commit }, projectData) {
      commit('SET_LOADING', true);
      try {
        const response = await axios.put(`${process.env.VUE_APP_API_URL}api/projects/${projectData.id}`, projectData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

      } catch (error) {
        commit('SET_ERROR', error.message);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async deleteProject({ commit }, projectId) {
        commit('SET_LOADING', true);
        try {
          console.log(`Attempting to delete project with ID: ${projectId}`);
          const response = await axios.delete(`${process.env.VUE_APP_API_URL}api/projects/${projectId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            }
          });
        } catch (error) {
          console.error('Error deleting project:', error.message);
          commit('SET_ERROR', error.message); 
        } finally {
          commit('SET_LOADING', false);
        }
      },
  },
  getters: {
    allProjects: state => state.projects,
    loadingproj: state => state.loading,
    error: state => state.error,
    totalCount: state => state.totalCount,
  }
};