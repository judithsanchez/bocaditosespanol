import styled from 'styled-components';

export const Container = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2rem;
	padding: 2rem;
	margin-bottom: 7.5rem;
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

export const PlayerControls = styled.div<{visible: boolean}>`
	border: none;
	border-radius: 50px;
	width: 350px;
	position: fixed;
	bottom: 2rem;
	left: 50%;
	transform: translateX(-50%);
	display: flex;
	justify-content: space-around;
	align-items: center;
	padding: 1.2rem 4rem;
	background: ${props => props.theme.colors.surface};
	box-shadow:
		0 8px 24px rgba(0, 0, 0, 0.12),
		0 4px 8px rgba(0, 0, 0, 0.08),
		inset 0 1px 2px rgba(255, 255, 255, 0.15);
	border: 1px solid rgba(0, 0, 0, 0.05);
	z-index: 10;
	opacity: ${props => (props.visible ? 1 : 0)};
	visibility: ${props => (props.visible ? 'visible' : 'hidden')};
	transition:
		opacity 0.3s ease,
		visibility 0.3s ease;
`;
export const ControlButton = styled.button`%;
	border: none;
	background: none;
	font-size: 2.5rem;
	cursor: pointer;
	display: flex;
	justify-content: center;
	align-items: center;
	transition: transform 0.2s ease;

	&:hover {
		transform: scale(1.2);
	}
`;
