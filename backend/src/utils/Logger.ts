export class Logger {
	private context: string;
	private startTime: number;
	private isClass: boolean;

	constructor(context: string, isClass: boolean = false) {
		this.context = context;
		this.startTime = Date.now();
		this.isClass = isClass;
	}

	start(functionName: string) {
		const separator = this.isClass ? '::' : '.';
		console.log(`
🚀 ${this.getTimestamp()} | ${this.context}${separator}${functionName}() started
------------------------------------------------------------`);
	}

	end(functionName: string) {
		const duration = Date.now() - this.startTime;
		const separator = this.isClass ? '::' : '.';
		console.log(`
✅ ${this.getTimestamp()} | ${
			this.context
		}${separator}${functionName}() completed
⏱️  Duration: ${duration}ms
------------------------------------------------------------`);
	}

	info(message: string, data?: Record<string, unknown>) {
		console.log(`
ℹ️  ${this.getTimestamp()} | ${this.context}
📝 ${message}
${data ? `📦 Data: ${JSON.stringify(data, null, 2)}` : ''}
------------------------------------------------------------`);
	}

	error(message: string, error: Error | unknown) {
		console.error(`
❌ ${this.getTimestamp()} | ${this.context}
💥 ${message}
🔍 Error: ${error instanceof Error ? error.message : String(error)}
${error instanceof Error && error.stack ? `📚 Stack: ${error.stack}` : ''}
------------------------------------------------------------`);
	}
	private getTimestamp(): string {
		return new Date().toISOString();
	}
}
