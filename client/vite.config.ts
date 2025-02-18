import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@bocaditosespanol/shared': path.resolve(__dirname, '../shared/dist'),
			'@types': path.resolve(__dirname, './src/types'),
		},
	},
});
