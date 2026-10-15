import { useCallback, useEffect, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import { socketVar } from '../../apollo/store';
import { Member } from '../types/member/member';

export interface ChatMessage {
	event: string;
	text: string;
	memberData: Member | null;
}

interface InfoPayload {
	event: string;
	totalClients: number;
	memberData: Member | null;
	action: string;
}

interface UseCommunityChatOptions {
	/** called for every new live message (not for the initial history) **/
	onNewMessage?: (message: ChatMessage) => void;
}

/**
 * Community chat over the shared WebSocket (socketVar, opened in apollo/client.ts).
 * Events: 'info' (online count), 'getMessages' (history), 'message' (new message).
 * The next phase can handle the assistant's events on the same socket here.
 */
const useCommunityChat = ({ onNewMessage }: UseCommunityChatOptions = {}) => {
	const socket = useReactiveVar(socketVar);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [onlineUsers, setOnlineUsers] = useState<number>(0);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!socket) return;

		socket.onmessage = (msg: MessageEvent) => {
			try {
				const data = JSON.parse(msg.data);

				switch (data.event) {
					case 'info': {
						const info: InfoPayload = data;
						setOnlineUsers(info.totalClients);
						break;
					}
					case 'getMessages': {
						setMessages(data.list as ChatMessage[]);
						break;
					}
					case 'message': {
						const message: ChatMessage = data;
						setMessages((prev) => [...prev, message]);
						onNewMessage?.(message);
						break;
					}
					default:
						break;
				}
			} catch (err) {
				console.log('WebSocket message error:', err);
			}
		};
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
