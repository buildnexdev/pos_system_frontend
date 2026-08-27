import React, { Suspense, useEffect } from 'react';
import ContentRoutes from './ContentRoutes';
import ChunkErrorBoundary from '../../components/error-boundary/ChunkErrorBoundary';
import { isChunkError, clearAllCaches } from '../../utils/chunkErrorHandler';
import CreativeLoadingSpinner from '../../pages/_common/CreativeLoadingSpinner';

// Global page-load fallback shown on every lazy route navigation — uses the
// design's loading veil so the loader is consistent across the whole app.
const LOADING = <CreativeLoadingSpinner loadingText='Loading…' />;

const Content = () => {
	// Handle chunk loading errors globally
	useEffect(() => {
		const handleError = (event: ErrorEvent) => {
			const error = event.error || { message: event.message };
			if (isChunkError(error)) {
				console.warn('Chunk loading error detected, clearing cache...');
				clearAllCaches().then(() => {
					setTimeout(() => {
						window.location.reload();
					}, 1000);
				});
			}
		};

		const handleRejection = (event: PromiseRejectionEvent) => {
			if (isChunkError(event.reason)) {
				console.warn('Chunk loading promise rejection detected, clearing cache...');
				event.preventDefault();
				clearAllCaches().then(() => {
					setTimeout(() => {
						window.location.reload();
					}, 1000);
				});
			}
		};

		window.addEventListener('error', handleError);
		window.addEventListener('unhandledrejection', handleRejection);

		return () => {
			window.removeEventListener('error', handleError);
			window.removeEventListener('unhandledrejection', handleRejection);
		};
	}, []);

	return (
		<main id='main-content' tabIndex={-1} className='content'>
			<ChunkErrorBoundary>
				<Suspense fallback={LOADING}>
					<ContentRoutes />
				</Suspense>
			</ChunkErrorBoundary>
		</main>
	);
};

export default Content;
