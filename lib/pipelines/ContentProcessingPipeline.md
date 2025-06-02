# Content Processing Pipeline Overview

The `ContentProcessingPipeline` class orchestrates the analysis and enrichment of various types of text content (songs, book excerpts, video transcripts). It takes raw content and metadata as input, processes it through a series of modular steps, and saves the enriched sentences and tokens to the database.

## `ContentProcessingContext`

The pipeline operates on a `ContentProcessingContext` object, which carries data through the steps:

```typescript
export interface ContentProcessingContext {
	input: AddContentRequest; // The initial request data (validated)
	sentences: {
		formatted: ISentence[]; // Sentences after initial formatting
		deduplicated: ISentence[]; // Deduplicated sentences
		enriched: ISentence[]; // Sentences after AI enrichment (translations, insights)
	};
	tokens: {
		words: IWord[]; // Initially identified words
		punctuationSigns: IPunctuationSign[]; // Initially identified punctuation
		emojis: IEmoji[]; // Initially identified emojis
		deduplicated: Token[]; // Deduplicated tokens (all types)
		enriched: Token[]; // Tokens after AI enrichment (senses, cognates, slang, grammar)
	};
	content?: IContent; // The final content object (ISong, IBookExcerpt, etc.) created at the end
	contentType?: ContentType; // The type of content being processed
}
```

## Pipeline Initialization (`constructor`)

1.  Receives the `AddContentRequest` containing the raw content and metadata.
2.  Initializes an empty `ContentProcessingContext` with the input request and sets the `contentType`.
3.  Instantiates the `WriteDatabaseService`.
4.  Defines the sequence of processing steps:
    - `SentenceFormatterStep`
    - `TokenIdentificationStep`
    - `SentenceAIEnricherSteps`
    - `SentenceLearningInsightsEnricherStep`
    - `SensesEnrichmentStep`
    - `CognateAnalysisStep`
    - `SlangDetectionStep`
    - `GrammaticalEnricherStep`
5.  Initializes the base `Pipeline` class with the context and the defined steps.

## Main Processing (`processText` method)

1.  **Input Validation**: Validates the incoming `AddContentRequest` against the `contentRequestSchema`. Throws an error if invalid.
2.  **Pipeline Execution**: Calls the base `process()` method, which executes each step in the defined sequence, passing the `ContentProcessingContext` between them. Each step modifies the context (e.g., adding formatted sentences, enriching tokens).
3.  **Content Object Creation**:
    - Based on the `contentType` from the input:
      - Generates a unique `contentId`.
      - Creates the specific content object (`ISong`, `IBookExcerpt`, or `IVideoTranscript`).
      - Populates it with metadata from the input and the `processedSentences` (enriched sentences) from the context.
      - Assigns the created content object to `processedContext.content`.
4.  **Database Saving**:
    - Checks if `processedContext.content` was successfully created.
    - Saves the enriched sentences (`processedContext.sentences.enriched`) using `writeDB.saveSentences`.
    - Saves the final content object (`processedContext.content`) using `writeDB.saveTextEntry`.
    - Saves all enriched tokens (`processedContext.tokens.enriched`) using `writeDB.saveTokens`.
5.  **Logging**: Logs information at various stages, including context creation, state after processing, and database operations.
6.  **Return**: Returns the final `processedContext`.

---

# Pipeline Step Summaries

## 1. SentenceFormatterStep Summary

## Input

- Raw text content (from various sources like songs, books, videos)
- Associated metadata (e.g., title, author/artist, source)

## Output

- Structured sentence objects with:
  - Unique IDs
  - Original content
  - Empty placeholders for translations and tokens
- Deduplicated sentence collection

This step transforms unstructured input text into structured, uniquely identified sentence objects ready for further processing.

## 2. TokenIdentificationStep Summary

## Input

- Formatted sentences with content but no token information
- Context with empty token collections

## Output

- Sentences enriched with token IDs
- Deduplicated tokens categorized as:
  - Words (with normalized form and initial empty sense structure)
  - Punctuation signs
  - Emojis
- Updated context with new token collections

## Process Flow

1. Processes each sentence to identify and extract tokens
2. Maps tokens to their respective sentences via tokenIds
3. Deduplicates tokens across all sentences
4. Filters out tokens that already exist in the database
5. Categorizes tokens by type (words, punctuation, emojis)

## Token Creation

The step leverages TokenFactory to:

- Split sentences into raw token strings using regex patterns
- Create properly typed token objects (Word/Emoji/PunctuationSign)
- Initialize word tokens with empty sense structures for later AI enrichment
- Generate consistent tokenIds based on token content

This step is crucial for breaking down sentences into their atomic components (tokens), which enables granular language analysis and learning insights in subsequent pipeline steps. Word tokens created here will be further enriched with linguistic information in later AI-powered steps.

## 3. SentenceAIEnricherSteps Summary

## Input

- Deduplicated sentences with content and token IDs
- Context with non-enriched sentences

## Output

- Sentences enriched with:
  - Contextual English translations
  - Literal word-for-word translations
  - All original properties preserved

## Process Flow

