'use client';

import styled from 'styled-components';
import Link from 'next/link';

export const HomeContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 80vh;
	gap: 2rem;
	background-color: ${props => props.theme.colors.background};
`;

export const Title = styled.h1`
	font-size: 2rem;
	color: ${props => props.theme.colors.onBackground};
	margin: 0;
`;

export const LearnImage = styled.img`
	max-width: 200px;
	height: auto;
`;

export const Tagline = styled.h2`
	font-size: 2rem;
	color: ${props => props.theme.colors.onBackground};
	margin: 0;
	text-align: center;
`;

export const NavBarContainer = styled.header`
	display: flex;
	align-items: center;
	justify-content: space-between;
	background-color: ${props => props.theme.colors.navbar};
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	height: 4rem;
	padding: 0 1rem;
	position: sticky;
	top: 0;
	z-index: 10;

	@media (min-width: 768px) {
		height: 5rem;
		padding: 0 3rem;
	}

	@media (min-width: 1024px) {
		padding: 0 4rem;
	}

	@media (min-width: 1280px) {
		height: 6rem;
		padding: 0 6rem;
	}
`;

export const Logo = styled.img`
	height: 2.5rem;
	width: 2.5rem;
	cursor: pointer;

	@media (min-width: 768px) {
		height: 3rem;
		width: 3rem;
	}

	@media (min-width: 1280px) {
		height: 3.5rem;
		width: 3.5rem;
	}
`;

export const NavLinks = styled.nav`
	display: flex;
	gap: 2rem;

	@media (min-width: 768px) {
		gap: 3rem;
	}

	@media (min-width: 1280px) {
		gap: 4rem;
	}
`;

export const StyledLink = styled(Link)`
	color: ${props => props.theme.colors.onSurface};
	text-decoration: none;
	font-size: 1.1rem;

	@media (min-width: 768px) {
		font-size: 1.2rem;
	}

	@media (min-width: 1280px) {
		font-size: 1.3rem;
	}

	&:hover {
		color: ${props => props.theme.colors.primary};
	}
`;

export const ThemeToggle = styled.button`
	background-color: transparent;
	border: none;
	height: 2.5rem;
	width: 2.5rem;
	padding: 0;
	cursor: pointer;

	@media (min-width: 768px) {
		height: 3rem;
		width: 3rem;
	}

	@media (min-width: 1280px) {
		height: 3.5rem;
		width: 3.5rem;
	}
`;

export const Container = styled.div`
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2rem;
	padding: 2rem;
	margin-bottom: 7.5rem;
	background-color: ${props => props.theme.colors.background};
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
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08),
		inset 0 1px 2px rgba(255, 255, 255, 0.15);
	border: 1px solid rgba(0, 0, 0, 0.05);
	z-index: 10;
	opacity: ${props => (props.visible ? 1 : 0)};
	visibility: ${props => (props.visible ? 'visible' : 'hidden')};
	transition: opacity 0.3s ease, visibility 0.3s ease;
`;

export const ControlButton = styled.button`
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

export const ModeSelector = styled.div`
	width: 350px;
	display: flex;
	gap: 1.5rem;
	margin-bottom: 2rem;
	padding: 0.5rem;
	background: ${props => props.theme.colors.primaryContainer};
	border-radius: 25px;
	justify-content: space-between;
`;

export const ModeButton = styled.button<{active: boolean}>`
	flex: 1;
	padding: 1rem 1.5rem;
	border-radius: 20px;
	border: none;
	font-size: 1rem;
	font-weight: 600;
	background: ${props =>
		props.active ? props.theme.colors.primary : 'transparent'};
	color: ${props =>
		props.active
			? props.theme.colors.onPrimary
			: props.theme.colors.onPrimaryContainer};
	cursor: pointer;
	transition: all 0.3s ease;
	box-shadow: ${props =>
		props.active ? '0 4px 12px rgba(26, 155, 163, 0.2)' : 'none'};

	&:hover {
		transform: translateY(-2px);
		background: ${props =>
			props.active
				? props.theme.colors.primary
				: props.theme.colors.primaryContainer};
	}

	&:active {
		transform: translateY(1px);
	}
`;

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

// export const Container = styled.div`
// 	width: 100%;
// 	display: flex;
// 	flex-direction: column;
// 	align-items: center;
// `;

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

// export const Title = styled.h1`
// 	color: ${props => props.theme.colors.onBackground};
// 	margin-bottom: 2rem;
// 	text-align: center;
// `;

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

export const BaseToken = styled.span<{
	isSelected?: boolean;
	isCognate?: boolean;
	isFalseCognate?: boolean;
	isSlang?: boolean;
	isPunctuation?: boolean;
}>`
	font-size: 1.4rem;
	font-family: 'Roboto', sans-serif;
	font-weight: ${props => (props.isSelected ? '900' : '400')};
	color: ${props =>
		props.isSelected ? props.theme.colors.primary : 'inherit'};
	cursor: ${props => (props.isPunctuation ? 'default' : 'pointer')};
	transition: all 0.2s ease;

	${props =>
		props.isCognate &&
		`
		border-bottom: 3px solid ${props.theme.colors.cognate};
	`}

	${props =>
		props.isFalseCognate &&
		`
		border-bottom: 3px solid ${props.theme.colors.falseCognate};
	`}

	${props =>
		props.isSlang &&
		`
		border-bottom: 3px solid ${props.theme.colors.slang};
	`}
`;
export const StyledWord = styled(BaseToken)`
	font-style: italic;
`;

export const StyledEmoji = styled(BaseToken)`
	font-style: normal;
	font-size: 1.6rem;
`;

export const StyledPunctuationLeft = styled(BaseToken)`
	font-style: normal;
	color: ${props => props.theme.colors.text}40;
	margin-left: -0.3rem;
	padding-right: 0.5rem;
`;

export const StyledPunctuationRight = styled(BaseToken)`
	font-style: normal;
	color: ${props => props.theme.colors.text}40;
	margin-right: -0.5rem;
	padding-left: 0.5rem;
`;

export const StyledTokensTranslations = styled.div`
	min-height: 0.2rem;
	width: fit-content;
	margin: 0 auto;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 0.5rem;
	align-items: center;
	justify-content: center;

	p {
		font-size: 14px;
		margin: 0;
		background-color: ${props => props.theme.colors.primary}90;
		border-radius: 5px;
		padding: 2px 8px;
	}
`;

// Add these exports to your StyledComponents.tsx file
export const SentenceContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.3rem;
	justify-content: center;
	padding: 1rem;
	cursor: pointer;
`;

export const TranslationContainer = styled.div`
	margin-top: 1rem;
	text-align: center;
	color: ${props => props.theme.colors.onSurface};
	font-size: 1rem;

	p {
		margin: 0.5rem 0;
	}
`;
