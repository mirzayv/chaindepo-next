import { ShipmentLocation, ShipmentStatus } from '../../enums/shipment.enum';

export interface TrackingEventInput {
	shipmentId: string;
	eventStatus: ShipmentStatus;
	eventLocation: ShipmentLocation;
	eventNote?: string;
}
