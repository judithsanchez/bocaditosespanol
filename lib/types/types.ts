export interface AIProvider {
	enrichContent(input: any, schema: any, instruction: string): Promise<any>;
}
