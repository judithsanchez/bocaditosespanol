import {useState} from 'react';
import Token from '@/components/Token';
import {ISentence, IToken, LearningMode} from '@/lib/types/common';
import {
	SentenceContainer,
	TranslationContainer,
} from '@/components/ui/StyledComponents';

interface SentenceProps {
	sentence: ISentence;
	mode: LearningMode;
}

export default function Sentence({sentence, mode}: SentenceProps) {
	const [showTranslation, setShowTranslation] = useState(false);
	const [showOriginal, setShowOriginal] = useState(false);

	// No need to fetch tokens - they're already in the sentence object
	const tokens = sentence.tokens || [];

	const toggleTranslation = () => {
		if (mode !== LearningMode.HIDE_TRANSLATIONS) {
			setShowTranslation(!showTranslation);
		}
	};

	const toggleOriginal = () => {
		if (mode === LearningMode.LISTENING_PRACTICE) {
			setShowOriginal(!showOriginal);
		}
	};

	const shouldShowOriginal =
		mode !== LearningMode.LISTENING_PRACTICE || showOriginal;
	const shouldShowTranslation =
		mode !== LearningMode.HIDE_TRANSLATIONS && showTranslation;

	return (
		<div>
			{shouldShowOriginal ? (
				<SentenceContainer onClick={toggleTranslation}>
					{tokens.map((token: IToken, index: number) => (
						<Token key={`${token.tokenId}-${index}`} token={token} />
					))}
				</SentenceContainer>
			) : (
				<SentenceContainer onClick={toggleOriginal}>
					<p>[Click to reveal text]</p>
				</SentenceContainer>
			)}

			{shouldShowTranslation && (
				<TranslationContainer>
					<p>{sentence.translations?.english?.contextual}</p>
					<p>
						<i>{sentence.translations?.english?.literal}</i>
					</p>
				</TranslationContainer>
			)}
		</div>
	);
}
