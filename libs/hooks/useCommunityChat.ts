import { useCallback, useEffect } from 'react';
import { useReactiveVar } from '@apollo/client';
import { chatMessagesVar, chatOnlineVar, ChatMessagePayload, socketVar } from '../../apollo/store';

export type ChatMessage = ChatMessagePayload;

interface UseCommunityChatOptions {
	/** called for every new live message (not for the initial history) **/
	onNewMessage?: (message: ChatMessage) => void;
}

/**
 * Community chat over the shared WebSocket (socketVar, opened in apollo/client.ts).
 * Events: 'info' (online count), 'getMessages' (history), 'message' (new message).
 * The socket writes them to chatOnlineVar / chatMessagesVar, so the count and history survive
 * page changes (the widget remounts with every layout, the socket does not).
 */
const useCommunityChat = ({ onNewMessage }: UseCommunityChatOptions = {}) => {
	const socket = useReactiveVar(socketVar);
	const messages = useReactiveVar(chatMessagesVar);
	const onlineUsers = useReactiveVar(chatOnlineVar);

	/** LIFECYCLES **/
	// a listener (not socket.onmessage) so it never replaces the store writer in apollo/client.ts
	useEffect(() => {
		if (!socket || !onNewMessage) return;

		const listener = (msg: MessageEvent) => {
			try {
				const data = JSON.parse(msg.data);
				if (data.event === 'message') onNewMessage(data as ChatMessage);
			} catch (err) {
				console.log('WebSocket message error:', err);
			}
		};

		socket.addEventListener('message', listener);
		return () => socket.removeEventListener('message', listener);
	}, [socket, onNewMessage]);

	/** HANDLERS **/
	/** returns false when nothing was sent (empty text or socket not open) **/
	const sendMessage = useCallback(
		(text: string): boolean => {
			const trimmed = text.trim();
			if (!trimmed) return false;
			if (!socket || socket.readyState !== WebSocket.OPEN) {
				console.log('WebSocket is not open');
				return false;
			}
			socket.send(JSON.stringify({ event: 'message', data: trimmed }));
			return true;
		},
		[socket],
	);

	return { messages, onlineUsers, sendMessage };
};

export default useCommunityChat;
