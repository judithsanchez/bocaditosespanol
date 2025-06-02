type ErrorResponse = {
	error: string;
	details?: unknown;
};

export class ApiResponse {
	static error(message: string, status: number = 500, details?: unknown) {
		const errorResponse: ErrorResponse = {
			error: message,
		};
		if (details) {
			errorResponse.details = details;
		}
		return Response.json(errorResponse, {status});
	}

	static notFound(message: string = 'Not found') {
		return this.error(message, 404);
	}

	static success<T>(data: T, status: number = 200) {
		return Response.json(data, {status});
	}

	static serverError(
		message: string = 'Internal server error',
		details?: unknown,
	) {
		return this.error(message, 500, details);
	}

	static badRequest(message: string = 'Bad request', details?: unknown) {
		return this.error(message, 400, details);
	}
}
