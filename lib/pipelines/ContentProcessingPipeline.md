# SentenceFormatterStep Summary

## Input

- Raw text content (e.g., song lyrics)
- Metadata (e.g., song title, artist)

## Output

- Structured sentence objects with:
  - Unique IDs
  - Original content
  - Empty placeholders for translations and tokens
- Deduplicated sentence collection

This step transforms unstructured text into structured, uniquely identified sentence objects ready for further processing in the language learning pipeline.

# TokenIdentificationStep Summary

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
