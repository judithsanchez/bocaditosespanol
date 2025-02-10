import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
import path from 'path';

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@shared': path.resolve(__dirname, './shared'),
			'@client': path.resolve(__dirname, './client/src'),
			'@backend': path.resolve(__dirname, './backend/src'),
		},
	},
});
