import { ShipmentLocation, ShipmentStatus, ShipmentType } from '../../enums/shipment.enum';
import { Member, TotalCounter } from '../member/member';
import { MeLiked } from '../like/like';

export interface Shipment {
	_id: string;
	shipmentType: ShipmentType;
	shipmentStatus: ShipmentStatus;
	shipmentOrigin: ShipmentLocation;
	shipmentDestination: ShipmentLocation;
	shipmentAddress: string;
	shipmentTitle: string;
	shipmentPrice: number;
	shipmentWeight: number;
	shipmentTrackingCode: string;
	shipmentViews: number;
	shipmentLikes: number;
	shipmentComments: number;
	shipmentRank: number;
	shipmentImages: string[];
	shipmentDesc?: string;
	memberId: string;
	carrierId?: string;
	lastEventHash?: string;
	deliveredAt?: Date;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface Shipments {
	list: Shipment[];
	metaCounter: TotalCounter[];
}
