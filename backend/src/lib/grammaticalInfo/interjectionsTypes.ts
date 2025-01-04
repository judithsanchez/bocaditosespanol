export enum InterjectionEmotion {
	SURPRISE = 'surprise',
	JOY = 'joy',
	PAIN = 'pain',
	ANGER = 'anger',
	GREETING = 'greeting',
	OTHER = 'other',
}

export enum InterjectionType {
	ONOMATOPOEIC = 'onomatopoeic',
	COURTESY = 'courtesy',
	EMPHATIC = 'emphatic',
	VULGAR = 'vulgar',
	GENERIC = 'generic',
}

export interface IInterjection {
	interjectionEmotion: InterjectionEmotion;
	interjectoinType?: InterjectionType;
}
