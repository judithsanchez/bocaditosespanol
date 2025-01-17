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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Logger_1 = require("./utils/Logger");
const SongProcessingPipeline_1 = require("./pipelines/SongProcessingPipeline");
const DatabaseService_1 = require("./services/DatabaseService");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const logger = new Logger_1.Logger('Server');
const pipeline = new SongProcessingPipeline_1.SongProcessingPipeline();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get('/', (_req, res) => {
    res.send('Hola hola caracolas!');
});
app.post('/songs', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger.start('postSong');
    try {
        const result = yield pipeline.processText(req.body);
        logger.info('Song processed successfully', { songId: result.song.songId });
        res.status(201).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            logger.error('Failed to process song', error);
            res.status(400).json({ error: error.message });
        }
        else {
            logger.error('Unknown error occurred', error);
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
    logger.end('postSong');
}));
app.get('/songs', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger.start('getAllSongs');
    try {
        const dbService = new DatabaseService_1.DatabaseService();
        const textEntries = yield dbService.readFile('text-entries.json');
        const songs = textEntries.song || [];
        const simplifiedSongs = songs.map((song) => ({
            songId: song.songId,
            metadata: song.metadata,
        }));
        logger.info('Retrieved all songs metadata successfully', {
            count: simplifiedSongs.length,
        });
        res.status(200).json(simplifiedSongs);
    }
    catch (error) {
        if (error instanceof Error) {
            logger.error('Failed to retrieve songs metadata', error);
            res.status(400).json({ error: error.message });
        }
        else {
            logger.error('Unknown error occurred', error);
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
    logger.end('getAllSongs');
}));
app.get('/songs/:songId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger.start('getSong');
    try {
        const songId = req.params.songId;
        const dbService = new DatabaseService_1.DatabaseService();
        const textEntries = yield dbService.readFile('text-entries.json');
        const songEntry = textEntries.song.find((entry) => entry.songId === songId);
        if (!songEntry) {
            res.status(404).json({ error: 'Song not found' });
            return;
        }
        const allSentences = yield dbService.readFile('sentences.json');
        const songSentences = allSentences[songId];
        const allTokens = yield dbService.getTokens();
        const tokenMap = new Map(allTokens.map(token => [token.tokenId, token]));
        const orderedSentences = songEntry.lyrics.map((sentenceId) => {
            const sentence = songSentences.find((s) => s.sentenceId === sentenceId);
            return {
                content: sentence.content,
                sentenceId: sentence.sentenceId,
                tokenIds: sentence.tokenIds,
                translations: sentence.translations,
                tokens: sentence.tokenIds.map((tokenId) => tokenMap.get(tokenId)),
            };
        });
        // Create enhanced response object with both metadata and sentences
        const response = {
            metadata: songEntry.metadata,
            sentences: orderedSentences,
        };
        logger.info('Song data retrieved successfully', { songId });
        res.status(200).json(response);
    }
    catch (error) {
        if (error instanceof Error) {
            logger.error('Failed to retrieve song data', error);
            res.status(400).json({ error: error.message });
        }
        else {
            logger.error('Unknown error occurred', error);
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
    logger.end('getSong');
}));
app.listen(port, () => {
    logger.info('Server started', { port });
});
