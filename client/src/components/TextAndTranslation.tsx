import React, {useState} from 'react';
import {ISentence, TokenType} from '../../../src/lib/types'; // TODO: fix the import

import styles from './styles/TextAndTranslation.module.css';
import {useTheme} from '../context/ThemeContext';
import {themes} from '../context/lib/constants';

const TextAndTranslation: React.FC<{sentence: ISentence}> = ({sentence}) => {
	const {theme} = useTheme();

	if (!sentence) {
		return <div>Loading...</div>;
	}
	const [hoveredTokenIndex, setHoveredTokenIndex] = useState<number | null>(
		null,
	);

	return (
		<div
			className={`${styles.textAndTranslation} ${
				theme === themes.light ? styles.lightMode : styles.darkMode
			}`}
		>
			<div className={styles.tokens}>
				{sentence.tokens
					.filter(token => token.type === TokenType.Word)
					.map((token, tokenIndex) => (
						<span
							className={`${styles.spanishToken} ${styles.token} ${
								hoveredTokenIndex === tokenIndex
									? `${styles.hoveredSpanishToken} ${
											theme === themes.light
												? styles.lightMode
												: styles.darkMode
									  }`
									: ''
							}`}
							key={tokenIndex}
							onMouseEnter={() => setHoveredTokenIndex(tokenIndex)}
							onMouseLeave={() => setHoveredTokenIndex(null)}
						>
							{token.token.spanish}
						</span>
					))}
			</div>
			<div className={styles.tokens}>
				{sentence.tokens
					.filter(token => token.type === TokenType.Word)
					.map((token, tokenIndex) => (
						<span
							className={`${styles.englishToken} ${styles.token} ${
								hoveredTokenIndex === tokenIndex
									? styles.hoveredEnglishToken
									: ''
							}`}
							key={tokenIndex}
							onMouseEnter={() => setHoveredTokenIndex(tokenIndex)}
							onMouseLeave={() => setHoveredTokenIndex(null)}
						>
							{token.token.english}
						</span>
					))}
			</div>
		</div>
	);
};

export default TextAndTranslation;
