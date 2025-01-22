import styled from 'styled-components';

export const Container = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2rem;
	padding: 2rem;
`;

export const YoutubeContainer = styled.div`
	top: 4.5rem;
	width: 350px;
	height: 200px;
	border-radius: 8px;
	overflow: hidden;
	z-index: 1;
	margin-bottom: 2rem;
	background: ${props => props.theme.colors.background};

	iframe {
		border: none;
		width: 100%;
		height: 100%;
		border-radius: 8px;
	}
`;

export const PlayerControls = styled.div`
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	justify-content: space-around;
	align-items: center;
	padding: 1.2rem 4rem;
	background: ${props => props.theme.colors.surface};
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
	z-index: 1000;
`;

export const ControlButton = styled.button`
	width: 50px;
	height: 50px;
	border-radius: 50%;
	border: none;
	background: ${props => props.theme.colors.primary};
	color: ${props => props.theme.colors.onPrimary};
	font-size: 1.5rem;
	cursor: pointer;
	display: flex;
	justify-content: center;
	align-items: center;
	transition: transform 0.2s ease;

	&:hover {
		transform: scale(1.05);
		background: ${props => props.theme.colors.tertiary};
		color: ${props => props.theme.colors.onPrimaryContainer};
	}

	&:active {
		transform: scale(0.95);
	}
`;
