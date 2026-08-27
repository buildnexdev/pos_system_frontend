import { useState, useEffect } from 'react';

const useAnimatedPlaceholder = (originalText: string, speed: number = 150) => {
	const [placeholderText, setPlaceholderText] = useState(originalText);

	useEffect(() => {
		if (!originalText) return;

		let rafId: number;
		let lastTime = performance.now();
		let accumulator = 0;
		let currentIndex = 0;
		let isWaiting = true;
		let waitStartTime = performance.now();

		const animate = (currentTime: number) => {
			const deltaTime = currentTime - lastTime;
			lastTime = currentTime;

			if (isWaiting) {
				if (currentTime - waitStartTime >= 2000) {
					isWaiting = false;
					accumulator = 0;
				}
			} else {
				accumulator += deltaTime;
				if (accumulator >= speed) {
					const steps = Math.floor(accumulator / speed);
					currentIndex = (currentIndex + steps) % originalText.length;
					accumulator %= speed;

					setPlaceholderText(
						originalText.substring(currentIndex) +
							originalText.substring(0, currentIndex),
					);

					if (currentIndex === 0) {
						isWaiting = true;
						waitStartTime = currentTime;
					}
				}
			}
			rafId = requestAnimationFrame(animate);
		};

		rafId = requestAnimationFrame(animate);

		return () => {
			if (rafId) cancelAnimationFrame(rafId);
		};
	}, [originalText, speed]);

	return placeholderText;
};

export default useAnimatedPlaceholder;
