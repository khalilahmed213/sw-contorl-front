import axios from 'axios';
const getAccessToken = () => localStorage.getItem('accessToken');

const state = {
  schedules: [],
  error: null,
  loading: false,
  isselectedschedule:{},
  isRecurring: null,
};

const getters = {
  getSchedules: state => state.schedules,
  getError: state => state.error,
  isLoading: state => state.loading,
  selectedschedule: state=>state.isselectedschedule,
  isrecurring: state => state.isRecurring,
  
};

const mutations = {
  setSchedules(state, schedules) {
    state.schedules = schedules;
  },
  setselectedschedule(state, schedule) {
    state.isselectedschedule = schedule; // Correctly setting the selected schedule
  },
  setError(state, error) {
    state.error = error;
  },
  setLoading(state, loading) {
    state.loading = loading; // Added loading mutation
  },
  ADD_SCHEDULE(state, schedule) {
    state.schedules.push(schedule);
  },
  UPDATE_SCHEDULE(state, updatedSchedule) {
    const index = state.schedules.findIndex(schedule => schedule.id === updatedSchedule.id);
    if (index !== -1) {
      state.schedules.splice(index, 1, updatedSchedule);
    }
  },
  SET_IS_RECURRING(state, isRecurring) {
    state.isrecurring = isRecurring;
  },
  DELETE_SCHEDULE(state, id) {
    state.schedules = state.schedules.filter(schedule => schedule.id !== id);
  }
};

const actions = {
  async fetchSchedules({ commit }) {
    try {
      const response = await axios.get('http://localhost:3000/api/schedules', {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });
      commit('setSchedules', response.data);
    } catch (error) {
      console.error('Failed to fetch schedules:', error.message);
    }
  },
  async fetchSelectedSchedule({ commit}) { 
    try {
      const response = await axios.get('http://localhost:3000/api/schedules/getisselected', {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      commit('setselectedschedule', response.data);
    } catch (error) {
      commit('setError', error.message);
      console.error('Error fetching schedules:', error);
      throw error; 
    } finally {
      commit('setLoading', false);
    }
  },
  async createSchedule({ commit }, schedule) {
    commit('setLoading', true); 
    try {
      const response = await axios.post('http://localhost:3000/api/schedules', schedule, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      commit('ADD_SCHEDULE', response.data.data); // Adjusted to use response.data.data
      return { success:response.data, message: response.data.message }; // Return success message
    } catch (error) {
      return { success: error.response.data.success, message: error.response.data.message };
    } finally {
      commit('setLoading', false); 
    }
  },
  async updateSchedule({ commit }, schedule) {
    commit('setLoading', true);
    try {
      const response = await axios.put(`http://localhost:3000/api/schedules/${schedule.id}`, schedule, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      
      commit('UPDATE_SCHEDULE', response.data.data); 
      return { success: true, message: response.data.message }; 
    } catch (error) {
      console.log(error.response.data.message)
      return { success:error.response.data.success, message: error.response.data.message };
    } finally {
      commit('setLoading', false); 
    }
  },
  async deleteSchedule({ commit }, id) {
    commit('setLoading', true); 
    try {
    const response =await axios.delete(`http://localhost:3000/api/schedules/${id}`, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      console.log(response)
      return { success: response.data.success, message: response.data.message }; 
    } catch (error) {
      console.log(error)
      return { success:error.response.data.success, message: error.response.data.message };
    } finally {
      commit('setLoading', false); 
    }
  },
  async toggleSelected({ commit }, scheduleId) {
    try {
      await axios.put(`http://localhost:3000/api/schedules/toggle-selected/${scheduleId}`,{}, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });

    } catch (error) {
      commit('setError', error.message);
      console.error('Error toggling isSelected:', error);
      throw error;
    }
  },
  async checkIfScheduleIsRecurring({ commit }, scheduleId) {
    try {
      const response = await axios.get(`http://localhost:3000/api/schedules/getrecuring`, {
        params: {
          id: scheduleId,
        },
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      commit('SET_IS_RECURRING', response.data.isRecurring);
    } catch (error) {
      console.log(error)
    }
  },

};

export default {
  state,
  getters,
  mutations,
  actions
};