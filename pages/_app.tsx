import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React, { useState } from 'react';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { light } from '../scss/MaterialTheme';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';
import '../scss/tailwind.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], display: 'swap' });

const App = ({ Component, pageProps }: AppProps) => {
	// @ts-ignore
	const [theme, setTheme] = useState(createTheme(light));
	const client = useApollo(pageProps.initialApolloState);

	return (
		<ApolloProvider client={client}>
			{/* Font variables on :root so MUI portals (menus, dialogs) and Tailwind both pick them up */}
			<style jsx global>{`
				:root {
					--font-inter: ${inter.style.fontFamily};
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
