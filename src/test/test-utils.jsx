import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import authReducer from '../store/authSlice';

export function renderWithProviders(
  ui,
  {
    route = '/',
    auth = {
      token: 'test-token',
      user_id: 'user-1',
      user_name: 'Test User',
      roles: ['User'],
      portal: 'user',
    },
  } = {},
) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </Provider>,
  );
}
