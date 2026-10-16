import { useMemo } from 'react';
import { ApolloClient, ApolloLink, InMemoryCache, split, from, NormalizedCacheObject } from '@apollo/client';
import createUploadLink from 'apollo-upload-client/public/createUploadLink.js';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { getJwtToken } from '../libs/auth';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { sweetErrorAlert } from '../libs/sweetAlert';
import { chatMessagesVar, chatOnlineVar, socketVar } from './store';
let apolloClient: ApolloClient<NormalizedCacheObject>;

function getHeaders() {
	const headers = {} as HeadersInit;
	const token = getJwtToken();
	// @ts-ignore
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return headers;
}

const tokenRefreshLink = new TokenRefreshLink({
	accessTokenField: 'accessToken',
	isTokenValidOrUndefined: () => {
		return true;
	}, // @ts-ignore
	fetchAccessToken: () => {
		// execute refresh token
		return null;
	},
});

// the one chat socket of this tab (created by WebSocketLink below), so auth changes can reconnect it
let activeWebsocket: LoggingWebsocket | null = null;

// Custom websocket client
class LoggingWebsocket {
	/** null while logged out: guests never open the chat socket */
	private socket: WebSocket | null = null;
	private readonly url: string;
	/** token the current connection was opened with; the server reads the identity only at connect time */
	private token: string = '';

	constructor(url: string) {
		this.url = url;
		this.connect();
		activeWebsocket = this;
	}

	private connect() {
		this.token = getJwtToken() ?? '';
		if (!this.token) {
			// guest: no connection, and nothing from a previous session stays visible
			this.socket = null;
			socketVar(null);
			chatOnlineVar(0);
			chatMessagesVar([]);
			return;
		}
		this.socket = new WebSocket(`${this.url}?token=${this.token}`);
		socketVar(this.socket);

		this.socket.onopen = () => {
			console.log('WebSocket connection!');
		};

		// chat events are stored app-wide: 'info' and 'getMessages' arrive once per connection,
		// before (or between) the widget mounts, so component state alone would miss them
		this.socket.onmessage = (msg) => {
			try {
				const data = JSON.parse(msg.data);
				switch (data.event) {
					case 'info':
						chatOnlineVar(Number(data.totalClients) || 0);
						break;
					case 'getMessages':
						chatMessagesVar(Array.isArray(data.list) ? data.list : []);
						break;
					case 'message':
						chatMessagesVar([...chatMessagesVar(), data]);
						break;
				}
			} catch (err) {
				console.log('WebSocket message error:', err);
			}
		};

		this.socket.onerror = (error) => {
			console.log('WebSocket, error:', error);
		};
	}

	/**
	 * Login and signup open the socket; logout closes it; a profile update reopens it with the new token
	 * (the server keeps the identity it saw at connect). While logged in, history and online count stay in
	 * chatMessagesVar / chatOnlineVar across a reconnect, and the new connection sends fresh ones.
	 */
	reconnectIfTokenChanged() {
		const current = getJwtToken() ?? '';
		if (current === this.token) return;
		const old = this.socket;
		if (old) {
			old.onmessage = null;
			old.onerror = null;
			old.onopen = null;
			old.close();
		}
		this.connect();
	}

	send(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) {
		if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(data as string);
	}

	close() {
		this.socket?.close();
	}
}

/** call after the stored JWT changes (libs/auth updateStorage / deleteStorage) */
export function reconnectChatSocket() {
	activeWebsocket?.reconnectIfTokenChanged();
}

function createIsomorphicLink() {
	if (typeof window !== 'undefined') {
		const authLink = new ApolloLink((operation, forward) => {
			operation.setContext(({ headers = {} }) => ({
				headers: {
					...headers,
					...getHeaders(),
				},
			}));
			console.warn('requesting.. ', operation);
			return forward(operation);
		});

		// @ts-ignore
		const link = new createUploadLink({
			// resolved in next.config.js from NEXT_PUBLIC_API_URL
			uri: process.env.REACT_APP_API_GRAPHQL_URL,
		});

		/* WEBSOCKET SUBSCRIPTION LINK */
		const wsLink = new WebSocketLink({
			// resolved in next.config.js from NEXT_PUBLIC_API_WS
			uri: process.env.REACT_APP_API_WS ?? 'ws://localhost:3007',
			options: {
				reconnect: false,
				timeout: 30000,
				connectionParams: () => {
					return { headers: getHeaders() };
				},
			},

			webSocketImpl: LoggingWebsocket,
		});

		const errorLink = onError(({ graphQLErrors, networkError, response }) => {
			if (graphQLErrors) {
				graphQLErrors.map(({ message, locations, path, extensions }) => {
					console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
					if (!message.includes('input')) sweetErrorAlert(message);
				});
			}
			if (networkError) console.log(`[Network error]: ${networkError}`);
			// @ts-ignore
			if (networkError?.statusCode === 401) {
			}
		});

		const splitLink = split(
			({ query }) => {
				const definition = getMainDefinition(query);
				return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
			},
			wsLink,
			authLink.concat(link),
		);

		return from([errorLink, tokenRefreshLink, splitLink]);
	}
}

function createApolloClient() {
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new InMemoryCache(),
		resolvers: {},
	});
}

export function initializeApollo(initialState = null) {
	const _apolloClient = apolloClient ?? createApolloClient();
	if (initialState) _apolloClient.cache.restore(initialState);
	if (typeof window === 'undefined') return _apolloClient;
	if (!apolloClient) apolloClient = _apolloClient;

	return _apolloClient;
}

export function useApollo(initialState: any) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}
