import { ShipmentLocation, ShipmentType } from '../../enums/shipment.enum';

interface ListSearch {
	typeList?: ShipmentType[];
	originList?: ShipmentLocation[];
}

/** /shipment?input=<ShipmentsInquiry JSON>, the format pages/shipment/index.tsx parses */
export const shipmentListHref = (search: ListSearch): string => {
	const input = { page: 1, limit: 9, sort: 'createdAt', direction: 'DESC', search };
	return `/shipment?input=${encodeURIComponent(JSON.stringify(input))}`;
};
