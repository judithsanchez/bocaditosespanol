import {AddSongRequest} from '../../lib/types';

export const mockSongRequest: AddSongRequest = {
	title: 'Vivir Mi Vida',
	interpreter: 'Marc Anthony',
	feat: [],
	youtube: 'https://youtube.com/watch?v=YXnjy5YlDwk',
	genre: ['salsa'],
	language: 'es',
	releaseDate: '2013-07-23',
	lyrics:
		'Voy a reír, voy a bailar\nVivir mi vida lalalalá\nVoy a reír, voy a gozar\nVivir mi vida lalalalá',
};

export const expectedProcessedContext = {
	rawInput: mockSongRequest,
	sentences: {
		raw: mockSongRequest.lyrics,
		formatted: [
			{
				sentenceId: 'vivir-mi-vida-1',
				tokens: ['voy', 'a', 'reír', ',', 'voy', 'a', 'bailar'],
				originalText: 'Voy a reír, voy a bailar',
			},
		],
		originalSentencesIds: [
			'vivir-mi-vida-1',
			'vivir-mi-vida-2',
			'vivir-mi-vida-3',
			'vivir-mi-vida-4',
		],
		deduplicated: [],
		enriched: [],
	},
	tokens: {
		all: [],
		words: [],
		deduplicated: [],
		newTokens: [],
		enriched: [],
	},
	song: {
		songId: 'vivir-mi-vida-marc-anthony',
		metadata: {
			interpreter: 'Marc Anthony',
			feat: [],
			title: 'Vivir Mi Vida',
			youtube: 'https://youtube.com/watch?v=YXnjy5YlDwk',
			genre: 'Salsa',
			language: 'es',
			releaseDate: '2013-07-23',
		},
		lyrics: [
			'vivir-mi-vida-1',
			'vivir-mi-vida-2',
			'vivir-mi-vida-3',
			'vivir-mi-vida-4',
		],
		createdAt: expect.any(String),
		updatedAt: expect.any(String),
	},
};
