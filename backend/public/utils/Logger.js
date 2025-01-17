"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    constructor(context, isClass = false) {
        Object.defineProperty(this, "context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "startTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "isClass", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.context = context;
        this.startTime = Date.now();
        this.isClass = isClass;
    }
    start(functionName) {
        const separator = this.isClass ? '::' : '.';
        console.log(`
🚀 ${this.getTimestamp()} | ${this.context}${separator}${functionName}() started
------------------------------------------------------------`);
    }
    end(functionName) {
        const duration = Date.now() - this.startTime;
        const separator = this.isClass ? '::' : '.';
        console.log(`
✅ ${this.getTimestamp()} | ${this.context}${separator}${functionName}() completed
⏱️  Duration: ${duration}ms
------------------------------------------------------------`);
    }
    info(message, data) {
        console.log(`
ℹ️  ${this.getTimestamp()} | ${this.context}
📝 ${message}
${data ? `📦 Data: ${JSON.stringify(data, null, 2)}` : ''}
------------------------------------------------------------`);
    }
    error(message, error) {
        console.error(`
❌ ${this.getTimestamp()} | ${this.context}
💥 ${message}
🔍 Error: ${error instanceof Error ? error.message : String(error)}
${error instanceof Error && error.stack ? `📚 Stack: ${error.stack}` : ''}
------------------------------------------------------------`);
    }
    getTimestamp() {
        return new Date().toISOString();
    }
}
exports.Logger = Logger;
