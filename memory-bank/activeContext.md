# Active Context

## Goal

Refactor the content processing pipeline steps (`lib/pipelines/steps/`) to use a generic `ContentProcessingContext` instead of the specific `SongProcessingContext`. This involves updating the step implementations and their corresponding tests.

## Recent Changes & Focus

- Refactored `lib/pipelines/steps/SensesEnrichmentStep.ts` to use `ContentProcessingContext`.
- Created `lib/pipelines/steps/SensesEnrichmentStep.mmd` sequence diagram.
- Created and fixed `lib/pipelines/steps/__tests__/SensesEnrichmentStep.test.ts`.
- **Refactored `lib/pipelines/steps/CognateAnalysisStep.ts` to use `ContentProcessingContext` and corrected `BatchProcessor` usage.**

## Current Step

- Update `memory-bank/activeContext.md` (This step).
- Create `lib/pipelines/steps/CognateAnalysisStep.mmd`.
- Create `lib/pipelines/steps/__tests__/CognateAnalysisStep.test.ts`.

## Next Steps

- Refactor `lib/pipelines/steps/SlangDetectionStep.ts`.
- Refactor `lib/pipelines/steps/GrammaticalEnricherStep.ts`.
- Refactor `lib/pipelines/steps/SentenceAIEnricherSteps.ts` (includes `SentenceFormatterStep` and `SentenceLearningInsightsEnricherStep`).
- Update `lib/pipelines/ContentProcessingPipeline.ts` to use the generic context and potentially adjust the pipeline execution flow if needed.
- Review all changes and ensure tests pass.

## Key Files

- `lib/pipelines/ContentProcessingPipeline.ts`
- `lib/pipelines/steps/*`
- `lib/pipelines/steps/__tests__/*`
- `lib/types/content.ts` (Potentially, if context needs adjustment)
- `memory-bank/activeContext.md`

## Potential Challenges

- Ensuring type safety with the generic context across all steps.
- Handling potential differences in how steps access or modify context data based on `contentType`.
- Updating numerous test files correctly.
- Ensuring the `BatchProcessor` and `GenericAIEnricher` work seamlessly with the refactored steps and context.
