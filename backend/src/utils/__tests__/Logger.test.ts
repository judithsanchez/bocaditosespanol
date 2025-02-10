import {Logger} from '../Logger';

describe('Logger', () => {
	let consoleSpy: jest.SpyInstance;
	let logger: Logger;

	beforeEach(() => {
		consoleSpy = jest.spyOn(console, 'log').mockImplementation();
		jest.spyOn(console, 'error').mockImplementation();
		logger = new Logger('TestContext');
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('should log start message correctly', () => {
		logger.start('testFunction');
		expect(consoleSpy).toHaveBeenCalled();
		const logMessage = consoleSpy.mock.calls[0][0];
		expect(logMessage).toContain('TestContext.testFunction() started');
	});

	it('should log end message with duration', () => {
		logger.end('testFunction');
		expect(consoleSpy).toHaveBeenCalled();
		const logMessage = consoleSpy.mock.calls[0][0];
		expect(logMessage).toContain('TestContext.testFunction() completed');
		expect(logMessage).toContain('Duration:');
	});

	it('should log info message with data', () => {
		const testData = {key: 'value'};
		logger.info('Test message', testData);
		expect(consoleSpy).toHaveBeenCalled();
		const logMessage = consoleSpy.mock.calls[0][0];
		expect(logMessage).toContain('Test message');
		expect(logMessage).toContain(JSON.stringify(testData, null, 2));
	});

	it('should log error message correctly', () => {
		const errorSpy = jest.spyOn(console, 'error');
		const testError = new Error('Test error');
		logger.error('Error occurred', testError);
		expect(errorSpy).toHaveBeenCalled();
		const errorMessage = errorSpy.mock.calls[0][0];
		expect(errorMessage).toContain('Error occurred');
		expect(errorMessage).toContain('Test error');
	});
});
