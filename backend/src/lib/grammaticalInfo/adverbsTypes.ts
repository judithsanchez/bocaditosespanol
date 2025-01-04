export enum AdverbType {
	Manner = 'manner',
	Time = 'time',
	Place = 'place',
	Degree = 'degree',
	Affirmation = 'affirmation',
	Negation = 'negation',
	Interrogative = 'interrogative',
	Exclamative = 'exclamative',
	Doubt = 'doubt',
}

export interface IAdverb {
	adverbType: AdverbType | '';
	usesMente?: boolean | '';
}
