import Hotjar from '@hotjar/browser';

const siteId = 6421588;
const hotjarVersion = 6;

export const initHotjar = () => {
	// Only initialize Hotjar in production or when explicitly enabled
	if (
		process.env.NODE_ENV === 'production' ||
		process.env.REACT_APP_ENABLE_HOTJAR === 'true'
	) {
		try {
			Hotjar.init(siteId, hotjarVersion);
			console.log('Hotjar initialized successfully');
		} catch (error) {
			console.error('Failed to initialize Hotjar:', error);
		}
	} else {
		console.log('Hotjar initialization skipped (development mode)');
	}
};

// Helper functions for Hotjar events
export const hotjarEvent = (eventName: string) => {
	if (typeof window !== 'undefined' && (window as any).hj) {
		(window as any).hj('event', eventName);
	}
};

export const hotjarIdentify = (
	userId: string,
	attributes?: Record<string, any>
) => {
	if (typeof window !== 'undefined' && (window as any).hj) {
		(window as any).hj('identify', userId, attributes);
	}
};
