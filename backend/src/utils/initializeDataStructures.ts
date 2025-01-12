import {writeFile, mkdir} from 'fs/promises';
import {existsSync} from 'fs';
import {ISentence, ISong} from '../../../lib/types';
import {Logger} from './Logger';

const initialStructures = {
	songs: [] as ISong[],
	sentences: [] as ISentence[],
	tokens: {
		words: {
			nouns: {},
			verbs: {},
			adjectives: {},
			adverbs: {},
			pronouns: {},
			determiners: {},
			articles: {},
			prepositions: {},
			conjunctions: {},
			interjections: {},
			numerals: {},
		},
		punctuationSigns: {},
		emojis: {},
	},
};

export async function initializeDataStructures() {
	const logger = new Logger('DataInitializer');
	logger.start('initializeDataStructures');

	try {
		const dataDir = 'data';

		logger.info('Checking data directory', {path: dataDir});
		if (!existsSync(dataDir)) {
			logger.info('Creating data directory');
			await mkdir(dataDir, {recursive: true});
		}

		const files = [
			{name: 'songs.json', content: initialStructures.songs},
			{name: 'sentences.json', content: initialStructures.sentences},
			{name: 'tokens.json', content: initialStructures.tokens},
		];

		for (const file of files) {
			const filePath = `${dataDir}/${file.name}`;
			logger.info('Processing file', {filePath});

			if (!existsSync(filePath)) {
				await writeFile(filePath, JSON.stringify(file.content, null, 2));
				logger.info('Created file with initial structure', {
					fileName: file.name,
				});
			}
		}

		logger.end('initializeDataStructures');
	} catch (error) {
		logger.error('Failed to initialize data structures', error);
		throw error;
	}
}
