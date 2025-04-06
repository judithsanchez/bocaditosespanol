import {ContentType} from '@/lib/types/content';
import {ContentProcessingContext} from '@/lib/pipelines/ContentProcessingPipeline';
import {ISentence} from '@/lib/types/sentence';

export const badBunnySongLyrics = `Otro sunset bonito que veo en San Juan. Disfrutando de todas esas cosas que extrañan los que se van. Disfrutando de noches de esas que ya no se dan. Que ya no se dan. Pero queriendo volver a la última vez. Y a los ojos te miré. Y contarte las cosas que no te conté. Te pareces a mi crush, jaja. Y tirarte las fotos que no te tiré. Muchacho, jurado te ves bien linda, déjame tirarte una foto. Ey, tengo el pecho pelado, me dio una matada. El corazón dándome patadas. Dime, baby, ¿dónde tú estás? Para llegarle con Roro, Julito, Cristal. Roy, Edgar, Seba, Óscar, Dalnelly, Big J, tocando batá. Hoy la calle la dejamos desbaratá. Y sería cabrón que tú me toques el güiro. Yo veo tu nombre y me salen suspiro. No sé si son petardos o si son tiros. Mi blanquita, perico, mi kilo. Yo estoy en PR, tranquilo, pero. Debí tirar más fotos de cuando te tuve. Debí darte más besos y abrazos las veces que pude. Ey, ojalá que los míos nunca se muden. Y si hoy me emborracho, pues que me ayuden. Debí tirar más fotos de cuando te tuve. Debí darte más besos y abrazos las veces que pude. Ojalá que los míos nunca se muden. Y si hoy me emborracho, pues que me ayuden. Ey, hoy voy a estar con abuelo todo el día, jugando dominó. Si me pregunta si aún pienso en ti, yo le digo que no. Que mi estadía cerquita de ti ya se terminó. Ya se terminó. Ey, que prendan la máquina, voy para Santurce. Aquí todavía se da caña. Chequéate las babies, diablo, mami, qué dulce. Hoy yo quiero beber, beber, beber. Y hablar mierda hasta que me expulsen. Estoy bien loco, estoy bien loco, estoy bien loco, estoy bien loco. Cabrón, guía tú, que, hasta caminando, yo estoy que choco. Estoy bien loco, estoy bien loco, estoy bien loco, estoy bien loco. Vamos a disfrutar, que nunca se sabe si nos queda poco. Debí tirar más... Gente, los quiero con cojones, los amo. Gracias por estar aquí, de verdad. Para mí, es bien importante que estén aquí. Cada uno de ustedes significa mucho para mí. Así que, vamos para la foto, vengan para acá. Métase todo el mundo, todo el corillo, vamos. Zumba. Ya Bernie tiene el nene y Jan, la nena. Ya no estamos para la movie y las cadenas. Estamos para las cosas que valgan la pena. Ey, para el perreo, la salsa, la bomba y la plena. Chequéate la mía cómo es que suena. Debí tirar más fotos de cuando te tuve. Debí darte más besos y abrazos las veces que pude. Ojalá que los míos nunca se muden. Y que tú me envíes más nudes. Y si hoy me emborracho, que Vero me ayude.`;

// Sample formatted sentences that would be produced by SentenceFormatterStep
export const formattedBadBunnySentences: ISentence[] = [
	{
		sentenceId: 'sentence-bad-bunny-dtmf-1',
		content: 'Otro sunset bonito que veo en San Juan.',
		translations: {
			english: {
				literal: '',
				contextual: '',
			},
		},
		tokenIds: [],
	},
	{
		sentenceId: 'sentence-bad-bunny-dtmf-2',
		content: 'Disfrutando de todas esas cosas que extrañan los que se van.',
		translations: {
			english: {
				literal: '',
				contextual: '',
			},
		},
		tokenIds: [],
	},
	{
		sentenceId: 'sentence-bad-bunny-dtmf-3',
		content: 'Disfrutando de noches de esas que ya no se dan.',
		translations: {
			english: {
				literal: '',
				contextual: '',
			},
		},
		tokenIds: [],
	},
];

// Sample sentences with simple content for specific test cases
export const simpleSentences: ISentence[] = [
	{
		sentenceId: 'sentence-simple-1',
		content: 'Hola mundo.',
		translations: {
			english: {
				literal: '',
				contextual: '',
			},
		},
		tokenIds: [],
	},
	{
		sentenceId: 'sentence-simple-2',
		content: '¡Buenos días!',
		translations: {
			english: {
				literal: '',
				contextual: '',
			},
		},
		tokenIds: [],
	},
];

export const createBadBunnySongContext = (): ContentProcessingContext => ({
	input: {
		contentType: ContentType.SONG,
		title: 'DtMF',
		genre: ['reggaeton', 'latin trap'],
		language: {
			main: 'spanish',
			variant: ['puerto rico'],
		},
		content: badBunnySongLyrics,
		source: 'https://www.youtube.com/watch?v=v9T_MGfzq7I',
		contributors: {
			main: 'Bad Bunny',
		},
	},
	sentences: {
		formatted: [],
		deduplicated: [],
		enriched: [],
	},
	tokens: {
		words: [],
		punctuationSigns: [],
		emojis: [],
		deduplicated: [],
		enriched: [],
	},
	contentType: ContentType.SONG,
});
// Create a context with pre-formatted sentences
export const createBadBunnySongContextWithFormattedSentences =
	(): ContentProcessingContext => {
		const context = createBadBunnySongContext();
		context.sentences.formatted = [...formattedBadBunnySentences];
		context.sentences.deduplicated = [...formattedBadBunnySentences];
		return context;
	};

// Create a context with simple sentences for specific test cases
export const createSimpleSentencesContext = (): ContentProcessingContext => {
	const context = createBadBunnySongContext();
	context.sentences.formatted = [...simpleSentences];
	context.sentences.deduplicated = [...simpleSentences];
	return context;
};
