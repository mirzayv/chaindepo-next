import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React, { useMemo } from 'react';
import { Inter, JetBrains_Mono, Manrope } from 'next/font/google';
import { dark, light } from '../scss/MaterialTheme';
import useColorMode from '../libs/hooks/useColorMode';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import '../scss/theme.css';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';
import '../scss/tailwind.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], display: 'swap' });
// display + UI font for the Tailwind pages (geometric, close to the Gilroy look); MUI pages keep Inter
const manrope = Manrope({ subsets: ['latin'], weight: ['500', '600', '700', '800'], display: 'swap' });

const App = ({ Component, pageProps }: AppProps) => {
	// MUI follows the same light/dark switch as Tailwind (class on <html>, see useColorMode)
	const { mode } = useColorMode();
	// @ts-ignore
	const theme = useMemo(() => createTheme(mode === 'dark' ? dark : light), [mode]);
	const client = useApollo(pageProps.initialApolloState);

	return (
		<ApolloProvider client={client}>
			{/* viewport-fit=cover makes env(safe-area-inset-*) report the iOS home-indicator / toolbar insets */}
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
			</Head>
			{/* Font variables on :root so MUI portals (menus, dialogs) and Tailwind both pick them up */}
			<style jsx global>{`
				:root {
					--font-inter: ${inter.style.fontFamily};
					--font-sans: ${manrope.style.fontFamily};
					--font-mono: ${jetbrainsMono.style.fontFamily};
				}
			`}</style>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Component {...pageProps} />
			</ThemeProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App);
