import { Provider } from 'react-redux';
import { store } from '../store/store';
import { AppToaster } from './AppToaster';

export function AppProviders({ children }) {
  return (
    <Provider store={store}>
      {children}
      <AppToaster />
    </Provider>
  );
}
