export interface IPreposition {
	type: 'simple' | 'compound' | 'locution';
	contractsWith?: 'article' | 'pronoun';
}
