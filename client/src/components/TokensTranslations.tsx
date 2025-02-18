import {StyledTokensTranslations} from '../styles/TokenTranslations.styles';
import {WordToken} from '@bocaditosespanol/shared';

export interface TokensTranslationsProps {
	selectedToken: WordToken | null;
}

export const TokensTranslations = ({
	selectedToken,
}: TokensTranslationsProps) => {
	return (
		<StyledTokensTranslations>
			{selectedToken?.tokenType === 'word' &&
				selectedToken.senses?.map(sense =>
					sense.translations.english.map((translation, index) => (
						<p key={`${sense.senseId}-translation-${index}`}>{translation}</p>
					)),
				)}
		</StyledTokensTranslations>
	);
};
