import {SchemaType} from '@google/generative-ai';
import {
	AdverbType,
	ArticleType,
	ConjunctionFunction,
	ConjunctionType,
	ContractsWith,
	DeterminerType,
	IAdjective,
	INoun,
	InterjectionEmotion,
	InterjectionType,
	IVerb,
	NumeralType,
	PrepositionType,
	PronounCase,
	PronounType,
	VerbClass,
	VerbMood,
	VerbRegularity,
	VerbTense,
	VerbVoice,
} from '@/lib/types/partsOfSpeech';
import {
	GrammaticalGender,
	GrammaticalNumber,
	GrammaticalPerson,
} from '@/lib/types/common';

type SchemaProperties = {
	[K in keyof (IAdjective & INoun)]?: boolean;
};

export class PartOfSpeechSchemaFactory {
	static createAdjectiveSchema(
		properties: Partial<Record<keyof IAdjective, boolean>> = {
			gender: true,
			number: true,
			isPastParticiple: true,
		},
	) {
		return PartOfSpeechSchemaFactory.createSchema(properties);
	}

	static createNounSchema(
		properties: Partial<Record<keyof INoun, boolean>> = {
			gender: true,
			number: true,
			isProperNoun: true,
			diminutive: true,
		},
	) {
		return PartOfSpeechSchemaFactory.createSchema(properties);
	}

	static createVerbSchema(
		properties: Partial<Record<keyof IVerb, boolean>> = {
			tense: true,
			mood: true,
			person: true,
			number: true,
			isRegular: true,
			infinitive: true,
			voice: true,
			verbClass: true,
			gerund: true,
			pastParticiple: true,
			verbRegularity: true,
			isReflexive: true,
		},
	) {
		return {
			type: SchemaType.ARRAY,
			items: {
				type: SchemaType.OBJECT,
				properties: {
					tokenId: {type: SchemaType.STRING},
					content: {type: SchemaType.STRING},
					grammaticalInfo: {
						type: SchemaType.OBJECT,
						properties: {
							tense: {
								type: SchemaType.ARRAY,
								items: {
									type: SchemaType.STRING,
									enum: Object.values(VerbTense),
								},
							},
							mood: {type: SchemaType.STRING, enum: Object.values(VerbMood)},
							person: {
								type: SchemaType.ARRAY,
								items: {
									type: SchemaType.STRING,
									enum: Object.values(GrammaticalPerson),
								},
							},
							number: {type: SchemaType.STRING},
							isRegular: {type: SchemaType.BOOLEAN},
							infinitive: {type: SchemaType.STRING},
							voice: {type: SchemaType.STRING, enum: Object.values(VerbVoice)},
							verbClass: {
								type: SchemaType.STRING,
								enum: Object.values(VerbClass),
							},
							gerund: {type: SchemaType.BOOLEAN},
							pastParticiple: {type: SchemaType.BOOLEAN},
							verbRegularity: {
								type: SchemaType.STRING,
								enum: Object.values(VerbRegularity),
							},
							isReflexive: {type: SchemaType.BOOLEAN},
						},
						required: Object.keys(properties),
					},
				},
				required: ['tokenId', 'content', 'grammaticalInfo'],
			},
		};
	}

	static createAdverbSchema() {
		return {
			type: SchemaType.ARRAY,
			items: {
				type: SchemaType.OBJECT,
				properties: {
					tokenId: {type: SchemaType.STRING},
					content: {type: SchemaType.STRING},
					grammaticalInfo: {
						type: SchemaType.OBJECT,
						properties: {
							adverbType: {
								type: SchemaType.STRING,
								enum: Object.values(AdverbType),
							},
							usesMente: {type: SchemaType.BOOLEAN},
						},
						required: ['adverbType', 'usesMente'],
					},
				},
				required: ['tokenId', 'content', 'grammaticalInfo'],
			},
		};
	}

	static createArticleSchema() {
		return {
			type: SchemaType.ARRAY,
			items: {
				type: SchemaType.OBJECT,
				properties: {
					tokenId: {type: SchemaType.STRING},
					content: {type: SchemaType.STRING},
					grammaticalInfo: {
						type: SchemaType.OBJECT,
						properties: {
							articleType: {
								type: SchemaType.STRING,
								enum: Object.values(ArticleType),
							},
							gender: {
								type: SchemaType.STRING,
								enum: Object.values(GrammaticalGender),
							},
							number: {
								type: SchemaType.STRING,
								enum: Object.values(GrammaticalNumber),
							},
						},
						required: ['articleType', 'gender', 'number'],
					},
				},
				required: ['tokenId', 'content', 'grammaticalInfo'],
			},
		};
	}

	static createNumeralSchema() {
		return {
			type: SchemaType.ARRAY,
			items: {
				type: SchemaType.OBJECT,
				properties: {
					tokenId: {type: SchemaType.STRING},
					content: {type: SchemaType.STRING},
					grammaticalInfo: {
						type: SchemaType.OBJECT,
						properties: {
							numeralType: {
								type: SchemaType.STRING,
								enum: Object.values(NumeralType),
							},
							gender: {
								type: SchemaType.STRING,
								enum: Object.values(GrammaticalGender),
							},
							number: {
								type: SchemaType.STRING,
								enum: Object.values(GrammaticalNumber),
							},
						},
						required: ['numeralType', 'gender', 'number'],
					},
				},
				required: ['tokenId', 'content', 'grammaticalInfo'],
			},
		};
	}

