import { createSlice } from '@reduxjs/toolkit';
import {
  clearAuthStorage,
  loadAuth,
  saveAuth,
} from '../features/auth/authStorage';

const persisted = loadAuth();

const initialState = {
  token: persisted?.token ?? null,
  user_id: persisted?.user_id ?? null,
  user_name: persisted?.user_name ?? null,
  roles: persisted?.roles ?? [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { token, user_id, user_name, roles } = action.payload;
      state.token = token;
      state.user_id = user_id;
      state.user_name = user_name;
      state.roles = roles;
      saveAuth({ token, user_id, user_name, roles });
    },
    logout(state) {
      state.token = null;
      state.user_id = null;
      state.user_name = null;
      state.roles = [];
      clearAuthStorage();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
