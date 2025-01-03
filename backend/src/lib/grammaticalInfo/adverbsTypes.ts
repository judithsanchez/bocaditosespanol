export interface IAdverb {
	type:
		| 'manner'
		| 'time'
		| 'place'
		| 'degree'
		| 'affirmation'
		| 'negation'
		| 'interrogative'
		| 'exclamative'
		| 'doubt';
	usesMente?: boolean;
}
