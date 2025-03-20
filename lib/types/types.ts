export interface AIProvider {
	enrichContent(
		input: unknown,
		schema: unknown,
		instruction: string,
	): Promise<unknown>;
}