1. **Checks for `contentType`**: Ensures `context.contentType` is defined before proceeding. Throws an error if missing.
2. **Creates Schema**: Uses `ContentSchemaFactory` with `context.contentType` to get the appropriate output schema.
3. **Generates Instructions**: Uses `ContentInstructionFactory` with `context.contentType` for tailored AI prompting.
4. **Processes Batches**: Uses `BatchProcessor` to send sentences to the `GenericAIEnricher` in optimized batches.
5. **Tracks Progress**: Logs detailed metrics during batch processing.
6. **Updates Context**: Stores the enriched sentences back into `context.sentences.enriched`.

## AI Enrichment

The step leverages multiple components:

- **`ContentSchemaFactory`**: Defines the expected output structure based on the `contentType`.
- **`ContentInstructionFactory`**: Generates AI instructions specific to the `contentType`.
- **`BatchProcessor`**: Manages efficient processing of sentence batches.
- **`GenericAIEnricher`**: Abstracts the interaction with the underlying AI provider.
- **AI Provider (Configurable)**: Performs the actual enrichment (e.g., Gemini).

This step is crucial for adding linguistic depth to sentences based on their specific content type. It ensures appropriate translations and enrichments are generated by dynamically adapting the AI schema and instructions.

## 4. SentenceLearningInsightsEnricherStep Summary

## Input

- Enriched sentences (containing translations)
- Context with enriched sentences

## Output

- Sentences further enriched with:
  - Learning insights (e.g., grammatical difficulty, key concepts)
  - All previous properties preserved

## Process Flow

1. **Processes Batches**: Uses `BatchProcessor` to send enriched sentences to the `GenericAIEnricher`.
2. **Generates Schema/Instructions**: Uses specific factories (`SentencesSchemaFactory`, `SentencesInstructionsFactory`) to tailor AI requests for learning insights.
3. **Updates Context**: Stores the sentences with added learning insights back into `context.sentences.enriched`.

This step focuses on the pedagogical aspect, adding valuable information for language learners directly to each sentence.

## 5. SensesEnrichmentStep Summary

## Input

- Deduplicated word tokens with basic structure (content, normalized form)
- Context with deduplicated tokens

## Output

- Word tokens enriched with potential senses (meanings), including:
  - Sense IDs
  - Part of speech information
  - English translations for each sense
- Updated context with enriched tokens

## Process Flow

1. **Filters Tokens**: Selects only word tokens for processing.
2. **Processes Batches**: Uses `BatchProcessor` and `GenericAIEnricher` to query the AI for possible senses of each word.
3. **Uses Factories**: Leverages `TokenAIEnrichmentFactory` and `TokenAIEnrichmentInstructionFactory` for schema and instruction generation.
4. **Updates Context**: Merges the enriched senses back into the corresponding word tokens in `context.tokens.enriched`.

This step expands the understanding of individual words by identifying their various meanings and associated grammatical roles.

## 6. CognateAnalysisStep Summary

## Input

- Enriched word tokens (containing senses and translations)
- Context with enriched tokens

## Output

- Word tokens updated with boolean flags:
  - `isCognate`
  - `isFalseCognate`
- Updated context with modified tokens

## Process Flow

1. **Filters Tokens**: Selects only word tokens.
2. **Processes Batches**: Uses `BatchProcessor` and `GenericAIEnricher` to analyze words for cognate status based on their content and English translations.
3. **Updates Context**: Updates the `isCognate` and `isFalseCognate` flags on the tokens in `context.tokens.enriched`.

This step helps learners identify words that are similar in Spanish and English, highlighting both true friends (cognates) and false friends (false cognates).

## 7. SlangDetectionStep Summary

## Input

- Enriched word tokens
- Context with enriched tokens

## Output

- Word tokens updated with a boolean flag:
  - `isSlang`
- Updated context with modified tokens

## Process Flow

1. **Filters Tokens**: Selects only word tokens.
2. **Processes Batches**: Uses `BatchProcessor` and `GenericAIEnricher` to analyze words for potential slang usage.
3. **Updates Context**: Updates the `isSlang` flag on the tokens in `context.tokens.enriched`.

This step identifies informal or colloquial language within the text.

## 8. GrammaticalEnricherStep Summary

## Input

- Enriched word tokens with identified senses and parts of speech.
- Context with enriched tokens.

## Output

- Word tokens with detailed grammatical information added to each relevant sense (e.g., verb conjugations, noun gender/number).
- Updated context with grammatically enriched tokens.

## Process Flow

1. **Groups by Part of Speech**: Filters and groups word tokens based on the part of speech of their senses (verbs, nouns, adjectives, etc.).
2. **Processes Batches per POS**: Iterates through each part of speech group, using `BatchProcessor` and `GenericAIEnricher`.
3. **Uses Specific Factories**: Employs `PartOfSpeechSchemaFactory` and `SystemInstructionFactory` to generate POS-specific schemas and instructions for the AI.
4. **Merges Results**: Updates the `grammaticalInfo` field within the corresponding senses of the tokens in `context.tokens.enriched`.

This step provides fine-grained grammatical details for each sense of a word, significantly enhancing the learning value.
