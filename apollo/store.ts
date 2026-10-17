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

/** the chat socket; null while logged out (guests do not connect, see apollo/client.ts) */
export const socketVar = makeVar<WebSocket | null>(null);

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

/**
 * Assistant conversation (floating widget). Kept here so it survives page changes (the widget remounts
 * with every layout); cleared on logout (libs/auth).
 */
export interface AssistantMessage {
	role: 'user' | 'model';
	text: string;
	/** a failed request, shown as a muted assistant bubble and never sent back as history */
	error?: boolean;
}

export const assistantMessagesVar = makeVar<AssistantMessage[]>([]);
export const chatMessagesVar = makeVar<ChatMessagePayload[]>([]);
