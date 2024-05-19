import React from 'react';

interface SongData {
	title: string;
	artist: string;
	album: string;
	youtubeVideo: string;
	spotify: string;
	genre: string[];
	released: string;
	lyrics: string;
	processedLyrics: {
		sentence: string;
		tokens: {
			token: {
				spanish: string;
				normalizedToken: string;
				english: string;
				hasSpecialChar: boolean;
				type: string;
			};
			type: string;
		}[];
	}[];
}

interface TextAndTranslationProps {
	songData: SongData | null;
}

const TextAndTranslation: React.FC<TextAndTranslationProps> = ({songData}) => {
	if (!songData || !songData.processedLyrics) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			{songData.processedLyrics.map((sentence, index) => (
				<div key={index}>
					<p>{sentence.sentence}</p>
					<div>
						{sentence.tokens
							.filter(token => token.type === 'word')
							.map((token, tokenIndex) => (
								<span key={tokenIndex}>{token.token.english} </span>
							))}
					</div>
				</div>
			))}
		</div>
	);
};

export default TextAndTranslation;
