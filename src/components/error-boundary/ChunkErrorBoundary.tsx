import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
	retryCount: number;
}

class ChunkErrorBoundary extends Component<Props, State> {
	private maxRetries = 3;

	constructor(props: Props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			retryCount: 0,
		};
	}

	static getDerivedStateFromError(error: Error): State {
		// Check if it's a chunk loading error
		const isChunkError =
			error.message.includes('ChunkLoadError') ||
			error.message.includes('Loading chunk') ||
			error.message.includes('Failed to fetch dynamically imported module') ||
			error.name === 'ChunkLoadError';

		return {
			hasError: isChunkError,
			error,
			retryCount: 0,
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('Chunk Error Boundary caught an error:', error, errorInfo);

		// If it's a chunk loading error, try to reload the page
		if (
			error.message.includes('ChunkLoadError') ||
			error.message.includes('Loading chunk') ||
			error.message.includes('Failed to fetch dynamically imported module') ||
			error.name === 'ChunkLoadError'
		) {
			this.handleChunkError();
		}
	}

	handleChunkError = () => {
		const { retryCount } = this.state;

		if (retryCount < this.maxRetries) {
			// Clear cache and reload
			this.clearCacheAndReload();
		} else {
			// Show error message after max retries
			this.setState({
				hasError: true,
				retryCount: retryCount + 1,
			});
		}
	};

	clearCacheAndReload = () => {
		// Clear all caches
		if ('caches' in window) {
			caches.keys().then((names) => {
				names.forEach((name) => {
					caches.delete(name);
				});
			});
		}

		// Clear service worker if exists
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.getRegistrations().then((registrations) => {
				registrations.forEach((registration) => {
					registration.unregister();
				});
			});
		}

		// Reload the page after a short delay
		setTimeout(() => {
			window.location.reload();
		}, 1000);
	};

	handleRetry = () => {
		this.setState({
			hasError: false,
			error: null,
			retryCount: this.state.retryCount + 1,
		});
		this.clearCacheAndReload();
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						minHeight: '100vh',
						padding: '24px',
						background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
						fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
					}}>
					<div
						style={{
							background: '#fff',
							borderRadius: '16px',
							boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
							padding: '48px 40px',
							maxWidth: '440px',
							width: '100%',
							textAlign: 'center',
						}}>
						<div
							style={{
								width: '80px',
								height: '80px',
								margin: '0 auto 24px',
								borderRadius: '50%',
								background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}>
							<svg
								width='40'
								height='40'
								viewBox='0 0 24 24'
								fill='none'
								stroke='#b45309'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
								style={{ flexShrink: 0 }}>
								<path d='M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' />
								<path d='M3 3v5h5' />
								<path d='M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16' />
								<path d='M16 21h5v-5' />
							</svg>
						</div>
						<h1
							style={{
								margin: '0 0 12px',
								fontSize: '1.5rem',
								fontWeight: 700,
								color: '#1e293b',
								letterSpacing: '-0.02em',
							}}>
							Couldn’t load this page
						</h1>
						<p
							style={{
								margin: '0 0 28px',
								fontSize: '0.9375rem',
								lineHeight: 1.5,
								color: '#64748b',
							}}>
							This often happens when the app has been updated or your cache is out of
							date. Try refreshing or clearing cache to load the latest version.
						</p>
						<div
							style={{
								display: 'flex',
								flexWrap: 'wrap',
								gap: '12px',
								justifyContent: 'center',
							}}>
							<button
								type='button'
								onClick={this.handleRetry}
								style={{
									padding: '12px 24px',
									background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
									color: '#fff',
									border: 'none',
									borderRadius: '10px',
									cursor: 'pointer',
									fontSize: '0.9375rem',
									fontWeight: 600,
									boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
								}}>
								Retry
							</button>
							<button
								type='button'
								onClick={this.clearCacheAndReload}
								style={{
									padding: '12px 24px',
									background: '#fff',
									color: '#475569',
									border: '2px solid #e2e8f0',
									borderRadius: '10px',
									cursor: 'pointer',
									fontSize: '0.9375rem',
									fontWeight: 600,
								}}>
								Clear cache & reload
							</button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ChunkErrorBoundary;
