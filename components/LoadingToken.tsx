'use client';

import styled from 'styled-components';

const LoadingTokenWrapper = styled.div`
	width: 50px;
	height: 30px;
	background: ${props => props.theme.colors.surface};
	border-radius: 4px;
	display: inline-block;
	margin: 4px;
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

export default function LoadingToken() {
	return <LoadingTokenWrapper />;
}
