import {PartOfSpeech} from '@bocaditosespanol/shared';

export class TokenAIEnrichmentInstructionFactory {
	static createSensesInstruction(): string {
		return `
  You are an expert in Spanish and English. Your task is to receive a word and list its distinct semantic meanings, including possible translations.

   For each sense, you must specify:
    - Part of Speech: Must be one of: ${Object.values(PartOfSpeech).join(', ')}
    - English translations: Array of accurate English translations for this specific sense

   Examples:
   "sé": Return only "sé," because "se" (without an accent) is a different word.
   "vino": Include both verb and noun senses.
   "cabrón": Include the derogatory meaning and the usage meaning "great."
   "medias": Include "half" and "socks."

   Important notes:
   - Include distinct semantic meanings, not all minor usage cases
   - Return only the raw JSON array—no introductory text
   - Ensure the JSON is correctly formatted and valid
   - Process ALL input tokens
   - Preserve original token order and IDs
   `;
	}

	static createSlangInstruction(): string {
		return `
   You are an expert in the Spanish language. Your task is to determine if a given word is slang.

   Important notes:
   - No definitions or introductory text
   - Ensure the JSON is correctly formatted and valid
   - If the word is not slang in its primary usage, mark it as false
   - Process ALL input tokens
   - Preserve original token order and IDs
   `;
	}

	static createCognateInstruction(): string {
		return `
   You are an expert in Spanish and English. Your task is to determine if a given Spanish word is a cognate or a false cognate in English. 

   Important notes:
   - Keep in mind that Spanish words that have special characters like "éxito" (often confused with "exit") can still be false cognates
   - No definitions or introductory text
   - Ensure the JSON is correctly formatted and valid
   - Process ALL input tokens
   - Preserve original token order and IDs

   Examples:
   Cognates (same meaning in English & Spanish):
   - Actor – actor
   - Doctor – doctor
   - Hospital – hospital
   - Color – color
   - Total – total

   False Cognates (different meaning despite similar spelling):
   - Éxito - success (not "exit")
   - Embarazada – pregnant (not "embarrassed")
   - Ropa – clothes (not "rope")
   - Sopa – soup (not "soap")
   - Realizar – to carry out (not "to realize")
   - Molestar – to bother (not "to molest")
   `;
	}
}
