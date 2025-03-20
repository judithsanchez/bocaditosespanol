/** @type {import('next').NextConfig} */
const nextConfig = {
	typescript: {
		ignoreBuildErrors: false, // Enables strict type checking
	},
	eslint: {
		ignoreDuringBuilds: true, // Skips linting during builds (optional)
	},
};

module.exports = nextConfig;
