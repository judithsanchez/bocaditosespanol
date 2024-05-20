import React from 'react';
import {ISentence, TokenType} from '../../../src/lib/types'; // TODO: fix the import
import {themes} from '../context/lib/constants';
import {useTheme} from '../context/ThemeContext';
import {themesCSS} from '../pages/lib/constants';
import {textAndTranslation} from './lib/constants';

const TextAndTranslation: React.FC<{sentence: ISentence}> = ({sentence}) => {
	if (!sentence) {
		return <div>Loading...</div>;
	}

	const {theme} = useTheme();

	return (
		<div
			className={`${textAndTranslation.css.container} ${
				theme === themes.light
					? themesCSS.lightModeClass
					: themesCSS.darkModeClass
			}`}
		>
			{/* <p>{sentence.sentence}</p> */}
			<div className={textAndTranslation.css.tokens}>
				{sentence.tokens
					.filter(token => token.type === TokenType.Word)
					.map((token, tokenIndex) => (
						// TODO: fix type issue
						<span
							className={`${textAndTranslation.css.spanishToken} ${textAndTranslation.css.token}`}
							key={tokenIndex}
						>
							{token.token.spanish}
						</span>
					))}
			</div>
			<div className={textAndTranslation.css.tokens}>
				{sentence.tokens
					.filter(token => token.type === TokenType.Word)
					.map((token, tokenIndex) => (
						// TODO: fix type issue
						<span
							className={`${textAndTranslation.css.englishToken} ${textAndTranslation.css.token}`}
							key={tokenIndex}
						>
							{token.token.english}
						</span>
					))}
			</div>
		</div>
	);
};

export default TextAndTranslation;
