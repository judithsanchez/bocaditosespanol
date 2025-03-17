import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import {ThemeProvider} from '@/components/ThemeContext'; // Not ThemeProvider.tsximport NavBar from '@/components/NavBar';
import StyledComponentsRegistry from '@/lib/registry';
import NavBar from '@/components/NavBar';

// Import fonts
const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

// Add metadata
export const metadata: Metadata = {
	title: 'Bocaditos de Español',
	description: 'Learn Spanish in Small Bites!',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
	return (
		<html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
			<body>
				<StyledComponentsRegistry>
					<ThemeProvider>
						<NavBar />
						{children}
					</ThemeProvider>
				</StyledComponentsRegistry>
			</body>
		</html>
	);
}
