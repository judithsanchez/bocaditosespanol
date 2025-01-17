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
exports.batchProcessor = void 0;
const constants_1 = require("../lib/constants");
const Logger_1 = require("./Logger");
function batchProcessor(_a) {
    return __awaiter(this, arguments, void 0, function* ({ items, processingFn, batchSize, options, }) {
        const logger = new Logger_1.Logger('BatchProcessor');
        logger.start('batchProcessor');
        if (batchSize <= 0) {
            logger.error('Invalid batch size', new Error(constants_1.errors.batchProcessing.invalidBatchSize));
            throw new Error(constants_1.errors.batchProcessing.invalidBatchSize);
        }
        if (items.length === 0) {
            logger.error('Empty batch provided', new Error(constants_1.errors.batchProcessing.emptyBatch));
            throw new Error(constants_1.errors.batchProcessing.emptyBatch);
        }
        const results = [];
        const totalBatches = Math.ceil(items.length / batchSize);
        logger.info('Batch processing configuration', {
            totalItems: items.length,
            batchSize,
            totalBatches,
            retryAttempts: options.retryAttempts,
            delayBetweenBatches: options.delayBetweenBatches,
        });
        for (let i = 0; i < items.length; i += batchSize) {
            const currentBatch = Math.floor(i / batchSize) + 1;
            const batch = items.slice(i, i + batchSize);
            logger.info('Processing batch', {
                batchNumber: currentBatch,
                totalBatches,
                batchSize: batch.length,
                startIndex: i,
                endIndex: i + batch.length,
            });
            let attempts = 0;
            while (attempts < options.retryAttempts) {
                try {
                    logger.info('Batch attempt', {
                        attempt: attempts + 1,
                        maxAttempts: options.retryAttempts,
                    });
                    const batchResults = yield processingFn(batch);
                    logger.info('Batch processed successfully', {
                        batchNumber: currentBatch,
                        resultsCount: batchResults.length,
                    });
                    results.push(...batchResults);
                    break;
                }
                catch (error) {
                    attempts++;
                    logger.error(`Batch ${currentBatch} processing failed`, error);
                    if (attempts === options.retryAttempts) {
                        logger.error('Retry limit exceeded', new Error(`${constants_1.errors.batchProcessing.retryLimitExceeded} ${currentBatch}`));
                        throw new Error(`${constants_1.errors.batchProcessing.retryLimitExceeded} ${currentBatch}`);
                    }
                    if (error instanceof Error && error.message.includes('RATE_LIMITED')) {
                        logger.error('Rate limit exceeded', error);
                    }
                    logger.info('Retrying batch', {
                        delay: options.delayBetweenBatches,
                        nextAttempt: attempts + 1,
                    });
                    yield new Promise(resolve => setTimeout(resolve, options.delayBetweenBatches));
                }
            }
            if (i + batchSize < items.length) {
                logger.info('Batch cooldown', {
                    delay: options.delayBetweenBatches,
                });
                yield new Promise(resolve => setTimeout(resolve, options.delayBetweenBatches));
            }
        }
        logger.info('Batch processing completed', {
            totalProcessed: results.length,
            originalCount: items.length,
            timestamp: new Date().toISOString(),
        });
        logger.end('batchProcessor');
        return results;
    });
}
exports.batchProcessor = batchProcessor;