	static createPronounSchema() {
		return {
			type: SchemaType.ARRAY,
			items: {
				type: SchemaType.OBJECT,
				properties: {
					tokenId: {type: SchemaType.STRING},
					content: {type: SchemaType.STRING},
					grammaticalInfo: {
						type: SchemaType.OBJECT,
						properties: {
							pronounType: {
								type: SchemaType.STRING,
								enum: Object.values(PronounType),
							},
							person: {
								type: SchemaType.STRING,
								enum: Object.values(GrammaticalPerson),
							},
							gender: {
								type: SchemaType.STRING,
								enum: Object.values(GrammaticalGender),
							},
							number: {
								type: SchemaType.STRING,
								enum: Object.values(GrammaticalNumber),
							},
							case: {
								type: SchemaType.STRING,
								enum: Object.values(PronounCase),
							},
							isReflexive: {type: SchemaType.BOOLEAN},
							isReciprocal: {type: SchemaType.BOOLEAN},
						},
						required: [
							'pronounType',
							'person',
							'gender',
							'number',
							'case',
							'isReflexive',
							'isReciprocal',
						],
					},
				},
				required: ['tokenId', 'content', 'grammaticalInfo'],
			},
		};
	}

	static createDeterminerSchema() {
		return {
			type: SchemaType.ARRAY,
			items: {
				type: SchemaType.OBJECT,
				properties: {
					tokenId: {type: SchemaType.STRING},
					content: {type: SchemaType.STRING},
					grammaticalInfo: {
						type: SchemaType.OBJECT,
						properties: {
							determinerType: {
								type: SchemaType.STRING,
								enum: Object.values(DeterminerType),
							},
							gender: {
								type: SchemaType.STRING,
								enum: Object.values(GrammaticalGender),
							},
							number: {
								type: SchemaType.STRING,
								enum: Object.values(GrammaticalNumber),
							},
						},
						required: ['determinerType', 'gender', 'number'],
					},
				},
				required: ['tokenId', 'content', 'grammaticalInfo'],
			},
		};
	}

	static createConjunctionSchema() {
		return {
			type: SchemaType.ARRAY,
			items: {
				type: SchemaType.OBJECT,
				properties: {
					tokenId: {type: SchemaType.STRING},
					content: {type: SchemaType.STRING},
					grammaticalInfo: {
						type: SchemaType.OBJECT,
						properties: {
							conjunctionType: {
								type: SchemaType.STRING,
								enum: Object.values(ConjunctionType),
							},
							conjunctionFunction: {
								type: SchemaType.STRING,
								enum: Object.values(ConjunctionFunction),
							},
						},
						required: ['conjunctionType', 'conjunctionFunction'],
					},
				},
				required: ['tokenId', 'content', 'grammaticalInfo'],
			},
		};
	}

	static createPrepositionSchema() {
		return {
			type: SchemaType.ARRAY,
			items: {
				type: SchemaType.OBJECT,
				properties: {
					tokenId: {type: SchemaType.STRING},
					content: {type: SchemaType.STRING},
					grammaticalInfo: {
						type: SchemaType.OBJECT,
						properties: {
							prepositionType: {
								type: SchemaType.STRING,
								enum: Object.values(PrepositionType),
							},
							contractsWith: {
								type: SchemaType.STRING,
								enum: Object.values(ContractsWith),
							},
						},
						required: ['prepositionType', 'contractsWith'],
					},
				},
				required: ['tokenId', 'content', 'grammaticalInfo'],
			},
		};
	}

	static createInterjectionSchema() {
		return {
			type: SchemaType.ARRAY,
			items: {
				type: SchemaType.OBJECT,
				properties: {
					tokenId: {type: SchemaType.STRING},
					content: {type: SchemaType.STRING},
					grammaticalInfo: {
						type: SchemaType.OBJECT,
						properties: {
							interjectionEmotion: {
								type: SchemaType.STRING,
								enum: Object.values(InterjectionEmotion),
							},
							interjectionType: {
								type: SchemaType.STRING,
								enum: Object.values(InterjectionType),
							},
						},
						required: ['interjectionEmotion', 'interjectionType'],
					},
				},
				required: ['tokenId', 'content', 'grammaticalInfo'],
			},
		};
	}

	private static createSchema(properties: SchemaProperties) {
		const grammaticalInfoProps: Record<string, unknown> = {};

		if (properties.gender) {
			grammaticalInfoProps.gender = {
				type: SchemaType.STRING,
				enum: Object.values(GrammaticalGender),
			};
		}

		if (properties.number) {
			grammaticalInfoProps.number = {
				type: SchemaType.STRING,
				enum: Object.values(GrammaticalNumber),
			};
		}

		if (properties.isPastParticiple) {
			grammaticalInfoProps.isPastParticiple = {
				type: SchemaType.BOOLEAN,
			};
		}

		if (properties.isProperNoun) {
			grammaticalInfoProps.isProperNoun = {
				type: SchemaType.BOOLEAN,
			};
		}

		if (properties.diminutive) {
			grammaticalInfoProps.diminutive = {
				type: SchemaType.BOOLEAN,
			};
		}

		return {
			type: SchemaType.ARRAY,
			items: {
				type: SchemaType.OBJECT,
				properties: {
					tokenId: {type: SchemaType.STRING},
					content: {type: SchemaType.STRING},
					grammaticalInfo: {
						type: SchemaType.OBJECT,
						properties: grammaticalInfoProps,
						required: Object.keys(grammaticalInfoProps),
					},
				},
				required: ['tokenId', 'content', 'grammaticalInfo'],
			},
		};
	}
}
