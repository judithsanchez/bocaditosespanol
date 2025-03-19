import {StyledTokensTranslations} from '@/components/ui/StyledComponents';
import {WordToken} from '@/lib/types/common';

export interface TokensTranslationsProps {
	selectedToken: WordToken | null;
}

export const TokensTranslations = ({
	selectedToken,
}: TokensTranslationsProps) => {
	if (!selectedToken || selectedToken.tokenType !== 'word') {
		return null;
	}

	return (
		<StyledTokensTranslations>
			{selectedToken.senses?.map(sense =>
				sense.translations.english.map((translation, index) => (
					<p key={`${sense.senseId}-translation-${index}`}>{translation}</p>
				)),
			)}
		</StyledTokensTranslations>
	);
};
