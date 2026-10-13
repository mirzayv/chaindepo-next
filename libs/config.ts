import { ShipmentStatus } from './enums/shipment.enum';

export const REACT_APP_API_URL = `${process.env.REACT_APP_API_URL}`;

export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fulfill all inputs!',
	error4: 'Message is empty!',
	error5: 'Only images with jpeg, jpg, png format allowed!',
};

/** kg **/
export const shipmentWeights = [0, 1, 5, 10, 25, 50, 100, 500, 1000, 5000];

export const topShipmentRank = 3;

export const SEPOLIA_TX_URL = 'https://sepolia.etherscan.io/tx/';

/**
 * Statuses a carrier may append next (mirrors backend TrackingEventService transitions).
 * IN_TRANSIT → IN_TRANSIT needs a different location than the previous event.
 * CANCELLED via createTrackingEvent is ADMIN only, so it is not offered here.
 */
export const carrierNextStatuses: Partial<Record<ShipmentStatus, ShipmentStatus[]>> = {
	[ShipmentStatus.CREATED]: [ShipmentStatus.PICKED_UP],
	[ShipmentStatus.PICKED_UP]: [ShipmentStatus.IN_TRANSIT],
	[ShipmentStatus.IN_TRANSIT]: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.DELIVERED],
};
