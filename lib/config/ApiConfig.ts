const isLocalDev = process.env.NODE_ENV === 'development';
const baseUrl = isLocalDev
	? 'http://localhost:3000'
	: 'https://bocaditosespanol.github.io';

export const ApiConfig = {
	baseUrl,
	endpoints: {
		content: `${baseUrl}/api/content`,
		songs: `${baseUrl}/api/songs`,
		tokens: `${baseUrl}/api/tokens`,
	},
};
