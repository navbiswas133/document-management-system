import { Provider } from 'react-redux';
import { store } from '../store/store';
import { AppToaster } from './AppToaster';

// Wraps the app with Redux store and toast notifications.
export function AppProviders({ children }) {
  return (
    <Provider store={store}>
      {children}
      <AppToaster />
    </Provider>
  );
}
