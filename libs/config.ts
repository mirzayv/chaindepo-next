import { ShipmentStatus } from './enums/shipment.enum';
import { BoardArticleCategory } from './enums/board-article.enum';

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
export const SEPOLIA_ADDRESS_URL = 'https://sepolia.etherscan.io/address/';
export const CHAINDEPO_CONTRACT = '0xF23A90A6e2C5ebB56799044B453DdbfeDD6d1246';

/**
 * Community boards shown in the UI, in order. HUMOR stays in the enum for the backend but is not offered.
 */
export const communityCategories: { value: BoardArticleCategory; label: string; desc: string }[] = [
	{
		value: BoardArticleCategory.FREE,
		label: 'General',
		desc: 'Questions and discussion about shipping across Korea.',
	},
	{ value: BoardArticleCategory.RECOMMEND, label: 'Tips', desc: 'Packing, routes and handover tips from shippers and carriers.' },
	{ value: BoardArticleCategory.NEWS, label: 'News', desc: 'Updates about ChainDepo and logistics in Korea.' },
];

export const communityCategoryLabel = (category?: string): string =>
	communityCategories.find((item) => item.value === category)?.label ?? 'General';

/** admin view: every enum value, including the hidden HUMOR board */
export const boardLabelOf = (category?: string): string =>
	communityCategories.find((item) => item.value === category)?.label ??
	(category === BoardArticleCategory.HUMOR ? 'Humor (hidden)' : category ?? '');

/** neutral fallback for shipments without photos **/
export const IMAGE_PLACEHOLDER = '/img/placeholder.svg';

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
