import { makeVar } from '@apollo/client';

import { CustomJwtPayload } from '../libs/types/customJwtPayload';
import { Member } from '../libs/types/member/member';
export const themeVar = makeVar({});

export const userVar = makeVar<CustomJwtPayload>({
	_id: '',
	memberType: '',
	memberStatus: '',
	memberAuthType: '',
	memberPhone: '',
	memberNick: '',
	memberFullName: '',
	memberImage: '',
	memberAddress: '',
	memberDesc: '',
	memberShipments: 0,
	memberRank: 0,
	memberArticles: 0,
	memberPoints: 0,
	memberLikes: 0,
	memberViews: 0,
	memberWarnings: 0,
	memberBlocks: 0,
});

//@ts-ignore
export const socketVar = makeVar<WebSocket>();

/**
 * Community chat state, written by the socket in apollo/client.ts (LoggingWebsocket).
 * It lives here and not in component state because the server sends the online count and the
 * history only once, right after connecting; the socket outlives page changes, the widget does not.
 */
export interface ChatMessagePayload {
	event: string;
	text: string;
	memberData: Member | null;
}

export const chatOnlineVar = makeVar<number>(0);
export const chatMessagesVar = makeVar<ChatMessagePayload[]>([]);
