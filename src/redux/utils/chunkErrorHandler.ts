/**
 * Utility functions to handle chunk loading errors
 */

export const isChunkError = (error: any): boolean => {
	if (!error) return false;

	const errorMessage = error.message || error.toString() || '';
	const errorName = error.name || '';

	return (
		errorMessage.includes('ChunkLoadError') ||
		errorMessage.includes('Loading chunk') ||
		errorMessage.includes('Failed to fetch dynamically imported module') ||
		errorMessage.includes('Loading CSS chunk') ||
		errorName === 'ChunkLoadError'
	);
};

export const clearAllCaches = async (): Promise<void> => {
	try {
		// Clear browser caches
		if ('caches' in window) {
			const cacheNames = await caches.keys();
			await Promise.all(cacheNames.map((name) => caches.delete(name)));
		}

		// Unregister service workers
		if ('serviceWorker' in navigator) {
			const registrations = await navigator.serviceWorker.getRegistrations();
			await Promise.all(registrations.map((registration) => registration.unregister()));
		}

		// Clear localStorage if needed (optional)
		localStorage.clear();

		// Clear sessionStorage if needed (optional)
		sessionStorage.clear();
	} catch (error) {
		console.error('Error clearing caches:', error);
	}
};

export const reloadWithCacheClear = async (): Promise<void> => {
	await clearAllCaches();
	// Small delay to ensure cache clearing completes
	setTimeout(() => {
		window.location.reload();
	}, 500);
};

export const retryChunkLoad = async (
	loadFn: () => Promise<any>,
	maxRetries: number = 3,
	delay: number = 1000,
): Promise<any> => {
	for (let i = 0; i < maxRetries; i++) {
		try {
			return await loadFn();
		} catch (error) {
			if (isChunkError(error) && i < maxRetries - 1) {
				console.warn(`Chunk load failed, retrying... (${i + 1}/${maxRetries})`);
				await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
				// Clear cache before retry
				await clearAllCaches();
			} else {
				throw error;
			}
		}
	}
};
