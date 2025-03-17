import {StyledTokensTranslations} from '@/components/ui/StyledComponents';
import {WordToken} from '@/lib/types/common';

export interface TokensTranslationsProps {
	selectedToken: WordToken | null;
}

export const TokensTranslations = ({
	selectedToken,
}: TokensTranslationsProps) => {
	return (
		<StyledTokensTranslations>
			{selectedToken?.tokenType === 'word' &&
				selectedToken.senses?.map(
					(sense: {translations: {english: any[]}; senseId: any}) =>
						sense.translations.english.map((translation, index) => (
							<p key={`${sense.senseId}-translation-${index}`}>{translation}</p>
						)),
				)}
		</StyledTokensTranslations>
	);
};
