import dynamic from 'next/dynamic';
import type { KoreaMapProps } from './KoreaMap';

/** Leaflet touches window on import, so the map only renders in the browser */
const MapView = dynamic<KoreaMapProps>(() => import('./KoreaMap'), {
	ssr: false,
	loading: () => <div className="h-full w-full animate-pulse rounded-card border border-line bg-surface motion-reduce:animate-none" />,
});

export default MapView;
export type { KoreaMapProps, MapMarker } from './KoreaMap';
