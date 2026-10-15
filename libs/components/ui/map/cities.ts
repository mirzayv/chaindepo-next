import { ShipmentLocation } from '../../../enums/shipment.enum';

export interface CityInfo {
	/** today's romanisation; the enum keeps the backend spelling (DAEJON, CHONJU) */
	name: string;
	lat: number;
	lng: number;
}

export const CITIES: Record<ShipmentLocation, CityInfo> = {
	[ShipmentLocation.SEOUL]: { name: 'Seoul', lat: 37.5665, lng: 126.978 },
	[ShipmentLocation.INCHEON]: { name: 'Incheon', lat: 37.4563, lng: 126.7052 },
	[ShipmentLocation.DAEJON]: { name: 'Daejeon', lat: 36.3504, lng: 127.3845 },
	[ShipmentLocation.CHONJU]: { name: 'Jeonju', lat: 35.8242, lng: 127.148 },
	[ShipmentLocation.GWANGJU]: { name: 'Gwangju', lat: 35.1595, lng: 126.8526 },
	[ShipmentLocation.DAEGU]: { name: 'Daegu', lat: 35.8714, lng: 128.6014 },
	[ShipmentLocation.GYEONGJU]: { name: 'Gyeongju', lat: 35.8562, lng: 129.2247 },
	[ShipmentLocation.BUSAN]: { name: 'Busan', lat: 35.1796, lng: 129.0756 },
	[ShipmentLocation.JEJU]: { name: 'Jeju', lat: 33.4996, lng: 126.5312 },
};

export const cityName = (location?: ShipmentLocation | null): string =>
	location ? CITIES[location]?.name ?? location : '';
