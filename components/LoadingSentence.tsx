'use client';

import styled from 'styled-components';
import {SentenceCard, TokensContainer} from '@/components/ui/StyledComponents';
import LoadingToken from './LoadingToken';

const LoadingTranslation = styled.div`
	height: 16px;
	width: 200px;
	background: ${props => props.theme.colors.surface};
	border-radius: 4px;
	margin: 1rem auto;
	animation: pulse 1.5s ease-in-out infinite;

	@keyframes pulse {
		0% {
			opacity: 0.6;
		}
		50% {
			opacity: 0.3;
		}
		100% {
			opacity: 0.6;
		}
	}
`;

export default function LoadingSentence() {
	return (
		<SentenceCard>
			<TokensContainer>
				{[...Array(5)].map((_, i) => (
					<LoadingToken key={`loading-${i}`} />
				))}
			</TokensContainer>
			<LoadingTranslation />
		</SentenceCard>
	);
}
