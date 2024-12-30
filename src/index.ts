import {paragraphSplitter} from './utils/paragraphSplitter';
import {TextProcessor} from './utils/TextProcessor';
import {ISentence} from './lib/types';
import {tokenizeSentences} from './utils/tokenizeSentences';
import {saveProcessedText} from './utils/saveProcessedText';

const laJumpa = `A ella no le gusta el reguetón, pero le encanta cómo canta la sensación. No fue mi intención, quedarme con toda la atención. Vivo en una mansión y no me sé ni la dirección. Está cabrón, muy cabrón. Papi Arca, pídanme la bendición. Joder,tío. Mi casa es un hotel y se ve cabrona la vista, hermoso. En ella puedo aterrizar un avión, solo me falta la pista. Imposible que falle esta combinación de flow, con ensalada mixta. Palomo, no insistas. Cuando se habla de grandeza, no estás en la lista. Neverland, los desmonto como Legoland. Y si yo te señalo, lo mío te lo dan. Y vas para adentro, pero de la van. Del cuello para arriba hace mucho frío. Yo llego y cae nieve en el caserío. Dejando sin regalo a estos malparíos. Santa Claus, con la esencia del Grinch metío. Y yo la vi, anda con dos. La amiga me miró. Al VIP se pegó. Claro que sí, claro que entró. Hola, mi nombre es Arcángel, un gusto, un placer. Hoy tú te vas con una leyenda que no va a volver a nacer. Y ya la vi, anda con dos. La amiga me miró. Al VIP se pegó. Claro que sí, claro que entró. Hola, mi nombre es Bad Bunny, un gusto, un placer. Aprovéchame hoy, que obligao no me vuelves a ver. Tu baby quiere que la rompa. Luka, step back, la jumpa. Tú estás loco por vender el alma, pero ni el diablo te la compra. Yo no tengo compe, pregúntaselo a tu compa. Todo el mundo ya sabe, por eso Bad Bunny ni ronca. A mí me escuchan las abuelas y sus nietecitos maleantes. Tiradores y estudiantes. Doctores y gánsters. Natural y con implante. Los adultos y los infantes. En Barcelona y Alicante. En Santurce y Almirante. Cruzando la calle con los Beatles. Damian Lillard y otro buzzer beater. El que quiera, que me tire. Otra cosa es que yo mire. Yo soy un pitcher, yo soy un pitcher. Y este es otro juego que me voy no hitter. Vengo de PR, tierra de Clemente. A mí sin cojones me tienen todos los Jeters. Los haters no salen, yo nunca los veo en la calle, para mí que ellos viven en Twitter. Okay, estoy ocupado haciendo dinero. So, no tengo tiempo pa cuidar mis hijos. Que ninguno cobra más de lo que cobra la babysitter. Papi, vámonos ya, quiero chingar. Okay, okay, dame un break. Te escupo la boca, te jalo el pelo. Te doy con el bicho y con el lelo. En el jet privado, un polvo en el cielo. Hoy quiero una puta, una modelo. Mami, chapéame, no me molestes. Que después yo te voy a romper con el nepe. Y ya le di a las dos. La amiga repitió. ¡Qué rico me lo mamó! En la boca de la otra se la echó. Hola, mi nombre es Benito, un gusto, un placer. Hoy chingaste con una leyenda que no va a volver a nacer. Y yo la vi, anda con dos. La amiga me miró. Al VIP se pegó. Claro que sí, claro que entró. Hola, mi nombre es Austin, un gusto, un placer. Estás escuchando a una leyenda que no va a volver a nacer, no. Probando. Señor Santos y el señor Martínez once again. El fenómeno. Arcángel. El que quiera, que me tire. Otra cosa es que yo mire. Yo soy un pitcher, yo soy un pitcher. Y este es otro juego que me voy no hitter. Vengo de PR, tierra de Clemente. A mí sin cojones me tienen todos los Jeters. Los haters no salen, yo nunca los veo en la calle, para mí que ellos viven en Twitter. Okay, estoy ocupado haciendo dinero. So, no tengo tiempo pa cuidar mis hijos. Que ninguno cobra más de lo que cobra la babysitter. Papi, vámonos ya, quiero chingar. Okay, okay, dame un break. Te escupo la boca, te jalo el pelo. Te doy con el bicho y con el lelo. En el jet privado, un polvo en el cielo. Hoy quiero una puta, una modelo. Mami, chapéame, no me molestes. Que después yo te voy a romper con el nepe. Y ya le di a las dos. La amiga repitió. ¡Qué rico me lo mamó! En la boca de la otra se la echó. Hola, mi nombre es Benito, un gusto, un placer. Hoy chingaste con una leyenda que no va a volver a nacer. Y yo la vi, anda con dos. La amiga me miró. Al VIP se pegó. Claro que sí, claro que entró. Hola, mi nombre es Austin, un gusto, un placer. Estás escuchando a una leyenda que no va a volver a nacer, no. Probando. Señor Santos y el señor Martínez once again. El fenómeno. Arcángel.`;

async function testTextProcessor() {
	console.log('🚀 Starting TextProcessor test');

	const processor = new TextProcessor(laJumpa);

	console.log('📝 Processing text data...');
	await processor.processTextData();

	console.log('💾 Saving to JSON...');
	const savedId = await processor.saveToJson('laJumpa');

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
