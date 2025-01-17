"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pipeline = void 0;
const Logger_1 = require("../utils/Logger");
class Pipeline {
    constructor(options, initialSteps) {
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: options
        });
        Object.defineProperty(this, "steps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "logger", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.logger = new Logger_1.Logger(`Pipeline:${options.name}`);
        if (initialSteps) {
            this.steps = initialSteps;
        }
    }
    addStep(step) {
        this.steps.push(step);
        return this;
    }
    process(input) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.start('process');
            let currentData = input;
            for (const [index, step] of this.steps.entries()) {
                try {
                    this.logger.info(`Executing step ${index + 1}/${this.steps.length}`);
                    currentData = yield step.process(currentData);
                }
                catch (error) {
                    this.logger.error(`Step ${index + 1} failed`, error);
                    if (this.options.stopOnError) {
                        throw error;
                    }
                }
            }
            this.logger.info('Pipeline completed successfully');
            this.logger.end('process');
            return currentData;
        });
    }
    getStepCount() {
        return this.steps.length;
    }
    reset() {
        this.steps = [];
        this.logger.info('Pipeline reset');
    }
}
exports.Pipeline = Pipeline;
