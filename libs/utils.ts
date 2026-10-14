import numeral from 'numeral';
import { sweetMixinErrorAlert } from './sweetAlert';

export const formatterStr = (value: number | undefined): string => {
	return numeral(value).format('0,0') != '0' ? numeral(value).format('0,0') : '';
};

/** Korean won, no decimals: 1500000 → ₩1,500,000 **/
export const formatKRW = (value: number | undefined | null): string => {
	return `₩${numeral(value ?? 0).format('0,0')}`;
};

/** enum value → readable label: IN_TRANSIT → In transit **/
export const labelOf = (value: string | undefined | null): string => {
	if (!value) return '';
	const text = value.replace(/_/g, ' ').toLowerCase();
	return text.charAt(0).toUpperCase() + text.slice(1);
};

export const likeTargetShipmentHandler = async (likeTargetShipment: any, id: string) => {
	try {
		await likeTargetShipment({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetShipmentHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

export const likeTargetBoardArticleHandler = async (likeTargetBoardArticle: any, id: string) => {
	try {
		await likeTargetBoardArticle({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetBoardArticleHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};

export const likeTargetMemberHandler = async (likeTargetMember: any, id: string) => {
	try {
		await likeTargetMember({
			variables: {
				input: id,
			},
		});
	} catch (err: any) {
		console.log('ERROR, likeTargetMemberHandler:', err.message);
		sweetMixinErrorAlert(err.message).then();
	}
};
