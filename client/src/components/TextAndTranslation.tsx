import React, {useState} from 'react';
import {TokenType} from '../../../src/lib/types'; // TODO: fix the import
import {themes} from '../context/lib/constants';
import styles from './styles/TextAndTranslation.module.css';
import {TextAndTranslationProps} from './lib/types';
import {useAppContext} from '../context/AppContext';

const TextAndTranslation: React.FC<TextAndTranslationProps> = ({sentence}) => {
	const {theme} = useAppContext();
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
