/**
 * API endpoints, inlined into the client bundle at build time.
 * Production: NEXT_PUBLIC_API_URL=https://api.<domain>/graphql, NEXT_PUBLIC_API_WS=wss://api.<domain>
 * The legacy REACT_APP_* names still work as a fallback for existing local .env files.
 */
const API_GRAPHQL_URL =
	process.env.NEXT_PUBLIC_API_URL ||
	process.env.NEXT_PUBLIC_API_GRAPHQL_URL ||
	process.env.REACT_APP_API_GRAPHQL_URL ||
	'http://localhost:3007/graphql';
const API_WS = process.env.NEXT_PUBLIC_API_WS || process.env.REACT_APP_API_WS || 'ws://localhost:3007';
/** server origin for uploaded files (images), i.e. the GraphQL URL without /graphql */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
	? API_GRAPHQL_URL.replace(/\/graphql\/?$/, '')
	: process.env.REACT_APP_API_URL || API_GRAPHQL_URL.replace(/\/graphql\/?$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
	},
	env: {
		REACT_APP_API_URL: API_BASE_URL,
		REACT_APP_API_GRAPHQL_URL: API_GRAPHQL_URL,
		REACT_APP_API_WS: API_WS,
	},
};

const { i18n } = require('./next-i18next.config');
nextConfig.i18n = i18n;

module.exports = nextConfig;
