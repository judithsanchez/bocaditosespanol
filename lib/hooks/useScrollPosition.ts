import {useState, useEffect} from 'react';

export const useScrollPosition = (elementId: string) => {
	const [showControls, setShowControls] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		let lastScrollY = window.scrollY;

		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			setShowControls(currentScrollY > lastScrollY && currentScrollY > 0);
			lastScrollY = currentScrollY;
		};

		window.addEventListener('scroll', handleScroll);
		handleScroll();

		return () => window.removeEventListener('scroll', handleScroll);
	}, [elementId]);

	return showControls;
};
