import styled from 'styled-components';

export const SentenceCard = styled.div`
	min-height: 150px;
	width: 350px;
	height: auto;
	background-color: ${props => props.theme.colors.surface};
	border-radius: 8px;
	box-shadow: 2px 6px 7px rgba(0, 0, 0, 0.25);
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	align-items: center;
	padding: 1.5rem;
	gap: 1.5rem;
`;

export const TokensContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	justify-content: center;
	text-align: center;
`;

export const Translation = styled.p`
	font-size: 12px;
	color: ${props => props.theme.colors.text}80;
	font-style: italic;
	text-align: center;
`;

export const WritingContainer = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	align-items: center;
`;

export const Input = styled.input`
	width: 100%;
	padding: 0.8rem;
	border-radius: 12px;
	border: 1px solid rgba(0, 0, 0, 0.1);
	font-size: 1.3rem;
	background-color: ${props => props.theme.colors.background};
	color: ${props => props.theme.colors.onBackground};
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	transition: all 0.2s ease;
	text-align: center;

	&:focus {
		outline: none;
		border-color: ${props => props.theme.colors.primary};
		box-shadow: 0 4px 12px rgba(26, 155, 163, 0.15);
		transform: translateY(-1px);
	}

	&::placeholder {
		color: ${props => props.theme.colors.onBackground};
		opacity: 0.6;
	}
`;
export const ButtonFeedbackContainer = styled.div`
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	position: relative;
`;

export const SubmitButton = styled.button`
	padding: 0.5rem 1.5rem;
	margin: 0.5rem 0;
	border-radius: 8px;
	border: none;
	background: ${props => props.theme.colors.primary};
	color: ${props => props.theme.colors.onPrimary};
	font-size: 1.2rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	&:active {
		transform: translateY(0);
	}
`;

export const FeedbackIcon = styled.div`
	font-size: 2rem;
	position: absolute;
	right: 0;
	top: 50%;
	transform: translateY(-50%);
`;
