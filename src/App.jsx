import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './app/routes';
import { AppProviders } from './app/providers';

// Top-level shell: global state (Redux) + page routing.
function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
