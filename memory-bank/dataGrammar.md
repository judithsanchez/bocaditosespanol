# Data Grammar

## Hierarchical Structure Overview

See the complete hierarchical structure diagram in [diagrams/dataGrammar.mmd](diagrams/dataGrammar.mmd)

## Data Types

### 1. Song (Top Level)

```typescript
interface Song {
	songId: string; // Unique identifier for the song
	metadata: Metadata; // Song metadata
	lyrics: string[]; // Array of sentence IDs
	createdAt: number; // Timestamp of creation
	updatedAt: number; // Timestamp of last update
}
```

### 2. Metadata

```typescript
interface Metadata {
	interpreter: string; // Main artist
	feat: string[]; // Featured artists
	title: string; // Song title
	youtube: string; // YouTube URL
	genre: string[]; // Music genres
	language: string; // Primary language
	releaseDate: string; // Release date (YYYY-MM-DD)
}
```

### 3. Sentences

```typescript
interface Sentence {
	sentenceId: string; // Unique identifier
	content: string; // Original text
	tokenIds: string[]; // References to tokens
	translations: Translation; // Translation data
	learningInsights: LearningInsight; // Learning metadata
}
```

### 4. Translations

```typescript
interface Translation {
	english: {
		contextual: string; // Natural translation
		literal: string; // Word-for-word translation
	};
}
```

### 5. Learning Insights

```typescript
interface LearningInsight {
	insight: string; // Grammatical explanation
	difficulty: 'beginner' | 'intermediate' | 'advanced'; // Difficulty level
}
```

### 6. Tokens

```typescript
interface Token {
	tokenId: string; // Unique identifier
	content: string; // The word or punctuation
	type: string; // Token type (word, punctuation, etc.)
	lemma: string; // Base form of the word
	pos: string; // Part of speech
	senses: Sense[]; // Word meanings and usage
}
```

### 7. Senses (Bottom Level)

```typescript
interface Sense {
	definition: string; // Meaning explanation
	examples: string[]; // Usage examples
	synonyms: string[]; // Similar words
	antonyms: string[]; // Opposite words
	register: string; // Formality level
	usage: string; // Usage context
}
```

## Key Points

1. **Data Flow**: See flow diagram in [diagrams/dataStructure.mmd](diagrams/dataStructure.mmd)

2. **Entity Relationships**: See ER diagram in [diagrams/entityRelations.mmd](diagrams/entityRelations.mmd)

3. **Data Modularity**:

   - Each level can be updated independently
   - Tokens and senses are reusable across sentences
   - Metadata is separated from content

4. **Extensibility**:
   - Translation structure can support multiple languages
   - Learning insights can be expanded
   - Token types can be extended
   - Sense data can be enriched
