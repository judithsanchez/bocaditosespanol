import Admin from '../../pages/Admin';
import HomePage from '../../pages/Home';
import SongsPage from '../../pages/Songs';
import VideosPage from '../../pages/Videos';
import {PageSection} from './types';

export const pagePageSections: PageSection[] = [
	{
		label: 'Home',
		path: '/',
		component: HomePage,
		isPublic: true,
	},
	{
		label: 'Songs',
		path: '/songs',
		component: SongsPage,
		isPublic: true,
	},
	{
		label: 'Videos',
		path: '/videos',
		component: VideosPage,
		isPublic: true,
	},
	{
		label: 'Admin',
		path: '/admin',
		component: Admin,
		isPublic: false,
	},
];

export const assets = {
	light: {
		darkThemeButton:
			'https://cdn.bfldr.com/Z0BJ31FP/at/r9vn7sx7x3mg5tww6gshsvt/button-to-dark-mode.svg',
		darkThemeButtonAlt: 'Switch to dark mode',
		logo: 'https://cdn.bfldr.com/Z0BJ31FP/at/ggx73vmcsmrspvt9fb8wg5kc/logo-main-grey.svg',
	},
	dark: {
		lightthemeButton:
			'https://cdn.bfldr.com/Z0BJ31FP/at/k87sm4jtprcnv89f7fq4nqv/button-to-light-mode.svg',
		lightThemeButtonAlt: 'Switch to light mode',
		logo: 'https://cdn.bfldr.com/Z0BJ31FP/at/7bq35cg9mzk7bngwjnt645w/logo-main-white.svg',
	},
	logoAlt: 'Logo',
};

export const textAndTranslation = {
	css: {
		container: 'textAndTranslation',
		tokens: 'tokens',
		token: 'token',
		englishToken: 'englishToken',
		hoveredEnglishToken: 'hoveredEnglishToken',
		spanishToken: 'spanishToken',
		hoveredSpanishToken: 'hoveredSpanishToken',
	},
};
