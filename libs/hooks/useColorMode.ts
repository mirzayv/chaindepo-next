import { useCallback, useEffect, useState } from 'react';

export type ColorMode = 'light' | 'dark';

/** localStorage key; also read by the inline script in pages/_document.tsx (keep both in sync) */
export const COLOR_MODE_KEY = 'cd-theme';

const listeners = new Set<(mode: ColorMode) => void>();

const currentMode = (): ColorMode =>
	typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light';

const storedMode = (): ColorMode | null => {
	try {
		const value = window.localStorage.getItem(COLOR_MODE_KEY);
		return value === 'dark' || value === 'light' ? value : null;
	} catch {
		return null;
	}
};

const applyMode = (mode: ColorMode, persist: boolean) => {
	const root = document.documentElement;
	root.classList.toggle('dark', mode === 'dark');
	root.style.colorScheme = mode;
	if (persist) {
		try {
			window.localStorage.setItem(COLOR_MODE_KEY, mode);
		} catch {
			// storage blocked: the choice lasts for this page view only
		}
	}
	listeners.forEach((listener) => listener(mode));
};

/**
 * Light / dark mode shared by every component (header toggle, MUI theme in _app).
 * The class on <html> is the source of truth; it is set before paint by _document's inline script.
 * Until the user picks a mode, the OS setting is followed live.
 */
const useColorMode = () => {
	// SSR renders light; the effect below syncs with the class the inline script already set
	const [mode, setMode] = useState<ColorMode>('light');

	useEffect(() => {
		setMode(currentMode());
		listeners.add(setMode);

		const media = window.matchMedia('(prefers-color-scheme: dark)');
		const onSystemChange = (e: MediaQueryListEvent) => {
			if (!storedMode()) applyMode(e.matches ? 'dark' : 'light', false);
		};
		media.addEventListener('change', onSystemChange);

		return () => {
			listeners.delete(setMode);
			media.removeEventListener('change', onSystemChange);
		};
	}, []);

	const toggleMode = useCallback(() => {
		applyMode(currentMode() === 'dark' ? 'light' : 'dark', true);
	}, []);

	return { mode, toggleMode };
};

export default useColorMode;
