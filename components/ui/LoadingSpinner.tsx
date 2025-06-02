'use client';

import styled from 'styled-components';

const SpinnerContainer = styled.div`
	border: 4px solid #f3f3f3;
	border-top: 4px solid #333;
	border-radius: 50%;
	width: 40px;
	height: 40px;
	animation: spin 1s linear infinite;
	margin-bottom: 1rem;

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
`;

export function LoadingSpinner() {
	return <SpinnerContainer />;
}
