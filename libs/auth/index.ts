import decodeJWT from 'jwt-decode';
import { initializeApollo, reconnectChatSocket } from '../../apollo/client';
import { assistantMessagesVar, userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { LOGIN, SIGN_UP } from '../../apollo/user/mutation';

export function getJwtToken(): any {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('accessToken') ?? '';
	}
}

export function setJwtToken(token: string) {
	localStorage.setItem('accessToken', token);
}

/**
 * The server's message for a failed login/signup, as-is (formatError on the backend already picks the
 * first ValidationPipe message), so the form can show it inline.
 */
const authErrorMessage = (err: any): string =>
	err?.graphQLErrors?.[0]?.message || err?.networkError?.message || err?.message || 'Something went wrong!';

/** throws an Error with the server's message; the join page shows it inline */
export const logIn = async (nick: string, password: string): Promise<void> => {
	const { jwtToken } = await requestJwtToken({ nick, password });
	if (!jwtToken) throw new Error('Something went wrong!');
	updateStorage({ jwtToken });
	updateUserInfo(jwtToken);
};

const requestJwtToken = async ({
	nick,
	password,
}: {
	nick: string;
	password: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();

	try {
		const result = await apolloClient.mutate({
			mutation: LOGIN,
			variables: { input: { memberNick: nick, memberPassword: password } },
			fetchPolicy: 'network-only',
			// the form shows the error itself, not the global SweetAlert popup (errorLink in apollo/client.ts)
			context: { silentErrors: true },
		});

		const { accessToken } = result?.data?.login;

		return { jwtToken: accessToken };
	} catch (err: any) {
		console.log('request token err', err?.graphQLErrors);
		throw new Error(authErrorMessage(err));
	}
};

/** phone is sent digits-only (01012345678); throws an Error with the server's message on failure */
export const signUp = async (nick: string, password: string, phone: string, type: string): Promise<void> => {
	const { jwtToken } = await requestSignUpJwtToken({ nick, password, phone, type });
	if (!jwtToken) throw new Error('Something went wrong!');
	updateStorage({ jwtToken });
	updateUserInfo(jwtToken);
};

const requestSignUpJwtToken = async ({
	nick,
	password,
	phone,
	type,
}: {
	nick: string;
	password: string;
	phone: string;
	type: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();

	try {
		const result = await apolloClient.mutate({
			mutation: SIGN_UP,
			variables: {
				input: { memberNick: nick, memberPassword: password, memberPhone: phone, memberType: type },
			},
			fetchPolicy: 'network-only',
			context: { silentErrors: true },
		});

		const { accessToken } = result?.data?.signup;

		return { jwtToken: accessToken };
	} catch (err: any) {
		console.log('request token err', err?.graphQLErrors);
		throw new Error(authErrorMessage(err));
	}
};

export const updateStorage = ({ jwtToken }: { jwtToken: any }) => {
	setJwtToken(jwtToken);
	window.localStorage.setItem('login', Date.now().toString());
	// the chat socket was opened with the previous token (or as a guest)
	reconnectChatSocket();
};

export const updateUserInfo = (jwtToken: any) => {
	if (!jwtToken) return false;

	const claims = decodeJWT<CustomJwtPayload>(jwtToken);
	userVar({
		_id: claims._id ?? '',
		memberType: claims.memberType ?? '',
		memberStatus: claims.memberStatus ?? '',
		memberAuthType: claims.memberAuthType,
		memberPhone: claims.memberPhone ?? '',
		memberNick: claims.memberNick ?? '',
		memberFullName: claims.memberFullName ?? '',
		// a path relative to the API (uploads/member/...), or '' — components prefix REACT_APP_API_URL or use the placeholder
		memberImage: claims.memberImage ?? '',
		memberAddress: claims.memberAddress ?? '',
		memberDesc: claims.memberDesc ?? '',
		memberShipments: claims.memberShipments,
		memberRank: claims.memberRank,
		memberArticles: claims.memberArticles,
		memberPoints: claims.memberPoints,
		memberLikes: claims.memberLikes,
		memberViews: claims.memberViews,
		memberWarnings: claims.memberWarnings,
		memberBlocks: claims.memberBlocks,
	});
};

export const logOut = () => {
	deleteStorage();
	deleteUserInfo();
	window.location.reload();
};

const deleteStorage = () => {
	localStorage.removeItem('accessToken');
	window.localStorage.setItem('logout', Date.now().toString());
	reconnectChatSocket();
	// the assistant conversation belongs to the member who is logging out
	assistantMessagesVar([]);
};

const deleteUserInfo = () => {
	userVar({
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
};
