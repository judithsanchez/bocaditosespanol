'use client';

import styled from 'styled-components';
import {SentenceCard} from '@/components/ui/StyledComponents';

const ErrorWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
	padding: 2rem;
	text-align: center;
	color: ${props => props.theme.colors.onSurface};
`;

const ErrorIcon = styled.div`
	font-size: 3rem;
`;

const ErrorMessage = styled.h2`
	margin: 0;
	font-size: 1.5rem;
	color: ${props => props.theme.colors.onSurface};
`;

const ErrorDescription = styled.p`
	margin: 0;
	color: ${props => props.theme.colors.onSurface};
	opacity: 0.8;
`;

interface ErrorStateProps {
	title?: string;
	description?: string;
}

export default function ErrorState({
	title = 'Something went wrong',
	description = 'Please try again later',
}: ErrorStateProps) {
	return (
		<SentenceCard>
			<ErrorWrapper>
				<ErrorIcon>😕</ErrorIcon>
				<ErrorMessage>{title}</ErrorMessage>
				<ErrorDescription>{description}</ErrorDescription>
			</ErrorWrapper>
		</SentenceCard>
	);
}
