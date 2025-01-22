import {StyledTokensTranslations} from '../styles/TokenTranslations.styles';
import {TokensTranslationsProps} from '../types/TonkensTranslations.types';

export const TokensTranslations = ({
	selectedToken,
}: TokensTranslationsProps) => {
	return (
		<StyledTokensTranslations>
			{selectedToken &&
				selectedToken.translations?.english.map((translation, index) => (
					<p key={`translation-${index}`}>{translation}</p>
				))}
		</StyledTokensTranslations>
	);
};
