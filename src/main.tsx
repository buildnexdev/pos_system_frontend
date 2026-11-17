import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App/App';
import store from './redux/store';
import GlobalLoadingOverlay from './components/ui/GlobalLoadingOverlay';
import AppToaster from './components/ui/AppToaster';
import './index.scss';

const container = document.getElementById('root');

createRoot(container as Element).render(
  <Provider store={store}>
    <Router>
      <App />
      <GlobalLoadingOverlay />
      <AppToaster />
    </Router>
  </Provider>,
);
