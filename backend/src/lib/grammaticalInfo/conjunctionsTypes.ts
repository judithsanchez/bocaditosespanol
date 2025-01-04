export enum ConjunctionType {
	coordinating = 'coordinating',
	subordinating = 'subordinating',
}

export enum ConjunctionFunction {
	additive = 'additive',
	adversative = 'adversative',
	disjunctive = 'disjunctive',
	causal = 'causal',
	temporal = 'temporal',
	conditional = 'conditional',
	concessive = 'concessive',
	consecutive = 'consecutive',
	comparative = 'comparative',
	final = 'final',
	modal = 'modal',
}

export interface IConjunction {
	conjunctionType: ConjunctionType;
	conjunctionFunction: ConjunctionFunction;
}
