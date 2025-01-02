import {MD3LightTheme, MD3DarkTheme} from 'react-native-paper';

export const lightTheme = {
	...MD3LightTheme,
	colors: {
		primary: '#47D8E0',
		onPrimary: '#FFFFFF',
		primaryContainer: '#C3F2F5',
		onPrimaryContainer: '#002F33',

		secondary: '#FA70B6',
		onSecondary: '#FFFFFF',
		secondaryContainer: '#FFD9E7',
		onSecondaryContainer: '#3D0021',

		tertiary: '#FDEA4E',
		onTertiary: '#403600',
		tertiaryContainer: '#FFF8BE',
		onTertiaryContainer: '#262000',

		error: '#B3261E',
		onError: '#FFFFFF',
		errorContainer: '#F9DEDC',
		onErrorContainer: '#410E0B',

		// Off-white background & surface
		background: '#FAFAFA',
		onBackground: '#1C1B1F',

		surface: '#FAFAFA',
		onSurface: '#1C1B1F',

		surfaceVariant: '#ECECEC',
		onSurfaceVariant: '#494949',

		outline: '#787878',
		outlineVariant: '#CFCFCF',

		shadow: '#000000',
		scrim: '#000000',
		backdrop: 'rgba(51, 47, 55, 0.4)',

		inverseSurface: '#313033',
		inverseOnSurface: '#F3EFF2',
		inversePrimary: '#74E6EB',

		surfaceDisabled: 'rgba(28, 27, 31, 0.12)',
		onSurfaceDisabled: 'rgba(28, 27, 31, 0.38)',

		elevation: {
			level0: 'transparent',
			level1: '#F6FCFD',
			level2: '#F0F7F8',
			level3: '#EAF2F3',
			level4: '#E8F0F1',
			level5: '#E4ECED',
		},
	},
};

export const darkTheme = {
	...MD3DarkTheme,
	colors: {
		/* BRAND (PRIMARY) -------------------------------------------------- */
		// In dark mode, we often lighten the brand color for text or icons.
		primary: '#71E3E9',
		onPrimary: '#00363A',
		primaryContainer: '#004F55',
		onPrimaryContainer: '#C3F2F5',

		/* SECONDARY -------------------------------------------------------- */
		// Lighter pink for text, deeper pink container.
		secondary: '#FA9ECD',
		onSecondary: '#4A002F',
		secondaryContainer: '#6D1047',
		onSecondaryContainer: '#FFD9E7',

		/* TERTIARY --------------------------------------------------------- */
		tertiary: '#FEEE86',
		onTertiary: '#3F3600',
		tertiaryContainer: '#5B4F00',
		onTertiaryContainer: '#FFF8BE',

		/* ERROR ------------------------------------------------------------ */
		error: '#F2B8B5',
		onError: '#601410',
		errorContainer: '#8C1D18',
		onErrorContainer: '#F9DEDC',

		/* NEUTRALS (BACKGROUND, SURFACE) ----------------------------------- */
		background: '#1C1B1F',
		onBackground: '#E5E1E6',

		surface: '#1C1B1F',
		onSurface: '#E5E1E6',
		surfaceVariant: '#464649',
		onSurfaceVariant: '#CAC9CD',

		outline: '#908E98',
		outlineVariant: '#5B5B5F',

		shadow: '#000000',
		scrim: '#000000',
		backdrop: 'rgba(51, 47, 55, 0.4)',

		/* "INVERSE" COLORS ------------------------------------------------- */
		inverseSurface: '#E5E1E6',
		inverseOnSurface: '#303033',
		inversePrimary: '#47D8E0', // brand teal on deeper surfaces

		/* DISABLED STATES -------------------------------------------------- */
		surfaceDisabled: 'rgba(229, 225, 230, 0.12)',
		onSurfaceDisabled: 'rgba(229, 225, 230, 0.38)',

		/* OPTIONAL ELEVATION SHADES (for MD3) ------------------------------ */
		elevation: {
			level0: 'transparent',
			level1: '#242427',
			level2: '#29292C',
			level3: '#2E2E31',
			level4: '#303034',
			level5: '#333337',
		},
	},
};
