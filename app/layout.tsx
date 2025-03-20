import type {Metadata} from 'next';
import {Inter, Roboto_Mono} from 'next/font/google';
import './globals.css';
import {ThemeProvider} from '@/components/ThemeContext';
import StyledComponentsRegistry from '@/lib/registry';
import NavBar from '@/components/NavBar';
import {PageWrapper, MainContent} from '@/components/ui/StyledComponents';

// Import Google fonts
const inter = Inter({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const robotoMono = Roboto_Mono({
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
		<html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
			<body>
				<StyledComponentsRegistry>
					<ThemeProvider>
						<PageWrapper>
							<NavBar />
							<MainContent>{children}</MainContent>
						</PageWrapper>
					</ThemeProvider>
				</StyledComponentsRegistry>
			</body>
		</html>
	);
}
