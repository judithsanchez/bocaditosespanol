/* eslint-disable */
// @ts-nocheck

import {useState} from 'react';
import {Token} from '../types/Token.types';
import {TokensTranslations} from './TokensTranslations';
import {TokenComponent} from './Token';
import {
	SentenceCard,
	TokensContainer,
	Translation,
} from '../styles/Sentence.styles';
import {ISentence} from '../types/SelectedSong.types';

const Sentence = ({sentence}: {sentence: ISentence}) => {
	const [selectedToken, setSelectedToken] = useState<Token | null>(null);

	const handleTokenClick = (token: Token) => {
		if (selectedToken?.content === token.content) {
			setSelectedToken(null);
		} else {
			setSelectedToken(token);
		}
	};

	return (
		<SentenceCard>
			<TokensTranslations selectedToken={selectedToken} />
			<TokensContainer>
				{sentence?.tokens
					?.filter(token => token !== null && token.content !== '.')
					.map((token, tokenIndex) => (
						<TokenComponent
							key={`token-${tokenIndex}`}
							token={token}
							isSelected={selectedToken?.content === token.content}
							onClick={() => handleTokenClick(token)}
						/>
					))}
			</TokensContainer>
			<Translation>
				{sentence.translations.english.contextual
					.toLowerCase()
					.replace(/\.$/, '')}
			</Translation>
		</SentenceCard>
	);
};
export default Sentence;
