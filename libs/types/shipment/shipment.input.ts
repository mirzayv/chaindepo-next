import { ShipmentLocation, ShipmentStatus, ShipmentType } from '../../enums/shipment.enum';
import { Direction } from '../../enums/common.enum';

export interface ShipmentInput {
	shipmentType: ShipmentType;
	shipmentOrigin: ShipmentLocation;
	shipmentDestination: ShipmentLocation;
	shipmentAddress: string;
	shipmentTitle: string;
	shipmentPrice: number;
	shipmentWeight: number;
	shipmentImages: string[];
	shipmentDesc?: string;
	carrierId?: string;
}

interface SISearch {
	memberId?: string;
	carrierId?: string;
	originList?: ShipmentLocation[];
	destinationList?: ShipmentLocation[];
	typeList?: ShipmentType[];
	statusList?: ShipmentStatus[];
	pricesRange?: Range;
	weightsRange?: Range;
	periodsRange?: PeriodsRange;
	text?: string;
}

export interface ShipmentsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: SISearch;
}

interface MSISearch {
	shipmentStatus?: ShipmentStatus;
}

export interface MyShipmentsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: MSISearch;
}

interface ALSISearch {
	shipmentStatus?: ShipmentStatus;
	shipmentOriginList?: ShipmentLocation[];
	shipmentDestinationList?: ShipmentLocation[];
}

export interface AllShipmentsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ALSISearch;
}

interface Range {
	start: number;
	end: number;
}

interface PeriodsRange {
	start: Date | number;
	end: Date | number;
}
