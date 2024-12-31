module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	transformIgnorePatterns: ['/node_modules/', '\\.pnp\\.[^\\/]+$'],
	moduleNameMapper: {
		'^@utils/(.*)$': '<rootDir>/src/utils/$1',
	},
	moduleFileExtensions: ['js', 'ts', 'json', 'node'],
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
	moduleDirectories: ['node_modules', 'src'],
	testRegex: ['(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$'],
	testPathIgnorePatterns: ['/node_modules/', '/public/'],
	bail: 0,
	verbose: false,
};
