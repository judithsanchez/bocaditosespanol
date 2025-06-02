'use client';

import styled from 'styled-components';

const LoadingWrapper = styled.div`
	min-height: 20px;
	width: fit-content;
	margin: 0 auto;
	display: flex;
	flex-direction: row;
	gap: 8px;
	align-items: center;
	justify-content: center;
`;

const LoadingPill = styled.div`
	width: 60px;
	height: 24px;
	background: ${props => props.theme.colors.surface};
	border-radius: 12px;
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

export default function LoadingTokenTranslations() {
	return (
		<LoadingWrapper>
			<LoadingPill />
			<LoadingPill />
			<LoadingPill />
		</LoadingWrapper>
	);
}
