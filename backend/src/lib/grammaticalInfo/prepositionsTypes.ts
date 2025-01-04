export enum PrepositionType {
	Simple = 'simple',
	Compound = 'compound',
	Locution = 'locution',
}

export enum ContractsWith {
	Article = 'article',
	Pronoun = 'pronoun',
}

export interface IPreposition {
	prepositionType: PrepositionType | '';
	contractsWith?: ContractsWith | '';
}
