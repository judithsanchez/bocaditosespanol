export interface IConjunction {
	type: 'coordinating' | 'subordinating';
	function:
		| 'additive'
		| 'adversative'
		| 'disjunctive'
		| 'causal'
		| 'temporal'
		| 'conditional'
		| 'concessive'
		| 'consecutive'
		| 'comparative'
		| 'final'
		| 'modal';
}
