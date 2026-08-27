import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App/App';
import store from './redux/store';
import { isChunkError, reloadWithCacheClear } from './redux/utils/chunkErrorHandler';
import './index.css';

const queryClient = new QueryClient();

window.addEventListener('error', (event) => {
	if (isChunkError(event.error || { message: event.message })) {
		console.warn('Chunk loading error detected, clearing cache and reloading...');
		event.preventDefault();
		reloadWithCacheClear();
	}
});

window.addEventListener('unhandledrejection', (event) => {
	if (isChunkError(event.reason)) {
		console.warn('Chunk loading promise rejection detected, clearing cache and reloading...');
		event.preventDefault();
		reloadWithCacheClear();
	}
});

const container = document.getElementById('root');

createRoot(container as Element).render(
	<Provider store={store}>
		<QueryClientProvider client={queryClient}>
			<Router>
				<App />
				<Toaster position="top-right" />
			</Router>
		</QueryClientProvider>
	</Provider>,
);

