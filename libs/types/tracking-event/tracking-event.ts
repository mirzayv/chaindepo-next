import { ShipmentLocation, ShipmentStatus } from '../../enums/shipment.enum';

export interface TrackingEvent {
	_id: string;
	shipmentId: string;
	memberId: string;
	eventStatus: ShipmentStatus;
	eventLocation: ShipmentLocation;
	eventNote?: string;
	prevHash: string;
	eventHash: string;
	eventTxHash?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface ChainVerification {
	valid: boolean;
	totalEvents: number;
	brokenAtIndex: number | null;
	lastEventHash: string | null;
	/** null when on-chain anchoring is disabled on the backend **/
	anchoredEvents: number | null;
}

export interface EventAnchorStatus {
	eventId: string;
	eventHash: string;
	eventTxHash: string | null;
	/** null when anchoring is disabled or the RPC call failed **/
	anchored: boolean | null;
}
