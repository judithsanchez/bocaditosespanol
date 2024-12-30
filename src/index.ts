import {paragraphSplitter} from './utils/paragraphSplitter';
import {TextProcessor} from './utils/TextProcessor';
import {ISentence} from './lib/types';
import {tokenizeSentences} from './utils/tokenizeSentences';
import {saveProcessedText} from './utils/saveProcessedText';

const buenosAires =
	"¿Quién te crees tú? Para controlarme todo el dia. Solo te di las llaves de mi casa, no las de mi vida. Por qué crees tú que si te vas yo me quedo sin nada. Baja de esa nube que yo estaba bien antes que tú llegaras. Te vendiste bien para que yo te bancara. No la falló mi tía cuando me decía que esto no duraba. Aunque te quiero, me hiciste daño. Dormimos juntos pero somos dos extraños. Tú me querías ¿Qué te ha pasado? Si así es tu amor mejor voy viendo para otro lado. Y aunque te quiero, me hiciste daño. Dormimos juntos pero somos dos extraño. Tú me querías. ¿Qué te ha pasado? No seré tu animalito domesticado. Si así es tu amor, mejor me voy, me voy para el carajo. Te quise, te quiero. Me quedó el amor en cero. Que en verdad tu me importabas pero me puse primero. Y yo no soy así como me vestí. ¿Para qué impresionarte fallándome a mi? Para lo nuestro ya es muy tarde. Necesito nuevos aires. No, no soy así y aunque te perdí. Volví a ser más yo desde que me fui. Te vendiste bien pa' que yo te bancara. No la falló mi tía cuando me decía que esto no duraba. Aunque te quiero, me hiciste daño. Dormimos juntos pero somos dos extraños. Tú me querías. ¿Qué te ha pasado? Si así es tu amor mejor voy viendo para otro lado. Y Aunque te quiero, me hiciste daño. Dormimos juntos pero somos dos extraños. Tú me querías. ¿Qué te ha pasado? No seré tu animalito domesticado. Si así es tu amor, mejor me voy, me voy para el carajo.";

async function testTextProcessor() {
	console.log('🚀 Starting TextProcessor test');

	const processor = new TextProcessor(buenosAires);

	console.log('📝 Processing text data...');
	await processor.processTextData();

	console.log('💾 Saving to JSON...');
	const savedId = await processor.saveToJson('buenos-aires');

	console.log('✅ Test completed!');
	console.log('📁 Saved with ID:', savedId);
}

testTextProcessor();

// async function testTextProcessorWithoutAPI() {
// 	console.log('🚀 Starting TextProcessor test (preprocessing only)');

// 	const processor = new TextProcessor(laJumpa2);

// 	// Get preprocessed sentences
// 	const splittedParagraph = paragraphSplitter(processor.textData);
// 	const tokenizedText: ISentence[] = splittedParagraph.map(sentence =>
// 		tokenizeSentences(sentence),
// 	);

// 	// Save directly to JSON
// 	const savedId = await saveProcessedText(
// 		tokenizedText,
// 		'src/data',
// 		'preprocessed-la-jumpa.json',
// 	);

// 	console.log('✅ Test completed!');
// 	console.log('📁 Saved preprocessed text with ID:', savedId);

// 	// Optional: log the structure
// 	console.log(
// 		'📝 Generated structure:',
// 		JSON.stringify(tokenizedText, null, 2),
// 	);
// }

// testTextProcessorWithoutAPI();
