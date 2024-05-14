import * as songsData from '../data/songs/songs.json';
import {TextProcessor} from './TextProcessor';

const laCamisaNegra = new TextProcessor(songsData[0].lyrics);
console.log(laCamisaNegra.processedText[0]);
console.log(laCamisaNegra.processedText[0].tokens);
