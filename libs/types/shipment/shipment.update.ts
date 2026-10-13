import { ShipmentLocation, ShipmentStatus, ShipmentType } from '../../enums/shipment.enum';

export interface ShipmentUpdate {
	_id: string;
	shipmentType?: ShipmentType;
	shipmentStatus?: ShipmentStatus;
	shipmentOrigin?: ShipmentLocation;
	shipmentDestination?: ShipmentLocation;
	shipmentAddress?: string;
	shipmentTitle?: string;
	shipmentPrice?: number;
	shipmentWeight?: number;
	shipmentImages?: string[];
	shipmentDesc?: string;
	carrierId?: string;
}
