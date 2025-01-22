import styled from 'styled-components';

export const Container = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

export const SearchInput = styled.input`
	width: 80%;
	padding: 0.8rem;
	margin: 2rem;
	border-radius: 12px;
	border: 1px solid rgba(0, 0, 0, 0.1);
	font-size: 1.1rem;
	background-color: ${props => props.theme.colors.surface};
	color: ${props => props.theme.colors.onSurface};
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	transition: all 0.2s ease;

	&:focus {
		outline: none;
		border-color: ${props => props.theme.colors.primary};
		box-shadow: 0 4px 12px rgba(26, 155, 163, 0.15);
		transform: translateY(-1px);
	}

	&::placeholder {
		color: ${props => props.theme.colors.onSurface};
		opacity: 0.6;
	}
`;
export const Title = styled.h1`
	color: ${props => props.theme.colors.onBackground};
	margin-bottom: 2rem;
	text-align: center;
`;

export const SongListContainer = styled.div`
	width: 80%;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

export const SongButton = styled.button`
	width: 100%;
	padding: 1rem;
	margin: 0.5rem 0;
	border-radius: 8px;
	border: none;
	background-color: ${props => props.theme.colors.surface};
	color: ${props => props.theme.colors.onSurface};
	cursor: pointer;
	transition: all 0.2s ease;
	font-size: 1.1rem;

	&:hover {
		background-color: ${props => props.theme.colors.secondary};
		color: ${props => props.theme.colors.background};
		transform: translateY(-2px);
	}
`;
