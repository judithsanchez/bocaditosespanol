# Database Services Explanation

This document explains the functionality and interaction of the `ReadDatabaseService` and `WriteDatabaseService` classes, which manage data persistence using JSON files.

## Overview

These services provide a temporary solution for reading and writing application data (tokens, sentences, text entries) stored in JSON files. They abstract the file system operations and data fetching logic.

## Core Components

1.  **`DatabaseConfig.ts` (`lib/config/`)**:

    - Centralizes configuration for file paths (local data directory, GitHub Pages URL) and filenames (`tokens.json`, `sentences.json`, `text-entries.json`).
    - Both services import this configuration to avoid hardcoded values.

2.  **`database.ts` (`lib/types/`)**:

    - Defines shared TypeScript interfaces (`TokenStorage`, `TextEntriesStorage`) used by both services to ensure consistent data structures.

3.  **`ReadDatabaseService.ts` (`lib/services/`)**:

    - **Purpose**: Responsible for reading data from the JSON files.
    - **Mechanism**:
      - Primarily attempts to fetch JSON data from a specified GitHub Pages URL using the browser's `fetch` API. This allows the deployed application to access the data.
      - Uses `DatabaseConfig` to construct the correct URLs.
      - Includes logging for fetch attempts, success (with data size and duration), and failures.
      - Provides methods like `getTokens`, `getSentences`, and `getTextEntries`.
      - `getTokens` includes logic to sort word tokens by their `lastUpdated` timestamp.
      - Returns structured data (using types from `lib/types/database.ts`) or default empty structures (e.g., `[]`, `{}`) if reading fails.
    - **Diagram**: See `ReadDatabaseService.mmd` for a sequence diagram.

4.  **`WriteDatabaseService.ts` (`lib/services/`)**:
    - **Purpose**: Responsible for writing data to the local JSON files. This is typically used during development or data processing phases.
    - **Mechanism**:
      - Uses Node.js `fs/promises` (`writeFile`, `mkdir`) to interact with the local file system.
      - Uses `DatabaseConfig` to determine the correct local file paths.
      - Initializes by ensuring the data directory exists.
      - Includes logging for directory creation, file writing attempts, success (with data size and duration), and failures.
      - Provides methods like `saveTokens`, `saveSentences`, and `saveTextEntry`.
      - `saveTokens` first reads the existing tokens using `ReadDatabaseService` to merge new/updated tokens before writing. It includes type validation for the data read.
      - Writes data formatted as JSON with indentation.
    - **Diagram**: See `WriteDatabaseService.mmd` for a sequence diagram.

## Interaction Flow

- **Reading**: `ReadDatabaseService` fetches JSON files from the GitHub Pages URL defined in `DatabaseConfig`.
- **Writing**: `WriteDatabaseService` reads/writes JSON files to the local file system path defined in `DatabaseConfig`. It uses `ReadDatabaseService` internally when updating data (like tokens) to ensure existing data isn't completely overwritten without merging.

## Recent Refactoring (April 2025)

- Centralized paths and filenames into `DatabaseConfig`.
- Improved logging with timestamps, durations, and data sizes.
- Consolidated shared interfaces (`TokenStorage`, `TextEntriesStorage`) into `lib/types/database.ts`.
- Added basic type validation in `WriteDatabaseService.saveTokens` when reading existing data.
- Corrected minor syntax/type errors.
