export const API_URL =
	process.env.NODE_ENV === 'development'
		? 'http://localhost:3000'
		: 'https://bocaditosespanol-backend.vercel.app';
